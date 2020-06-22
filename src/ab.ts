import { ConfigType, OphanAPI, CoreAPI } from './types';

import { initCore } from './core';
import { initOphan } from './ophan';

const DEFAULT_CONFIG = {
	mvtMaxValue: 1000000,
	mvtId: 1234,
	pageIsSensitive: false,
	abTestSwitches: {},
	serverSideTests: {},
	errorReporter: () => null,
	ophanRecord: () => null,
	arrayOfTestObjects: [],
};

export class AB {
	private _isUserInVariant: CoreAPI['isUserInVariant'];
	private _firstRunnableTest: CoreAPI['firstRunnableTest'];
	private _runnableTest: CoreAPI['runnableTest'];

	private _registerCompleteEvents: OphanAPI['registerCompleteEvents'];
	private _registerImpressionEvents: OphanAPI['registerImpressionEvents'];
	private _trackABTests: OphanAPI['trackABTests'];

	constructor(config: ConfigType) {
		const {
			mvtMaxValue,
			mvtId,
			pageIsSensitive,
			abTestSwitches,
			serverSideTests,
			errorReporter,
			ophanRecord,
			arrayOfTestObjects,
		} = { ...DEFAULT_CONFIG, ...config };

		const core = initCore({
			mvtMaxValue,
			mvtId,
			pageIsSensitive,
			abTestSwitches,
			arrayOfTestObjects,
		});

		const ophan = initOphan({
			serverSideTests,
			errorReporter,
			ophanRecord,
		});

		this._firstRunnableTest = core.firstRunnableTest;
		this._runnableTest = core.runnableTest;
		this._isUserInVariant = core.isUserInVariant;

		this._registerCompleteEvents = ophan.registerCompleteEvents;
		this._registerImpressionEvents = ophan.registerImpressionEvents;
		this._trackABTests = ophan.trackABTests;
	}

	// CoreAPI
	get firstRunnableTest(): CoreAPI['firstRunnableTest'] {
		return this._firstRunnableTest;
	}
	get runnableTest(): CoreAPI['runnableTest'] {
		return this._runnableTest;
	}
	get isUserInVariant(): CoreAPI['isUserInVariant'] {
		return this._isUserInVariant;
	}

	// OphanAPI
	get registerCompleteEvents(): OphanAPI['registerCompleteEvents'] {
		return this._registerCompleteEvents;
	}
	get registerImpressionEvents(): OphanAPI['registerImpressionEvents'] {
		return this._registerImpressionEvents;
	}
	get trackABTests(): OphanAPI['trackABTests'] {
		return this._trackABTests;
	}
}
