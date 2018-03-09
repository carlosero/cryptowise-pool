module.exports = async (instanceAttribute, amount) => {
  assert.equal((await instanceAttribute).valueOf(), amount);
}
