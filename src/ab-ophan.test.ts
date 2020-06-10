import { initOphan } from './ab-ophan';
import {
	genRunnableAbTestWhereControlIsRunnable,
	genVariant,
} from './fixtures/ab-test';
import { OphanRecordFunction } from './types';

export const initABCoreDefaultConfig = {
	mvtMaxValue: 1000000,
	mvtCookieId: 1234,
	pageIsSensitive: false,
	abTestSwitches: {
		DummyTest: true,
		DummyTestException: true,
	},
};

const mockErrorReporter = jest.fn((error) => error);
const mockOphanRecord = jest.fn((record) => record);

const initOphanDefaultConfig = {
	serverSideTests: {},
	errorReporter: mockErrorReporter,
	ophanRecord: mockOphanRecord,
};

describe('A/B Ophan analytics', () => {
	test('Ophan data structure contains the correct values for completion of success', () => {
		const ophanRecord: OphanRecordFunction = (send) => send;
		const mockOphanRecord = jest.fn(ophanRecord);
		const abTestOphan = initOphan({
			...initOphanDefaultConfig,
			...{ ophanRecord: mockOphanRecord },
		});

		const successFunc = (complete: () => void) => {
			complete();
		};
		abTestOphan.registerCompleteEvents([
			genRunnableAbTestWhereControlIsRunnable('DummyTest', undefined, [
				genVariant({ id: 'control', success: successFunc }),
				genVariant({ id: 'variant' }),
			]),
			genRunnableAbTestWhereControlIsRunnable('DummyTest2'),
		]);

		expect(mockOphanRecord).toHaveBeenCalledTimes(1);
		expect(mockOphanRecord).toHaveBeenCalledWith({
			abTestRegister: {
				DummyTest: {
					complete: true,
					variantName: 'control',
				},
			},
		});
	});

	test('Ophan data structure contains the correct values for completion of success when delayed', (done) => {
		const ophanRecord: OphanRecordFunction = (send) => send;
		const mockOphanRecord = jest.fn(ophanRecord);
		const abTestOphan = initOphan({
			...initOphanDefaultConfig,
			...{ ophanRecord: mockOphanRecord },
		});

		const successFunc = (complete: () => void) => {
			// This could be an event listener for example
			// but we're testing 'async' code to ensure that
			// our code handles delayed calling of the complete callback

			setTimeout(() => {
				complete();

				expect(mockOphanRecord).toHaveBeenCalledTimes(1);
				expect(mockOphanRecord).toHaveBeenCalledWith({
					abTestRegister: {
						DummyTestA: {
							complete: true,
							variantName: 'controlA',
						},
					},
				});

				done();
			}, 100);
		};
		abTestOphan.registerCompleteEvents([
			genRunnableAbTestWhereControlIsRunnable('DummyTestA', undefined, [
				genVariant({ id: 'controlA', success: successFunc }),
				genVariant({ id: 'variantA' }),
			]),
			genRunnableAbTestWhereControlIsRunnable('DummyTest2A'),
		]);
	});

	test('Ophan data structure contains the correct values for completion of impression', () => {
		const ophanRecord: OphanRecordFunction = (send) => send;
		const mockOphanRecord = jest.fn(ophanRecord);
		const abTestOphan = initOphan({
			...initOphanDefaultConfig,
			...{ ophanRecord: mockOphanRecord },
		});

		const impressionFunc = (track: () => void) => {
			track();
		};

		abTestOphan.registerImpressionEvents([
			genRunnableAbTestWhereControlIsRunnable('DummyTest3', undefined, [
				genVariant({ id: 'control1', impression: impressionFunc }),
				genVariant({ id: 'variant1', impression: impressionFunc }),
			]),
			genRunnableAbTestWhereControlIsRunnable('DummyTest4'),
		]);

		expect(mockOphanRecord).toHaveBeenCalledTimes(1);
		expect(mockOphanRecord).toHaveBeenCalledWith({
			abTestRegister: {
				DummyTest3: {
					complete: false,
					variantName: 'control1',
				},
			},
		});
	});

	test('success function fires when canRun is true', () => {
		const abTestOphan = initOphan(initOphanDefaultConfig);
		const dummy = genRunnableAbTestWhereControlIsRunnable('DummyTest');
		dummy.variants[0].success = () => undefined;
		const spy = jest.spyOn(dummy.variants[0], 'success');

		abTestOphan.registerCompleteEvents([dummy]);

		expect(spy).toHaveBeenCalled();
	});

	test('success function fires when canRun is false', () => {
		const abTestOphan = initOphan(initOphanDefaultConfig);
		const dummy = genRunnableAbTestWhereControlIsRunnable('DummyTest');
		dummy.variants[0].success = () => undefined;
		const spy = jest.spyOn(dummy.variants[0], 'success');

		dummy.canRun = () => false;
		abTestOphan.registerCompleteEvents([dummy]);

		expect(spy).toHaveBeenCalled();
	});

	test('defer firing the impression when the function is provided', () => {
		const abTestOphan = initOphan(initOphanDefaultConfig);
		const dummy = genRunnableAbTestWhereControlIsRunnable('DummyTest');

		/**
		 * impression events are only registered if every variant has an `impression` function
		 */
		dummy.variants.forEach((v) => {
			v.impression = () => undefined;
		});

		const controlSpy = jest.spyOn(dummy.variants[0], 'impression');
		const variantSpy = jest.spyOn(dummy.variants[1], 'impression');

		abTestOphan.registerImpressionEvents([dummy]);

		expect(
			controlSpy.mock.calls.length + variantSpy.mock.calls.length,
		).toEqual(1);
	});

	test('trackABtests fires the ophanRecord with all runnable AB tests', () => {
		const ophanRecord: OphanRecordFunction = (send) => send;
		const mockOphanRecord = jest.fn(ophanRecord);
		const abTestOphan = initOphan({
			...initOphanDefaultConfig,
			...{ ophanRecord: mockOphanRecord },
		});

		abTestOphan.trackABTests([
			genRunnableAbTestWhereControlIsRunnable('DummyTest', undefined, [
				genVariant({ id: 'control' }),
				genVariant({ id: 'variant' }),
			]),
			genRunnableAbTestWhereControlIsRunnable('DummyTest2'),
		]);

		expect(mockOphanRecord).toHaveBeenCalledTimes(1);
		expect(mockOphanRecord).toHaveBeenCalledWith({
			abTestRegister: {
				DummyTest: {
					complete: false,
					variantName: 'control',
				},
				DummyTest2: {
					complete: false,
					variantName: 'control',
				},
			},
		});
	});
});
