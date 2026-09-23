import { DEFAULT_FONT } from './default-font';
import { getParsedTexts, type TextParams, type ParsedText } from './text-parsing';
import { drawText, calcReturnAnimation, calcMousePressed } from './text-drawing';
import { clearSavedParams, loadParams, saveCurrent, setupControlPanel } from './control-panel';
import { loadP5 } from '../lab/experiments/shared';
import type { ParamsApi } from '@/lib/params/params';

type LetterFlowParams = {
  texts: TextParams[];
  mouseSize: number;
  selectCurves: boolean;
  export: { withBackground: boolean };
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export function initLetterFlow(frame: HTMLElement, paramsRoot: HTMLElement) {
  let disposed = false;
  let p5Instance: any = null;
  let controls: ParamsApi | null = null;
  let resizeFrame = 0;
  let generation = 0;
  let recreateParams: (() => void) | null = null;
  const pendingTimeouts = new Set<number>();
  const canvasContainer = frame.querySelector<HTMLElement>('.letter-flow-canvas');
  if (!canvasContainer) throw new Error('Letter Flow canvas container is missing.');

  const resetValues: LetterFlowParams = {
    // strokecolor is the brand orange (--palette-orange in site.css).
    texts: [{ string: 'drag me', size: 150, lineHeight: 1, textcolor: '#FFFFFF', strokecolor: '#ff7142', stroke: true, strokeWeight: 2, move: { x: 0, y: 0 }, straEffect: true, return: true, returnSpeed: .01, delay: 0, lock: false, font: DEFAULT_FONT }],
    mouseSize: 150, selectCurves: true, export: { withBackground: false },
  };
  const params = loadParams(resetValues);
  let rebuild: (() => Promise<void>) | null = null;

  const showError = (message: string) => {
    if (disposed) return;
    let error = frame.querySelector<HTMLElement>('.letter-flow-error');
    if (!error) { error = document.createElement('p'); error.className = 'letter-flow-error'; error.setAttribute('role', 'status'); frame.appendChild(error); }
    error.textContent = message;
  };
  const clearError = () => frame.querySelector('.letter-flow-error')?.remove();

  const reset = async () => {
    Object.assign(params, clone(resetValues));
    clearSavedParams();
    recreateParams?.();
    await rebuild?.();
  };

  const ro = new ResizeObserver(() => {
    if (resizeFrame || disposed) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      p5Instance?.windowResized?.();
    });
  });
  ro.observe(frame);

  void loadP5().then((P5) => {
    if (disposed) return;
    const sketch = (p5: any) => {
      let width = 0;
      let height = 0;
      let layer: any;
      let mouseLayer: any;
      let texts: ParsedText[] = [];
      let textLayers: any[] = [];
      const translatingVertex: any[] = [];

      const dimensions = () => {
        const rect = frame.getBoundingClientRect();
        return { width: Math.max(1, Math.floor(rect.width)), height: Math.max(1, Math.floor(rect.height)) };
      };
      const replaceLayers = () => {
        textLayers.forEach((item) => item.remove?.());
        textLayers = texts.map(() => p5.createGraphics(width, height));
        texts.forEach((text, index) => { text.layer = textLayers[index]; });
      };
      rebuild = async () => {
        const current = ++generation;
        try {
          const next = await getParsedTexts(params.texts, width, height);
          if (disposed || current !== generation) return;
          texts = next;
          replaceLayers();
          clearError();
          saveCurrent(params);
        } catch (error) {
          if (!disposed && current === generation) {
            showError('The selected font could not be read. Reset or choose another font.');
            console.error('Letter Flow text refresh failed:', error);
          }
        }
      };
      const saveScreen = () => {
        if (params.export.withBackground) p5.saveCanvas(`LETTERFLOW-${Date.now()}`, 'png');
        else p5.saveCanvas(layer, `LETTERFLOW-${Date.now()}`, 'png');
      };
      const createParamsUI = () => {
        const open = controls?.isOpen() ?? false;
        controls?.dispose();
        controls = setupControlPanel(params, resetValues, () => rebuild?.() ?? Promise.resolve(), saveScreen, reset, paramsRoot, frame);
        controls.setOpen(open);
      };
      recreateParams = createParamsUI;

      try { createParamsUI(); }
      catch (error) { showError('Settings are unavailable, but the canvas remains usable.'); console.error('Letter Flow controls failed:', error); }

      p5.setup = () => {
        ({ width, height } = dimensions());
        p5.createCanvas(width, height).parent(canvasContainer);
        layer = p5.createGraphics(width, height);
        mouseLayer = p5.createGraphics(width, height);
        void rebuild?.();
      };
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      p5.draw = () => {
        p5.clear(); layer.clear(); mouseLayer.clear();
        for (const text of texts) { if (!text.straEffect) text.layer.clear(); drawText(p5, text); }
        if (p5.mouseIsPressed && !reducedMotion) calcMousePressed(p5, mouseLayer, translatingVertex, params.mouseSize, params.selectCurves);
        for (const text of texts) if (text.back && !reducedMotion) calcReturnAnimation(p5, text, params.selectCurves);
        for (const text of texts) layer.image(text.layer, 0, 0);
        p5.image(layer, 0, 0); if (!reducedMotion) p5.image(mouseLayer, 0, 0);
      };
      p5.mousePressed = () => {
        const mouse = p5.createVector(p5.mouseX, p5.mouseY); const selected: any[] = [];
        for (const text of texts) {
          if (text.lock) continue;
          const vertex: any[] = [];
          for (const path of text.paths) for (const command of path.commands as any[]) {
            const point = p5.createVector(command.x + text.traslate.x, command.y + text.traslate.y);
            if (Number.isFinite(command.x) && Number.isFinite(command.y) && point.dist(mouse) < params.mouseSize / 2) { command.lerp = false; command.lerpValue = 1; vertex.push(command); }
          }
          if (vertex.length) selected.push({ vertex, text });
        }
        if (selected.length) translatingVertex.push({ mouse: { x: p5.mouseX, y: p5.mouseY }, texts: selected });
      };
      p5.mouseReleased = () => {
        const list = translatingVertex.at(-1); if (!list) return;
        for (const text of list.texts) {
          const timeout = window.setTimeout(() => {
            pendingTimeouts.delete(timeout);
            if (disposed) return;
            text.vertex.forEach((vertex: any) => { vertex.lerp = true; vertex.lerpValue = 1; });
          }, text.text.backDelay * 1000);
          pendingTimeouts.add(timeout);
        }
        translatingVertex.shift();
      };
      p5.windowResized = () => {
        const next = dimensions();
        if (next.width === width && next.height === height) return;
        width = next.width; height = next.height;
        p5.resizeCanvas(width, height); layer.resizeCanvas(width, height); mouseLayer.resizeCanvas(width, height);
        void rebuild?.();
      };
    };
    const instance = new P5(sketch, canvasContainer);
    if (disposed) instance.remove(); else p5Instance = instance;
  }).catch((error) => { showError('Letter Flow could not start. Reset the experiment to try again.'); console.error('Letter Flow failed to load:', error); });

  return () => {
    disposed = true; generation++; ro.disconnect();
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    pendingTimeouts.forEach((timeout) => clearTimeout(timeout)); pendingTimeouts.clear();
    recreateParams = null;
    controls?.dispose(); controls = null;
    p5Instance?.remove(); p5Instance = null;
  };
}
