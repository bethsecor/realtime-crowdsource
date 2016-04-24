const assert = require('assert');
const removeEmpty = require('../lib/remove-empty.js');

describe('removeEmpty', () => {
  it('should return an array with no empty strings', () => {
    var options = ["cat", "", "dog"];
    assert.equal(removeEmpty(options).toString(), ["cat", "dog"].toString());
  });
});
