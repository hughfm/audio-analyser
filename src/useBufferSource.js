const { useEffect, useRef } = React;

export default function useBufferSource(audioBuffer, { context, onEnd }) {
  const bufferSource = useRef();
  const startTime = useRef(0);

  useEffect(() => {
    bufferSource.current = context.createBufferSource();
    bufferSource.current.buffer = audioBuffer;

    bufferSource.current.onended = () => {
      onEnd();
    };

    bufferSource.current.start();
    startTime.current = context.currentTime;

    return () => {
      bufferSource.current.stop();
      bufferSource.current.disconnect();
    };
  }, [audioBuffer]);

  return [bufferSource, startTime];
}
