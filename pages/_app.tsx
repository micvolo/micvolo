import '../styles/globals.css'
import Layout from '../components/layout/Layout';
import { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';

const App = ({ Component, pageProps }: AppProps) => {
    return (
        <>
        <Layout>
            <Component {...pageProps} />
        </Layout>
        <Analytics/>
        </>
    )
}

export default App