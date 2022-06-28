import MarqueeWallpaper from "../components/MarqueeWallpaper";
import {Canvas} from "@react-three/fiber";
import {Html, OrbitControls} from "@react-three/drei";
import {Suspense} from "react";
import Poly from "../components/3d/Poly";

function Box() {
    return (
        <mesh>
            <sphereGeometry attach="geometry" args={[15, 32, 16]} />
            <meshBasicMaterial attach="material" color="0xffff00"/>
        </mesh>
    )
}

const MicVolo = () => (
    <div className="absolute inset-0">
        <MarqueeWallpaper/>
        <Canvas>
            {/*<Html center>*/}
            {/*    <p className={'text-8xl text-black bg-white h-200'}>CIAOOO</p>*/}
            {/*</Html>*/}
            <OrbitControls/>
            <ambientLight/>
            <mesh>
                <sphereGeometry args={[15, 32, 16]} />
                <meshBasicMaterial  color={0xffff00}/>
            </mesh>
            <Suspense fallback={<Box/>}>
                <Poly scale={3}/>
            </Suspense>
        </Canvas>
    </div>
)

export default MicVolo