# syntax=docker/dockerfile:1.2

# build
FROM node:18-alpine as build
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
ARG NEXT_PUBLIC_QWACKER_API_URL
ENV NEXT_PUBLIC_QWACKER_API_URL=${NEXT_PUBLIC_QWACKER_API_URL} \
    PORT=3000
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
COPY . .
RUN npm run build

# start
FROM node:18-alpine 
WORKDIR /app
ENV NODE_ENV=production 
COPY --from=build /app/package.json /app/package-lock.json /app/next.config.js ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
EXPOSE 3000
USER node
CMD npm run start