import { AB } from './ab';

const DEFAULT_CONFIG = {
	mvtMaxValue: 1000000,
	mvtCookieId: 1234,
	pageIsSensitive: false,
	abTestSwitches: {},
	serverSideTests: {},
	errorReporter: () => null,
	ophanRecord: () => null,
};

describe('A/B Initalisation', () => {
	test('Initalisation returns API', () => {
		const myAB = new AB(DEFAULT_CONFIG);
		expect(myAB.test).not.toBeUndefined();
		expect(myAB.test?.core).not.toBeUndefined();
		expect(myAB.test?.ophan).not.toBeUndefined();
	});
});
