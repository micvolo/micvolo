import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
    uri: process.env.NODE_ENV === 'production' ? 'https://backend.micvolo.me/graphql' : 'http://localhost:1337/graphql',
    cache: new InMemoryCache(),
});

export default client;