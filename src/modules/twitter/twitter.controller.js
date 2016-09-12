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
    this.twitter = new TwitterService(config.twitter.key, config.twitter.secret)
  }

  getTweets (req, res) {
    var username = req.params.username
    if (!username) throw new Error('NO USERNAME SPECIFIED! URL format: /getTweets/[username]')

    // get tweets for current username
    this.twitter.getTweets({
      count: req.params.count || this.config.tweetsPerRequest,
      username: username
    })
    .then((tweets) => {
      if (tweets.error) this.respond(res, tweets, 500)
      if (!tweets || !tweets.length) this.respond(res, [])
      this.respond(res, tweets)
    })
  }

  getTweetsMedia (req, res) {
    var username = req.params.username
    if (!username) throw new Error('NO USERNAME SPECIFIED! URL format: /getTweets/[username]')

    // get tweets for current username
    this.twitter.getTweets({
      count: req.params.count || this.config.tweetsPerRequest,
      username: username
    })
    .then((tweets) => {
      if (tweets.error) this.respond(res, tweets, 500)
      if (!tweets || !tweets.length) this.respond(res, [])

      // filter tweets with media
      var tweetsMedia = tweets.filter((tweet) => tweet.extended_entities)
      logger.info(`${tweetsMedia.length} out of ${tweets.length} tweets have media`)

      this.respond(res, tweetsMedia)
    })
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
