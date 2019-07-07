const { useRef } = React;

const BrowserAudioContext = window.AudioContext || window.webkitAudioContext;

export default () => {
  const ref = useRef(null);

  if (ref.current) return ref.current;

  ref.current = new BrowserAudioContext();
  ref.current.suspend();

  return ref.current;
};
