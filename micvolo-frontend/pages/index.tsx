import type { NextPage } from 'next'
import {Canvas} from "@react-three/fiber";
import {Suspense} from "react";
import Poly from "../components/3d/Poly";

const Home: NextPage = () => {
  return (
      <div className="h-screen">
        <Canvas>
          <ambientLight/>
          <Suspense fallback={null}>
            <Poly scale={3}/>
          </Suspense>
        </Canvas>
      </div>
  )
}

export default Home
