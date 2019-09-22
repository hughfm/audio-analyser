import useGain from './useGain.js';
import useAnalyser from './useAnalyser.js';
import AnimatedFrequencyGraph from './AnimatedFrequencyGraph.js';
import GraphBackdrop from './GraphBackdrop.js';
import WaveformCanvas from './WaveformCanvas.js';
import useExternalAudio from './useExternalAudio.js';
import useBufferSource from './useBufferSource.js';
import AnimatedAudioPlayhead from './AudioPlayhead.js';
import useColorScheme from './useColorScheme.js';
import useConnectedAudioGraph from './useConnectedAudioGraph.js';
import ControlBar from './ControlBar.js';
import useAudioContext from './useAudioContext.js';

const { useRef, useState } = React;

const AGUST_URL = 'https://dl.dropboxusercontent.com/s/mqtdw1b7u02j9sf/agust.mp3?dl=0';

const App = () => {
  const audioCtx = useAudioContext();

  const searchParams = new URLSearchParams(window.location.search);
  const trackInUrl = !!searchParams.get('track');
  const [audioUrl, setAudioUrl] = useState(searchParams.get('track') ? decodeURIComponent(searchParams.get('track')) : AGUST_URL);
  const [playing, setPlaying] = useState(() => audioCtx.state === 'running');
  const volumeElement = useRef(null);
  const [colors, resetColors] = useColorScheme();
  const [analyserSize, setAnalyserSize] = useState(Math.pow(2, 11));
  const [analyserSmoothing, setAnalyserSmoothing] = useState(0.95);

  // Load audio file
  const [
    audioBuffer,
    { state, error, progress },
  ] = useExternalAudio(audioUrl, { context: audioCtx });

  const duration = audioBuffer ? audioBuffer.duration : 0;

  // Create audio nodes
  const {
    node: gainNode,
    value: gainValue,
    setValue: setGainValue,
  } = useGain(1, { context: audioCtx });

  const { node: analyserNode } = useAnalyser(analyserSize, { context: audioCtx, smoothing: analyserSmoothing });
  const { node: bufferSource, startTime: bufferStartTime } = useBufferSource(audioBuffer, {
    context: audioCtx,
    onEnd: () => {
      audioCtx.suspend();
      setPlaying(false);
    },
  });

  // Connect audio graph
  useConnectedAudioGraph({
    context: audioCtx,
    source: bufferSource,
    nodes: [gainNode, analyserNode],
  });

  const togglePlayingState = () => {
    if (!playing) {
      audioCtx.resume();
    } else {
      audioCtx.suspend();
    }

    setPlaying(!playing);
  };

  const [showInstructions, setShowInstructions] = useState(true);

  return (
    <div
      onKeyDown={(e) => {
        if (e.keyCode !== 32 || e.target.tagName === 'BUTTON') return;
        togglePlayingState();
      }}
      tabIndex="0"
    >
      <ControlBar
        audioCtx={audioCtx}
        url={audioUrl}
        setUrl={setAudioUrl}
        state={state}
        error={error}
        progress={progress}
        playing={playing}
        audioBuffer={audioBuffer}
        togglePlayingState={togglePlayingState}
        shuffle={resetColors}
      />

      <div className="analyserSizeSelector">
        {
          [6, 7, 8, 9, 10, 11, 12]
            .map(num => Math.pow(2, num))
            .map(size => (
              <button
                key={size}
                onClick={() => setAnalyserSize(size)}
                className={analyserSize === size ? "active" : ""}
              >
                {size}
              </button>
            ))
        }
      </div>

      <div className="analyserSmoothingSelector">
        {
          [0.05, 0.25, 0.5, 0.75, 0.95]
            .map(value => (
              <button
                key={value}
                onClick={() => setAnalyserSmoothing(value)}
                className={analyserSmoothing === value ? "active" : ""}
              >
                {value}
              </button>
            ))
        }
      </div>

      <input
        className="volumeControl"
        value={gainValue}
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
        constant={gainValue}
      />

      <AnimatedFrequencyGraph
        analyserNode={analyserNode}
        strokeStyle="linen"
        lineWidth={1}
      />

      <AnimatedAudioPlayhead
        context={audioCtx}
        startTime={bufferStartTime}
        duration={duration}
      />

      <div className="credits">
        Created by <a href="https://www.hughfm.com">Hugh Middleton</a>. View the code on <a href="https://www.github.com/hughfm/audio-analyser">GitHub</a>.
      </div>

      {
        showInstructions && !trackInUrl && (
          <div className="instructions">
            <p>Welcome.</p>
            <p>
              Paste a URL to any audio file on the web into the text input at the top to load and play it.
            </p>
            <p>
              Once you have loaded in a new track, copy paste the URL from your browser's address bar to share it.
            </p>
            <p>
              By default, it will play my recording of the superb piece <a href="https://www.youtube.com/watch?v=LYvlmiwEP9M">Ágúst</a> by Ólafur Arnalds.
            </p>
            <button onClick={() => setShowInstructions(false)}>Start</button>
          </div>
        )
      }
    </div>
  );
};

export default App;
