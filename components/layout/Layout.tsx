import Navbar from "./Navbar";
import {ReactNode} from "react";

const Layout = ({children}: { children: ReactNode }) => (
    <>
        <Navbar/>
        <main>{children}</main>
    </>
)

export default Layout