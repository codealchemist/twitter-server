const TwitterController = require('./modules/twitter/twitter.controller')

module.exports = (app, config) => {
  const twitter = new TwitterController(config)
  app.get('/tweets/:username/', (req, res) => { twitter.getTweets(req, res) })
  app.get('/tweets/:username/media', (req, res) => { twitter.getTweetsMedia(req, res) })
  app.get('/search/:query', (req, res) => { twitter.search(req, res) })
  app.get('/search/:query/media', (req, res) => { twitter.searchMedia(req, res) })
  app.get('/user/:username', (req, res) => { twitter.getUser(req, res) })
}
