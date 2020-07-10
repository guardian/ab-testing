// Top Level Config and APIs

export type CoreAPIConfig = {
	mvtMaxValue?: number;
	mvtId: number;
	pageIsSensitive: boolean;
	// abTestSwitches start with ab with test ID: abTestIAmRunning
	abTestSwitches: Record<string, boolean>;
	forcedTestVariant?: { testId: ABTest['id']; variant: Variant };
	forcedTestException?: ABTest['id'];
	arrayOfTestObjects: ABTest[];
};

export type CoreAPI = {
	runnableTest: (
		test: ABTest,
	) => Runnable<ABTest & { variantToRun: Variant }> | null;
	firstRunnableTest: (
		tests: ReadonlyArray<ABTest>,
	) => Runnable<ABTest> | null;
	isUserInVariant: (
		testId: ABTest['id'],
		variantId?: Variant['id'],
	) => boolean;
};

export type OphanAPIConfig = {
	serverSideTests?: ServerSideTests;
	errorReporter?: ErrorReporterFunc;
	ophanRecord?: OphanRecordFunction;
};

export type OphanAPI = {
	registerCompleteEvents: (tests: ReadonlyArray<Runnable<ABTest>>) => void;
	registerImpressionEvents: (tests: ReadonlyArray<Runnable<ABTest>>) => void;
	trackABTests: (tests: ReadonlyArray<Runnable<ABTest>>) => void;
};

export type ABTestAPI = CoreAPI & OphanAPI;
export type AbTestConfig = CoreAPIConfig & OphanAPIConfig;

// Internal

export type OphanProduct =
	| 'CONTRIBUTION'
	| 'RECURRING_CONTRIBUTION'
	| 'MEMBERSHIP_SUPPORTER'
	| 'MEMBERSHIP_PATRON'
	| 'MEMBERSHIP_PARTNER'
	| 'DIGITAL_SUBSCRIPTION'
	| 'PRINT_SUBSCRIPTION';

export interface OphanABEvent {
	variantName: string;
	complete: string | boolean;
	campaignCodes?: ReadonlyArray<string>;
}

export type OphanABPayload = {
	[testId: string]: OphanABEvent;
};

export type OphanRecordFunction = (send: {
	[key: string]: OphanABPayload;
}) => void;

type ListenerFunction = (f: () => void) => void;

export interface Variant {
	id: string;
	test: (x: Record<string, unknown>) => void;
	campaignCode?: string;
	canRun?: () => boolean;
	impression?: ListenerFunction;
	success?: ListenerFunction;
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

export type ServerSideTests = {
	[key: string]: string;
};

// We don't know what the error reporter for the platform might need
export type ErrorReporterFunc = (...args: unknown[]) => void;
