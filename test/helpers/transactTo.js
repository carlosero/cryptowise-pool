module.exports = async (instance, state, admin) => {
	curState = await instance.state.call();
	if (curState.valueOf() != state) {
		await instance.setState(state, {from: admin});
	}
}
