import { ABTest, Variant, Runnable } from './types';
// import { getVariantFromLocalStorage } from './ab-local-storage'; // Deprecating from localstorage
import { isExpired } from './lib/time-utils';

type abCoreAPI = {
	runnableTest: (test: ABTest) => Runnable<ABTest> | null;
	allRunnableTests: (
		tests: ReadonlyArray<ABTest>,
	) => ReadonlyArray<Runnable<ABTest>> | [];
	firstRunnableTest: (
		tests: ReadonlyArray<ABTest>,
	) => Runnable<ABTest> | null;
};

type initABCoreConfig = {
	mvtMaxValue: number;
	mvtCookieId: number;
	pageIsSensitive: boolean;
	abTestSwitches: Record<string, boolean>;
	forcedTestVariant?: { testId: ABTest['id']; variant: Variant };
	forcedTestException?: ABTest['id'];
};
export const initABCore = (config: initABCoreConfig): abCoreAPI => {
	const {
		mvtMaxValue,
		mvtCookieId,
		pageIsSensitive,
		abTestSwitches,
		forcedTestVariant,
		forcedTestException,
	} = config;
	// We only take account of a variant's canRun function if it's defined.
	// If it's not, assume the variant can be run.
	const variantCanBeRun = (variant: Variant): boolean => {
		const isInTest = variant.id !== 'notintest';
		if (variant.canRun) {
			return variant.canRun() && isInTest;
		} else {
			return isInTest;
		}
	};

	const testCanBeRun = (test: ABTest): boolean => {
		const expired = isExpired(test.expiry);
		const isSensitive = pageIsSensitive;
		const shouldShowForSensitive = !!test.showForSensitive;
		const isTestOn = abTestSwitches[test.id] && !!abTestSwitches[test.id];
		const canTestBeRun = !test.canRun || test.canRun();

		// console.log('expired', expired);
		// console.log('isSensitive', isSensitive);
		// console.log('shouldShowForSensitive', shouldShowForSensitive);
		// console.log('isTestOn', isTestOn);
		// console.log('canTestBeRun', canTestBeRun);
		// console.log('test.canRun()', test.canRun());

		return (
			(isSensitive ? shouldShowForSensitive : true) &&
			isTestOn &&
			!expired &&
			canTestBeRun
		);
	};

	// Determine whether the user is in the test or not and return the associated
	// variant ID, based on the MVT cookie segmentation.
	//
	// The test population is just a subset of MVT ids. A test population must
	// begin from a specific value. Overlapping test ranges are permitted.
	const computeVariantFromMvtCookie = (test: ABTest): Variant | null => {
		const smallestTestId = mvtMaxValue * test.audienceOffset;
		const largestTestId = smallestTestId + mvtMaxValue * test.audience;

		if (
			mvtCookieId &&
			mvtCookieId > smallestTestId &&
			mvtCookieId <= largestTestId
		) {
			// This mvt test id is in the test range, so allocate it to a test variant.
			return test.variants[mvtCookieId % test.variants.length];
		}

		return null;
	};

	// This is the heart of the A/B testing framework.
	// It turns an ABTest into a Runnable<ABTest>, if indeed the test
	// actually has a variant which could run on this pageview.
	//
	// This function can be called at any time, it should always give the same result for a given pageview.
	const runnableTest: abCoreAPI['runnableTest'] = (test) => {
		// const fromLocalStorage = getVariantFromLocalStorage(test); // We're deprecating accessing localstorage
		const fromCookie = computeVariantFromMvtCookie(test);
		const fromForcedTest =
			forcedTestVariant?.testId === test.id && forcedTestVariant.variant;
		const forcedOutOfTest = forcedTestException === test.id;
		const variantToRun = fromForcedTest || fromCookie;

		// console.log('ftv', forcedTestVariant);
		// console.log('fft', fromForcedTest);
		// console.log('vtr', variantToRun);
		// console.log('tcbr', testCanBeRun(test));

		if (
			!forcedOutOfTest &&
			testCanBeRun(test) &&
			variantToRun &&
			variantCanBeRun(variantToRun)
		) {
			return {
				...test,
				variantToRun,
			};
		}

		return null;
	};

	// please ignore
	const allRunnableTests: abCoreAPI['allRunnableTests'] = (tests) =>
		tests.reduce<Runnable<ABTest>[]>((prev, currentValue) => {
			// in this pr
			const rt = runnableTest(currentValue); // i will remove these comments
			return rt ? [...prev, rt] : prev; // so that this api can be reviewed seperate
		}, []); // ta

	// Please ignore
	const firstRunnableTest: abCoreAPI['firstRunnableTest'] = (tests) =>
		tests // in this pr
			.map((test: ABTest) => runnableTest(test)) // I will remove these comments
			.find((rt: Runnable<ABTest> | null) => rt !== null) || null; // so that this API can be reviewed seperate

	return {
		runnableTest,
		allRunnableTests,
		firstRunnableTest,
	};
};
