import Image from "next/image";
import Link from "next/link";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { useState } from "react";
import MenuLanguageComponent from "../MenuLanguageComponent";

export default function Navbar() {
    const [menu, setMenu] = useState(false)

    const works = [
        {
            name: 'Space',
            uri: '/space'
        },
        {
            name: 'Macbook',
            uri: '/macbook'
        },
        {
            name: 'GetBellied',
            uri: '/getbellied'
        },
        {
            name: 'CanvasNoise',
            uri: '/canvasnoise'
        },
        {
            name: 'OldStraStudio',
            uri: '/oldstrastudio'
        },
    ]
    return (
        <nav
            className="flex items-center justify-between flex-wrap bg-black p-1 border-2 border-white rounded-[24px] absolute inset-x-6 top-6 z-[99999]">
            <div className="flex items-center text-white">
                <Link href="/" passHref>
                    <a className="h-9">
                        <Image className="rounded-full" width="36" height="36" src={"/images/profile.jpg"} alt="logo" />
                    </a>
                </Link>
                <span className="ml-4 text-xl">Michele Volonghi</span>
            </div>

            <button onClick={() => setMenu(menu => !menu)} className="sm:hidden text-white">
                {menu && <XIcon className="h-9" />}
                {!menu && <MenuIcon className="h-9" />}
            </button>

            <div
                className={`items-center w-auto flex justify-end flex-[0_0_100%] sm:flex-none sm:flex ${!menu && 'hidden'}`}>
                <div className="text-sm">
                    {works.map(work =>
                        <Link href={'/works' + work.uri} passHref key={work.name}>
                            <a
                                className="inline-block text-white mx-4">
                                {work.name}
                            </a>
                        </Link>
                    )}
                </div>
                <a href="https://stra.studio" target="_blank"
                    className="text-sm px-4 py-[6px] border-2 rounded-full text-white border-white "
                    rel="noreferrer">Stra
                    Studio</a>
            </div>
        </nav>
    )
}