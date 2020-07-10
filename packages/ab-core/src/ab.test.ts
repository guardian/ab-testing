import { AB } from './ab';
import { ABTestAPI } from './types';

const DEFAULT_CONFIG = {
	mvtMaxValue: 1000000,
	mvtId: 1234,
	pageIsSensitive: false,
	abTestSwitches: {},
	serverSideTests: {},
	errorReporter: () => null,
	ophanRecord: () => null,
	forcedTestVariant: undefined,
	forcedTestException: undefined,
	arrayOfTestObjects: [],
};

describe('A/B Initalisation', () => {
	test('Initalisation returns API', () => {
		const myAB: ABTestAPI = new AB(DEFAULT_CONFIG);
		expect(myAB).not.toBeUndefined();
		expect(myAB.isUserInVariant).not.toBeUndefined();
		expect(myAB.firstRunnableTest).not.toBeUndefined();
		expect(myAB.trackABTests).not.toBeUndefined();
		expect(myAB.registerCompleteEvents).not.toBeUndefined();
	});
});
