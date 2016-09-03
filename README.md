# twitter-server
Provides easy Twitter integration.

Connects to the Twitter API using OAuth2 and exposes basic endpoints to retrieve tweets and users.

All endpoints returns JSON.

## Exposed endpoints
`/tweets/:username`
returns tweets for requested Twitter user

`/tweets/:username/media`
returns tweets with media for requested Twitter user

`/user/:username`
returns requested Twitter user

## Setup
Edit `src/config.json` and replace `YOUR-TWITTER-KEY-HERE` and `YOUR-TWITTER-SECRET-HERE` with your app's data.

While signed in to Twitter open [your Twitter apps page](https://apps.twitter.com) and grab the required data from there.

## Install

`git clone https://github.com/codealchemist/twitter-server`

## Alternative install

You can also use `twitter-server` as an npm dependency.

`npm install twitter-server --save`

To always run it before your app you can have something like this on your `package.json`:

```
  "scripts": {
    "start": "node node_modules/twitter-server/src/index.js && node src/index.js"
  }
```

Being `src/index.js` the entry point of your app.

Then you can start your app with `npm start` and, first, it will start `twitter-server`.

## Start
`npm start`

## Test
`npm test`

It will check:
- your code doesn't have errors and matches [standard](https://github.com/feross/standard) styling
- there are not unused, outdated or missing packages using [npm-check](https://www.npmjs.com/package/npm-check)
- methods do what they are expected to do using [mocha](https://mochajs.org) and [chai](http://chaijs.com)

## Continuous development test
`npm run test-watch`

This will run unit tests only, continually watching for file changes.

## Thanks

Comments? Suggestions?

Please, leave a comment.

Thanks for being here! Enjoy!
