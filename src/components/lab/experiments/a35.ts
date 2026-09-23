import type { MountFn } from './index';
import { fitStage, watchSize, pointerRelative, waitForMedia } from './shared';
import fragment from '@/components/lab/shaders/a35-frag.glsl?raw';
import { mountRecorder } from '../scripts/recorder';

const a35: MountFn = async (stage, opts) => {
  const { Renderer, Geometry, Program, Mesh, Vec2, Vec4, Texture } = await import('ogl');

  const canvas = document.createElement('canvas');
  canvas.className = 'lab-webgl';
  stage.appendChild(canvas);

  const disposeRecorder = mountRecorder(canvas);

  const video = document.createElement('video');
  video.loop = true; video.muted = true; video.playsInline = true;
  video.src = '/lab/projects/a34/vv.mp4';
  video.className = 'lab-video-source';
  stage.appendChild(video);

  const video2 = document.createElement('video');
  video2.loop = true; video2.muted = true; video2.playsInline = true;
  video2.src = '/lab/projects/a34/v.mp4';
  video2.className = 'lab-video-source';
  stage.appendChild(video2);

  const img = document.createElement('img');
  img.src = '/lab/projects/a35/dlow.webp';
  img.className = 'lab-image-source';
  stage.appendChild(img);

  await Promise.all([
    video.play(), video2.play(),
    waitForMedia(img, () => img.complete && img.naturalWidth > 0, 'Image'),
    waitForMedia(video, () => video.readyState >= video.HAVE_CURRENT_DATA, 'Video'),
    waitForMedia(video2, () => video2.readyState >= video2.HAVE_CURRENT_DATA, 'Video'),
  ]);

  const { width, height } = fitStage(stage, canvas);
  const uMouse = new Vec4(-1);
  const renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio, 2), width, height });
  const gl = renderer.gl;

  const displacement = new Texture(gl, { image: img, generateMipmaps: false, width: img.width, height: img.height });
  const videoTexture = new Texture(gl, { image: video, generateMipmaps: false, width: video.videoWidth, height: video.videoHeight });
  const videoTexture2 = new Texture(gl, { image: video2, generateMipmaps: false, width: video2.videoWidth, height: video2.videoHeight });

  const geometry = new Geometry(gl, {
    position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
    uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
  });

  const program = new Program(gl, {
    vertex: `attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,0.,1.); }`,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: uMouse },
      uVideo: { value: videoTexture },
      uVideo2: { value: videoTexture2 },
      uVideoResolution: { value: new Vec2(video.videoWidth, video.videoHeight) },
      uVideo2Resolution: { value: new Vec2(video2.videoWidth, video2.videoHeight) },
      uDisplacement: { value: displacement },
      uResolution: { value: new Vec2(width, height) },
    },
  });

  const mesh = new Mesh(gl, { geometry, program });

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
  stage.addEventListener('pointercancel', onPointerUp);
  stage.addEventListener('pointerleave', onPointerUp);

  let raf = 0;
  const start = performance.now();
  const loop = () => {
    videoTexture.needsUpdate = true;
    videoTexture2.needsUpdate = true;
    program.uniforms.uTime.value = (performance.now() - start) * 0.001;
    renderer.render({ scene: mesh });
    if (!opts.reducedMotion) raf = requestAnimationFrame(loop);
  };
  const resize = () => {
    const { width: w, height: h } = fitStage(stage, canvas);
    renderer.setSize(w, h);
    program.uniforms.uResolution.value = new Vec2(w, h);
  };

  const unwatch = watchSize(stage, resize);
  resize();
  loop();
  if (opts.reducedMotion) { video.pause(); video2.pause(); }

  return () => {
    disposeRecorder();
    cancelAnimationFrame(raf);
    unwatch();
    video.pause(); video.src = '';
    video2.pause(); video2.src = '';
    stage.removeEventListener('pointermove', onPointer);
    stage.removeEventListener('pointerdown', onPointerDown);
    stage.removeEventListener('pointerup', onPointerUp);
    stage.removeEventListener('pointercancel', onPointerUp);
    stage.removeEventListener('pointerleave', onPointerUp);
    renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
    video.remove(); video2.remove(); img.remove(); canvas.remove();
  };
};

export default a35;
