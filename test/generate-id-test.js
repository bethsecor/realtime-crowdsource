const assert = require('assert');
const generateId = require('../lib/generate-id.js');

describe('generateId', () => {
  it('should generate id of length twenty', () => {
    assert.equal(generateId().length, 20);
  });
});
