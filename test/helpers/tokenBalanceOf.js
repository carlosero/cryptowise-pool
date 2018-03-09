module.exports = async (tokenContract, investor) => {
  return (await tokenContract.balaceOf(investor)).valueOf();
}
