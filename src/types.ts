export type ConfigType = {
	mvtMaxValue: number;
	mvtCookieId: number;
	pageIsSensitive: boolean;
	abTestSwitches: Record<string, boolean>;
	forcedTestVariant?: { testId: ABTest['id']; variant: Variant };
	forcedTestException?: ABTest['id'];
};

export type coreAPI = {
	runnableTest: (test: ABTest) => Runnable<ABTest> | null;
	allRunnableTests: (
		tests: ReadonlyArray<ABTest>,
	) => ReadonlyArray<Runnable<ABTest>> | [];
	firstRunnableTest: (
		tests: ReadonlyArray<ABTest>,
	) => Runnable<ABTest> | null;
};

export type OphanProduct =
	| 'CONTRIBUTION'
	| 'RECURRING_CONTRIBUTION'
	| 'MEMBERSHIP_SUPPORTER'
	| 'MEMBERSHIP_PATRON'
	| 'MEMBERSHIP_PARTNER'
	| 'DIGITAL_SUBSCRIPTION'
	| 'PRINT_SUBSCRIPTION';

export interface EngagementBannerTemplateParams {
	titles?: string[];
	leadSentence?: string;
	closingSentence?: string;
	messageText: string;
	mobileMessageText?: string;
	ctaText: string;
	buttonCaption: string;
	linkUrl: string;
	hasTicker: boolean;
	tickerHeader?: string;
	signInUrl?: string;
	secondaryLinkUrl?: string;
	secondaryLinkLabel?: string;
	subsLinkUrl?: string;
}

/**
 * AllExistingSupporters - all recurring, all one-offs in last 3 months
 * AllNonSupporters - no recurring, no one-offs in last 3 months
 * Everyone
 * PostAskPauseSingleContributors - people who made a contribution more than 3 months ago
 *
 * Note - PostAskPauseSingleContributors is a subset of AllNonSupporters, so priority ordering of these tests is important
 */
export type AcquisitionsComponentUserCohort =
	| 'AllExistingSupporters'
	| 'AllNonSupporters'
	| 'Everyone'
	| 'PostAskPauseSingleContributors';

export interface EngagementBannerTestParams {
	titles?: string[];
	leadSentence?: string;
	messageText?: string;
	ctaText?: string;
	buttonCaption?: string;
	linkUrl?: string;
	hasTicker?: boolean;
	tickerHeader?: string;
	products?: OphanProduct[];
	template?: (templateParams: EngagementBannerTemplateParams) => string;
	bannerModifierClass?: string;
	minArticlesBeforeShowingBanner?: number;
	userCohort?: AcquisitionsComponentUserCohort;
	bannerShownCallback?: () => void;
}

type ListenerFunction = (f: () => void) => void;

export interface Variant {
	id: string;
	test: (x: Record<string, unknown>) => void;
	campaignCode?: string;
	canRun?: () => boolean;
	impression?: ListenerFunction;
	success?: ListenerFunction;
	engagementBannerParams?: EngagementBannerTestParams;
}

export interface ABTest {
	id: string;
	start: string;
	expiry: string;
	author: string;
	description: string;
	audience: number;
	audienceOffset: number;
	successMeasure: string;
	audienceCriteria: string;
	showForSensitive?: boolean;
	idealOutcome?: string;
	dataLinkNames?: string;
	variants: ReadonlyArray<Variant>;
	canRun: () => boolean;
	notInTest?: () => void;
}

export type Runnable<ABTest> = ABTest & {
	variantToRun: Variant;
};
