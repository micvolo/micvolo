import {ReactNode} from "react";

export const Container = (props: {children: ReactNode}) => (
    <section className={'w-full px-[100px] py-[150px]'}>
        <div className={'w-full max-w-screen-xl mx-auto flex flex-wrap'}>
            {props.children}
        </div>
    </section>
)
