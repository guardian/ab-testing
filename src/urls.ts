import { ABTest, Variant, Participations } from './types';

import { testAndParticipationsToVariant } from './utils';

export const getForcedParticipationsFromUrl = (): Participations => {
	if (window.location.hash.startsWith('#ab')) {
		const tokens = window.location.hash.replace('#ab-', '').split(',');

		return tokens.reduce((obj, token) => {
			const [testId, variantId] = token.split('=');
			return {
				...obj,
				[testId]: { variant: variantId },
			};
		}, {});
	}

	return {};
};

// If the given test has a variant which is forced by the URL, return it
// TODO test this
export const getVariantFromUrl = (test: ABTest): Variant | undefined | null =>
	testAndParticipationsToVariant(test, getForcedParticipationsFromUrl());

// Useful if you want to force a test even when it normally wouldn't run
// (for example, to display a specific epic variant to verify it renders
// okay).
// TODO test this
export const getIgnoreCanRunFromUrl = (): boolean =>
	window.location.hash.includes('ignoreCanRun=true');
