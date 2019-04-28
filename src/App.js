import { AudioContext } from './index.js';
import useGain from './useGain.js';
import useAnalyser from './useAnalyser.js';
import AnimatedFrequencyGraph from './AnimatedFrequencyGraph.js';
import GraphBackdrop from './GraphBackdrop.js';
import WaveformCanvas from './WaveformCanvas.js';
import useExternalAudio from './useExternalAudio.js';

const { useRef, useContext, useEffect, useState } = React;

const AGUST_URL = 'https://dl.dropboxusercontent.com/s/mqtdw1b7u02j9sf/agust.mp3?dl=0';

const App = () => {
  const volumeElement = useRef(null);

  const audioCtx = useContext(AudioContext);
  const [gainNode, setGainValue] = useGain(audioCtx);
  const analyserNode = useAnalyser(audioCtx);
  const searchParams = new URLSearchParams(window.location.search);
  const [audioUrl, setAudioUrl] = useState(searchParams.get('track') || AGUST_URL);
  const [playing, setPlaying] = useState(() => audioCtx.state === 'running');

  const audioBuffer = useExternalAudio(audioUrl, { context: audioCtx });
  const bufferSource = useRef();
  if (!bufferSource.current) bufferSource.current = audioCtx.createBufferSource();

  useEffect(() => {
    if (audioBuffer && bufferSource.current) {
      bufferSource.current.buffer = audioBuffer;
      bufferSource.current.start();
      if (audioCtx.state === 'running') setPlaying(true);
    }

    return () => {
      if (bufferSource.current) bufferSource.current.buffer = null;
    };
  }, [bufferSource, audioBuffer]);

  useEffect(() => {
    bufferSource.current && bufferSource.current.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);

    return () => {
      bufferSource.current && bufferSource.current.disconnect();
      gainNode.disconnect();
      analyserNode.disconnect();
    };
  }, [audioCtx, bufferSource, gainNode, analyserNode]);

  const togglePlayingState = () => {
    if (!playing) {
      audioCtx.resume();
      setPlaying(true);
    } else {
      audioCtx.suspend();
      setPlaying(false);
    }
  };

  return (
    <div
      onKeyDown={(e) => {
        if (e.keyCode !== 32 || e.target.tagName === 'BUTTON') return;
        togglePlayingState();
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
            `playPause ${playing ? "playing" : "paused"}`
          }
          onClick={togglePlayingState}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>

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

      <GraphBackdrop fillStyle="pink" />

      <WaveformCanvas
        buffer={audioBuffer}
        strokeStyle="white"
        resolution={10000}
      />

      <AnimatedFrequencyGraph
        analyserNode={analyserNode}
        strokeStyle="blue"
        lineWidth={1}
      />
    </div>
  );
};

export default App;
