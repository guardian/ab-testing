import { exampleAPI, ConfigType } from './types';

export const initExample = (config: ConfigType): exampleAPI => {
	return {
		deleteme: config.deleteme || false,
	};
};
