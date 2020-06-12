import { ConfigType, ABType } from './types';

import { initCore } from './ab-core';
import { initOphan } from './ab-ophan';

const DEFAULT_CONFIG = {
	mvtMaxValue: 1000000,
	mvtCookieId: 1234,
	pageIsSensitive: false,
	abTestSwitches: {},
	serverSideTests: {},
	errorReporter: () => null,
	ophanRecord: () => null,
};

export class AB {
	private ab: ABType | undefined;

	get test(): ABType | undefined {
		return this.ab;
	}

	init(config: ConfigType): void {
		const {
			mvtMaxValue,
			mvtCookieId,
			pageIsSensitive,
			abTestSwitches,
			serverSideTests,
			errorReporter,
			ophanRecord,
		} = { ...DEFAULT_CONFIG, ...config };

		this.ab = {
			core: initCore({
				mvtMaxValue,
				mvtCookieId,
				pageIsSensitive,
				abTestSwitches,
			}),
			ophan: initOphan({
				serverSideTests,
				errorReporter,
				ophanRecord,
			}),
		};
	}
}
