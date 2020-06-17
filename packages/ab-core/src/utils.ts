import { ABTest, Variant, Runnable } from './types';

const NOT_IN_TEST = 'notintest';

const notInTestVariant = {
	id: NOT_IN_TEST,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	test: () => {},
};

type Participations = {
	[testId: string]: {
		variant: string;
	};
};

const toPairs = (obj: {
	[key: string]: { variant: string };
}): [string, { variant: string }][] => {
	const arr = [] as [string, { variant: string }][];
	for (const [key, value] of Object.entries(obj)) {
		arr.push([key, value]);
	}
	return arr;
};

const fromPairs = (
	arr: [string, { variant: string }][],
): { [key: string]: { variant: string } } => {
	const obj = {} as { [key: string]: { variant: string } };
	arr.forEach((item) => {
		obj[item[0]] = item[1];
	});
	return obj;
};

export const isTestSwitchedOn = (
	testId: string,
	switches: { [key: string]: boolean },
): boolean => switches[testId];

export const runnableTestsToParticipations = (
	runnableTests: ReadonlyArray<Runnable<ABTest>>,
): Participations =>
	runnableTests.reduce(
		(participations: Participations, { id: testId, variantToRun }) => ({
			...participations,
			...{ [testId]: { variant: variantToRun.id } },
		}),
		{},
	);

export const testExclusionsWhoseSwitchExists = (
	participations: Participations,
	switches: { [key: string]: boolean },
): Participations => {
	const pairs: Array<[string, { variant: string }]> = toPairs(
		participations,
	).filter(
		([testId, { variant: variantId }]) =>
			variantId === NOT_IN_TEST && switches[`ab${testId}`] !== undefined,
	);
	return fromPairs(pairs);
};

// If the given test has a 'notintest' participation, return the notintest variant.
// Or else, if the given test has a normal variant participation, return that variant.
export const testAndParticipationsToVariant = (
	test: ABTest,
	participations: Participations,
): Variant | null | undefined => {
	const participation = participations[test.id];
	if (participation) {
		// We need to return something concrete here to ensure
		// that a notintest variant actually prevents other variants running.
		if (participation.variant === NOT_IN_TEST) {
			return notInTestVariant;
		}

		return test.variants.find(
			(variant) => variant.id === participation.variant,
		);
	}

	return null;
};
