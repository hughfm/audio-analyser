const { useEffect, useState } = React;

export default function useGain(initialValue = 1, { context }) {
  const [node, setNode] = useState(null);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (context) {
      const newNode = context.createGain();
      newNode.gain.value = value;
      setNode(newNode);
    }
  }, [context, initialValue]);

  return {
    node,
    value,
    setValue: (value) => {
      node.gain.value = value;
      setValue(value);
    },
  }
}
