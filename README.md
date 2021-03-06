<a href="https://www.buymeacoffee.com/codealchemist" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-black.png" alt="Buy Me A Coffee" width="150px"></a>

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

## Cache

Twitter responses are cached by default.

Adjust cache TTL by setting the desired values in your config file.

These are the default values expressed in minutes:

```
"cacheTtl": {
  "users": 15,
  "tweets": 2
}
```

Set a value of `0` to disable cache for an endpoint.

## CORS

By default all domains are allowed.
You can setup CORS whitelisting by adding this to your config file to avoid responding to not allowed domains:

```
"cors": {
  "whitelist": ["http://your-domain.com"]
}
```

## Setup
Make a copy of `src/config.json` and set your Twitter credentials by replacing `key` and `secret` with your app's data.

While signed in to Twitter open [your Twitter apps page](https://apps.twitter.com) and grab the required data from there.

You will provide this config file when starting twitter-server.

**Sample config:**
```
{
  "cors": {
    "whitelist": []
  },
  "twitter": {
    "key": null,
    "secret": null
  },
  "tweetsPerRequest": 70,
  "ip": "127.0.0.1",
  "port": "3080",
  "cacheTtl": {
    "users": 15,
    "tweets": 2
  }
}
```


## Install

Using git:

`git clone https://github.com/codealchemist/twitter-server`

Using npm:

`npm install twitter-server --save`

Or globally if you like:

`npm install twitter-server --global`

To always run it before your app you can have something like this on your `package.json`:

```
  "scripts": {
    "start": "node node_modules/twitter-server/src/index.js --config twitter-server-config.json && node src/index.js"
  }
```

Being `src/index.js` the entry point of your app and `twitter-server-config.json` your custom config for twitter-server located at the root of your project.

Then you can start your app with `npm start` and, first, it will start `twitter-server`.

## Start

In *mocked mode*, without the need to provide Twitter credentials, it will return mocked responses, useful for integration testing:

`npm start`

If you already created a **config file with your Twitter credentials** then:

`npm start -- --config my-config.json`

Or:

`node src/index.js --config my-config.json`

## Test
`npm test`

It will check:
- your code doesn't have errors and matches [standard](https://github.com/feross/standard) styling
- there are not unused, outdated or missing packages using [npm-check](https://www.npmjs.com/package/npm-check)
- methods do what they are expected to do using [mocha](https://mochajs.org) and [chai](http://chaijs.com)

## Continuous development test
`npm run test-watch`

This will run unit tests only, continually watching for file changes.


## Notes

Requires node above v4.1.
If your current node version doesn't support destructuring you'll need to add the following flag after the node command:

`--harmony_destructuring`

You'll need to add this to `package.json` in the `scripts` section to the `start` entry, or in the command line if you directly run the app with `node`, example:

`node --harmony_destructuring src/index.js`

## Thanks

Comments? Suggestions?

Please, leave a comment.

Thanks for being here! Enjoy!
