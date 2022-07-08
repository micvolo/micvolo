import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
    uri: process.env.NODE_ENV === 'production' ? 'https://backend.micvolo.me/graphql' : 'https://backend.micvolo.me/graphql',
    cache: new InMemoryCache(),
});

export default client;