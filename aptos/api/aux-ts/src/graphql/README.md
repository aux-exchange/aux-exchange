# Quickstart

- Create a `.env` file containing our node urls
- `APTOS_LOCAL=false yarn start:graphql`
- `APTOS_LOCAL=false yarn metadata`

# Adding/modifying graphQL endpoints

- Update/add the appropriate schema in: `typeDefs`
- Run `yarn run codegen` from the `aux-ts` directory
- Update/add resolvers in `resolvers`