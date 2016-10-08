'use strict'

const TwitterService = require('./twitter.service')
const winston = require('winston')
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ]
})

module.exports = class TwitterController {
  constructor (config) {
    this.config = config
    this.twitter = new TwitterService(config)
  }

  getTweets (req, res) {
    var username = req.params.username
    if (!username) throw new Error('NO USERNAME SPECIFIED! URL format: /getTweets/[username]')

    // get tweets for current username
    req.query = req.query || {}
    let count = req.query.count || this.config.tweetsPerRequest
    this.twitter.getTweets({
      username: username,
      count: count,
      maxId: req.query.max_id
    })
    .then(
      // success
      (tweets) => {
        if (tweets.error) this.respond(res, tweets, 500)
        if (!tweets || !tweets.length) this.respond(res, [])
        this.respond(res, tweets)
      },

      // fail
      (error) => {
        logger.error('ERROR: getTweets:', error)
        this.respond(res, error, 500)
      }
    )
  }

  getTweetsMedia (req, res) {
    var username = req.params.username
    if (!username) throw new Error('NO USERNAME SPECIFIED! URL format: /getTweets/[username]')

    // get tweets for current username
    req.query = req.query || {}
    let count = req.query.count || this.config.tweetsPerRequest
    this.twitter.getTweets({
      username: username,
      count: count,
      maxId: req.query.max_id
    })
    .then(
      // success
      (tweets) => {
        if (tweets.error) this.respond(res, tweets, 500)
        if (!tweets || !tweets.length) return this.respond(res, [])

        // filter tweets with media
        var tweetsMedia = tweets.filter((tweet) => tweet.extended_entities)
        logger.info(`${tweetsMedia.length} out of ${tweets.length} tweets have media`)

        // if no tweets with media in current batch
        // request another one
        if (!tweetsMedia.length) {
          var lastTweet = tweets.slice(-1)[0]
          req.query.max_id = lastTweet.id
          logger.info('no media tweets, get another batch: max_id:', lastTweet.id)
          return this.getTweetsMedia(req, res)
        }

        // return tweets with media
        this.respond(res, tweetsMedia)
      },

      // fail
      (error) => {
        logger.error('ERROR: getTweets:', error)
        this.respond(res, error, 500)
      }
    )
  }

  getUser (req, res) {
    var username = req.params.username
    if (!username) throw new Error('NO USERNAME SPECIFIED! URL format: /getTweets/[username]')

    this.twitter.getUser(username)
      .then((user) => {
        if (user.error) this.respond(res, user, 500)
        if (!user) this.respond(res, [])
        this.respond(res, user)
      })
  }

  search (req, res) {
    var query = req.params.query
    if (!query) throw new Error('NO QUERY SPECIFIED! URL format: /search/[query]')

    // get tweets for current username
    req.query = req.query || {}
    let count = req.query.count || this.config.tweetsPerRequest
    this.twitter.search({
      query: query,
      count: count,
      maxId: req.query.max_id
    })
    .then(
      // success
      (tweets) => {
        if (tweets.error) this.respond(res, tweets, 500)
        if (!tweets || !tweets.length) this.respond(res, [])
        this.respond(res, tweets)
      },

      // fail
      (error) => {
        logger.error('ERROR: search:', error)
        this.respond(res, error, 500)
      }
    )
  }

  searchMedia (req, res) {
    var query = req.params.query
    if (!query) throw new Error('NO QUERY SPECIFIED! URL format: /search/[query]')

    // add media filter
    if (!query.match(/filter:media/)) query+=' filter:media'
    query+=' exclude:retweets exclude:replies'

    // get tweets for current username
    req.query = req.query || {}
    let count = req.query.count || this.config.tweetsPerRequest
    this.twitter.search({
      query: query,
      count: count,
      maxId: req.query.max_id
    })
    .then(
      // success
      (response) => {
        if (response.error) this.respond(res, response, 500)
        if (!response.statuses || !response.statuses.length) this.respond(res, [])
        this.respond(res, response)
      },

      // fail
      (error) => {
        logger.error('ERROR: search:', error)
        this.respond(res, error, 500)
      }
    )
  }

  /**
   * Send JSON response to client.
   *
   * @param  {object} data
   * @param  {int} status
   */
  respond (res, data, status) {
    status = status || 200

    res
      .status(status)
      .json(data)
  }
}
