import { genAbTest, genVariant } from './fixtures/ab-test';
import { initCore } from './core';

const DummyTest = genAbTest({ id: 'DummyTest' });
const initCoreDefaultConfig = {
	mvtMaxValue: 1000000,
	mvtCookieId: 1234,
	pageIsSensitive: false,
	abTestSwitches: {
		DummyTest: true,
		DummyTestException: true,
	},
	arrayOfTestObjects: [DummyTest],
};

const abTestLibDefault = initCore(initCoreDefaultConfig);

describe('A/B test core', () => {
	beforeEach(() => {
		window.location.hash = '';
	});

	describe('runnableTest', () => {
		test('should return null for an expired test', () => {
			const expiredTest = genAbTest({
				id: 'DummyTest',
				canRun: true,
				expiry: '2000-01-01',
			});
			expect(abTestLibDefault.runnableTest(expiredTest)).toEqual(null);
		});

		test('should return null for a test which is switched off', () => {
			const test = genAbTest({ id: 'DummyTest', canRun: false });
			const rt = abTestLibDefault.runnableTest(test);
			expect(rt).toBeNull();
		});

		test('should return null if the test cannot be run', () => {
			const test = genAbTest({ id: 'DummyTest', canRun: false });
			expect(abTestLibDefault.runnableTest(test)).toBeNull();
		});

		test('should return null if the test can be run but the variant cannot', () => {
			const test = genAbTest({
				id: 'DummyTest',
				canRun: true,
				expiry: '9999-12-12',
				variants: [genVariant({ id: 'control', canRun: false })],
			});
			expect(abTestLibDefault.runnableTest(test)).toBeNull();
		});

		test('should return null if the mvtId is not in the audience offset', () => {
			const test = genAbTest({
				id: 'DummyTest',
				canRun: true,
				audienceOffset: 0.5,
			});
			expect(abTestLibDefault.runnableTest(test)).toBeNull();
		});

		test('should return true if the mvtId is in the audience offset', () => {
			const abTestLib = initCore({
				...initCoreDefaultConfig,
				...{
					mvtCookieId: 600000,
				},
			});
			const test = genAbTest({
				id: 'DummyTest',
				canRun: true,
				audienceOffset: 0.5,
			});
			expect(abTestLib.runnableTest(test)).not.toBeNull();
		});

		test('should return the forced variant on matching test', () => {
			const abTestLib = initCore({
				...initCoreDefaultConfig,
				...{
					forcedTestVariant: {
						testId: 'DummyTest',
						variant: genVariant({ id: 'variant123', canRun: true }),
					},
				},
			});
			const test = genAbTest({ id: 'DummyTest', canRun: true });
			const rt = abTestLib.runnableTest(test);
			expect(rt).not.toBeNull();
			if (rt) {
				expect(rt.variantToRun).toHaveProperty('id', 'variant123');
			}
		});

		test('should return the variantToRun specified by the mvtId, if the test is not the runnableTest param', () => {
			const abTestLib = initCore({
				...initCoreDefaultConfig,
				...{
					forcedTestVariant: {
						testId: 'NotDummyTest',
						variant: genVariant({ id: 'variant123', canRun: true }),
					},
				},
			});
			const test = genAbTest({
				id: 'DummyTest',
				canRun: true,
				variants: [
					genVariant({ id: 'control234', canRun: true }),
					genVariant({ id: 'variant234', canRun: true }),
				],
			});
			const rt = abTestLib.runnableTest(test);
			expect(rt).not.toBeNull();
			if (rt) {
				expect(rt.variantToRun).toHaveProperty('id', 'control234');
			}
		});

		test('should return the variantToRun specified by the mvtId, if forced variant is absent (odd mvtId)', () => {
			const test = genAbTest({
				id: 'DummyTest',
				canRun: true,
				variants: [
					genVariant({ id: 'control456', canRun: true }),
					genVariant({ id: 'variant456', canRun: true }),
				],
			});
			const rt = abTestLibDefault.runnableTest(test);
			expect(rt).not.toBeNull();
			if (rt) {
				expect(rt.variantToRun).toHaveProperty('id', 'control456');
			}
		});

		test('should return the variantToRun specified by the mvtId, if forced variant is absent (even mvtId)', () => {
			const abTestLib = initCore({
				...initCoreDefaultConfig,
				...{
					mvtCookieId: 1245,
				},
			});
			const test = genAbTest({
				id: 'DummyTest',
				canRun: true,
				variants: [
					genVariant({ id: 'control789', canRun: true }),
					genVariant({ id: 'variant789', canRun: true }),
				],
			});
			const rt = abTestLib.runnableTest(test);
			expect(rt).not.toBeNull();
			if (rt) {
				expect(rt.variantToRun).toHaveProperty('id', 'variant789');
			}
		});

		test('when forcedTestException is set, it should return null for matching tests and not null for other tests', () => {
			const abTestLib = initCore({
				...initCoreDefaultConfig,
				...{ forcedTestException: 'DummyTestException' },
			});

			const test = genAbTest({ id: 'DummyTest', canRun: true });
			const rt = abTestLib.runnableTest(test);
			expect(rt).not.toBeNull();

			const testException = genAbTest({ id: 'DummyTestException' });
			const rtException = abTestLib.runnableTest(testException);
			expect(rtException).toBeNull();
		});
	});

	describe('isUserInVariant', () => {
		test('Returns correct boolean values when user is in one variant', () => {
			// The user mvtId is 1234, which puts them into the 'control' bucket
			// with two variants, as it is an even number
			expect(
				abTestLibDefault.isUserInVariant(DummyTest.id, 'control'),
			).toBeTruthy();
			expect(
				abTestLibDefault.isUserInVariant(DummyTest.id, 'variant'),
			).toBeFalsy();
		});

		test('Returns correct boolean values when user is in the other variant', () => {
			const DummyTest = genAbTest({
				id: 'DummyTest',
			});
			const abTestLib = initCore({
				...initCoreDefaultConfig,
				...{ arrayOfTestObjects: [DummyTest], mvtCookieId: 1235 },
			});
			// The user mvtId is 1235
			// so the user should not in the variant bucket
			expect(
				abTestLib.isUserInVariant(DummyTest.id, 'control'),
			).toBeFalsy();
			expect(
				abTestLib.isUserInVariant(DummyTest.id, 'variant'),
			).toBeTruthy();
		});

		test('Returns false when user is in no variant', () => {
			const DummyTest = genAbTest({
				id: 'DummyTest',
				audience: 0.1,
				audienceOffset: 0.9,
			});
			const abTestLib = initCore({
				...initCoreDefaultConfig,
				...{ arrayOfTestObjects: [DummyTest] },
			});
			// The user mvtId is 1234, and the test audience is 90-100%
			// so the user should not be in any variants
			expect(
				abTestLib.isUserInVariant(DummyTest.id, 'control'),
			).toBeFalsy();
			expect(
				abTestLib.isUserInVariant(DummyTest.id, 'variant'),
			).toBeFalsy();
		});

		test("Returns false when test can't run", () => {
			const DummyTest = genAbTest({
				id: 'DummyTest',
				canRun: false,
			});
			const abTestLib = initCore({
				...initCoreDefaultConfig,
				...{ arrayOfTestObjects: [DummyTest] },
			});
			expect(
				abTestLib.isUserInVariant(DummyTest.id, 'control'),
			).toBeFalsy();
			expect(
				abTestLib.isUserInVariant(DummyTest.id, 'variant'),
			).toBeFalsy();
		});
	});
});
