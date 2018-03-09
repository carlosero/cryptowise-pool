var expectThrow = require('./expectThrow');

module.exports = async (instance, investor, amount = 12340000) => {
  let beforeBalance = (await instance.contributions.call(investor)).valueOf();
  await expectThrow(instance.sendTransaction({ value: amount, from: investor }), "Error");
  let newBalance = (await instance.contributions.call(investor)).valueOf();
  assert.equal(beforeBalance, newBalance);
}
