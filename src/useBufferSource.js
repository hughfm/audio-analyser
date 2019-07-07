const { useEffect, useState } = React;

export default function useBufferSource(audioBuffer, { context, onEnd }) {
  const [node, setNode] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (context && audioBuffer && (!node || node.buffer !== audioBuffer)) {
      const newNode = context.createBufferSource();

      newNode.buffer = audioBuffer;

      if (typeof onEnd === 'function') {
        newNode.onended = () => onEnd();
      }

      setNode(newNode);
      setStartTime(context.currentTime);
      newNode.start();
    }
  }, [context, audioBuffer, onEnd]);

  return { node, startTime };
}
