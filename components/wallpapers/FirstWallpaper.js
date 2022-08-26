import { useEffect } from "react";
import gsap from "gsap";
export default function FirstWallpaper() {

    const row = 10;

    const elementsNumber = Math.pow(row, 2)

    const elements = Array(elementsNumber).fill().map((x, i) => {
        const v = 100 / row
        return <div key={i} style={{ height: v + 'vh', width: v + '%' }} className={`bg-black stra-square-${i}`}></div>
    })

    useEffect(() => {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: '1', defaults: { duration: 0.4, ease: 'none' } })
        for (const [i, el] of elements.entries()) {
            tl
                .fromTo(`.stra-square-${i}`, { background: 'black' }, { background: 'white' }, '-=0.3')
        }
        for (const [i, el] of elements.entries()) {
            tl
                .to(`.stra-square-${i}`, { background: 'black' }, '-=0.3')
        }
    })

    return (
        <div className="fixed h-screen w-full flex flex-wrap -z-10">
            {elements}
        </div>
    )
}