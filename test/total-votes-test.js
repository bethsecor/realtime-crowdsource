const assert = require('assert');
const totalVotes = require('../lib/total-votes.js');

describe('totalVotes', () => {
  it('should return total number of votes', () => {
    var votes = {'123': 'A', '124': 'B', '125': 'A'};
    assert.equal(totalVotes(votes), 3);
  });
});
