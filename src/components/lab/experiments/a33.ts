import type { MountFn } from './index';
import { disposeP5, fitStage, loadP5, trackP5, watchSize } from './shared';

// Pointer-driven line-grid sketch (A33.astro:6-63), scoped to the mounted stage.
// Hand tracking, cursor UI and the :root palette side effects from the original
// main.js are removed: the pointer-driven grid is the whole experience.
const a33: MountFn = async (stage, opts) => {
  const P5 = await loadP5();
  let p5Instance: InstanceType<typeof P5> | null = null;
  const PARAMS = { num: 30 };

  const container = document.createElement('div');
  container.className = 'lab-p5';
  stage.appendChild(container);

  const sketch = (p5: InstanceType<typeof P5>) => {
    let middle = 0;
    p5.setup = () => {
      const { width: w, height: h } = fitStage(stage);
      p5.createCanvas(w, h);
      p5.stroke(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
      p5.strokeWeight(1);
      middle = Math.floor((PARAMS.num - 1) / 2);
      if (opts.reducedMotion) {
        p5.noLoop();
        p5.redraw();
      }
    };

    p5.draw = () => {
      p5.clear();
      const { width, height } = fitStage(stage);
      const pointerX = opts.reducedMotion ? width / 2 : p5.mouseX;
      const pointerY = opts.reducedMotion ? height / 2 : p5.mouseY;
      for (let i = 0; i < PARAMS.num; i++) {
        let x = pointerX;
        let y = pointerY;
        if (i === middle) {
          p5.push();
          p5.strokeWeight(3);
          p5.line(x, 0, x, height);
          p5.line(0, y, width, y);
          p5.pop();
        } else if (i > middle) {
          x = width - pointerX;
          y = height - pointerY;
          const j = i - middle;
          const vx = (x / (PARAMS.num - middle)) * j + pointerX;
          const vy = (y / (PARAMS.num - middle)) * j + pointerY;
          p5.line(vx, 0, vx, height);
          p5.line(0, vy, width, vy);
        } else {
          const vx = (x / (PARAMS.num - middle - 1)) * (i + 1);
          const vy = (y / (PARAMS.num - middle - 1)) * (i + 1);
          p5.line(vx, 0, vx, height);
          p5.line(0, vy, width, vy);
        }
      }
    };

    p5.windowResized = () => {
      const { width: w, height: h } = fitStage(stage);
      p5.resizeCanvas(w, h);
    };

  };

  p5Instance = trackP5(new P5(sketch, container));
  const unwatch = watchSize(stage, () => {
    if (p5Instance) p5Instance.windowResized();
  });

  return () => {
    unwatch();
    disposeP5(p5Instance); p5Instance = null;
    container.remove();
  };
};

export default a33;
