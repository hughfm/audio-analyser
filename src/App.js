import { AudioContext } from './index.js';
import useGain from './useGain.js';
import useAnalyser from './useAnalyser.js';

const { useRef, useContext, useEffect, useState } = React;

const createDrawFunction = ({
  canvasCtx,
  analyser,
  dataArray,
  bufferLength,
  audioEl,
}) => {
  const draw = () => {
    const width = canvasCtx.canvas.width;
    const height = canvasCtx.canvas.height;
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    // CLEAR SCREEN
    canvasCtx.fillStyle = 'black';
    canvasCtx.fillRect(0, 0, width, height);

    // FILL LOAD STATE
    const loadProgress = audioEl.buffered.length
      ? audioEl.buffered.end(0) / audioEl.duration
      : 0;
    canvasCtx.fillStyle = '#333';
    canvasCtx.fillRect(0, 0, width * loadProgress, height);

    // SET LINE STYLE
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = 'white';

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

const AGUST_URL = 'https://dl.dropboxusercontent.com/s/mqtdw1b7u02j9sf/agust.mp3?dl=0';

const App = () => {
  const audioElement = useRef(null);
  const volumeElement = useRef(null);
  const canvasElement = useRef(null);
  const audioCtx = useContext(AudioContext);
  const trackNode = useRef(null);
  const [gainNode, setGainValue] = useGain(audioCtx);
  const analyserNode = useAnalyser(audioCtx);
  const audioGraphConnected = useRef(false);
  const dataArray = useRef(null);
  const rafId = useRef(null);
  const searchParams = new URLSearchParams(window.location.search);
  const [audioUrl, setAudioUrl] = useState(searchParams.get('track') || AGUST_URL);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvasCtx = canvasElement.current.getContext('2d');
      canvasCtx.canvas.height = window.innerHeight;
      canvasCtx.canvas.width = window.innerWidth;
    };

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [canvasElement]);

  useEffect(() => {
    if (!dataArray.current) {
      dataArray.current = new Uint8Array(analyserNode.frequencyBinCount);
    }

    if (!rafId.current && canvasElement.current && audioElement.current) {
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
        audioEl: audioElement.current,
      }));
    }

    return () => {
      window.cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
  }, [dataArray, analyserNode, rafId, canvasElement, audioElement]);

  useEffect(() => {
    if (!trackNode.current && audioElement.current) {
      trackNode.current = audioCtx.createMediaElementSource(audioElement.current);
    }

    return () => {};
  });

  useEffect(() => {
    if (!audioGraphConnected.current && trackNode.current) {
      trackNode.current.connect(gainNode);
      gainNode.connect(analyserNode);
      analyserNode.connect(audioCtx.destination);

      audioGraphConnected.current = true;
    }

    return () => {
      trackNode.current.disconnect();
      gainNode.disconnect();
      analyserNode.disconnect();

      audioGraphConnected.current = false;
    };
  }, []);

  return (
    <div
      onKeyDown={(e) => {
        if (e.keyCode !== 32 || e.target.tagName === 'BUTTON') return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        if (audioElement.current.paused) {
          audioElement.current.play();
          setPlaying(true);
        } else {
          audioElement.current.pause();
          setPlaying(false);
        }
      }}
      tabIndex="0"
    >
      <div className="topBar">
        <input
          type="text"
          value={audioUrl}
          onChange={({ target }) => setAudioUrl(target.value)}
          className="urlInput"
        />
        <button
          className={
            `playPause ${!audioElement.current || audioElement.current.paused ? "paused" : "playing"}`
          }
          onClick={() => {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            if (audioElement.current.paused) {
              audioElement.current.play();
              setPlaying(true);
            } else {
              audioElement.current.pause();
              setPlaying(false);
            }
          }}
        >
          {!audioElement.current || audioElement.current.paused ? 'Play' : 'Pause'}
        </button>
      </div>

      <audio
        ref={audioElement}
        controls={false}
        id="audio"
        src={audioUrl}
        crossOrigin="anonymous"
      ></audio>

      <input
        className="volumeControl"
        value={gainNode.gain.value}
        onChange={e => setGainValue(e.target.value)}
        ref={volumeElement}
        type="range"
        id="volume"
        min="0"
        max="1"
        step=".01"
      />

      <canvas
        className="canvas"
        ref={canvasElement}
        id="canvas"
      ></canvas>
    </div>
  );
};

export default App;
