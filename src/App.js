import { AudioContext } from './index.js';
import useGain from './useGain.js';
import useAnalyser from './useAnalyser.js';
import AnimatedFrequencyGraph from './AnimatedFrequencyGraph.js';
import GraphBackdrop from './GraphBackdrop.js';
import AnimatedAudioPlayhead from './AnimatedAudioPlayhead.js';
import AnimatedAudioLoadState from './AnimatedAudioLoadState.js';
import WaveformCanvas from './WaveformCanvas.js';
import useExternalAudio from './useExternalAudio.js';

const { useRef, useContext, useEffect, useState } = React;

const AGUST_URL = 'https://dl.dropboxusercontent.com/s/mqtdw1b7u02j9sf/agust.mp3?dl=0';

const App = () => {
  const audioElement = useRef(null);
  const volumeElement = useRef(null);

  const audioCtx = useContext(AudioContext);
  const trackNode = useRef(null);
  const [gainNode, setGainValue] = useGain(audioCtx);
  const analyserNode = useAnalyser(audioCtx);
  const audioGraphConnected = useRef(false);
  const searchParams = new URLSearchParams(window.location.search);
  const [audioUrl, setAudioUrl] = useState(searchParams.get('track') || AGUST_URL);
  const [playing, setPlaying] = useState(false);
  const audioBuffer = useExternalAudio(audioUrl, { context: audioCtx });

  useEffect(() => {
    if (!trackNode.current && audioElement.current) {
      trackNode.current = audioCtx.createMediaElementSource(audioElement.current);
    }

    return () => {};
  }, [audioElement, trackNode, audioCtx]);

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

  const togglePlayingState = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (!playing) {
      audioElement.current.play();
      setPlaying(true);
    } else {
      audioElement.current.pause();
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

      <audio
        ref={audioElement}
        controls={false}
        id="audio"
        src={audioUrl}
        // eslint-disable-next-line react/no-unknown-property
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

      {/* CANVAS LAYERS */}
      <GraphBackdrop
        binCount={analyserNode.frequencyBinCount}
        binSpacing="log"
        tickSize={5}
        fillStyle="pink"
        strokeStyle="red"
        lineWidth={3}
      />

      <WaveformCanvas
        buffer={audioBuffer}
        strokeStyle="white"
        resolution={10000}
      />

      <AnimatedAudioLoadState
        audioElement={audioElement}
        fillStyle="rgba(0, 255, 255, 0.2)"
      />

      <AnimatedFrequencyGraph
        analyserNode={analyserNode}
        strokeStyle="blue"
        lineWidth={1}
      />

      <AnimatedAudioPlayhead
        audioElement={audioElement}
        strokeStyle="yellow"
        lineWidth={10}
      />
    </div>
  );
};

export default App;
