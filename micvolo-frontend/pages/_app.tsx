import '../styles/globals.css'
import type {AppProps} from 'next/app'
import Layout from '../components/layout';
import Navbar from "../components/navbar";

function MyApp({Component, pageProps}: AppProps) {
    return (
        <>
            <Navbar></Navbar>
            <Component {...pageProps} />
        </>
    )
}

export default MyApp
