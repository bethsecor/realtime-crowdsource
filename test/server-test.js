const assert = require('assert');
const request = require('request');
const app = require('../server');
const newPoll = require('./fixtures/new-poll');
const existingPoll = require('./fixtures/existing-poll');
const closedPoll = require('./fixtures/closed-poll');

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
      var poll = { poll: newPoll.validPoll };

      this.request.post('/polls', { form: poll }, (error, response) => {
        if (error) { done(error); }
        var pollCount = Object.keys(app.locals.polls).length;
        assert.equal(pollCount, 1, `Expected 1 poll, found ${pollCount}`);
        done();
      });
    });

    it('should redirect the user to their new pizza', (done) => {
      var poll = { poll: newPoll.validPoll };

      this.request.post('/polls', { form: poll }, (error, response) => {
        if (error) { done(error); }
        var newPollId = Object.keys(app.locals.polls)[0];
        var newAdminId = app.locals.polls[newPollId].adminID;
        assert.equal(response.headers.location, '/polls/' + newPollId + '/admin/' + newAdminId);
        done();
      });
    });
  });

  describe('GET /polls/:pollId', () => {
    beforeEach(() => {
      app.locals.polls.testPoll = existingPoll.validPoll;
      app.locals.polls.closedTestPoll = closedPoll.validPoll;
    });

    it('should not return 404', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get(`/polls/testPoll`, (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });

    it('should return a page that has the title of the poll', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get(`/polls/testPoll`, (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes(poll.question),
               `"${response.body}" does not include "${poll.question}".`);
        done();
      });
    });

    it('should return a page that has the options of the poll', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get(`/polls/testPoll`, (error, response) => {
        if (error) { done(error); }
        poll.options.forEach(function(option){
          assert(response.body.includes(option),
          `"${response.body}" does not include "${option}".`);
        });
        done();
      });
    });

    it('should return a page that has the results of the poll', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get(`/polls/testPoll`, (error, response) => {
        if (error) { done(error); }
        poll.options.forEach(function(option){
          assert(response.body.includes(`${option}: 0 (0%)`),
          `"${response.body}" does not include "${option}".`);
        });
        done();
      });
    });

    it('should return a page that has a closed poll status for a closed poll', (done) => {
      var poll = app.locals.polls.closedTestPoll;

      this.request.get(`/polls/closedTestPoll`, (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes('This poll is closed. Sad day for you.'),
        `"${response.body}" does not include 'This poll is closed. Sad day for you'.`);
        done();
      });
    });
  });

  describe('GET /polls/:pollId/admin/:adminId', () => {
    beforeEach(() => {
      app.locals.polls.testPoll = existingPoll.validPoll;
      app.locals.polls.closedTestPoll = closedPoll.validPoll;
    });

    it('should not return 404', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get(`/polls/testPoll/admin/${poll.adminID}`, (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });

    it('should return a page that has the results of the poll', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get(`/polls/testPoll/admin/${poll.adminID}`, (error, response) => {
        if (error) { done(error); }
        poll.options.forEach(function(option){
          assert(response.body.includes(`${option}: 0 (0%)`),
          `"${response.body}" does not include "${option}".`);
        });
        done();
      });
    });

    it('should return a page that has the status of the poll', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get(`/polls/testPoll/admin/${poll.adminID}`, (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes('Poll Status: Open'),
        `"${response.body}" does not include Poll Status: Open.`);
        done();
      });
    });

    it('should return a page that has a close poll button', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get(`/polls/testPoll/admin/${poll.adminID}`, (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes('Close Poll Now'),
        `"${response.body}" does not include Close Poll Now.`);
        done();
      });
    });

    it('should return a page that has a close poll in minutes', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get(`/polls/testPoll/admin/${poll.adminID}`, (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes('Close poll in'),
        `"${response.body}" does not include Close poll in.`);
        done();
      });
    });

    it('should return a page that has a closed poll status for a closed poll', (done) => {
      var poll = app.locals.polls.closedTestPoll;

      this.request.get(`/polls/closedTestPoll/admin/${poll.adminID}`, (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes('Poll Status: Closed'),
        `"${response.body}" does not include Poll Status Closed.`);
        done();
      });
    });
  });
});
