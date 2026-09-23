import type { MountFn } from './index';
import { disposeP5, fitStage, loadP5, pointerRelative, trackP5, watchSize } from './shared';
import { createParams } from '@/lib/params/params';

const a42: MountFn = async (stage, opts) => {
  const P5 = await loadP5();

  let p5Instance: InstanceType<typeof P5> | null = null;

  const o = {
    size: 10,
    distance: 40,
    count: 18,
    positions: [] as { x: number; y: number }[],
    lerpedPositions: [] as { x: number; y: number }[],
  };

  const paramsUI = createParams({
    root: opts.params,
    onChange: () => { (p5Instance as any)?.resetTrail?.(); },
    setup: (fields) => {
      fields.addNumber(o, 'size', { min: 1, max: 50, step: 1 });
      fields.addNumber(o, 'distance', { min: 1, max: 50, step: 1 });
      fields.addNumber(o, 'count', { min: 1, max: 50, step: 1 });
    },
  });

  const container = document.createElement('div');
  container.className = 'lab-p5';
  stage.appendChild(container);

  const sketch = (p5: InstanceType<typeof P5>) => {
    p5.setup = () => {
      const { width: w, height: h } = fitStage(stage);
      p5.createCanvas(w, h);
      p5.stroke('white');
      p5.strokeWeight(1);
      p5.fill('black');
      o.positions = [];
      for (let i = 0; i < o.count; i++) o.positions.push({ x: w / 2, y: h / 2 });
      o.lerpedPositions = o.positions.map((p) => ({ ...p }));
    };
    (p5 as any).resetTrail = () => {
      const { width: w, height: h } = fitStage(stage);
      o.positions = Array.from({ length: o.count }, () => ({ x: w / 2, y: h / 2 }));
      o.lerpedPositions = o.positions.map((point) => ({ ...point }));
    };

    p5.draw = () => {
      p5.background(0);
      for (let i = 0; i < o.count; i++) {
        o.lerpedPositions[i].x = lerp(o.lerpedPositions[i].x, o.positions[i].x, 0.1);
        o.lerpedPositions[i].y = lerp(o.lerpedPositions[i].y, o.positions[i].y, 0.1);
        if (i > 0) {
          p5.line(o.lerpedPositions[i - 1].x, o.lerpedPositions[i - 1].y, o.lerpedPositions[i].x, o.lerpedPositions[i].y);
        }
        p5.ellipse(o.lerpedPositions[i].x, o.lerpedPositions[i].y, o.size);
      }
    };

    const updatePointer = () => {
      const { x, y } = { x: p5.mouseX, y: p5.mouseY };
      if (!o.positions.length) return;
      o.positions[0].x = x;
      o.positions[0].y = y;
      for (let i = 1; i < o.count; i++) {
        const angle = Math.atan2(o.positions[i].x - o.positions[i - 1].x, o.positions[i].y - o.positions[i - 1].y);
        o.positions[i].x = o.positions[i - 1].x + o.distance * Math.sin(angle);
        o.positions[i].y = o.positions[i - 1].y + o.distance * Math.cos(angle);
      }
    };

    p5.mouseMoved = () => { if (!opts.reducedMotion) updatePointer(); };
    p5.touchMoved = () => { if (!opts.reducedMotion) updatePointer(); return false; }; 
    p5.windowResized = () => {
      const { width: w, height: h } = fitStage(stage);
      p5.resizeCanvas(w, h);
    };

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }
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

export default a42;
