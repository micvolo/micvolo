import * as THREE from 'three'
import {Vector3} from 'three'
import normal from '../public/images/normal.jpg';
import profile from '../public/images/profile.jpg';
import moonImage from '../public/images/moon.jpg';
import {Suspense, useMemo, useRef} from "react";
import {Canvas, useFrame, useLoader} from "@react-three/fiber";
import Macbook from "../components/3d/Macbook";
import {Scroll, ScrollControls, useScroll} from '@react-three/drei';

function Torus() {

    const ref = useRef<THREE.Mesh>(null!)

    useFrame((state, delta) => {
        ref.current.rotation.x += 0.02
        ref.current.rotation.y += 0.005
        ref.current.rotation.z += 0.01
    })

    return (
        <mesh
            ref={ref}
            scale={1}>
            <torusGeometry args={[50, 5, 8, 10]}/>
            <meshBasicMaterial color={0xFF6347} wireframe={true}/>
        </mesh>
    )
}

function Volo() {

    const voloTexture = useLoader(THREE.TextureLoader, profile.src)
    const ref = useRef<THREE.Mesh>(null!)

    const scroll = useScroll();


    useFrame((state, delta) => {
        ref.current.rotation.x += 0.01;
        ref.current.rotation.y += 0.01;


        const t = scroll.offset * 50

        state.camera.position.set(
            (t) + 20,
            (t * -2) + 20,
            (t * -1) + 20
        )

        state.camera.lookAt(0, 0, 0)


    })

    return (
        <mesh ref={ref} scale={1}>
            <boxGeometry args={[20, 20, 20]}/>
            <meshBasicMaterial map={voloTexture}/>
        </mesh>
    )
}

function Moon() {

    const moonTexture = useLoader(THREE.TextureLoader, moonImage.src)
    const normalTexture = useLoader(THREE.TextureLoader, normal.src)
    const ref = useRef<THREE.Mesh>(null!)

    useFrame((state, delta) => {
        ref.current.rotation.x += 0.0008;
    })

    return (
        <mesh ref={ref} scale={1} position={[-20, 0, 130]}>
            <sphereGeometry args={[100, 32, 32]}/>
            <meshStandardMaterial map={moonTexture} normalMap={normalTexture}/>
        </mesh>
    )

}

function Stars({starsArray}: { starsArray: { position: Vector3 }[] }) {

    const moonTexture = useLoader(THREE.TextureLoader, moonImage.src)
    const normalTexture = useLoader(THREE.TextureLoader, normal.src)

    return <>{
        starsArray.map(({position}: { position: Vector3 }, i: number) => (
            <mesh key={i} position={position}>
                <sphereGeometry args={[THREE.MathUtils.randFloatSpread(1), 24, 24]}/>
                <meshStandardMaterial map={moonTexture} normalMap={normalTexture}/>
            </mesh>
        ))
    }</>
}

const Space = () => {

    const starsArray = useMemo(() => Array.from({length: 1000}, () => ({
        position: new Vector3(
            THREE.MathUtils.randFloatSpread(200),
            THREE.MathUtils.randFloatSpread(200),
            THREE.MathUtils.randFloatSpread(200)
        )
    })), [])

    const scroll = useScroll()

    return (
        <div style={{position: "absolute", top: 0, bottom: 0, right: 0, left: 0}}>

            <Canvas onCreated={({camera}) => {
                camera.position.set(20, 20, 20);
                camera.lookAt(0, 0, 0)
            }}>

                <pointLight color="green"/>
                {/*<pointLight position={[-50, 90, 50]} color="green"/>*/}
                {/*<ambientLight color={0xffffff}/>*/}
                <ScrollControls>
                    <Scroll>

                        <Torus/>
                        <Volo/>
                        <Moon/>
                        <Stars starsArray={starsArray}/>
                        <Suspense fallback={null}>
                            <Macbook scale={200} position={new Vector3(-30, 90, 50)}/>
                        </Suspense>
                    </Scroll>
                </ScrollControls>
            </Canvas>
        </div>
    )
}
export default Space
