import useWindowSize from './useWindowSize.js';

const { useRef, useState, useEffect } = React;

const calculateProgress = (audioElement) => {
  if (!audioElement || !audioElement.duration) return 0;
  return audioElement.currentTime / audioElement.duration;
};

const useAudioProgress = (audioElement) => {
  const [audioProgress, setAudioProgress] = useState(() => {
    return calculateProgress(audioElement.current);
  });

  useEffect(() => {
    let rafId;

    const frame = () => {
      setAudioProgress(calculateProgress(audioElement.current));
      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [audioElement]);

  return audioProgress;
};

export default function AnimatedAudioPlayhead({ audioElement }) {
  const canvas = useRef(null);
  const [windowHeight, windowWidth] = useWindowSize();
  const audioProgress = useAudioProgress(audioElement);

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    ctx.clearRect(0, 0, windowWidth, windowHeight);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.beginPath();

    // DRAW PLAYHEAD
    ctx.moveTo(audioProgress * windowWidth, 0);
    ctx.lineTo(audioProgress * windowWidth, windowHeight);

    ctx.stroke();
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
