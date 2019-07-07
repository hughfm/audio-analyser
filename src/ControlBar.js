import { LOADING, DECODING, WAITING } from './useExternalAudio.js';

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

const ControlBar = ({
  url,
  setUrl,
  state,
  error,
  progress,
  playing,
  audioBuffer,
  togglePlayingState,
  shuffle,
}) => {
  const readyToPlay = audioBuffer && !error && state === WAITING;

  return (
    <div className="topBar">
      <div className="url">
        <input
          type="text"
          value={url}
          onChange={({ target }) => {
            setUrl(target.value);
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
        onClick={shuffle}
        className="shuffle"
      >Shuffle</button>
    </div>
  );
};

export default ControlBar;
