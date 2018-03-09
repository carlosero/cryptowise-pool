module.exports = async (instance, investor, amount = 12340000) => {
  let beforeBalance = (await instance.contributions.call(investor)).valueOf();
  await instance.sendTransaction({ value: amount, from: investor });
  let newBalance = (await instance.contributions.call(investor)).valueOf();
  assert.isAbove(newBalance, beforeBalance);
}
