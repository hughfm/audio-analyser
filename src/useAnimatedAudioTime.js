const { useEffect, useState } = React;

export default function useAudioTime(context) {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let rafId;

    const frame = () => {
      rafId = window.requestAnimationFrame(frame);
      setCurrentTime(context.currentTime);
    };

    rafId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [context]);

  return currentTime;
}
