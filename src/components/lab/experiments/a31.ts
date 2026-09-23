import type { MountFn } from './index';
import { fitStage, watchSize, pointerRelative } from './shared';
import fragment from '@/components/lab/shaders/a31.frag.glsl?raw';

const a31: MountFn = async (stage, opts) => {
  const { Renderer, Geometry, Program, Mesh, Vec2, Vec4 } = await import('ogl');

  const canvas = document.createElement('canvas');
  canvas.className = 'lab-webgl';
  stage.appendChild(canvas);

  const { width, height } = fitStage(stage, canvas);

  const uMouse = new Vec4(-1);
  let raf = 0;

  const renderer = new Renderer({
    canvas,
    dpr: Math.min(window.devicePixelRatio, 2),
    width,
    height,
  });
  const gl = renderer.gl;

  const geometry = new Geometry(gl, {
    position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
    uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
  });

  const program = new Program(gl, {
    vertex: /* glsl */ `
      attribute vec2 uv;
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: uMouse },
      uResolution: { value: new Vec2(width, height) },
    },
  });

  const mesh = new Mesh(gl, { geometry, program });

  const resize = () => {
    const { width: w, height: h } = fitStage(stage, canvas);
    renderer.setSize(w, h);
    program.uniforms.uResolution.value = new Vec2(w, h);
  };

  const onPointer = (e: PointerEvent) => {
    const { x, y } = pointerRelative(e, stage);
    uMouse.set(x, y, uMouse.z, uMouse.w);
  };
  const onPointerDown = (e: PointerEvent) => {
    const { x, y } = pointerRelative(e, stage);
    uMouse.set(uMouse.x, uMouse.y, x, y);
  };
  const onPointerUp = () => uMouse.set(uMouse.x, uMouse.y, -1, -1);

  stage.addEventListener('pointermove', onPointer);
  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointerleave', onPointerUp);

  const unwatch = watchSize(stage, resize);
  resize();

  const start = performance.now();
  const loop = () => {
    program.uniforms.uTime.value = (performance.now() - start) * 0.001;
    renderer.render({ scene: mesh });
    if (!opts.reducedMotion) raf = requestAnimationFrame(loop);
  };
  loop();

  return () => {
    cancelAnimationFrame(raf);
    unwatch();
    stage.removeEventListener('pointermove', onPointer);
    stage.removeEventListener('pointerdown', onPointerDown);
    stage.removeEventListener('pointerup', onPointerUp);
    stage.removeEventListener('pointerleave', onPointerUp);
    renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.remove();
  };
};

export default a31;
