/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react';

import { AB as ABConstructor, ABTest, CoreAPI } from '@guardian/ab-core';

/**
 * Usage
 *
 * import { ABProvider, useAB } from './ab';
 *
 * const Example = () => {
 *   const AB = useAB();
 *   if (AB.isUserInVariant('DummyTest', 'variant')) return <p>InTheTest</p>;
 *   return <p>NotInTest</p>;
 * };
 *
 * export const WithProvider = (abConfig) => (
 *   <ABProvider { ...abConfig } >
 *     <Example />
 *   </ABProvider>
 * )
 */

/**
 * ABContext is the global context container for the AB object
 *
 * CoreAPI = Is the AB API as exported from ab-rendering
 */
const ABContext = React.createContext<CoreAPI | undefined>(undefined);

/**
 * ABProvider sets an instance of ABContext
 *
 * Each instance of AB has its own config.
 */
export const ABProvider = ({
	tests,
	switches,
	isSensitive,
	mvtMax = 1000000,
	mvtId,
	children,
}: {
	tests: ABTest[];
	switches: { [key: string]: boolean };
	isSensitive: boolean;
	mvtMax?: number;
	mvtId: number;
	children: React.ReactNode;
}) => (
	<ABContext.Provider
		value={
			new ABConstructor({
				mvtCookieId: mvtId,
				mvtMaxValue: mvtMax,
				pageIsSensitive: isSensitive,
				abTestSwitches: switches,
				arrayOfTestObjects: tests,
			})
		}
	>
		{children}
	</ABContext.Provider>
);

/**
 * useAB is a wrapper around React.useContext(ABContext) to provide a
 * check to make sure there is a ABProvider parent and throw a useful
 * message if not
 */
export const useAB = () => {
	const context = React.useContext<CoreAPI | undefined>(ABContext);
	if (context === undefined) {
		throw new Error('useAB must be used within the ABProvider');
	}
	return context;
};
