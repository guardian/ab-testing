import { AB } from './ab';
import { ABType } from './types';

const DEFAULT_CONFIG = {
	mvtMaxValue: 1000000,
	mvtCookieId: 1234,
	pageIsSensitive: false,
	abTestSwitches: {},
	serverSideTests: {},
	errorReporter: () => null,
	ophanRecord: () => null,
	arrayOfTestObjects: [],
};

describe('A/B Initalisation', () => {
	test('Initalisation returns API', () => {
		const myAB: ABType = new AB(DEFAULT_CONFIG);
		expect(myAB).not.toBeUndefined();
		expect(myAB.isUserInVariant).not.toBeUndefined();
		expect(myAB.firstRunnableTest).not.toBeUndefined();
		expect(myAB.trackABTests).not.toBeUndefined();
		expect(myAB.registerCompleteEvents).not.toBeUndefined();
	});
});
