import { ABTest } from './types';
import memoize from 'lodash.memoize';
import { allRunnableTests } from './ab-core';
import { runnableTestsToParticipations } from 'common/modules/experiments/ab-utils';
import {
	registerCompleteEvents,
	registerImpressionEvents,
	trackABTests,
} from 'common/modules/experiments/ab-ophan';

// These are the tests which will actually take effect on this pageview.
// Note that this is a subset of the potentially runnable tests,
// because we only run one epic test and one banner test per pageview.
// We memoize this because it can't change for a given pageview, and because getParticipations()
// and isInVariantSynchronous() depend on it and these are called in many places.
export const getSynchronousTestsToRun = memoize((concurrentTests: ABTest[]) =>
	allRunnableTests<ABTest>(concurrentTests),
);

// This excludes epic & banner tests
export const getSynchronousParticipations = (): Participations =>
	runnableTestsToParticipations(getSynchronousTestsToRun());

// This excludes epic & banner tests
export const isInVariantSynchronous = (
	test: ABTest,
	variantId: string,
): boolean =>
	getSynchronousTestsToRun().some(
		(t) => t.id === test.id && t.variantToRun.id === variantId,
	);

// This excludes epic & banner tests
// checks if the user in in a given test with any variant
export const isInABTestSynchronous = (test: ABTest): boolean =>
	getSynchronousTestsToRun().some((t) => t.id === test.id);

export const runAndTrackAbTests = (): Promise<void> => {
	const testsToRun = getSynchronousTestsToRun();

	testsToRun.forEach((test) => test.variantToRun.test(test));

	registerImpressionEvents(testsToRun);
	registerCompleteEvents(testsToRun);
	trackABTests(testsToRun);
};
