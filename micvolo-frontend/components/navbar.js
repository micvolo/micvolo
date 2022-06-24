import logo from '../public/images/profile.jpg';
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
    return(
        <nav className="flex items-center justify-between flex-wrap bg-black p-4 border-2 border-white rounded-full absolute inset-x-6 top-6 z-[99999]">
            <div className="flex items-center text-white">
                <Link href="/" passHref>
                    <a>
                <Image className="rounded-full" width="36" height="36" src={logo}  alt="logo">
                </Image>
                    </a>
                </Link>
                <span className="mx-4 text-xl">Michele Volonghi</span>
            </div>
            <div className="w-full block flex-grow flex items-center w-auto">
                <div className="text-sm flex-grow">
                    <Link href="space" passHref>
                    <a
                       className="block mt-4 inline-block mt-0 text-white mr-4">
                        Space
                    </a>
                    </Link>
                    <Link href="macbook" passHref>
                    <a
                       className="block mt-4 inline-block mt-0 text-white mr-4">
                        Macbook
                    </a>
                    </Link>
                </div>
                <div>
                    <a href="https://stra.studio" target="_blank"
                       className="inline-block text-sm px-4 py-2 leading-none border-2 rounded-full text-white border-white">Stra Studio</a>
                </div>
            </div>
        </nav>
    )
}