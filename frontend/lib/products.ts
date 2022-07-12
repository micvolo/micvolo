import client from "./apollo-client";
import {gql} from "@apollo/client";

export const getProducts = async (props: {locale?: string, uri?:string}) => {
    const {locale, uri} = props;

    const localeString = locale ? `locale: "${locale}",` : ``;

    const uriString = uri ? `filters: {uri: {eq: "${uri}"}},` : ``;

    const {data} = await client.query({
        query: gql`
        {
          products (sort: "uri", ${localeString} ${uriString}) {
            data {
              id
              attributes {
                name
                content
                price
                uri
                files {
                    data {
                        attributes {
                            url
                        }
                    }
                }
                image {
                  data {
                    attributes {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      `,
    });

    return data.products.data as Product[];
}

export interface Product {
    id: number;
    attributes: {
        name: string;
        content: string;
        price: number;
        slug: string;
        uri: string;
        image: {
            data: {
                attributes: {
                    url: string
                }
            }
        }
        files: {
            data: {
                attributes: {
                    url: string
                }
            }[]
        }
    }
}