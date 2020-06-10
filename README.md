# ab-rendering

Client-side ab testing framework (broken out from Frontend)

## API

### AB Test Core

Initalise the AB Test framework with `initAbCore()`

```ts
type initABCoreConfig = {
    mvtMaxValue: number;
    mvtCookieId: number;
    pageIsSensitive: boolean;
    abTestSwitches: Record<string, boolean>;
    forcedTestVariant?: { testId: ABTest['id']; variant: Variant };
    forcedTestException?: ABTest['id'];
};

// mvtMaxValue: MVT % is calculated from 0 to mvtMaxValue
// mvtCookieId: The user's MVT ID to calculate what tests and variants they fall into
// pageIsSensitive: In Frontend set by page.config.isSensitive
// abTestSwitches: An object containing all of the boolean values of abTestSwitches, in Frontend from page.config.switches.abTests
// forcedTestVariant: In Frontend this might be set by the URL override, but otherwise can be used to force a user into a test and variant at init time
// forcedTestException: Can be used to force a user out of a test (in Frontend, again with url override)

export const initABCore = (config: initABCoreConfig): coreAPI
```

`initAbCore(...)` returns the core API.

```ts
// Pass the configuration from the platform that the AB tests rely on
const initABCoreDefaultConfig = {
	mvtMaxValue: 1000000,
	mvtCookieId: 1234,
	pageIsSensitive: false,
	abTestSwitches: {
		DummyTest: true,
	},
};

const abTestLibDefault = initABCore(initABCoreDefaultConfig);

// Provides access to
abTestLibDefault.runnableTest();
abTestLibDefault.allRunnableTests();
abTestLibDefault.firstRunnableTest();
```

## TODO

-   bundling https://www.npmjs.com/package/microbundle ✅
-   Generate flow types from Typescript definition https://github.com/joarwilk/flowgen
-   Move time-utils to a packaged lib folder
