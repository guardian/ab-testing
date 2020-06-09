import { initExample } from './example';

const config = {
	mvtMaxValue: 1000000,
	mvtCookieId: 1234,
	pageIsSensitive: false,
	abTestSwitches: {
		DummyTest: true,
		DummyTestException: true,
	},
	deleteme: true,
};

describe('example', () => {
	const example = initExample(config);
	it('should want to be deleted', () => {
		expect(example.deleteme).toBe(true);
	});
});
