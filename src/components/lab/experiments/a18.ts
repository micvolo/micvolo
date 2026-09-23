import type { MountFn } from './index';
import { disposeP5, fitStage, loadP5, trackP5, watchSize } from './shared';
import { createParams } from '@/lib/params/params';

const a18: MountFn = async (stage, opts) => {
  const [P5, opentype] = await Promise.all([loadP5(), import('opentype.js')]);

  let p5Instance: InstanceType<typeof P5> | null = null;

  const PARAMS = {
    rows: 10,
    cols: 10,
    noiseSpeed: 0.01,
    string: 'DEMO',
    // SF Pro is wider than the old Thunder face; 450 keeps the word's footprint close to the original 600.
    size: 450,
    fps: 60,
    stroke: false,
    strokeWeight: 1,
    bgcolor: '#000000',
    textcolor: '#FFFFFF',
    strokecolor: '#000000',
  };

  const paramsUI = createParams({
    root: opts.params,
    stage,
    onChange: () => { (p5Instance as any)?.recalculate?.(); },
    setup: (fields) => {
      fields.addText(PARAMS, 'string');
      fields.addNumber(PARAMS, 'size', { min: 0, max: 1000 });
      fields.addNumber(PARAMS, 'rows', { min: 1, max: 1000 });
      fields.addNumber(PARAMS, 'cols', { min: 1, max: 1000 });
      fields.addNumber(PARAMS, 'noiseSpeed', { min: 0.001, max: 0.1, step: 0.001 });
      fields.addBoolean(PARAMS, 'stroke');
      fields.addNumber(PARAMS, 'strokeWeight', { min: 0, max: 10, step: 0.1 });
      fields.addColor(PARAMS, 'bgcolor', { label: 'Background' });
      fields.addColor(PARAMS, 'textcolor', { label: 'Text color' });
      fields.addColor(PARAMS, 'strokecolor', { label: 'Stroke color' });
      fields.addNumber(PARAMS, 'fps', { label: 'FPS', min: 0, max: 100, readonly: true });
    },
  });

  const container = document.createElement('div');
  container.className = 'lab-p5';
  stage.appendChild(container);

  const sketch = (p5: InstanceType<typeof P5>) => {
    let pg: ReturnType<InstanceType<typeof P5>['createGraphics']>;
    let font: opentype.Font;
    let paths: opentype.Path[];
    let textW = 0;
    let textH = 0;
    let translate = { x: 0, y: 0 };
    const grid = { minx: 100, maxx: 0, miny: 100, maxy: 0 };

    p5.setup = async () => {
      const { width: w, height: h } = fitStage(stage);
      p5.createCanvas(w, h);
      pg = p5.createGraphics(w, h);
      container.style.opacity = '1';
      const response = await fetch('/fonts/sf-pro.ttf');
      if (!response.ok) throw new Error('The experiment font could not be loaded.');
      font = opentype.parse(await response.arrayBuffer());
      recalc();
    };

    const recalc = () => {
      grid.minx = 100; grid.maxx = 0; grid.miny = 100; grid.maxy = 0;
      paths = font.getPaths(PARAMS.string, 0, 0, PARAMS.size);
      textW = font.getAdvanceWidth(PARAMS.string, PARAMS.size);
      textH = 0;
      for (const path of paths) {
        const h = Math.abs(path.getBoundingBox().y1 - path.getBoundingBox().y2);
        if (h > textH) textH = h;
        for (const c of path.commands as any[]) {
          if (c.x && c.y) {
            c.i = +(c.x / 100).toFixed();
            c.j = +(c.y / 100).toFixed();
            if (c.i < grid.minx) grid.minx = c.i;
            if (c.i > grid.maxx) grid.maxx = c.i;
            if (c.j < grid.miny) grid.miny = c.j;
            if (c.j > grid.maxy) grid.maxy = c.j;
          }
        }
      }
      const { width: w, height: h } = fitStage(stage);
      translate = { x: (w - textW) / 2, y: (h - textH) / 2 + textH };
    };
    (p5 as any).recalculate = recalc;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    p5.draw = () => {
      if (!paths || !pg) return;
      if (reducedMotion) {
        p5.background(PARAMS.bgcolor);
        pg.push();
        pg.translate(translate.x, translate.y);
        pg.strokeWeight(PARAMS.strokeWeight);
        if (PARAMS.stroke) { pg.stroke(PARAMS.strokecolor); pg.noFill(); }
        else { pg.stroke(PARAMS.strokecolor); pg.fill(PARAMS.textcolor); }
        for (const path of paths) {
          pg.beginShape();
          let point = { x: 0, y: 0 };
          for (const c of path.commands as any[]) {
            switch (c.type) {
              case 'M': case 'L': pg.vertex(c.x, c.y); point = { x: c.x, y: c.y }; break;
              case 'Z': break;
              case 'Q': {
                const x1 = point.x + (2 / 3) * (c.x1 - point.x); const y1 = point.y + (2 / 3) * (c.y1 - point.y);
                pg.bezierVertex(x1, y1); pg.bezierVertex(c.x + (2 / 3) * (c.x1 - c.x), c.y + (2 / 3) * (c.y1 - c.y)); pg.bezierVertex(c.x, c.y); point = { x: c.x, y: c.y }; break;
              }
              case 'C': pg.bezierVertex(c.x1, c.y1); pg.bezierVertex(c.x2, c.y2); pg.bezierVertex(c.x, c.y); point = { x: c.x, y: c.y }; break;
            }
          }
          pg.endShape();
        }
        pg.pop();
        p5.image(pg, 0, 0);
        p5.noLoop();
        return;
      }
      PARAMS.fps = Math.round(p5.frameRate());
      paramsUI.refresh();
      p5.background(PARAMS.bgcolor);

      pg.push();
      pg.translate(translate.x, translate.y);
      pg.strokeWeight(PARAMS.strokeWeight);
      if (PARAMS.stroke) { pg.stroke(PARAMS.strokecolor); pg.noFill(); }
      else { pg.stroke(PARAMS.strokecolor); pg.fill(PARAMS.textcolor); }

      for (const path of paths) {
        pg.beginShape();
        let shapes = 0;
        let point = { x: 0, y: 0 };
        for (const c of path.commands as any[]) {
          const noise = (p5.noise((c.i ?? 0), (c.j ?? 0), p5.frameCount * PARAMS.noiseSpeed) - 0.5) * 0.5;
          if (noise) {
            if (Number.isFinite(c.x)) c.x += noise;
            if (Number.isFinite(c.x1)) c.x1 += noise;
            if (Number.isFinite(c.x2)) c.x2 += noise;
          }
          switch (c.type) {
            case 'M': if (shapes > 0) pg.beginContour(); pg.vertex(c.x, c.y); point = { x: c.x, y: c.y }; break;
            case 'Z': if (shapes > 0) pg.endContour(); shapes++; break;
            case 'L': pg.vertex(c.x, c.y); point = { x: c.x, y: c.y }; break;
            case 'Q': {
              const x1 = point.x + (2 / 3) * (c.x1 - point.x); const y1 = point.y + (2 / 3) * (c.y1 - point.y);
              pg.bezierVertex(x1, y1); pg.bezierVertex(c.x + (2 / 3) * (c.x1 - c.x), c.y + (2 / 3) * (c.y1 - c.y)); pg.bezierVertex(c.x, c.y); point = { x: c.x, y: c.y }; break;
            }
            case 'C': pg.bezierVertex(c.x1, c.y1); pg.bezierVertex(c.x2, c.y2); pg.bezierVertex(c.x, c.y); point = { x: c.x, y: c.y }; break;
          }
        }
        pg.endShape();
      }
      pg.stroke('red');
      for (let i = 0; i < grid.maxx + 1; i++) {
        const noise = p5.noise(i, p5.frameCount * 0.01) * 100;
        const v = (i * textW) / grid.maxx + noise;
        pg.line(v, 0, v, -textH);
      }
      for (let i = 0; i < grid.maxy + 1; i++) {
        pg.line(0, (i * textH) / grid.maxy, textW, (i * textH) / grid.maxy);
      }
      pg.strokeWeight(0);
      pg.pop();
      p5.image(pg, 0, 0);
    };

    p5.windowResized = () => {
      if (!font || !pg) return;
      const { width: w, height: h } = fitStage(stage);
      p5.resizeCanvas(w, h);
      pg.resizeCanvas(w, h);
      recalc();
    };
  };

  p5Instance = trackP5(new P5(sketch, container));

  const unwatch = watchSize(stage, () => {
    if (p5Instance) p5Instance.windowResized();
  });

  return () => {
    unwatch();
    paramsUI.dispose();
    disposeP5(p5Instance);
    p5Instance = null;
    container.remove();
  };
};

export default a18;
