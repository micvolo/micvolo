import {getProducts} from "../../lib/products";
import {
    GetStaticPaths,
    GetStaticPathsContext,
    GetStaticProps,
    GetStaticPropsContext,
    InferGetStaticPropsType,
    NextPage
} from "next";
import {Container} from "../../components/layout/Container";
import Image from "next/image";

const ProductPage = ({product}: InferGetStaticPropsType<typeof getStaticProps>) => {

    let files = product.attributes.files?.data?.map(f => f.attributes.url);

    return(
        <Container>
            <div className="flex-none relative w-[400px] h-80">
                <Image src={product.attributes.image.data.attributes.url} layout={"fill"} objectFit={"contain"}></Image>
            </div>
            <div className="flex-1 flex-ver">
                <p className="text-white text-8xl">{product.attributes.name}</p>
                <p className="text-white text-4xl">{product.attributes.price} €</p>
                <p className="text-white">{product.attributes.content}</p>
            </div>
            <div className="bg-white flex-full h-80 w-full flex flex-col gap-4 p-4">
                {files?.map(f => (
                    <a key={f} className="bg-black text-xl text-white m-4 overflow-hidden" href={f} download target="_blank" rel="noreferrer">
                        {f}
                    </a>
                ))}
            </div>
        </Container>
    )
}
export default ProductPage

export const getStaticPaths = async (context: GetStaticPathsContext) => {
    const products = await getProducts({locale: 'en'});
    const uris = products.map(p => p.attributes.uri);
    const paths = uris.map(uri => ({params: {uri}}))

    return {
        paths,
        fallback: true,
    }
}

export const getStaticProps = async (context: GetStaticPropsContext) => {

    const uri = context.params?.uri as string;
    const {locale} = context;

    const product =( await getProducts({uri, locale}))[0]
    return {
        props: {
            product
        }
    }
}