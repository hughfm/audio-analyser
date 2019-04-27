import { AudioContext } from './index.js';
import useGain from './useGain.js';
import useAnalyser from './useAnalyser.js';
import AnimatedFrequencyGraph from './AnimatedFrequencyGraph.js';
import GraphBackdrop from './GraphBackdrop.js';
import AnimatedAudioPlayhead from './AnimatedAudioPlayhead.js';
import AnimatedAudioLoadState from './AnimatedAudioLoadState.js';

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
    if (audioElement.current.paused) {
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
            `playPause ${!audioElement.current || audioElement.current.paused ? "paused" : "playing"}`
          }
          onClick={togglePlayingState}
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

      <GraphBackdrop binCount={analyserNode.frequencyBinCount} />
      <AnimatedAudioLoadState audioElement={audioElement} />
      <AnimatedAudioPlayhead audioElement={audioElement} />
      <AnimatedFrequencyGraph analyserNode={analyserNode} />
    </div>
  );
};

export default App;
