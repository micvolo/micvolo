import type { MountFn } from './index';
import { fitStage, watchSize, pointerRelative } from './shared';
import * as THREE from 'three';
import vertex from '@/components/lab/shaders/a29-vert.glsl?raw';
import fragment from '@/components/lab/shaders/a29-frag.glsl?raw';
import finalFrag from '@/components/lab/shaders/a29-frag3.glsl?raw';

const a29: MountFn = (stage, opts) => {
  const canvas = document.createElement('canvas');
  canvas.className = 'lab-webgl';
  stage.appendChild(canvas);

  const { width, height } = fitStage(stage, canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
  camera.position.z = 2;
  const scene = new THREE.Scene();

  const loader = new THREE.TextureLoader();
  const map = loader.load('/lab/projects/a29/bgFrag.png');
  const geometry = new THREE.PlaneGeometry(1, 1);

  const targetType = renderer.capabilities.isWebGL2 || renderer.extensions.has('EXT_color_buffer_float') ? THREE.FloatType : THREE.UnsignedByteType;
  const targetA = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, type: targetType });
  const targetB = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, type: targetType });
  let textureA = targetA;
  let textureB = targetB;

  const bufferScene = new THREE.Scene();
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uResolution: { value: new THREE.Vector2(width, height) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
      uVelocity: { value: new THREE.Vector2(0, 0) },
      tMap: { value: map },
      tWater: { value: map },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
  });
  const mesh = new THREE.Mesh(geometry, material);
  bufferScene.add(mesh);

  const finalMaterial = new THREE.ShaderMaterial({
    uniforms: { uResolution: { value: new THREE.Vector2(width, height) }, tFlow: { value: textureB.texture }, tWater: { value: map } },
    vertexShader: vertex,
    fragmentShader: finalFrag,
  });
  const finalMesh = new THREE.Mesh(geometry, finalMaterial);
  scene.add(finalMesh);

  const data = { mouse: { x: 0, y: 0 }, client: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } };
  let lastTime = 0;

  const onPointer = (e: PointerEvent) => {
    const { x, y } = pointerRelative(e, stage);
    const { width: w, height: h } = fitStage(stage);
    data.velocity.x = x - data.client.x;
    data.velocity.y = y - data.client.y;
    data.mouse.x = x / w;
    data.mouse.y = 1 - y / h;
    data.client.x = x;
    data.client.y = y;
    const now = performance.now();
    lastTime = now;
  };

  stage.addEventListener('pointermove', onPointer);

  let raf = 0;
  const loop = () => {
    material.uniforms.uTime.value += 0.02;
    material.uniforms.uMouse.value.lerp(new THREE.Vector2(data.mouse.x, data.mouse.y), 0.1);
    material.uniforms.uVelocity.value.lerp(new THREE.Vector2(data.velocity.x, data.velocity.y), 0.5);

    renderer.setRenderTarget(textureB);
    renderer.render(bufferScene, camera);
    const t = textureA;
    textureA = textureB;
    textureB = t;
    material.uniforms.tMap.value = textureA.texture;
    finalMaterial.uniforms.tFlow.value = textureB.texture;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    if (!opts.reducedMotion) raf = requestAnimationFrame(loop);
  };
  const resize = () => {
    const { width: w, height: h } = fitStage(stage, canvas);
    renderer.setSize(w, h);
    camera.left = w / -2; camera.right = w / 2; camera.top = h / 2; camera.bottom = h / -2;
    camera.updateProjectionMatrix();
    mesh.scale.set(w, h, 1);
    finalMesh.scale.set(w, h, 1);
    material.uniforms.uResolution.value.set(w, h);
    finalMaterial.uniforms.uResolution.value.set(w, h);
    targetA.setSize(w, h);
    targetB.setSize(w, h);
  };

  const unwatch = watchSize(stage, resize);
  resize();
  loop();

  return () => {
    cancelAnimationFrame(raf);
    unwatch();
    stage.removeEventListener('pointermove', onPointer);
    renderer.dispose();
    targetA.dispose();
    targetB.dispose();
    map.dispose();
    geometry.dispose();
    material.dispose();
    finalMaterial.dispose();
    canvas.remove();
  };
};

export default a29;
