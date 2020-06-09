import { ConfigType, coreAPI, exampleAPI } from './types';

import { initCore } from './ab-core';
import { initExample } from './example';

type abAPI = { core: coreAPI; example: exampleAPI };

export const initialise = (config: ConfigType): abAPI => {
	const core = initCore(config);
	const example = initExample(config);

	return { core, example };
};
