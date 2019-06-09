import { AudioContext } from './index.js';
import useGain from './useGain.js';
import useAnalyser from './useAnalyser.js';
import AnimatedFrequencyGraph from './AnimatedFrequencyGraph.js';
import GraphBackdrop from './GraphBackdrop.js';
import WaveformCanvas from './WaveformCanvas.js';
import useExternalAudio, { LOADING, DECODING, WAITING } from './useExternalAudio.js';
import useBufferSource from './useBufferSource.js';
import AnimatedAudioPlayhead from './AudioPlayhead.js';
import useColorScheme from './useColorScheme.js';

const { useRef, useContext, useEffect, useState } = React;

const AGUST_URL = 'https://dl.dropboxusercontent.com/s/mqtdw1b7u02j9sf/agust.mp3?dl=0';

const statusMessage = (state, error, progress, playing) => {
  if (error) return 'Error.';
  if (playing) return 'Playing.';

  switch (state) {
    case LOADING:
      return `${progress}% Loaded.`;
    case DECODING:
      return 'Decoding.';
    default:
      return 'Ready.';
  }
};

const App = () => {
  const volumeElement = useRef(null);

  const audioCtx = useContext(AudioContext);
  const [gainNode, setGainValue] = useGain(audioCtx);
  const analyserNode = useAnalyser(audioCtx);
  const searchParams = new URLSearchParams(window.location.search);
  const [audioUrl, setAudioUrl] = useState(searchParams.get('track') ? decodeURIComponent(searchParams.get('track')) : AGUST_URL);
  const [playing, setPlaying] = useState(() => audioCtx.state === 'running');
  // const [on, setOn] = useState(false);

  const [
    audioBuffer,
    { state, error, progress },
  ] = useExternalAudio(audioUrl, { context: audioCtx });

  const [bufferSource, bufferStartTime] = useBufferSource(audioBuffer, {
    context: audioCtx,
    onEnd: () => {
      audioCtx.suspend();
      setPlaying(false);
    },
  });

  const [colors, resetColors] = useColorScheme();
  const duration = audioBuffer ? audioBuffer.duration : 0;
  const readyToPlay = audioBuffer && !error && state === WAITING;

  useEffect(() => {
    bufferSource.current.connect(gainNode.current);
    gainNode.current.connect(analyserNode.current);
    analyserNode.current.connect(audioCtx.destination);

    audioCtx.suspend();
    setPlaying(audioCtx.state === 'running');

    return () => {
      bufferSource.current.disconnect();
      gainNode.current.disconnect();
      analyserNode.current.disconnect();
    };
  }, [bufferSource.current, audioBuffer]);

  const togglePlayingState = () => {
    if (!playing) {
      audioCtx.resume();
    } else {
      audioCtx.suspend();
    }

    setPlaying(!playing);
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
        <div className="url">
          <input
            type="text"
            value={audioUrl}
            onChange={({ target }) => {
              setAudioUrl(target.value);
              const url = new URL(window.location);
              url.searchParams.set('track', encodeURIComponent(target.value));
              history.replaceState({}, '', url.toString());
            }}
            className="urlInput"
          />
          <span className="message">{statusMessage(state, error, progress, playing)}</span>
        </div>

        <button
          className={
            `playPause ${playing ? "playing" : "paused"}`
          }
          onClick={togglePlayingState}
          disabled={!readyToPlay}
        >
          {playing ? 'Stop' : 'Play'}
        </button>

        <button
          onClick={resetColors}
          className="shuffle"
        >Shuffle</button>
      </div>

      <input
        className="volumeControl"
        value={gainNode.current.gain.value}
        onChange={e => setGainValue(e.target.value)}
        ref={volumeElement}
        type="range"
        id="volume"
        min="0"
        max="1"
        step=".01"
      />

      <GraphBackdrop fillStyle={colors.background} />

      <WaveformCanvas
        buffer={audioBuffer}
        strokeStyle="white"
        resolution={10000}
        constant={gainNode.current.gain.value}
      />

      <AnimatedFrequencyGraph
        analyserNode={analyserNode.current}
        strokeStyle="linen"
        lineWidth={1}
      />

      <AnimatedAudioPlayhead
        context={audioCtx}
        startTime={bufferStartTime.current}
        duration={duration}
      />
    </div>
  );
};

export default App;
