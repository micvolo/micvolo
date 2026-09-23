// Port of lab/src/scripts/recorder.ts — S-key canvas→webm MediaRecorder download.
// Bound to the card canvas instead of document.querySelector("canvas") so it scopes per-card.

export function mountRecorder(canvas: HTMLCanvasElement): () => void {
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const a = document.createElement('a');
    a.setAttribute('href', URL.createObjectURL(blob));
    a.setAttribute('download', 'r.webm');
    a.click();
    a.remove();
  };

  const defaultTitle = document.title;
  const onKeydown = (e: KeyboardEvent) => {
    if (e.code === 'KeyS') {
      if (recorder.state === 'recording') {
        recorder.stop();
        document.title = defaultTitle;
      } else {
        recorder.start();
        document.title = 'Recording | ' + defaultTitle;
      }
    }
  };
  addEventListener('keydown', onKeydown);

  return () => {
    removeEventListener('keydown', onKeydown);
    if (recorder.state === 'recording') {
      recorder.stop();
      document.title = defaultTitle;
    }
  };
}
