import type { MountFn } from './index';
import { fitStage, watchSize, pointerRelative } from './shared';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Minimal demo (A25.astro:44-123): a calm generated landscape filling the whole canvas,
// with the original pointer ripple + chromatic aberration pass applied over it.
const a25: MountFn = async (stage, opts) => {
  const canvas = document.createElement('canvas');
  canvas.className = 'lab-webgl';
  stage.appendChild(canvas);

  const { width, height } = fitStage(stage, canvas);

  const camera = new THREE.PerspectiveCamera(70, width / height, 10, 1000);
  const scene = new THREE.Scene();
  // 1 world unit = 1 content pixel; the camera distance frames the stage height.
  const fovHalf = THREE.MathUtils.degToRad(camera.fov / 2);

  const texture = await new THREE.TextureLoader().loadAsync('/lab/projects/a25/landscape.png');
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const uMouse = new THREE.Vector2(-10, -10);
  const myEffect = {
    uniforms: {
      tDiffuse: { value: null },
      resolution: { value: new THREE.Vector2(1, height / width) },
      uMouse: { value: uMouse },
    },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform vec2 resolution;
      uniform vec2 uMouse;
      varying vec2 vUv;
      float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
        uv -= disc_center; uv *= resolution;
        float dist = sqrt(dot(uv, uv));
        return smoothstep(disc_radius + border_size, disc_radius - border_size, dist);
      }
      void main() {
        vec2 newUV = vUv;
        float c = circle(vUv, uMouse, 0.0, 0.2);
        float r = texture2D(tDiffuse, newUV.xy += c * 0.05).x;
        float g = texture2D(tDiffuse, newUV.xy += c * 0.0525).y;
        float b = texture2D(tDiffuse, newUV.xy += c * 0.055).z;
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `,
  };
  const customPass = new ShaderPass(myEffect);
  composer.addPass(customPass);

  // Cover-fit the landscape over the whole canvas.
  const layout = () => {
    const { width: w, height: h } = fitStage(stage, canvas);
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.position.z = (h / 2) / Math.tan(fovHalf);
    camera.updateProjectionMatrix();
    const imgAspect = texture.image.width / texture.image.height;
    if (w / h > imgAspect) mesh.scale.set(w, w / imgAspect, 1);
    else mesh.scale.set(h * imgAspect, h, 1);
    customPass.uniforms.resolution.value.y = h / w;
  };

  const onPointer = (e: PointerEvent) => {
    const { x, y } = pointerRelative(e, stage);
    const { width: w, height: h } = fitStage(stage);
    uMouse.set(x / w, 1 - y / h);
    if (opts.reducedMotion) composer.render();
  };
  stage.addEventListener('pointermove', onPointer);

  let raf = 0;
  const loop = () => {
    composer.render();
    if (!opts.reducedMotion) raf = requestAnimationFrame(loop);
  };

  const unwatch = watchSize(stage, layout);
  layout();
  loop();

  return () => {
    cancelAnimationFrame(raf);
    unwatch();
    stage.removeEventListener('pointermove', onPointer);
    composer.dispose();
    renderer.dispose();
    geometry.dispose();
    material.dispose();
    texture.dispose();
    canvas.remove();
  };
};

export default a25;
