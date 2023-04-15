This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

## Prod Version

[https://z-index-next-app-at.vercel.app](https://z-index-next-app-at.vercel.app/)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
