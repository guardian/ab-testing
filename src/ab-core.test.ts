import { genAbTest, genVariant } from './fixtures/ab-test';
import { initABCore } from './ab-core';

const initABCoreDefaultConfig = {
	mvtMaxValue: 1000000,
	mvtCookieId: 1234,
	pageIsSensitive: false,
	abTestSwitches: {
		DummyTest: true,
		DummyTestException: true,
	},
};

const abTestLibDefault = initABCore(initABCoreDefaultConfig);

describe('A/B tests', () => {
	beforeEach(() => {
		window.location.hash = '';
	});

	describe('runnableTest', () => {
		test('should return null for an expired test', () => {
			const expiredTest = genAbTest('DummyTest', true, '2000-01-01');
			expect(abTestLibDefault.runnableTest(expiredTest)).toEqual(null);
		});

		test('should return null for a test which is switched off', () => {
			const test = genAbTest('DummyTest');
			const rt = abTestLibDefault.runnableTest(test);
			expect(rt).toBeNull();
		});

		test('should return null if the test cannot be run', () => {
			const test = genAbTest('DummyTest', false);
			expect(abTestLibDefault.runnableTest(test)).toBeNull();
		});

		test('should return null if the test can be run but the variant cannot', () => {
			const test = genAbTest('DummyTest', true, '9999-12-12', [
				genVariant('control', false),
			]);
			expect(abTestLibDefault.runnableTest(test)).toBeNull();
		});

		test('should return null if the mvtId is not in the audience offset', () => {
			const test = genAbTest(
				'DummyTest',
				true,
				undefined,
				undefined,
				undefined,
				0.5,
			);
			expect(abTestLibDefault.runnableTest(test)).toBeNull();
		});

		test('should return true if the mvtId is in the audience offset', () => {
			const abTestLib = initABCore({
				...initABCoreDefaultConfig,
				...{
					mvtCookieId: 600000,
				},
			});
			const test = genAbTest(
				'DummyTest',
				true,
				undefined,
				undefined,
				undefined,
				0.5,
			);
			expect(abTestLib.runnableTest(test)).not.toBeNull();
		});

		test('should return the forced variant on matching test', () => {
			const abTestLib = initABCore({
				...initABCoreDefaultConfig,
				...{
					forcedTestVariant: {
						testId: 'DummyTest',
						variant: genVariant('variant123', true),
					},
				},
			});
			const test = genAbTest('DummyTest', true);
			const rt = abTestLib.runnableTest(test);
			expect(rt).not.toBeNull();
			if (rt) {
				expect(rt.variantToRun).toHaveProperty('id', 'variant123');
			}
		});

		test('should return the variantToRun specified by the cookie, if the test is not the runnableTest param', () => {
			const abTestLib = initABCore({
				...initABCoreDefaultConfig,
				...{
					forcedTestVariant: {
						testId: 'NotDummyTest',
						variant: genVariant('variant123', true),
					},
				},
			});
			const test = genAbTest('DummyTest', true, undefined, [
				genVariant('control234', true),
				genVariant('variant234', true),
			]);
			const rt = abTestLib.runnableTest(test);
			expect(rt).not.toBeNull();
			if (rt) {
				expect(rt.variantToRun).toHaveProperty('id', 'control234');
			}
		});

		test('should return the variantToRun specified by the cookie, if forced variant is absent (odd cookie)', () => {
			const test = genAbTest('DummyTest', true, undefined, [
				genVariant('control234', true),
				genVariant('variant234', true),
			]);
			const rt = abTestLibDefault.runnableTest(test);
			expect(rt).not.toBeNull();
			if (rt) {
				expect(rt.variantToRun).toHaveProperty('id', 'control234');
			}
		});

		test('should return the variantToRun specified by the cookie, if forced variant is absent (even cookie)', () => {
			const abTestLib = initABCore({
				...initABCoreDefaultConfig,
				...{
					mvtCookieId: 1245,
				},
			});
			const test = genAbTest('DummyTest', true, undefined, [
				genVariant('control234', true),
				genVariant('variant234', true),
			]);
			const rt = abTestLib.runnableTest(test);
			expect(rt).not.toBeNull();
			if (rt) {
				expect(rt.variantToRun).toHaveProperty('id', 'variant234');
			}
		});

		test('when forcedTestException is set, it should return null for matching tests and not null for other tests', () => {
			const abTestLib = initABCore({
				...initABCoreDefaultConfig,
				...{ forcedTestException: 'DummyTestException' },
			});

			const test = genAbTest('DummyTest', true);
			const rt = abTestLib.runnableTest(test);
			expect(rt).not.toBeNull();

			const testException = genAbTest('DummyTestException');
			const rtException = abTestLib.runnableTest(testException);
			expect(rtException).toBeNull();
		});
	});
});
