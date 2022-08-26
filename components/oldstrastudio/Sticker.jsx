import { gsap } from "gsap";
import { useEffect } from "react";

export default function Sticker() {
    const string = 'Download-Portfolio-';
    const radius = 30;

    const chars = string.split('').map((c, i) => <span key={i} className={`absolute uppercase text-[8px] text-white sticker-char-${i}`}>{c}</span>);

    useEffect(() => {
        for (const [i] of chars.entries()) {
            const rotation = i * (360 / chars.length)
            gsap.set(`.sticker-char-${i}`, {
                transformOrigin: `0px ${radius}px`,
                x: radius,
                rotate: rotation,
            })
            gsap.center
            gsap.timeline({ repeat: -1 })
                .fromTo('.sticker', { rotation: 0 }, {
                    rotation: 360,
                    duration: 3,
                    ease: 'none'
                })
        }
    })


    return (
        <a href="stra.studio" className="absolute bg-black rounded-full sticker font-black" style={{ height: radius * 2, width: radius * 2 }}>
            {chars}
        </a>
    )
}