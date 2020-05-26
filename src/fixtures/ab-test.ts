import { Runnable, ABTest, Variant } from '../types';

export const genVariant = (id: string, canRun?: boolean): Variant => ({
	id,
	test: (): undefined => undefined,
	...(canRun != null ? { canRun: (): boolean => !!canRun } : {}),
});

export const genAbTest = (
	id: string,
	canRun?: boolean,
	expiry?: string,
	variants?: Variant[],
	audience?: number,
	audienceOffset?: number,
): ABTest => ({
	id,
	audienceCriteria: 'n/a',
	audienceOffset: audienceOffset || 0,
	audience: audience || 1,
	author: 'n/a',
	canRun: (): boolean => {
		if (canRun !== null) return !!canRun;
		return true;
	},
	description: 'n/a',
	start: '0001-01-01',
	expiry: expiry || '9999-12-12',
	successMeasure: 'n/a',
	variants: variants || [genVariant('control'), genVariant('variant')],
});

export const genRunnableAbTestWhereControlIsRunnable = (
	id: string,
	canRun?: boolean,
): Runnable<ABTest> => {
	const abTest = genAbTest(id, canRun);
	return {
		...abTest,
		variantToRun: abTest.variants[0],
	};
};

export const genRunnableAbTestWhereVariantIsRunnable = (
	id: string,
	canRun?: boolean,
): Runnable<ABTest> => {
	const abTest = genAbTest(id, canRun);
	return {
		...abTest,
		variantToRun: abTest.variants[1],
	};
};
