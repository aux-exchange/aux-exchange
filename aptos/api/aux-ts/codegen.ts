import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "./src/graphql/typeDefs",
  generates: {
    "src/graphql/generated/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
    },
  },
};

export default config;
