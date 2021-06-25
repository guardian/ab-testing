import { Runnable, ABTest, Variant } from '../types';

type genVariantConfig = {
	id: string;
	canRun?: boolean;
	success?: (complete: () => void) => void;
	impression?: (track: () => void) => void;
};
export const genVariant = (genVariantConfig: genVariantConfig): Variant => {
	const { id, canRun, success, impression } = genVariantConfig;
	return {
		id,
		test: (): undefined => undefined,
		...(canRun != null ? { canRun: (): boolean => !!canRun } : {}),
		success: success || undefined,
		impression: impression || undefined,
	};
};

type genAbConfig = {
	id: string;
	canRun?: boolean;
	expiry?: string;
	variants?: Variant[];
	audience?: number;
	audienceOffset?: number;
};
export const genAbTest = (genAbConfig: genAbConfig): ABTest => {
	const { id, canRun, expiry, variants, audience, audienceOffset } =
		genAbConfig;
	return {
		id,
		audienceCriteria: 'n/a',
		audienceOffset: audienceOffset || 0,
		audience: audience || 1,
		author: 'n/a',
		canRun: (): boolean => {
			if (canRun !== undefined) return !!canRun;
			return true;
		},
		description: 'n/a',
		start: '0001-01-01',
		expiry: expiry || '9999-12-12',
		successMeasure: 'n/a',
		variants: variants || [
			genVariant({ id: 'control' }),
			genVariant({ id: 'variant' }),
		],
	};
};

export const genRunnableAbTestWhereControlIsRunnable = (
	id: string,
	canRun?: boolean,
	variants?: Variant[],
): Runnable<ABTest> => {
	const abTest = genAbTest({ id, canRun, variants });

	return {
		...abTest,
		variantToRun: abTest.variants[0],
	};
};

export const genRunnableAbTestWhereVariantIsRunnable = (
	id: string,
	canRun?: boolean,
): Runnable<ABTest> => {
	const abTest = genAbTest({ id, canRun });
	return {
		...abTest,
		variantToRun: abTest.variants[1],
	};
};
