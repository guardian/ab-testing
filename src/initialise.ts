import { ConfigType, coreAPI } from './types';

import { initCore } from './ab-core';

type abAPI = { core: coreAPI };

export const initialise = (config: ConfigType): abAPI => {
	const core = initCore(config);

	return { core };
};
