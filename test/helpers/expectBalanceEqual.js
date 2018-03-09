balanceOf = require('./balanceOf');

module.exports = async (instance, investor, amount = 12340000) => {
  assert.equal(await balanceOf(instance, investor), amount);
}
