import '../styles/globals.css'
import Layout from '../components/layout/Layout';
import { AppProps } from 'next/app';

const App = ({ Component, pageProps }: AppProps) => {
    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    )
}

export default App