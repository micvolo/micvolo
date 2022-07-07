import {Menu} from '@headlessui/react'
import Link from "next/link";
import {useRouter} from "next/router";

export default function MenuLanguageComponent() {

    const router = useRouter()
    const { pathname, asPath, query } = router

    //router.push({ pathname, query }, asPath, { locale: nextLocale })

    // @ts-ignore
    return (
        <Menu as="div" className="relative inline-block">
            <Menu.Button className="inline-block text-white mx-4">Lang</Menu.Button>
            <Menu.Items
                className="absolute right-0 mt-2 origin-top-right divide-y divide-gray-100 border-2 border-white rounded-[24px] bg-black text-white">
                <div className="px-1 py-1 ">
                    <Menu.Item className="group flex w-full items-center rounded-[24px] px-2 py-2 text-sm hover:bg-white hover:text-black">
                            <button onClick={() => router.push({ pathname, query }, asPath, { locale: 'it' })}>
                                ITA
                            </button>
                    </Menu.Item>
                    <Menu.Item className="group flex w-full items-center rounded-[24px] px-2 py-2 text-sm hover:bg-white hover:text-black">
                        <button onClick={() => router.push({ pathname, query }, asPath, { locale: 'en' })}>
                            ENG
                        </button>
                    </Menu.Item>
                </div>
            </Menu.Items>
        </Menu>
    )
}