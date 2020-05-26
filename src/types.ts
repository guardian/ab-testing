export type OphanProduct =
	| 'CONTRIBUTION'
	| 'RECURRING_CONTRIBUTION'
	| 'MEMBERSHIP_SUPPORTER'
	| 'MEMBERSHIP_PATRON'
	| 'MEMBERSHIP_PARTNER'
	| 'DIGITAL_SUBSCRIPTION'
	| 'PRINT_SUBSCRIPTION';

export interface EngagementBannerTemplateParams {
	titles?: Array<string>;
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
export interface EngagementBannerTestParams {
	titles?: Array<string>;
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
	test: (x: Object) => void;
	campaignCode?: string;
	canRun?: () => boolean;
	impression?: ListenerFunction;
	success?: ListenerFunction;
	engagementBannerParams?: EngagementBannerTestParams;
}

export interface AbTest {
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
