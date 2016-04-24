const assert = require('assert');
const minutesToMilliseconds = require('../lib/minutes-to-milliseconds.js');

describe('minutesToMilliseconds', () => {
  it('should convert minutes to milliseconds', () => {
    assert.equal(minutesToMilliseconds(2), 120000);
  });
});
