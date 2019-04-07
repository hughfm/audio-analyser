const { useRef, useState } = React;

export default function useGain(ctx) {
  const gainNodeRef = useRef();

  if (!gainNodeRef.current) gainNodeRef.current = ctx.createGain();

  const { current: gainNode } = gainNodeRef;
  const [_, setGainValue] = useState(gainNode.gain.value);

  return [
    gainNode,
    (value) => {
      gainNode.gain.value = value;
      setGainValue(value);
    },
  ];
}
