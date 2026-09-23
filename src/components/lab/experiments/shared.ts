// --- p5 lifecycle -----------------------------------------------------------
// p5 2.x attaches ~20 window listeners (keyboard, pointer, wheel, resize, ...)
// when an instance starts and tears them down in `remove()`. Two traps: its
// friendly error system validates calls through zod's JIT compiler, which uses
// `new Function` and trips the site's `script-src 'self'` CSP (even zod's own
// capability probe reports a violation), and `remove()` is async and skips
// listener teardown while the instance has not finished starting, so rapid
// navigation leaked every listener per visit.

/** Import p5 with its friendly error system disabled and eval-free. */
export async function loadP5() {
  // zod (bundled inside p5) reads this config before building schemas and then
  // skips both the `new Function` probe and JIT compilation (its documented
  // `jitless` mode "useful in environments that disallow eval"). It is exposed
  // on globalThis precisely so it can be set before zod evaluates; it must run
  // before `import('p5')`, which constructs FES zod schemas at module load.
  const zodConfig = ((globalThis as any).__zod_globalConfig ??= {});
  zodConfig.jitless ??= true;
  const { default: P5 } = await import('p5');
  // p5 2.x's documented off switch for the friendly error system.
  P5.disableFriendlyErrors = true;
  return P5;
}

type P5InstanceLike = {
  remove: () => unknown;
  _runLifecycleHook?: (hookName: string) => unknown;
  _removeAbortController?: { abort: () => void };
  _requestAnimId?: number;
  _loop?: boolean;
  hitCriticalError?: boolean;
  _curElement?: unknown;
};

const liveP5Instances = new Set<P5InstanceLike>();

/** Track a live p5 instance so the shared mount lifecycle can always tear it down. */
export function trackP5<T extends P5InstanceLike>(instance: T): T {
  liveP5Instances.add(instance);
  return instance;
}

/** Complete, idempotent p5 teardown: window listeners, draw loop and canvas. */
export function disposeP5(instance: P5InstanceLike | null | undefined): void {
  if (!instance) return;
  liveP5Instances.delete(instance);
  // Halt startup/draw if the instance is still (or already) mid-setup.
  instance.hitCriticalError = true;
  instance._loop = false;
  if (instance._requestAnimId) window.cancelAnimationFrame(instance._requestAnimId);
  // `remove()` only aborts the listener signal and runs its 'remove' hooks once
  // the instance has a canvas. Do both up front so nothing leaks either way:
  // listeners registered with an already-aborted signal never attach.
  instance._removeAbortController?.abort();
  if (!instance._curElement) void instance._runLifecycleHook?.('remove'); // focus/blur handlers
  void instance.remove();
}

/** Shared mount-lifecycle sweep: tear down any tracked p5 instance still alive. */
export function disposeAllP5(): void {
  for (const instance of [...liveP5Instances]) disposeP5(instance);
}

export function fitStage(stage: HTMLElement, canvas?: HTMLCanvasElement) {
  const rect = stage.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  if (canvas) {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width;
    canvas.height = height;
  }
  return { width, height };
}

export function pointerRelative(e: PointerEvent | MouseEvent | Touch, stage: HTMLElement) {
  const rect = stage.getBoundingClientRect();
  return {
    x: (e.clientX ?? 0) - rect.left,
    y: (e.clientY ?? 0) - rect.top,
  };
}

export function watchSize(stage: HTMLElement, callback: () => void) {
  const ro = new ResizeObserver(() => callback());
  ro.observe(stage);
  return () => ro.disconnect();
}

export function waitForMedia(element: HTMLMediaElement | HTMLImageElement, ready: () => boolean, label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ready()) { resolve(); return; }
    const timeout = window.setTimeout(() => finish(new Error(`${label} timed out`)), 10000);
    const finish = (error?: Error) => {
      clearTimeout(timeout);
      element.removeEventListener('loadeddata', loaded);
      element.removeEventListener('load', loaded);
      element.removeEventListener('error', failed);
      error ? reject(error) : resolve();
    };
    const loaded = () => finish();
    const failed = () => finish(new Error(`${label} failed to load`));
    element.addEventListener('loadeddata', loaded, { once: true });
    element.addEventListener('load', loaded, { once: true });
    element.addEventListener('error', failed, { once: true });
  });
}
