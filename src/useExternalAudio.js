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
    setDecoding(false);

    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'arraybuffer';

    request.addEventListener('progress', (e) => {
      setProgress(e.loaded / e.total);
    });

    request.addEventListener('load', () => {
      if (request.status < 200 || request.status >= 300) {
        setError(new Error(`The HTTP request failed with status ${request.status}`));
        setLoading(false);
        return;
      }

      setLoading(false);
      setDecoding(true);

      context.decodeAudioData(request.response, (buffer) => {
        /* success */
        setAudioBuffer(buffer);
        setDecoding(false);
      }, (error) => {
        /* error */
        setError(error);
        setDecoding(false);
      });
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
