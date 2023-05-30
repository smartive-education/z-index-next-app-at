# syntax=docker/dockerfile:1

# build
FROM node:18-alpine as build
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
ARG NODE_AUTH_TOKEN
RUN echo "@smartive-education:registry=https://npm.pkg.github.com" > ~/.npmrc \
    && echo "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}" > ~/.npmrc \
    && npm ci
COPY . .
RUN npm run build

# start
FROM node:18-alpine 
WORKDIR /app
ARG NODE_AUTH_TOKEN
ARG NEXT_PUBLIC_QWACKER_API_URL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG ZITADEL_ISSUER
ARG ZITADEL_CLIENT_ID
ENV NODE_ENV=production \
    NEXT_PUBLIC_QWACKER_API_URL=${NEXT_PUBLIC_QWACKER_API_URL} \
    NEXTAUTH_URL=${NEXTAUTH_URL} \
    NEXTAUTH_SECRET=${NEXTAUTH_SECRET} \
    ZITADEL_ISSUER=${ZITADEL_ISSUER} \
    ZITADEL_CLIENT_ID=${ZITADEL_CLIENT_ID}
COPY --from=build /app/package.json /app/package-lock.json ./
RUN echo "@smartive-education:registry=https://npm.pkg.github.com" > ~/.npmrc \
    && echo "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}" > ~/.npmrc \
    && npm ci
COPY --from=build /app/.next ./.next
EXPOSE 3000
USER node
CMD npm run start