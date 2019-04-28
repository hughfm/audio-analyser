import { AudioContext } from './index.js';
import useGain from './useGain.js';
import useAnalyser from './useAnalyser.js';
import AnimatedFrequencyGraph from './AnimatedFrequencyGraph.js';
import GraphBackdrop from './GraphBackdrop.js';
import AnimatedAudioPlayhead from './AnimatedAudioPlayhead.js';
import AnimatedAudioLoadState from './AnimatedAudioLoadState.js';
import useWindowSize from './useWindowSize.js';

const { useRef, useContext, useEffect, useState } = React;

const AGUST_URL = 'https://dl.dropboxusercontent.com/s/mqtdw1b7u02j9sf/agust.mp3?dl=0';

const App = () => {
  const audioElement = useRef(null);
  const volumeElement = useRef(null);
  const waveformCanvas = useRef(null);

  const audioCtx = useContext(AudioContext);
  const trackNode = useRef(null);
  const [gainNode, setGainValue] = useGain(audioCtx);
  const analyserNode = useAnalyser(audioCtx);
  const audioGraphConnected = useRef(false);
  const searchParams = new URLSearchParams(window.location.search);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [windowHeight, windowWidth] = useWindowSize();

  const [audioUrl, setAudioUrl] = useState(searchParams.get('track') || AGUST_URL);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const request = new XMLHttpRequest();
    request.open('GET', audioUrl);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      audioCtx.decodeAudioData(request.response, (buffer) => {
        setAudioBuffer(buffer);
      }, (error) => {
        console.log('error decoding.', error);
      });
    };
    request.send();
  }, []);

  const SAMPLES_TO_DRAW = 100000;

  useEffect(() => {
    const ctx = waveformCanvas.current.getContext('2d');

    ctx.clearRect(0, 0, windowWidth, windowHeight);
    ctx.lineWidth = windowWidth / SAMPLES_TO_DRAW;
    ctx.strokeStyle = 'black';
    ctx.beginPath();

    if (audioBuffer) {
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const data = audioBuffer.getChannelData(channel);

        let x = 0;
        let dataIndex, dataValue;

        for (let sample = 0; sample < SAMPLES_TO_DRAW; sample++) {
          dataIndex = ~~(data.length * (sample / SAMPLES_TO_DRAW));
          dataValue = data[dataIndex];

          ctx.moveTo(x, windowHeight / 2 * (channel + 1) - windowHeight / audioBuffer.numberOfChannels / 2);
          ctx.lineTo(x, windowHeight / 2 * (channel + 1) - windowHeight / audioBuffer.numberOfChannels / 2 + dataValue * windowHeight / audioBuffer.numberOfChannels / 2);

          x = (sample / SAMPLES_TO_DRAW) * windowWidth;
        }
      }

      ctx.stroke();
    }

    return () => {
      ctx.clearRect(0, 0, windowWidth, windowHeight);
    };
  }, [audioBuffer, windowHeight, windowWidth]);

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

      {/* CANVAS LAYERS */}
      <GraphBackdrop
        binCount={analyserNode.frequencyBinCount}
        binSpacing="log"
        tickSize={5}
        fillStyle="pink"
        strokeStyle="red"
        lineWidth={3}
      />

      <canvas
        className="canvas"
        ref={waveformCanvas}
        width={windowWidth}
        height={windowHeight}
      ></canvas>

      <AnimatedAudioLoadState
        audioElement={audioElement}
        fillStyle="rgba(0, 255, 255, 0.2)"
      />

      <AnimatedFrequencyGraph
        analyserNode={analyserNode}
        strokeStyle="blue"
        lineWidth={5}
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
