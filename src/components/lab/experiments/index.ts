import type { Project } from '@/lib/lab/projects';
import { disposeAllP5 } from './shared';

export type MountOptions = {
  reducedMotion: boolean;
  /** Description-area slot the experiment renders its parameter fields into. */
  params: HTMLElement;
};
export type MountFn = (stage: HTMLElement, opts: MountOptions) => (() => void) | Promise<() => void>;

const modules: Record<string, () => Promise<{ default: MountFn }>> = {
  a15: () => import('./a15'), a18: () => import('./a18'), a25: () => import('./a25'), a26: () => import('./a26'), a29: () => import('./a29'), a30: () => import('./a30'), a31: () => import('./a31'), a32: () => import('./a32'), a33: () => import('./a33'), a35: () => import('./a35'), a41: () => import('./a41'), a42: () => import('./a42'),
};

function clearStageResources(stage: HTMLElement) {
  stage.querySelectorAll<HTMLVideoElement>('video').forEach((video) => { video.pause(); video.srcObject = null; video.removeAttribute('src'); video.load(); });
  stage.querySelectorAll<HTMLCanvasElement>('canvas').forEach((canvas) => (canvas.getContext('webgl') ?? canvas.getContext('webgl2'))?.getExtension('WEBGL_lose_context')?.loseContext());
  stage.replaceChildren();
}

export function mountExperiment(id: string, stage: HTMLElement, opts: MountOptions): () => void {
  const clearAll = () => {
    disposeAllP5();
    clearStageResources(stage);
    opts.params.replaceChildren();
  };
  const loader = modules[id];
  if (!loader) { stage.innerHTML = `<p class="lab-card__fallback">Experiment <code>${id}</code> is not available.</p>`; return () => {}; }
  clearAll();
  let disposed = false;
  let dispose: (() => void) | undefined;
  loader().then((mod) => disposed ? undefined : mod.default(stage, opts)).then((mountedDispose) => {
    if (!mountedDispose) return;
    if (disposed) mountedDispose(); else dispose = mountedDispose;
  }).catch((error) => {
    if (disposed) return;
    console.error(`Failed to load experiment ${id}:`, error);
    clearAll();
    stage.innerHTML = `<p class="lab-card__fallback">This experiment could not start in this browser. Try another browser or return to the <a href="/graphic-experiments">Graphic experiments index</a>.</p>`;
  });
  return () => { disposed = true; dispose?.(); clearAll(); };
}
