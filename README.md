# ab-rendering

Client-side ab testing framework (broken out from Frontend)

## API

The AB test libary is split into x modules:

-   AB Test Core, for initalisation of the ab test framework
-   AB Test Ophan, for initialisation of Ophan tracking for AB tests

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

### AB Test Ophan

Initalise the Ophan Record events

```ts
export const initAbOphan = (
	serverSideTests: ServerSideTests, // Pass a serverSideTest object containing MVT tests
	errorReporter: ErrorReporterFunc, // Pass an error reporter, probably Sentry
	ophanRecord: OphanRecordFunction, // Pass the ophanRecord function
): abOphanAPI
```

`initAbOphan(...)` returns the Ophan AB tests API.

```ts
// Pass the configuration from the platform that the AB test Ophan reporting relies on
const initABOphanDefaultConfig = {
	serverSideTests: { abTestServer: 'variant' }, // In Frontend from window.guaridan.config.tests
	errorReporter: sentry.reportError,
	ophanRecord: ophan.record,
};

const abTestLibOphan = initABOphan(initABOphanDefaultConfig);

// Provides access to
abTestLibOphan.registerCompleteEvents(tests);
abTestLibOphan.registerImpressionEvents(tests);
abTestLibOphan.trackABTests(tests);
```

## TODO

-   bundling https://www.npmjs.com/package/microbundle ✅
-   Generate flow types from Typescript definition https://github.com/joarwilk/flowgen
-   Move time-utils to a packaged lib folder
