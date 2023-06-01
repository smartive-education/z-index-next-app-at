# syntax=docker/dockerfile:1

# build
FROM node:18-alpine as build
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
ARG NODE_AUTH_TOKEN
ENV NEXT_PUBLIC_QWACKER_API_URL=https://qwacker-api-http-prod-4cxdci3drq-oa.a.run.app/ \
    PORT=3000
RUN echo "@smartive-education:registry=https://npm.pkg.github.com" > ~/.npmrc \
    && echo "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}" > ~/.npmrc \
    && npm ci
COPY . .
RUN npm run build

# start
FROM node:18-alpine 
WORKDIR /app
ARG NODE_AUTH_TOKEN
ENV NODE_ENV=production \
    NEXT_PUBLIC_QWACKER_API_URL=https://qwacker-api-http-prod-4cxdci3drq-oa.a.run.app/ \
    PORT=3000
COPY --from=build /app/package.json /app/package-lock.json ./
RUN echo "@smartive-education:registry=https://npm.pkg.github.com" > ~/.npmrc \
    && echo "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}" > ~/.npmrc \
    && npm ci
COPY --from=build --chown=node:node /app/.next ./.next
EXPOSE 3000
CMD npm run start