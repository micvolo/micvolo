import type { MountFn } from './index';
import { fitStage, watchSize } from './shared';
import { createParams } from '@/lib/params/params';
import gsap from 'gsap';
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import * as waterShader from '@/components/lab/shaders/a32/water';
import * as boardShader from '@/components/lab/shaders/a32/board';

// Port of lab/src/scripts/a32/three.js, scoped to the mounted stage.
const a32: MountFn = async (stage, opts) => {
  const canvas = document.createElement('canvas');
  canvas.className = 'lab-webgl';
  stage.appendChild(canvas);

  const settings = {
    uWaveAmp: 0.5,
    uWaveNoise: 1,
    uWaveTime: 5,
    wireframe: false,
  };
  const shaderMaterials: THREE.ShaderMaterial[] = [];

  const paramsUI = createParams({
    root: opts.params,
    // Slider → gsap-tweened uniform wiring (three.js:22-37). Tweaks retarget the
    // tween as values move; overwrite keeps one tween per uniform.
    onChange: () => {
      for (const [key, value] of Object.entries(settings)) {
        for (const shader of shaderMaterials) {
          if (shader.uniforms[key]) {
            gsap.to(shader.uniforms[key], { value, overwrite: true, onComplete: () => { if (opts.reducedMotion) draw(); } });
          }
        }
      }
    },
    setup: (fields) => {
      fields.addNumber(settings, 'uWaveAmp', { label: 'Amplitude', min: 0, max: 2, step: 0.1 });
      fields.addNumber(settings, 'uWaveNoise', { label: 'Noise', min: 0, max: 5, step: 0.1 });
      fields.addNumber(settings, 'uWaveTime', { label: 'Time', min: 0.1, max: 20, step: 0.1 });
    },
  });

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor('#000523');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
  camera.position.set(-5, 5, 5);
  scene.add(camera);

  const mapControls = new MapControls(camera, canvas);
  mapControls.addEventListener('change', () => {
    if (camera.position.x > 10) {
      camera.position.x = 10;
    }
  });

  const resize = () => {
    const { width, height } = fitStage(stage, canvas);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    draw();
  };

  // The uniform tweens reference draw from the params onChange closure above;
  // fields only fire after mount, so the later declaration is safe.
  const clock = new THREE.Clock();
  const draw = () => {
    const elapsedTime = clock.getElapsedTime();
    shaderMaterials.forEach((shader) => {
      if (shader.uniforms.uTime) shader.uniforms.uTime.value = elapsedTime;
    });
    mapControls.update();
    renderer.render(scene, camera);
  };

  resize();
  const unwatch = watchSize(stage, resize);

  // HDR environment + background (three.js:53-56).
  const envTexture = await new RGBELoader().loadAsync('/lab/projects/a32/bg.hdr');
  envTexture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = envTexture;
  scene.background = envTexture;

  // Water (three.js:58-85).
  const waterGeometry = new THREE.PlaneGeometry(50, 50, 1024, 1024);
  const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterShader.vertex,
    fragmentShader: waterShader.fragment,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      PI: { value: Math.PI },
      uTex: { value: null },
      uResolution: { value: [waterGeometry.parameters.width * 1.0, waterGeometry.parameters.height * 1.0] },
      uWaveAmp: { value: settings.uWaveAmp * 1.0 },
      uWaveNoise: { value: settings.uWaveNoise * 1.0 },
      uWaveTime: { value: settings.uWaveTime * 1.0 },
      uRand: { value: Math.random() * 1.0 },
    },
    side: THREE.DoubleSide,
    wireframe: settings.wireframe,
  });
  shaderMaterials.push(waterMaterial);
  const wavesTexture = await new THREE.TextureLoader().loadAsync('/lab/projects/a32/waves.jpg');
  waterMaterial.uniforms.uTex.value = wavesTexture;
  waterMaterial.needsUpdate = true;

  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  scene.add(water);

  // Surfboard (three.js:87-120).
  const dracoLoader = new DRACOLoader().setDecoderPath(
    'https://www.gstatic.com/draco/versioned/decoders/1.5.6/',
  );
  const gltfLoader = new GLTFLoader().setDRACOLoader(dracoLoader);
  const gltf = await gltfLoader.loadAsync('/lab/projects/a32/surf.glb');

  const mesh = gltf.scene.children[0] as THREE.Mesh;
  const objectGeometry = mesh.geometry;
  const map = (mesh.material as THREE.MeshStandardMaterial).map;

  const objectMaterial = new THREE.ShaderMaterial({
    vertexShader: boardShader.vertex,
    fragmentShader: boardShader.fragment,
    transparent: true,
    uniforms: {
      scale: { value: 0.02 },
      uTime: { value: 0 },
      PI: { value: Math.PI },
      uTex: { value: null },
      uTexRes: { value: null },
      uWaveAmp: { value: settings.uWaveAmp * 1.0 },
      uWaveNoise: { value: settings.uWaveNoise * 1.0 },
      uWaveTime: { value: settings.uWaveTime * 1.0 },
    },
    side: THREE.DoubleSide,
    wireframe: settings.wireframe,
  });
  shaderMaterials.push(objectMaterial);
  objectMaterial.uniforms.uTex.value = map;
  objectMaterial.uniforms.uTexRes.value = new THREE.Vector2(
    wavesTexture.image.width,
    wavesTexture.image.height,
  );
  objectMaterial.needsUpdate = true;

  const object = new THREE.Mesh(objectGeometry, objectMaterial);
  scene.add(object);

  let raf = 0;
  const tick = () => {
    draw();
    if (!opts.reducedMotion) raf = requestAnimationFrame(tick);
  };
  tick();

  // Looping ocean audio on first click (three.js:156-159), scoped to the stage.
  const mySound = new Audio('/lab/projects/a32/ocean.mp3');
  mySound.volume = 1;
  mySound.loop = true;
  const startAudio = () => { void mySound.play(); };
  stage.addEventListener('click', startAudio, { once: true });

  return () => {
    cancelAnimationFrame(raf);
    unwatch();
    paramsUI.dispose();
    stage.removeEventListener('click', startAudio);
    mySound.pause();
    mySound.removeAttribute('src');
    shaderMaterials.length = 0;
    mapControls.dispose();
    waterGeometry.dispose();
    waterMaterial.dispose();
    objectGeometry.dispose();
    objectMaterial.dispose();
    wavesTexture.dispose();
    map?.dispose();
    envTexture.dispose();
    dracoLoader.dispose();
    renderer.dispose();
  };
};

export default a32;
