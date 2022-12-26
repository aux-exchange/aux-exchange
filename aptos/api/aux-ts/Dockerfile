FROM node:18

COPY config.yaml /root/.aptos/config.yaml

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 4000
ENV APTOS_NETWORK=mainnet
ENV REDIS_HOST=redis
CMD [ "node", "build/src/graphql/index.js" ]
