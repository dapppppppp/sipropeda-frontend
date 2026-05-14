FROM node:18.18.0-alpine

# create destination directory
RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app

# update and install dependency
RUN apk update && apk upgrade
RUN apk add git

# copy the app, note .dockerignore
COPY . /usr/src/nuxt-app/
RUN npm install --legacy-peer-deps
# RUN NODE_OPTIONS=--max_old_space_size=4096 npm run build
RUN npm run build

ENV HOST 0.0.0.0
EXPOSE 1100

CMD [ "npm", "run", "start" ]
