const assert = require('assert');
const countVotes = require('../lib/count-votes.js');
const closedPoll = require('./fixtures/closed-poll');

describe('countVotes', () => {
  it('should return a count of all the votes', () => {
    var poll = closedPoll.validPoll;
    var voteCount = {'Rey': [1, "50.00"], 'Finn': [0, 0],
                     'Po': [0, 0], 'BB8': [1, "50.00"]};
    assert.equal(countVotes(poll).toString(), voteCount.toString());
  });
});
