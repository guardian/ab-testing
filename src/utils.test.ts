import { ABTest, Variant, Runnable } from './types';

import {
	runnableTestsToParticipations,
	testAndParticipationsToVariant,
	testExclusionsWhoseSwitchExists,
} from './utils';

const NOT_IN_TEST = 'notintest';

const genVariant = (id: string, canRun?: boolean): Variant => ({
	id,
	test: () => undefined,
	...(canRun != null ? { canRun: () => !!canRun } : {}),
});

const genAbTest = (
	id: string,
	canRun?: boolean,
	expiry?: string,
	variants?: Variant[],
): ABTest => ({
	id,
	audienceCriteria: 'n/a',
	audienceOffset: 0,
	audience: 1,
	author: 'n/a',
	showForSensitive: false,
	canRun: () => {
		if (canRun != null) return !!canRun;
		return true;
	},
	description: 'n/a',
	start: '0001-01-01',
	expiry: expiry || '9999-12-12',
	successMeasure: 'n/a',
	variants: variants || [genVariant('control'), genVariant('variant')],
});

const genRunnableAbTestWhereControlIsRunnable = (
	id: string,
	canRun?: boolean,
): Runnable<ABTest> => {
	const abTest = genAbTest(id, canRun);
	return {
		...abTest,
		variantToRun: abTest.variants[0],
	};
};

const genRunnableAbTestWhereVariantIsRunnable = (
	id: string,
	canRun?: boolean,
): Runnable<ABTest> => {
	const abTest = genAbTest(id, canRun);
	return {
		...abTest,
		variantToRun: abTest.variants[1],
	};
};

describe('A/B utils', () => {
	describe('runnableTestsToParticipations', () => {
		it('should set the runnable variant in the participations', () => {
			expect(
				runnableTestsToParticipations([
					genRunnableAbTestWhereControlIsRunnable('a'),
					genRunnableAbTestWhereControlIsRunnable('b'),
				]),
			).toEqual({
				a: { variant: 'control' },
				b: { variant: 'control' },
			});

			expect(
				runnableTestsToParticipations([
					genRunnableAbTestWhereControlIsRunnable('c'),
					genRunnableAbTestWhereVariantIsRunnable('d'),
				]),
			).toEqual({
				c: { variant: 'control' },
				d: { variant: 'variant' },
			});
		});
	});

	describe('testExclusionsWhoseSwitchExists', () => {
		it('should filter out non-NOT_IN_TEST variants', () => {
			expect(
				testExclusionsWhoseSwitchExists(
					{
						SwitchExists: { variant: NOT_IN_TEST },
						SwitchExists2: { variant: NOT_IN_TEST },
						SwitchExists3: { variant: 'real' },
					},
					{
						abSwitchExists: false,
						abSwitchExists2: true,
					},
				),
			).toEqual({
				SwitchExists: { variant: NOT_IN_TEST },
				SwitchExists2: { variant: NOT_IN_TEST },
			});
		});

		it('should exclude NOT_IN_TEST variants whose switch does not exist', () => {
			expect(
				testExclusionsWhoseSwitchExists(
					{
						SwitchExists: { variant: NOT_IN_TEST },
						SwitchExists2: { variant: NOT_IN_TEST },
						SwitchExists3: { variant: 'real' },
					},
					{},
				),
			).toEqual({});
		});
	});

	describe('testAndParticipationsToVariant', () => {
		it('should return the NOT_IN_TEST variant if present', () => {
			const notInTestVariant = genVariant(NOT_IN_TEST);
			expect(
				testAndParticipationsToVariant(
					genAbTest('a', true, '9999-12-12', [
						genVariant('control'),
						notInTestVariant,
					]),
					{
						a: { variant: NOT_IN_TEST },
						b: { variant: 'hey' },
					},
				),
			).toHaveProperty('id', NOT_IN_TEST);
		});

		it('should return a normal variant if no NOT_IN_TEST variant present', () => {
			const variant = genVariant('Variant');
			expect(
				testAndParticipationsToVariant(
					genAbTest('b', true, '9999-12-12', [
						genVariant('control'),
						variant,
					]),
					{
						a: { variant: 'hey' },
						b: { variant: 'Variant' },
					},
				),
			).toEqual(variant);
		});
	});
});
