## Mumble App
Twitter clone, created for the Frontend Engineering Advanced CAS 2023 Course. 

## Getting Started

1. In order to be able to download the packages create a .npmrc file with the following content:
   @smartive-education:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:\_authToken=your_github_token

2.Install the packages and run the development server:

```bash
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

## UI-Lib

The App uses the "@smartive-education/design-system-component-z-index-at" library, which has been created as a design system/component library especially for this application as a preceeding separate project also as part of the aforementioned CAS course. 

## Use the App

Click the Login/Register Button on the login screen and login with an existing user, or register a new user on Zitadel.

## Build, Lint, Test

```bash
npm run build && npm run prettier && npm run lint && npm run test
```

## Run Dependency Cruiser

```bash
npm run cruiser
```

## PWA

The application uses the default settings of next-pwa lib, which provides the following main features:

- caching static assets
- install on native device
- offline fallback page

## Rendering strategies

- Login - Static
- Timeline - Static && Client Side
- Profile - Client Side
- Detail - Server side

## Features

Mobile first design 

Error handling

- Client Side - with error modal, retry option, where retry is possible
- Server Side - with custom error page

Timeline Page 

- State management: X-state
- Preserves scrolled down position on page re-entry
- Background polling for new posts, refresh button
- Infinity scrolling
- User data cache (limit the number of requests)

Profile Page

- State management: X-state
- 3 possible states: new user (suggested users and posts), other user (only posts), loggedInUser (posts and liked posts)
- Infinity scrolling
- User data cache (limit the number of requests)

Detail Page

- State management: useReducer
- Can be shared (by copying and pasting the url in a different window)
- Reducers are unit tested

## CI/CD

- Every push on a feature branch triggers Lint/Test/Build
- Every push on a PR publishes a new Dockerfile to Github Container Registry. The new Container will then be downloaded and e2e tests are executed on github.
- Every merge into main publishes a new Dockerfile to Google Artifact Registry. The new Container will then be automatically deployed to Google Cloud run with terraform. E2E Tests are executed against the newly deployed version. 
## Deploy on Vercel

Every PR creates a test deployment with dynamic URL on Vercel, to represent the changes. 
Every merge into main triggers an automatic deployment on [https://z-index-next-app-at.vercel.app](https://z-index-next-app-at.vercel.app/)

## Deploy on Google Cloud Run

[https://z-index-at-mokbz4buwa-oa.a.run.app/](https://z-index-at-mokbz4buwa-oa.a.run.app/)

Deployed to Google Cloud Run with terraform. 

## E2E Tests with Playwright

```bash
npm run e2e
```

## Docker

Run docker locally:
(.npmrc and .env files need to exist in the root folder)

```bash
docker build --build-arg NEXT_PUBLIC_QWACKER_API_URL=https://qwacker-api-http-prod-4cxdci3drq-oa.a.run.app/ --secret id=npmrc,src=./.npmrc .

docker run -p 3000:3000 --env-file ./.env z-index-at-local
```



