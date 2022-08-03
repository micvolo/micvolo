import type {NextPage} from 'next'
import {Canvas} from "@react-three/fiber";
import {Suspense, useState} from "react";
import Poly from "../components/3d/Poly";
import {Html, OrbitControls} from "@react-three/drei";
import MarqueeWallpaper from "../components/MarqueeWallpaper";
import MicVolo from "./micvolo";
import Head from 'next/head';

const Home: NextPage = () => {
    return (
        <MicVolo/>
    )
}

export default Home
