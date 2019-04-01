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

const createDrawFunction = ({ canvasCtx, analyser, dataArray, width, height, bufferLength }) => {
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

const bg = '#ecd078';
const fg = '#605063';

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

    if (!rafId.current && canvasElement.current) {
      rafId.current = window.requestAnimationFrame(createDrawFunction({
        analyser: analyserNode,
        canvasCtx: canvasElement.current.getContext('2d'),
        width: canvasElement.current.width,
        height: canvasElement.current.height,
        dataArray: dataArray.current,
        bufferLength: analyserNode.frequencyBinCount,
      }));
    }

    return () => {/* cleanup */};
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
    <div>
      <h1>Web Audio API</h1>

      <audio
        ref={audioEl}
        controls={false}
        id="audio"
        src="crusade-mkii.mp3"
      ></audio>

      <button
        id="play"
        onClick={() => {
          if (audioCtx.state === 'suspended') audioCtx.resume();
          if (audioEl.current.paused) {
            audioEl.current.play();
          } else {
            audioEl.current.pause();
          }
        }}
      >
        Play/Pause
      </button>

      <input
        value={gainValue}
        onChange={e => setGainValue(e.target.value)}
        ref={volumeElement}
        type="range"
        id="volume"
        min="0"
        max="1"
        step=".1"
      />

      <canvas
        ref={canvasElement}
        id="canvas"
        width="1300"
        height="500"
        style={{ border: '1px solid' }}
      ></canvas>
    </div>
  );
};

export default App;
