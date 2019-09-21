const { useEffect, useState, useRef } = React;

export default function useAudioTime(context) {
  const [currentTime, setCurrentTime] = useState(0);
  const rafId = useRef();

  useEffect(() => {
    const frame = () => {
      setCurrentTime(context.currentTime);
      rafId.current = requestAnimationFrame(frame);
    };

    rafId.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId.current);
  }, [context]);

  return currentTime;
}
