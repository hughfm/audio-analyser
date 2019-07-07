const { useEffect } = React;

const useConnectedAudioGraph = ({ context, nodes, source }) => {
  useEffect(() => {
    if ([context, source, ...nodes].every(Boolean)) {
      source.connect(nodes[0]);

      nodes.forEach((node, index, nodeArray) => {
        if (index < nodeArray.length - 1) {
          node.connect(nodeArray[index + 1]);
        } else {
          node.connect(context.destination);
        }
      });
    }

    return () => {
      [source, ...nodes]
        .filter(Boolean)
        .forEach(node => node.disconnect());
    };
  }, [context, source, ...nodes]);
};

export default useConnectedAudioGraph;
