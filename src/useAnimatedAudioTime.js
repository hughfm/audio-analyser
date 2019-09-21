const { useEffect, useState } = React;

export default function useAudioTime(context) {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setCurrentTime(context.currentTime);
    });

    return () => cancelAnimationFrame(rafId);
  }, [context currentTime]);

  return currentTime;
}
