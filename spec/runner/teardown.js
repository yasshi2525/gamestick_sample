const teardown = async() => {
	if (global.context) {
		await global.context.destroy();
	}
};

export default teardown;
