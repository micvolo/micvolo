import { context } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import {Noise} from 'noisejs'

const CanvasNoise = () => {

    const canvasRef = useRef()
    const animationRef = useRef()

    useEffect(() => {

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const width = canvas.width;
        const height = canvas.height;


        const cols = 20;
        const rows = 15;
        const numCells = cols * rows

        const gridw = width * 0.8;
        const gridh = height * 0.8;

        const cellw = gridw / cols
        const cellh = gridh / rows
        const margx = (width - gridw) * 0.5
        const margy = (height - gridh) * 0.5

        const noise = new Noise(Math.random());

        const draw = (frame) => {
        for (let i = 0; i < numCells; i++) {
            const col = i % cols
            const row = Math.floor(i / cols)

            const x = col * cellw
            const y = row * cellh
            const w = cellw * 0.8
            const h = cellh * 0.8

            const n = noise.perlin2(x / 1000 * frame / 700, y / 1000);
            const angle = n * Math.PI * 0.1
            const scale = (n + 1) / 2 * 30

            ctx.save()
            ctx.translate(x, y)
            ctx.translate(margx, margy)
            ctx.translate(cellw * 0.5, cellh * 0.5)
            ctx.rotate(angle)

            ctx.strokeStyle = 'white'
            ctx.lineWidth = scale
            ctx.beginPath()
            ctx.moveTo(w * -0.5, 0)
            ctx.lineTo(w * 0.5, 0)
            ctx.stroke()

            ctx.restore()
        }
    }
        
        const animate = () => {
            animationRef.current = requestAnimationFrame(animate)
            ctx.clearRect(0, 0, width, height);
            const time = new Date().getTime();
            draw(time);
        }
        animate()
        
        return () => {
            cancelAnimationFrame(animationRef.current);
        }
    })
    return (<canvas ref={canvasRef} className="fixed h-screen w-full" />)
}

export default CanvasNoise;