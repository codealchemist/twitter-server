const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

// ------------------------------

const TwitterService = require('./../../../src/modules/twitter/twitter.service')
const config = require('./../../../src/config.json')

describe('TwitterService', function () {
  var twitterService

  beforeEach(function () {
    twitterService = new TwitterService(config)
  })

  it('should be defined', function () {
    expect(TwitterService).to.not.be.undefined
  })

  it('should get access token', function () {
    expect(twitterService.getAccessToken()).to.be.fulfilled
  })

  it('should get tweets', function () {
    var params = {
      count: 3,
      username: 'albertomiranda'
    }
    expect(twitterService.getTweets(params)).to.be.fulfilled
  })

  it('should get user', function () {
    expect(twitterService.getUser('albertomiranda')).to.be.fulfilled
  })

  it('should reuse access token', function (done) {
    twitterService.getAccessToken()
      .then(function (accessToken) {
        expect(twitterService.getAccessToken()).to.eventually.equal(accessToken).notify(done)
      })
  })
})
