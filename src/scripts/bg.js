import { Renderer, Program, Mesh, Vec2, Vec3, Vec4, Flowmap, Texture, Geometry } from 'ogl';

const imgSize = [1920, 1080];

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
}
`;

const fragment = /* glsl */ `
precision highp float;
precision highp int;
uniform sampler2D tFlow;
uniform float uTime;
varying vec2 vUv;
uniform vec4 res;
uniform vec3 bg1;
uniform vec3 bg2;
uniform vec3 bg3;

float rand(vec2 n) {return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}
float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);
    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);
    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);
    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));
    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);
    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float lines(float uv, float offset){
    float a = abs(0.5 * cos(uv) + offset * .5 );
    return smoothstep(0.0, .5 + offset * 0.5, a);
}

void main() {
        // MOUSE
        vec3 flow = texture2D(tFlow, vUv).rgb;
        vec2 myUV = (vUv - vec2(0.5))*res.zw + vec2(0.5);
        myUV -= flow.xy * .2;

        // COLORI
        float n = noise(vec3(myUV.xy * 8.,uTime*.01)) * 10.;
        float baseUv = (1.-myUV.y) * n;
        float basePattern = lines(baseUv, 1.);
        float secondPattern = lines(baseUv, .1);
        vec3 baseColor = mix(bg1, bg2, basePattern);
        vec3 color = mix(baseColor, bg3, secondPattern);

        // FILIGRANA
        vec2 uvRandom = vUv;
        uvRandom.y *= rand(vec2(uvRandom.y, 1.));
        color.rgb += rand(uvRandom) * 0.15;

        gl_FragColor = vec4(color, 1.0);
}
`;
const canvas = document.querySelector('.webgl')
const renderer = new Renderer({ dpr: 2, canvas });
const gl = renderer.gl;
let aspect = 1;
const mouse = new Vec2(-1);
const velocity = new Vec2();
const flowmap = new Flowmap(gl, { falloff: .3, dissipation: 0.99 });
const geometry = new Geometry(gl, {
    position: {
        size: 2,
        data: new Float32Array([-1, -1, 3, -1, -1, 3])
    },
    uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) }
});
let a1, a2;
let imageAspect = imgSize[1] / imgSize[0];
if (window.innerHeight / window.innerWidth < imageAspect) {
    a1 = 1;
    a2 = window.innerHeight / window.innerWidth / imageAspect;
} else {
    a1 = (window.innerWidth / window.innerHeight) * imageAspect;
    a2 = 1;
}
const colors = []
for (const variable of ['--bg1', '--bg2', '--bg3']) {
    let bgcolor1 = getComputedStyle(document.documentElement)
        .getPropertyValue(variable);
    bgcolor1 = bgcolor1.substring(4, bgcolor1.length - 1)
        .replace(/ /g, '')
        .split(',');
    colors.push(bgcolor1.map(c => c / 255))
}
const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
        uTime: { value: 0 },
        bg1: { value: new Vec3(colors[0][0], colors[0][1], colors[0][2]) },
        bg2: { value: new Vec3(colors[1][0], colors[1][1], colors[1][2]) },
        bg3: { value: new Vec3(colors[2][0], colors[2][1], colors[2][2]) },
        res: { value: new Vec4(window.innerWidth, window.innerHeight, a1, a2) },
        tFlow: flowmap.uniform
    }
});
const mesh = new Mesh(gl, { geometry, program });
function resize() {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    if (window.innerHeight !== height) {
        console.log(window.innerHeight, height)
    }
    if (window.innerWidth !== width) {
        console.log(window.innerWidth, width)
    }
    let a1, a2;
    if (height / width < imageAspect) {
        a1 = 1;
        a2 = height / width / imageAspect;
    } else {
        a1 = (width / height) * imageAspect;
        a2 = 1;
    }
    mesh.program.uniforms.res.value = new Vec4(
        width,
        height,
        a1,
        a2
    );

    renderer.setSize(width, height);
    aspect = width / height;
}
window.addEventListener("resize", resize, false);
resize();
if ("ontouchmove" in window) {
    window.addEventListener("touchmove", updateMouse, { passive: false });
    window.addEventListener("touchstart", updateMouse, false);
} else {
    window.addEventListener("mousemove", updateMouse, false);
}
let lastTime;
const lastMouse = new Vec2();
function updateMouse(e) {
    if (e.changedTouches && e.changedTouches.length) {
        e.x = e.changedTouches[0].clientX;
        e.y = e.changedTouches[0].clientY;
    }
    if (e.type === 'scroll') {
        e.y = (1 - e.target.scrollTop / e.target.offsetHeight) * e.target.clientHeight;
        e.x = (e.target.clientWidth / 2);
        lastScroll = e.target.scrollTop;
    }
    if (e.x === undefined) {
        e.x = e.clientX;
        e.y = e.clientY;
    }
    mouse.set(e.x / gl.renderer.width, 1.0 - e.y / gl.renderer.height);
    if (!lastTime) {
        lastTime = performance.now();
        lastMouse.set(e.x, e.y);
    }

    const deltaX = e.x - lastMouse.x;
    const deltaY = e.y - lastMouse.y;
    lastMouse.set(e.x, e.y);
    let time = performance.now();
    let delta = Math.max(10.4, time - lastTime);
    lastTime = time;
    velocity.x = deltaX / delta;
    velocity.y = deltaY / delta;
    velocity.needsUpdate = true;
}
requestAnimationFrame(update);
function update(t) {
    requestAnimationFrame(update);
    if (!velocity.needsUpdate) {
        mouse.set(-1);
        velocity.set(0);
    }
    velocity.needsUpdate = false;
    flowmap.aspect = aspect;
    flowmap.mouse.copy(mouse);
    flowmap.velocity.lerp(velocity, .15);
    flowmap.update();
    program.uniforms.uTime.value = t * 0.01;
    renderer.render({ scene: mesh });
}