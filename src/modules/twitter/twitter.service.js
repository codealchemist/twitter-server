const https = require('https')
const OAuth2 = require('oauth').OAuth2
const querystring = require('querystring')
const winston = require('winston')
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ]
})

module.exports = class TwitterService {
  constructor (key, secret) {
    this.accessToken = null

    this.mockedMode = false
    if (!key || !secret) {
      // use mocked mode, response with mocks
      this.mockedMode = true
      this.accessToken = 'mocked-access-token'
      this.mocks = {
        tweets: require('./tweets.mock'),
        user: require('./user.mock')
      }
      return
    }

    this.oauth2 = new OAuth2(key, secret, 'https://api.twitter.com/', null, 'oauth2/token', null)
  }

  getAccessToken () {
    var promise = new Promise((resolve, reject) => {
      if (this.accessToken) return resolve(this.accessToken)

      this.oauth2.getOAuthAccessToken('', {
        'grant_type': 'client_credentials'
      }, (e, accessToken) => {
        if (e) {
          logger.info('get token error:', e)
          return reject(e)
        }

        logger.info('got access token:', accessToken)
        this.accessToken = accessToken
        return resolve(accessToken)
      })
    })

    return promise
  }

  /**
   * Returns tweets for the passed user.
   *
   * @param  {object} params {count, username, maxId}
   * @return {object} promise
   */
  getTweets (params) {
    // defaults
    params.count = params.count || 20

    var promise = new Promise((resolve, reject) => {
      if (this.mockedMode) return resolve(this.mocks.tweets)

      this.getAccessToken()
        .then(onAccessToken)

      // ------------------------------

      function onAccessToken (accessToken) {
        var requestParamsObj = {
          screen_name: params.username,
          count: params.count
        }
        if (params.maxId) requestParamsObj.max_id = params.maxId

        var requestParams = querystring.stringify(requestParamsObj)
        logger.info('getTweets: request params: ', requestParams)

        var options = {
          hostname: 'api.twitter.com',
          path: '/1.1/statuses/user_timeline.json?' + requestParams,
          headers: {
            Authorization: 'Bearer ' + accessToken
          }
        }

        https.get(options, (result) => {
          var buffer = ''
          result.setEncoding('utf8')

          result.on('data', (data) => {
            buffer += data
          })

          result.on('end', () => {
            var tweets = JSON.parse(buffer)
            return resolve(tweets)
          })

          result.on('error', reject)
        })
      }
    })

    return promise
  }

  /**
   * Returns requested twitter user.
   *
   * @param  {string} username
   * @return {object} promise
   */
  getUser (username) {
    var promise = new Promise((resolve, reject) => {
      if (this.mockedMode) return resolve(this.mocks.user)

      this.getAccessToken()
        .then(onAccessToken)

      // ------------------------------

      function onAccessToken (accessToken) {
        logger.info('getUser:', username)
        var requestParamsObj = {
          screen_name: username
        }
        var requestParams = querystring.stringify(requestParamsObj)
        var options = {
          hostname: 'api.twitter.com',
          path: '/1.1/users/show.json?' + requestParams,
          headers: {
            Authorization: 'Bearer ' + accessToken
          }
        }

        https.get(options, (result) => {
          var buffer = ''
          result.setEncoding('utf8')

          result.on('data', function (data) {
            buffer += data
          })

          result.on('end', function () {
            var user = JSON.parse(buffer)
            return resolve(user)
          })

          result.on('error', reject)
        })
      }
    })

    return promise
  }
}
