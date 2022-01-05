FROM node:12-alpine

WORKDIR /usr/src/app
COPY . .
RUN chmod +x ./deploy.sh && sh ./deploy.sh

WORKDIR /usr/src/app/deploy

EXPOSE ${PORT}

ENTRYPOINT [ "node", "./build/index.js" ]

# STOP

# RUN yarn
# WORKDIR /usr/src/app/client
# RUN yarn build
# WORKDIR /usr/src/app

# RUN mv ./client/build* ./build/public
# RUN rm -rf ./client
# RUN echo -e 'process.env.NODE_ENV="production";\n' | cat - ./build/index.js > temp && mv temp ./build/index.js