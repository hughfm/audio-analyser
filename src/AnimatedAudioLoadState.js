import useWindowSize from './useWindowSize.js';

const { useRef, useState, useEffect } = React;

const calculateProgress = (audioElement) => {
  if (!audioElement || !audioElement.duration || !audioElement.buffered.length) return 0;
  return audioElement.buffered.end(0) / audioElement.duration;
};

const useAudioBufferProgress = (audioElement) => {
  const [audioBufferProgress, setAudioBufferProgress] = useState(() => {
    return calculateProgress(audioElement.current);
  });

  useEffect(() => {
    let rafId;

    const frame = () => {
      setAudioBufferProgress(calculateProgress(audioElement.current));
      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [audioElement]);

  return audioBufferProgress;
};

export default function AnimatedAudioLoadState({ audioElement }) {
  const canvas = useRef(null);
  const [windowHeight, windowWidth] = useWindowSize();
  const audioBufferProgress = useAudioBufferProgress(audioElement);

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    ctx.clearRect(0, 0, windowWidth, windowHeight);

    // FILL LOAD STATE
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, 0, windowWidth * audioBufferProgress, windowHeight);
  });

  return (
    <canvas
      ref={canvas}
      className="canvas"
      width={windowWidth}
      height={windowHeight}
    ></canvas>
  );
};
