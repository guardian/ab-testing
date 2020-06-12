import { ConfigType, CoreAPI, OphanAPIConfig, OphanAPI } from './types';

import { initCore } from './ab-core';
import { initOphan } from './ab-ophan';

type abAPI = { core: CoreAPI; ophan: OphanAPI };

export const initialise = (
	config: ConfigType,
	ophanConfig: OphanAPIConfig,
): abAPI => {
	const core = initCore(config);
	const ophan = initOphan(ophanConfig);

	return { core, ophan };
};
