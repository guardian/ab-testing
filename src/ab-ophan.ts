import {
	OphanABEvent,
	OphanABPayload,
	ABTest,
	Variant,
	Runnable,
	ServerSideTests,
	ErrorReporterFunc,
	OphanRecordFunction,
} from './types';

type Noop = () => void;
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop: Noop = () => {};

const submit = (
	payload: OphanABPayload,
	ophanRecord: OphanRecordFunction,
): void =>
	ophanRecord({
		abTestRegister: payload,
	});

/**
 * generate an A/B event for ophan
 */
const makeABEvent = (variant: Variant, complete: boolean): OphanABEvent => {
	const event: OphanABEvent = {
		variantName: variant.id,
		complete,
	};

	if (variant.campaignCode) {
		event.campaignCodes = [variant.campaignCode];
	}

	return event;
};

/**
 * Checks if this test will defer its impression by providing its own impression function.
 *
 * If it does, the test won't be included in the Ophan call that happens at pageload, and must fire the impression
 * itself via the callback passed to the `impression` property in the variant.
 */
const defersImpression = (test: ABTest): boolean =>
	test.variants.every(
		(variant: Variant): boolean => typeof variant.impression === 'function',
	);

/**
 * Create a function that will fire an A/B test to Ophan
 */
const buildOphanSubmitter = (
	test: ABTest,
	variant: Variant,
	complete: boolean,
	ophanRecord: OphanRecordFunction,
): (() => void) => {
	const data = {
		[test.id]: makeABEvent(variant, complete),
	};
	return () => submit(data, ophanRecord);
};

/**
 * Create a function that sets up listener to fire an Ophan `complete` event. This is used in the `success` and
 * `impression` properties of test variants to allow test authors to control when these events are sent out.
 */
const registerCompleteEvent = (
	complete: boolean,
	errorReporter: ErrorReporterFunc,
	ophanRecord: OphanRecordFunction,
) => (test: Runnable<ABTest>): void => {
	const variant = test.variantToRun;
	const listener = (complete ? variant.success : variant.impression) || noop;

	try {
		listener(buildOphanSubmitter(test, variant, complete, ophanRecord));
	} catch (err) {
		errorReporter(err, {}, false);
	}
};

const buildOphanPayload = (
	tests: ReadonlyArray<Runnable<ABTest>>,
	serverSideTestObj: ServerSideTests,
	errorReporter: ErrorReporterFunc,
): OphanABPayload => {
	try {
		const log: OphanABPayload = {};
		const serverSideTests = Object.keys(serverSideTestObj).filter(
			(test) => !!serverSideTestObj[test],
		);

		tests
			.filter((test) => !defersImpression(test))
			.forEach((test) => {
				log[test.id] = makeABEvent(test.variantToRun, false);
			});

		serverSideTests.forEach((test) => {
			const serverSideVariant: Variant = {
				id: 'inTest',
				test: () => undefined,
			};

			log[`ab${test}`] = makeABEvent(serverSideVariant, false);
		});

		return log;
	} catch (error) {
		// Encountering an error should invalidate the logging process.
		errorReporter(error, {}, false);
		return {};
	}
};

type abOphanAPI = {
	registerCompleteEvents: (tests: ReadonlyArray<Runnable<ABTest>>) => void;
	registerImpressionEvents: (tests: ReadonlyArray<Runnable<ABTest>>) => void;
	trackABTests: (tests: ReadonlyArray<Runnable<ABTest>>) => void;
};

type abOphanAPIConfig = {
	serverSideTests: ServerSideTests;
	errorReporter: ErrorReporterFunc;
	ophanRecord: OphanRecordFunction;
};

export const initAbOphan = (config: abOphanAPIConfig): abOphanAPI => {
	const { serverSideTests, errorReporter, ophanRecord } = config;

	const registerCompleteEvents: abOphanAPI['registerCompleteEvents'] = (
		tests,
	) => {
		return tests.forEach(
			registerCompleteEvent(true, errorReporter, ophanRecord),
		);
	};

	const registerImpressionEvents: abOphanAPI['registerImpressionEvents'] = (
		tests,
	) =>
		tests
			.filter(defersImpression)
			.forEach(registerCompleteEvent(false, errorReporter, ophanRecord));

	const trackABTests: abOphanAPI['trackABTests'] = (tests) =>
		submit(
			buildOphanPayload(tests, serverSideTests, errorReporter),
			ophanRecord,
		);

	return { registerCompleteEvents, registerImpressionEvents, trackABTests };
};
