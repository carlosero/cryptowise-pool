module.exports = async (instance, investor) => {
  return (await instance.contributions.call(investor)).valueOf();
}
