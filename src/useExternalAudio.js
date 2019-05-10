const { useEffect, useState } = React;

export default function useExternalAudio(url, { context }) {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(0);
    setError(null);
    setAudioBuffer(null);

    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'arraybuffer';

    request.addEventListener('progress', (e) => {
      setProgress(e.loaded / e.total);
    });

    request.addEventListener('load', () => {
      setLoading(false);
      setDecoding(true);

      context.decodeAudioData(request.response)
        .then((buffer) => setAudioBuffer(buffer))
        .catch((error) => setError(error))
        .then(() => setDecoding(false));
    });

    request.addEventListener('error', (e) => {
      setLoading(false);
      setError(e);
    });

    request.addEventListener('abort', () => {
      setLoading(false);
    });

    request.send();

    return () => {
      if (loading) request.abort();
      setAudioBuffer(null);
    };
  }, [url, context]);

  const metadata = { loading, error, progress, decoding };

  return [audioBuffer, metadata];
}
