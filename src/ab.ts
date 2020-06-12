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
	private _core: ABType['core'];
	private _ophan: ABType['ophan'];

	constructor(config: ConfigType) {
		const {
			mvtMaxValue,
			mvtCookieId,
			pageIsSensitive,
			abTestSwitches,
			serverSideTests,
			errorReporter,
			ophanRecord,
		} = { ...DEFAULT_CONFIG, ...config };

		this._core = initCore({
			mvtMaxValue,
			mvtCookieId,
			pageIsSensitive,
			abTestSwitches,
		});

		this._ophan = initOphan({
			serverSideTests,
			errorReporter,
			ophanRecord,
		});
	}

	get core(): ABType['core'] {
		return this._core;
	}
	get ophan(): ABType['ophan'] {
		return this._ophan;
	}
}
