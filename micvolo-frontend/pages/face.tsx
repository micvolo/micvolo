import Poly from "../components/Poly";
import {Suspense, useRef} from "react";
import {Canvas, useFrame} from "@react-three/fiber";
import {Vector3} from "three";
import * as THREE from "three";
import Navbar from "../components/navbar";
import {Html} from "@react-three/drei";

function Face() {

    const ref = useRef<THREE.Mesh>(null!);



    return (
        <Suspense fallback={null}>
            <Poly scale={2}/>
        </Suspense>
    )
}

export default function App() {


    return (
        <div className="h-screen">
            <Canvas>
                <ambientLight/>
                <Suspense fallback={null}>
                    <Face/>
                </Suspense>
            </Canvas>
        </div>
    )
}