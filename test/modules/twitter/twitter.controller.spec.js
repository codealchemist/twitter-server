const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

// ------------------------------

const TwitterController = require('./../../../src/modules/twitter/twitter.controller')
const twitter = new TwitterController()

describe('twitterController', function (done) {
  // mock express
  var res = {
    setHeader: () => {},
    status: () => {},
    send: () => {
      done()
    }
  }

  it('should be defined', function () {
    expect(twitter).to.not.be.undefined
  })

  it('getTweets should throw error when no username is provided', function () {
    var req = {params: {}}
    expect(() => { twitter.getTweets(req, res) })
      .to.throw(Error, 'NO USERNAME SPECIFIED! URL format: /getTweets/[username]')
  })

  it('getUser should throw error when no username is provided', function () {
    var req = {params: {}}
    expect(() => { twitter.getUser(req, res) })
      .to.throw(Error, 'NO USERNAME SPECIFIED! URL format: /getTweets/[username]')
  })

  it('should get tweets', function () {
    var req = {params: {username: 'test'}}

    // will call res.send, which calls done()
    twitter.getTweets(req, res)
  })

  it('should get user', function () {
    var req = {params: {username: 'test'}}

    // will call res.send, which calls done()
    twitter.getUser(req, res)
  })
})
