import * as THREE from 'three'
import React, { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Environment, useGLTF, OrbitControls, useProgress } from '@react-three/drei'
import Site from './Site.jsx'
import Sticker from './Sticker.jsx'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

export default function StraStudio() {

    const { progress } = useProgress()

    
    return (
        <div style={{fontFamily: 'greed-regular'}}>
            {/* loading screen */}
            <h1 className={`w-full h-screen bg-black z-10 flex justify-center items-center fixed text-2xl sm:text-4xl md:text-6xl text-white ${progress === 100 ? 'hidden' : 'show'}`}>
                Loading ... {progress.toFixed()}%
            </h1>

            {/* just for the scrollbar */}
            <div className={`absolute h-[200%] ${progress !== 100 ? 'hidden' : 'show'}`}></div>

            {/* real gsap div */}
            <div className="absolute w-full h-screen flex justify-center items-center trigger">

                <h1 className="strastudio-front absolute text-2xl sm:text-4xl md:text-6xl text-white">
                    Stra Studio
                </h1>

                <h1 className="strastudio-back leading-none text-2xl sm:text-4xl md:text-6xl text-white whitespace-pre text-center opacity-0 pointer-events-none">
                    Multicreative Studio<br />
                    <a href="https://goo.gl/maps/ECxHMR5k9DbzQh7i9" rel="noreferrer" target="_blank">Via Villa Glori 10/b <span>&#10041;</span> Brescia</a><br />
                    <a href="https://www.instagram.com/strastudioo/" rel="noreferrer" target="_blank">↘stra.studio</a>  <a href="mailto:hello@stra.studio" rel="noreferrer" target="_blank">↘hello@stra.studio</a><br />
                    <a href="tel:+39 339 87 35 670" rel="noreferrer" target="_blank">(+39) 339 87 35 670</a>
                </h1>

                <div className="mac-panel absolute w-full h-full opacity-0">
                    <Canvas camera={{ position: [0, 0, 30], fov: 25 }}>
                        <pointLight position={[10, 10, 20]} intensity={1.5} />
                        <Suspense>
                            <Model />
                            <Environment preset="city" />
                        </Suspense>
                    </Canvas>
                </div>

            </div>

        </div>
    )
}

function Model() {

    const group = useRef()
    const scrollTriggerRef = useRef()
    const htmlPageRef = useRef()

    const { nodes, materials } = useGLTF('/mac-draco.glb')

    useEffect(() => {
        // htmlPageRef.current.parentElement.style.pointerEvents = 'none'

        gsap.registerPlugin(ScrollTrigger)
        gsap.timeline(
            {
                scrollTrigger: {
                    trigger: '.trigger',
                    pin: true,
                    scrub: 1,
                    snap: 1 / 4
                }
            }
        )
            .addLabel('start', 0)
            .addLabel('desc', 1)
            .addLabel('mac', 2)
            .addLabel('end', 3)
            .to('.strastudio-front', { opacity: 0 }, 'start')
            .to('.strastudio-back', { opacity: 1 }, 'start')
            .set('.strastudio-back', { pointerEvents: 'auto' })
            .to('.strastudio-back', { opacity: 0, pointerEvents: 'none' }, 'desc')
            .to('.mac-panel', { opacity: 1 }, 'desc')
            // .set(htmlPageRef.current.parentElement.style, { pointerEvents: 'auto' })
            .to(scrollTriggerRef.current.rotation, { y: Math.PI }, 'mac')

        group.current.position.z = innerWidth > 768 ? 0 : innerWidth > 640 ? -20 : -40;
        window.addEventListener('resize', () => {
            group.current.position.z = innerWidth > 768 ? 0 : innerWidth > 640 ? -20 : -40;
        })
    })

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.cos(t / 2) / 10 + 0.25, 0.1)
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, Math.sin(t / 4) / 20, 0.1)
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, (-5 + Math.sin(t)) / 5, 0.1)
    })

    const threeSite = {
        width: 340,
        height: 224,
        borderRadius: 3,
        overflow: 'hidden',
        overflowY: 'auto',
        background: 'black',
    }

    const threeSticker = {
        width: 340,
        height: 224,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }

    return (
        <group ref={group} dispose={null}>
            <group ref={scrollTriggerRef}>
                <group rotation-x={-0.425} position={[0, -0.04, 0.41]}>
                    <group position={[0, 2.96, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
                        <mesh material={materials.aluminium} geometry={nodes['Cube008'].geometry} />
                        <mesh material={materials['matte.001']} geometry={nodes['Cube008_1'].geometry} />
                        <mesh geometry={nodes['Cube008_2'].geometry} />
                        <Html ref={htmlPageRef} style={threeSite} rotation-x={-Math.PI / 2} position={[0, 0.05, -0.09]} transform
                            occlude>
                            <Site />
                        </Html>
                        <Html style={threeSticker} rotation-x={-Math.PI / 2} rotation-y={Math.PI} position={[0, -0.1, -0.09]} transform
                            occlude>
                            <Sticker />
                        </Html>
                    </group>
                </group>
                <mesh material={materials.keys} geometry={nodes.keyboard.geometry} position={[1.79, 0, 3.45]} />
                <group position={[0, -0.1, 3.39]}>
                    <mesh material={materials.aluminium} geometry={nodes['Cube002'].geometry} />
                    <mesh material={materials.trackpad} geometry={nodes['Cube002_1'].geometry} />
                </group>
                <mesh material={materials.touchbar} geometry={nodes.touchbar.geometry} position={[0, -0.03, 1.2]} />
            </group>
        </group>
    )
}
