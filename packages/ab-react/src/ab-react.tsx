/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react';

import {
	AB as ABConstructor,
	AbTestConfig,
	ABTestAPI,
} from '@guardian/ab-core';

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
const ABContext = React.createContext<ABTestAPI | undefined>(undefined);

/**
 * ABProvider sets an instance of ABContext
 *
 * Each instance of AB has its own config.
 */
export const ABProvider = ({
	arrayOfTestObjects,
	abTestSwitches,
	pageIsSensitive,
	mvtMaxValue,
	mvtId,
	forcedTestVariants,
	forcedTestException,
	errorReporter,
	ophanRecord,
	serverSideTests,
	children,
}: AbTestConfig & { children: React.ReactNode }) => (
	<ABContext.Provider
		value={
			new ABConstructor({
				mvtId,
				mvtMaxValue,
				pageIsSensitive,
				abTestSwitches,
				arrayOfTestObjects,
				forcedTestVariants,
				forcedTestException,
				errorReporter,
				ophanRecord,
				serverSideTests,
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
	const context = React.useContext<ABTestAPI | undefined>(ABContext);
	if (context === undefined) {
		throw new Error('useAB must be used within the ABProvider');
	}
	return context;
};
