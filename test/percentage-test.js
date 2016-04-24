const assert = require('assert');
const percentage = require('../lib/percentage.js');

describe('percentage', () => {
  it('should return percentage of option', () => {
    var voteCount = {'A': [2, 0], 'B': [1, 0], 'C': [0, 0]};
    var votes = {'123': 'A', '124': 'B', '125': 'A'};
    assert.equal(percentage(votes, '123', voteCount), 66.67);
  });
});
