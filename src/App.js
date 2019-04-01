import { AudioContext } from './index.js';

const { useRef, useContext, useEffect, useState } = React;

const useGain = (ctx) => {
  const gainNodeRef = useRef();

  if (!gainNodeRef.current) gainNodeRef.current = ctx.createGain();

  const { current: gainNode } = gainNodeRef;
  const [gainValue, setGainValue] = useState(gainNode.gain.value);

  return [
    gainNode,
    gainValue,
    (value) => {
      gainNode.gain.value = value;
      setGainValue(value);
    },
  ];
};

const useAnalyser = (ctx) => {
  const analyserNodeRef = useRef();

  if (!analyserNodeRef.current) {
    analyserNodeRef.current = ctx.createAnalyser();
    analyserNodeRef.current.fftSize = Math.pow(2, 11);
    analyserNodeRef.current.smoothingTimeConstant = 0.85;
  }

  return analyserNodeRef.current;
};

const createDrawFunction = ({
  canvasCtx,
  analyser,
  dataArray,
  width,
  height,
  bufferLength,
  audioEl,
}) => {
  const draw = () => {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    // CLEAR SCREEN
    canvasCtx.fillStyle = bg;
    canvasCtx.fillRect(0, 0, width, height);

    // SET LINE STYLE
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = fg;

    // BEGIN
    canvasCtx.beginPath();

    // CALCULATE BIN WIDTH
    const sliceWidth = width * 1.0 / (bufferLength + 1);

    // DRAW PLAYHEAD
    const progress = audioEl.currentTime / audioEl.duration;
    canvasCtx.moveTo(progress * width, 0);
    canvasCtx.lineTo(progress * width, height);

    // MOVE LINE TO STARTING POINT
    let x = 0;
    let y = height;
    canvasCtx.moveTo(x, y);

    // BEGIN LOOPING OVER BINS
    for (var i = 0; i < bufferLength; i++) {
      // CALCULATE NEXT Y VALUE
      const v = dataArray[i] / 255.0;
      const y = height - (v * height);

      // DRAW LINE TO NEXT COORDINATES
      canvasCtx.lineTo(x, y);

      // DRAW TICK
      canvasCtx.moveTo(x, height);
      canvasCtx.lineTo(x, height - 5);

      // DRAW CENTER LINE
      canvasCtx.moveTo(0, height / 2);
      canvasCtx.lineTo(width, height / 2);

      canvasCtx.moveTo(x, y);

      // ADVANCE X
      x = ((Math.log(i + 1) / Math.log(bufferLength)) * width);
    }

    // DRAW LINE TO FINISHING POINT
    canvasCtx.lineTo(width, height);

    // STROKE
    canvasCtx.stroke();
  };

  return draw;
};

const bg = '#000';
const fg = '#fff';

const App = () => {
  const audioEl = useRef(null);
  const volumeElement = useRef(null);
  const canvasElement = useRef(null);
  const audioCtx = useContext(AudioContext);
  const [trackNode, setTrackNode] = useState(null);
  const [gainNode, gainValue, setGainValue] = useGain(audioCtx);
  const analyserNode = useAnalyser(audioCtx);
  const audioGraphConnected = useRef(false);
  const dataArray = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    if (!dataArray.current) {
      dataArray.current = new Uint8Array(analyserNode.frequencyBinCount);
    }

    if (!rafId.current && canvasElement.current && audioEl.current) {
      const canvasCtx = canvasElement.current.getContext('2d');
      canvasCtx.canvas.height = window.innerHeight;
      canvasCtx.canvas.width = window.innerWidth;

      rafId.current = window.requestAnimationFrame(createDrawFunction({
        analyser: analyserNode,
        canvasCtx,
        width: canvasElement.current.width,
        height: canvasElement.current.height,
        dataArray: dataArray.current,
        bufferLength: analyserNode.frequencyBinCount,
        audioEl: audioEl.current,
      }));
    }

    return () => {
      window.cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
  });

  useEffect(() => {
    if (!trackNode) setTrackNode(audioCtx.createMediaElementSource(audioEl.current));

    if (!audioGraphConnected.current && trackNode) {
      trackNode
        .connect(gainNode)
        .connect(analyserNode)
        .connect(audioCtx.destination);

      audioGraphConnected.current = true;
    }

    return () => {/* cleanup */};
  });

  return (
    <div
      onKeyDown={(e) => {
        if (e.keyCode !== 32) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        if (audioEl.current.paused) {
          audioEl.current.play();
        } else {
          audioEl.current.pause();
        }
      }}
      tabIndex="0"
    >
      <audio
        ref={audioEl}
        controls={false}
        id="audio"
        src="agust.mp3"
      ></audio>

      <input
        value={gainValue}
        onChange={e => setGainValue(e.target.value)}
        ref={volumeElement}
        type="range"
        id="volume"
        min="0"
        max="1"
        step=".1"
        style={{ display: 'none' }}
      />

      <canvas
        ref={canvasElement}
        id="canvas"
        width="1300"
        height="500"
        style={{
          border: '1px solid',
          position: 'fixed',
          top: '0',
          left: '0',
        }}
      ></canvas>
    </div>
  );
};

export default App;
