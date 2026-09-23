import * as THREE from "three";

export class Flowmap {
    constructor(renderer, camera, { falloff = 0.3, alpha = 1, dissipation = 0.98, width = 1, height = 1 }) {
        this.renderer = renderer;
        this.camera = camera;
        this.aspect = 1;
        this.width = width;
        this.height = height;
        this.mouse = new THREE.Vector2();
        this.velocity = new THREE.Vector2();
        this.options = {
            falloff,
            alpha,
            dissipation,
        }
        this.mask = {}
        this.init();
    }
    init() {
        this.mask.read = new THREE.WebGLRenderTarget(
            this.width,
            this.height,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: THREE.FloatType,
            },
        );
        this.mask.write = this.mask.read.clone();
        this.scene = new THREE.Scene();
        const geometry = new THREE.PlaneGeometry(this.width, this.height);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                tMap: { value: new THREE.TextureLoader().load("/lab/projects/a29/bgFrag.png") },
                uFalloff: { value: this.options.falloff * 0.5 },
                uAlpha: { value: this.options.alpha },
                uDissipation: { value: this.options.dissipation },
                uAspect: { value: this.aspect },
                uMouse: { value: this.mouse },
                uVelocity: { value: this.velocity },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.sourceTexture = material.uniforms.tMap.value;
        this.scene.add(this.mesh);
        this.value = this.mask.read.texture;
    }
    setSize(width, height) {
        if (width === this.width && height === this.height) return;
        this.width = width;
        this.height = height;
        this.mask.read.setSize(width, height);
        this.mask.write.setSize(width, height);
    }
    update() {
        this.mesh.material.uniforms.uAspect.value = this.aspect;
        this.renderer.setRenderTarget(this.mask.write);
        this.renderer.render(this.scene, this.camera);
        const t = this.mask.read;
        this.mask.read = this.mask.write;
        this.mask.write = t;
        this.mesh.material.uniforms.tMap.value = this.mask.read.texture;
        this.renderer.setRenderTarget(null);
    }
    dispose() {
        this.mask.read.dispose();
        this.mask.write.dispose();
        this.sourceTexture.dispose();
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.scene.remove(this.mesh);
    }
}


const vertex = /* glsl */ `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
    }`;

const fragment = /* glsl */ `
    uniform sampler2D tMap;

    uniform float uFalloff;
    uniform float uAlpha;
    uniform float uDissipation;

    uniform float uAspect;
    uniform vec2 uMouse;
    uniform vec2 uVelocity;

    varying vec2 vUv;

    void main() {
        vec4 color = texture2D(tMap, vUv) * uDissipation;
        vec2 cursor = vUv - uMouse;
        cursor.x *= uAspect;

        vec3 stamp = vec3(uVelocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
        float falloff = smoothstep(uFalloff, 0.0, length(cursor)) * uAlpha;

        color.rgb = mix(color.rgb, stamp, vec3(falloff));
        gl_FragColor = color;
    }`;