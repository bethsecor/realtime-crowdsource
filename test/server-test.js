const assert = require('assert');
const request = require('request');
const app = require('../server');
const fixtures = require('./fixtures');

describe('Server', () => {

  before((done) => {
    this.port = 9876;

    this.server = app.listen(this.port, (err, result) => {
      if (err) { return done(err); }
      done();
    });

    this.request = request.defaults({
      baseUrl: 'http://localhost:9876/'
    });
  });

  after(() => {
    this.server.close();
  });

  it('should exist', () => {
    assert(app);
  });

  describe('GET /', () => {

    it('should return a 200', (done) => {
      this.request.get('/', (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should have a body with a form', (done) => {
      this.request.get('/', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes("Create A Poll!"),
               `"${response.body}" does not include 'Create A Poll!'.`);
        done();
      });
    });
  });

  describe('POST /polls', () => {
    beforeEach(() => {
      app.locals.polls = {};
    });

    it('should not return 404', (done) => {
      this.request.post('/polls', (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });

    it('should receive and restore data', (done) => {
      var poll = { poll: fixtures.validPoll };

      this.request.post('/polls', { form: poll }, (error, response) => {
        if (error) { done(error); }
        var pollCount = Object.keys(app.locals.polls).length;
        assert.equal(pollCount, 1, `Expected 1 poll, found ${pollCount}`);
        done();
      });
    });

    it('should redirect the user to their new pizza', (done) => {
      var poll = { poll: fixtures.validPoll };

      this.request.post('/polls', { form: poll }, (error, response) => {
        if (error) { done(error); }
        var newPollId = Object.keys(app.locals.polls)[0];
        var newAdminId = app.locals.polls[newPollId].adminID;
        assert.equal(response.headers.location, '/polls/' + newPollId + '/admin/' + newAdminId);
        done();
      });
    });
  });
});
