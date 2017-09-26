import assert from 'assert'
const util = require(`../${process.env.TEST_DIR||'src'}/lib/util`)
const { noop } = util;

describe('noop', () => {
  it('a check', (done) => {
    assert.equal(noop(), undefined);
    done();
  });
});
