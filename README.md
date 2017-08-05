# swader

A progressive web app with **100/100 PWA score** from [Google Lighthouse](https://developers.google.com/web/tools/lighthouse/).

Uses:
* __React__ and __Fetch API__ to retrieve and explore the data from [swapi](https://swapi.co/)
* __Service Worker API__ and __sw-precache__ to store the assets for offline usage
* __IndexedDB__ to store from the API's data and refresh with a given throttling interval
* __Jest__ and __enzyme__ for unit testing

Stands for The (S)tar (W)ars (A)PI's (D)ata (E)xplore(R).

## Live demo

The latest version of the app is available here:
* <https://swader.now.sh> (http/2)
* <https://swader.surge.sh> (http/1.1)

## Browser Support

Use the latest version of Google Chrome or Mozilla Firefox since they support all necessary PWA features, such as Service Worker. Safari 10 works fine with IndexedDB, but doesn't support Service Worker [yet](https://m.phillydevshop.com/apples-refusal-to-support-progressive-web-apps-is-a-serious-detriment-to-future-of-the-web-e81b2be29676).

More info about Service Worker and other PWA features support and can be found [here](https://jakearchibald.github.io/isserviceworkerready/).

## Quickstart

```
# install the dependencies
npm install

# to start local dev server on http://localhost:3000
npm run start:dev

# make and preview production build on http://localhost:5000
npm run build && npm run start
```

Or if you prefer yarn:

```
# install the dependencies
yarn

# to start local dev server on http://localhost:3000
yarn start:dev

# make and preview production build on http://localhost:5000
yarn build && yarn start
```

## Running the tests

```
# with npm
npm test

# with yarn
yarn test
```

## Deployment

The app is preconfigured for [now.sh](https://now.sh) or [surge.sh](https://surge.sh) deployment.

### now.sh

Simply run [now-cli](https://github.com/zeit/now-cli) from the app's folder. There is no need to create a production build before deployment.

```
now
```

It will be deployed as a node app, built in the cloud and served with [serve](https://github.com/zeit/serve).

### surge.sh

Use preconfigured npm script `deploy:surge`, optionally specify a domain:

```
# with npm
npm run deploy:surge -- <domain>

# with yarn
yarn deploy:surge -- <domain>
```

It will create a production build, copy `index.html` to `200.html` to let Surge handle [react-router](https://github.com/ReactTraining/react-router) routes and upload build folder contents to Surge CDN.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
