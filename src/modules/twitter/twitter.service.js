"use strict";
const requestify = require('requestify')
const OAuth2 = require('oauth').OAuth2
const querystring = require('querystring')
const winston = require('winston')
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ]
})

module.exports = class TwitterService {
  constructor (config) {
    this.config = config || {}
    this.cacheTtl = config.cacheTtl || {
      // ttl in minutes for both
      'users': 15,
      'tweets': 2
    }
    this.accessToken = null

    // if there's no key or secret
    // use mocked mode, response with mocks
    let {key, secret} = config.twitter
    this.mockedMode = false
    if (!key || !secret) {
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
  getTweets ({ username, count = 20, maxId }) {
    var promise = new Promise((resolve, reject) => {
      if (this.mockedMode) return resolve(this.mocks.tweets)

      this.getAccessToken().then((accessToken) => {
        var requestParamsObj = {
          screen_name: username,
          count: count
        }
        if (maxId) requestParamsObj.max_id = maxId

        var requestParams = querystring.stringify(requestParamsObj)
        logger.info('getTweets: request params: ', requestParams)
        var url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?' + requestParams
        requestify.request(url, {
          method: 'GET',
          cache: {
            cache: true,
            expires: 1000 * 60 * this.cacheTtl.tweets
          },
          headers: {
            Authorization: 'Bearer ' + accessToken
          },
          dataType: 'json'
        })
        .then((response) => {
          let tweets = response.getBody()
          if (maxId) tweets = this.removeRepeatedMax(tweets, maxId)
          resolve(tweets)
        })
        .fail((error) => reject(error))
      })
    })

    return promise
  }

  /**
   * When paginating tweets the last one from one batch (max_id)
   * can be the first one of the next batch.
   * Remove it if this is the case.
   *
   * @param  {array} tweets [description]
   * @param  {string} maxId
   * @return {array} tweets without the repeated one
   */
  removeRepeatedMax (tweets, maxId) {
    if (!tweets.length) return []
    var firstTweet = tweets[0]
    if (firstTweet.id === +maxId) tweets.splice(0, 1)
    return tweets
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

      this.getAccessToken().then((accessToken) => {
        logger.info('getUser:', username)
        var requestParamsObj = {
          screen_name: username
        }
        var requestParams = querystring.stringify(requestParamsObj)
        var url = 'https://api.twitter.com/1.1/users/show.json?' + requestParams
        requestify.request(url, {
          method: 'GET',
          cache: {
            cache: true,
            expires: 1000 * 60 * this.cacheTtl.users
          },
          headers: {
            Authorization: 'Bearer ' + accessToken
          },
          dataType: 'json'
        })
        .then(onResponse)
        .fail(reject)

        function onResponse (response) {
          var body = response.getBody()
          resolve(body)
        }
      })
    })

    return promise
  }
}
