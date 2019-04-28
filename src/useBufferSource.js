const { useEffect, useRef } = React;

export default function useBufferSource(audioBuffer, { context }) {
  const bufferSource = useRef();

  useEffect(() => {
    bufferSource.current = context.createBufferSource();
    bufferSource.current.buffer = audioBuffer;
  }, [audioBuffer]);

  return bufferSource;
}
