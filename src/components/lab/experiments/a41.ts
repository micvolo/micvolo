import type { MountFn } from './index';
import { disposeP5, fitStage, loadP5, trackP5, watchSize } from './shared';
import { createParams } from '@/lib/params/params';

const a41: MountFn = async (stage, opts) => {
  const P5 = await loadP5();

  let p5Instance: InstanceType<typeof P5> | null = null;
  const { width, height } = fitStage(stage);

  const o = {
    alpha: 0,
    beta: 0,
    frame: 0,
    increment: 0.01,
    size: 100,
    speed: 0.01,
    resetTiming: 300,
    straEffect: false,
    rainbow: true,
  };

  const paramsUI = createParams({
    root: opts.params,
    toggle: true,
    setup: (fields) => {
      fields.addNumber(o, 'size', { min: 1, max: 500, step: 1 });
      fields.addNumber(o, 'speed', { min: 0.001, max: 0.1, step: 0.001 });
      fields.addNumber(o, 'resetTiming', { min: 120, max: 600, step: 1 });
      fields.addBoolean(o, 'straEffect');
      fields.addBoolean(o, 'rainbow');
    },
  });

  const container = document.createElement('div');
  container.className = 'lab-p5';
  stage.appendChild(container);

  const sketch = (p5: InstanceType<typeof P5>) => {
    p5.setup = () => {
      const { width: w, height: h } = fitStage(stage);
      p5.createCanvas(w, h);
      p5.stroke('red');
    };

    p5.draw = () => {
      if (opts.reducedMotion) {
        p5.clear();
        o.alpha = 1;
        o.beta = 1;
        drawFunction(p5);
        p5.noLoop();
        return;
      }
      if (o.frame % o.resetTiming === 0) {
        p5.clear();
        o.frame = 0;
        o.alpha = 0;
        o.beta = 0;
      }
      if (o.straEffect) p5.clear();
      o.alpha += o.speed * Math.pow(1000000, o.frame * 0.001);
      if (o.rainbow) p5.stroke(`hsl(${Math.floor((o.frame * 5) % 360)}, 100%, 50%)`);
      if (o.beta < 1) o.beta += o.speed;
      drawFunction(p5);
      o.frame++;
    };

    function drawFunction(p5: InstanceType<typeof P5>) {
      const { width: w, height: h } = fitStage(stage);
      const startX = -w / 2 / o.size;
      const endX = w / 2 / o.size;
      p5.beginShape();
      p5.noFill();
      for (let x = startX; x <= endX; x += o.increment) {
        const y = heart(x, o.alpha, o.beta) * o.size;
        if (!Number.isFinite(y)) continue;
        const graphX = p5.map(x, startX, endX, 0, w);
        const graphY = p5.map(y, -h / 2, h / 2, h, 0);
        p5.vertex(graphX, graphY);
      }
      p5.endShape();
    }

    p5.windowResized = () => {
      const { width: w, height: h } = fitStage(stage);
      p5.resizeCanvas(w, h);
    };
  };

  function heart(x: number, alpha: number, beta: number) {
    const e = Math.E;
    const pi = Math.PI;
    const radicand = pi - Math.pow(x, 2) * beta;
    return radicand < 0 ? Number.NaN : Math.cbrt(Math.pow(x, 2)) * beta + (e / 3) * Math.sqrt(radicand) * Math.sin(alpha * pi * x);
  }

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

export default a41;
