import Image from "next/image";
import Link from "next/link";
import {getProducts, Product} from "../../lib/products";
import {Container} from "../../components/layout/Container";
import {GetServerSidePropsContext} from "next";

const Products = ({products}: { products: Product[] }) => {
    return (
        <Container>
                {products.map(p => (
                    <Link key={p.id} href={`/products/${encodeURIComponent(p.attributes.uri)}`}>
                        <div className="border-white border-[1px] w-60 hover:cursor-pointer m-5">
                            <div className={'relative h-28'}>
                                <Image src={p.attributes.image.data.attributes.url} layout="fill"
                                       objectFit={"contain"}/>
                            </div>
                            <p className="text-4xl text-white">{p.attributes.name}</p>
                            <p className="text-4xl text-white">{p.attributes.price} €</p>
                            <p className="text-xl text-white prose">{p.attributes.content}</p>
                        </div>
                    </Link>
                ))}
        </Container>
    )
}

export default Products;

export async function getServerSideProps(context: GetServerSidePropsContext) {

    const {locale} = context;

    const products = await getProducts({locale});

    return {
        props: {
            products
        },
    };
}