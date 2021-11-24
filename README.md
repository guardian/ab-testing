![AB Testing Logo](./images/logo.png)

# The Guardian's AB Testing Library

## Getting Started

`yarn add @guardian/ab-core`

In a (P)react project, there's a react provider, so you also need:

`yarn add @guardian/ab-react`

And then:

-   [Initialising in a non-react project](#initialising-in-a-non-react-project)
-   [Initialising in a React project](#initialising-in-a-react-project)

And then [using the API](#the-api).

<small>ab-core is a peer-dependency of ab-react so you need both installed if you want to use the provider</small>

## What does this client-side A/B testing library do?

This library:

-   Initialises with an MVT ID that can be set by the server for fast user bucketing
-   Is built upon the a/b testing code running on theguardian.com for five years
-   Has the ability to force variants for testing
-   Has simple integration with Ophan, with impression and success methods built in to the library
-   Can be integrated into a Typescript / JS project and includes an optional (P)react provider and hook

There’s some background to the [early requirements to the library and some documentation in Frontend](https://github.com/guardian/frontend/blob/master/docs/03-dev-howtos/01-ab-testing.md), there’s some [notes about the migration of ab tests](https://docs.google.com/document/d/1-_koo-DK9n7pRT_74nP72lq9o4RVl-RytUOZKqPVf4A/edit).

<!-- Run `npx marked-toc README.md` -->

<!-- toc -->

-   [The Guardian's AB Testing Library](#the-guardians-ab-testing-library)
    -   [Getting Started](#getting-started)
    -   [What does this client-side A/B testing library do?](#what-does-this-client-side-ab-testing-library-do)
    -   [How it works](#how-it-works)
        -   [Initialising in a non-react project](#initialising-in-a-non-react-project)
        -   [Initialising in a React project](#initialising-in-a-react-project)
        -   [The initalisation config object](#the-initalisation-config-object)
        -   [The API](#the-api)
        -   [Ab Test Definition](#ab-test-definition)
        -   [Example of the AB Test config in Frontend and DCR](#example-of-the-ab-test-config-in-frontend-and-dcr)
    -   [Frontend: Difference and Integration with DCR](#frontend-difference-and-integration-with-dcr)
        -   [Integration between Frontend and DCR](#integration-between-frontend-and-dcr)
        -   [Differences of this library vs Frontend implementation](#differences-of-this-library-vs-frontend-implementation)
        -   [Deprecation/Descoping of localstorage](#deprecationdescoping-of-localstorage)
    -   [MVTId calculator](#mvtid-calculator)
    -   [Contributions](#contributions)
        -   [Lerna](#lerna)
        -   [Publishing to NPM with Lerna](#publishing-to-npm-with-lerna)
        -   [Testing with Jest](#testing-with-jest)
        -   [Yarn Link & Peer Dependencies](#yarn-link--peer-dependencies)
        -   [Building the library with Microbundle](#building-the-library-with-microbundle)
        -   [Constructor and Provider Patterns](#constructor-and-provider-patterns)
    -   [What's Next](#whats-next)

<!-- toc stop -->

## How it works

1. **Define the AB test**: Each AB test and their variants are defined in code with configuration such as audience size & offset and impression & success listeners etc
2. **Initialise the library**: The AB Test library is initialised with configuration values such as a user's MVT ID, an array of the above defined A/B tests etc
3. **Use the AB Test API**: The intialisation returns an API that can be used to check if the current user is in a variant of a test along with a variety of other API methods

### Initialising in a non-react project

```ts
import { AB } from '@guardian/ab-core';

// See config object values below
const coreConfig = {};
const ophanConfig = {};

const abTests = new AB(config);

// Must be performed in the platform after initialisation to ensure tracking defined in ABTests is setup
// [tests] being an array of *runnable* ab tests
abTest.registerCompleteEvents([tests]);
abTest.registerImpressionEvents([tests]);
abTest.trackABTests([tests]);

// The API then provides access to the utility methods for use within modules
abTests.runnableTest(test);
abTests.firstRunnableTest([tests]);
abTests.isUserInVariant(testId, variantId);
```

### Initialising in a React project

Intialise the config options with the ABProvider

```ts
// At the ReactDOM.render level

import { ABProvider } from '@guardian/ab-react';

ReactDOM.render(
	<ABProvider
		arrayOfTestObjects={tests}
		abTestSwitches={{
			...{ abAbTestTest: true },
			...CAPI.config.switches,
		}}
		pageIsSensitive={CAPI.config.isSensitive}
		mvtMaxValue={1000000}
		mvtId={mvtId}
		ophanRecord={ophanRecordFunc}
	>
		<App CAPI={CAPI} NAV={NAV} />
	</ABProvider>,
);
```

```ts
// In the 'App' file
import { useAB } from '@guardian/ab-react';

// Initalise all of the impression and completion events
const ABTestAPI = useAB();
useEffect(() => {
	const allRunnableTests = ABTestAPI.allRunnableTests(tests);
	ABTestAPI.registerImpressionEvents(allRunnableTests);
	ABTestAPI.registerCompleteEvents(allRunnableTests);
}, [ABTestAPI]);
```

```ts
// Within the components
import { useAB } from '@guardian/ab-react';

// Example usage of AB Tests
// Used in the Cypress tests as smoke test of the AB tests framework integration
const ABTestAPI = useAB();

// We can check if a user is in a variant, returns a boolean
// ABTestTest being an ab test that was passed in via the ab test array
const abTestDataAttr =
	(ABTestAPI.isUserInVariant('AbTestTest', 'control') && 'ab-test-control') ||
	(ABTestAPI.isUserInVariant('AbTestTest', 'variant') && 'ab-test-variant') ||
	'ab-test-not-in-test';

// We can get the variant straight from a check for
// whether the test is runnable
const runnableTest = ABTestAPI.runnableTest(abTestTest);
const variantFromRunnable =
	(runnableTest && runnableTest.variantToRun.id) || 'not-runnable';

<div
	data-ab-user-in-variant={abTestDataAttr}
	data-ab-runnable-test={variantFromRunnable}
>
	AB Test
</div>;
```

### The initalisation config object

| Config              | Type                                              | Example                                                                           |
| ------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| mvtMaxValue         | number                                            | `10000`                                                                           |
| mvtCookieId         | number                                            | getCookie('mvtCookie')                                                            |
| pageIsSensitive     | boolean                                           | guardian.config.page.isSensitive                                                  |
| abTestSwitches      | Record                                            | {'TestOne': true}                                                                 |
| forcedTestVariants  | Optional: { [key: string]: { variant: string } }; | { Testone: { variant: 'myCoolVariant' }, TestTwo: { variant: 'myCoolVariant' } }; |
| forcedTestException | Optional: ABTest['id']                            |                                                                                   |
| arrayOfTestObjects  | ABTest[]                                          |                                                                                   |
| ServerSideTets      | ServerSideTests                                   |                                                                                   |
| errorReporter       | ErrorReporterFunc                                 |                                                                                   |
| ophanRecord         | OphanRecordFunction                               |                                                                                   |

### The API

```ts
type CoreAPI = {
	allRunnableTests: (
		tests: ReadonlyArray<ABTest>,
	) => ReadonlyArray<Runnable<ABTest>> | [];
	runnableTest: (
		test: ABTest,
	) => Runnable<ABTest & { variantToRun: Variant }> | null;
	firstRunnableTest: (
		tests: ReadonlyArray<ABTest>,
	) => Runnable<ABTest> | null;
	isUserInVariant: (
		testId: ABTest['id'],
		variantId?: Variant['id'],
	) => boolean;
};
```

| API Method        | Params                         | Returns                                                                                    |
| ----------------- | ------------------------------ | ------------------------------------------------------------------------------------------ |
| allRunnableTests  | Array of ab tests              | Array of Runnable tests or empty array                                                     |
| runnableTest      | A single AB test               | A runnable ab test object with variantToRun property containing the variant to run or null |
| firstRunnableTest | Array of AB Tests              | A runnable ab test object or null                                                          |
| isUserInVariant   | A AB test ID, and a Variant ID | A boolean                                                                                  |

### Ab Test Definition

Within your platforms, you should define the test this way. If the test needs to run across platforms, then the test definition needs to be the same (as well as the initialisation config).

```ts
import { ABTest } from '@guardian/ab-core';

export const abTestTest: ABTest = {
    id: 'AbTestTest', // This ID must match the Server Side AB Test
    start: '2020-05-20',
    expiry: '2020-12-01', // Remember that the server side test expiry can be different
    author: 'anemailaddress@theguardian.com',
    description: 'This Test'
    audience: 0.0001, // 0.01% (1 is 100%)
    audienceOffset: 0.5, // 50% (1 is 100%). Prevent overlapping with other tests.
                        // Offset skips 0 - 50%, audience is from 50.00 to 50.01
    successMeasure: 'It works',
    audienceCriteria: 'Everyone',
    idealOutcome: 'It works',
    showForSensitive: true, // Should this A/B test run on sensitive articles?
    canRun: () => true, // Check for things like user or page sections
    variants: [
        {
            id: 'control',
            test: (): void => {}, // You can define what you want your variant to do in here or use the isUserInVariant API
            impression: (impression) => {
                // This will be immediate.
                // You could also use eventListeners as below
                // Make sure abTest.registerCompleteEvents([tests]); and abTest.registerImpressionEvents([tests]); have been called
                impression();
            },
            success: (success) => {
                // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
                window.addEventListener('guAbTestEvent', (e) => {
                    const detail = e?.detail;
                    if (
                        detail?.abTest === 'abTestTest' &&
                        detail?.variant === 'control' &&
                        detail?.event === 'success') {
                            success();
                        }
                });

            },
        },
        {
            id: 'variant',
            test: (): void => {},
            impression: (impression) => {
                impression();
            },
            success: (success) => {
                //...
            },
        },
    ],
};

// If you're using event listeners for the impression and success events you can call them with CustomEvents
// Say a user clicked something
window.dispatchEvent(new CustomEvent('guAbTestEvent', {
  detail: {
    abTest: 'abTestTest',
    variant: 'control'
    event: 'success'
  }
}))
```

### Example of the AB Test config in Frontend and DCR

The initialisation values are populated on these platforms like so:

| Config              | Note                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| mvtMaxValue         | MVT % is calculated from 0 to mvtMaxValue                                                                                         |
| mvtCookieId         | The user's MVT ID to calculate what tests and variants they fall into                                                             |
| pageIsSensitive     | Sensitive pages must have explicit settings in AB tests                                                                           |
| abTestSwitches      | An object containing all of the boolean values of abTestSwitches, in Frontend from page.config.switches.abTests                   |
| forcedTestVariants  | In Frontend this might be set by the URL override, but otherwise can be used to force a user into a test and variant at init time |
| forcedTestException | Can be used to force a user out of a test (in Frontend, again with url override)                                                  |
| arrayOfTestObjects  | Pass all tests definitions into the config                                                                                        |
| ServerSideTets      | ServerSideTests are accessed via client-side config in Frontend and DCR                                                           |
| errorReporter       | Pass an error reporter, probably Sentry                                                                                           |
| ophanRecord         | Probably Ophan's 'record' function                                                                                                |

## Frontend: Difference and Integration with DCR

### Integration between Frontend and DCR

-   There is currently a requirement to copy and paste the AB test definitions between the two platforms. Each platform has an `experiments` folder ([Frontend](https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/modules/experiment), [DCR](https://github.com/guardian/dotcom-rendering/blob/master/src/web/experiments)) and the test definition and structure of those folders should match. The difference will be where to import - in Frontend in [ab-test.ts](https://github.com/guardian/frontend/blob/main/static/src/javascripts/projects/common/modules/experiments/ab-tests.ts) and in DCR in [ab-tests.ts](https://github.com/guardian/dotcom-rendering/blob/main/src/web/experiments/ab-tests.ts).
-   For Frontend and DCR, you will need to have a switch as you would usually do in Frontend. This will be passed through to DCR in the backend and be accessible to the client-side code.

### Differences of this library vs Frontend implementation

-   There is no localstorage functionality in this library, unlike previously where you could store the A/B test in Frontend. To persist an opted-in test, the MVT cookie will need to be set to the correct value.
-   _Forced Tests_ - used by the url-opt-in mechanism **ignores** canRun on both the test _and_ the variant, so it will always run when forced. Previously on Frontend it still listened to the variant's canRun.
-   Handles only concurrent tests, this library does not concern itself with epics or banner tests. There is no mechanism for A/B tests to interact or wait for one another outside of audience size and offsets.
-   The public API is reduced to only what was used in Frontend
-   Some public methods have been renamed like `isUserInVariant` (this does make it difficult to copy and paste an implementation between Frontend and DCR right now until this library is integrated with Frontend)

### Deprecation/Descoping of localstorage

This library does not currently handle the overriding of ab tests into local storage. Storing a user's test variant in localstorage was primarily used internally and with a) Url overrides at a page level and b) Cookie overrides for persistance, it was deemed as not required in _at least_ the first pass of this library.

To override and persist you’ll need to update your mvt-id cookie on theguardian.com. You can calculate the mvt id required with the calculator below.

## MVTId calculator

[Use this simple calculator](https://ab-tests.netlify.app/) to see what MVT ID your test variant will fall into.

![AB Testing Tool](./images/abtesttool.gif)

## Contributions

Make sure you run `lerna bootstrap` to link the packages together.

### Lerna

This project uses Lerna (for commands in all packages) and Yarn Workspaces (for package structure).

You can run commands from the root in all packages, with `lerna run --parallel command` (as long as they're named the same).

Or the following in the root aliased to Yarn like `yarn test`

```json
"test": "lerna run --parallel test",
"tsc": "lerna run --parallel tsc",
"lint": "lerna run --parallel lint",
"build": "lerna run --parallel build",
"dev": "lerna run --parallel dev",
"validate": "lerna run --parallel validate",
```

### Publishing to NPM with Lerna

You can publish with `lerna publish`.

Publish a canary release with with `lerna publish --canary`.

**Don't forget to bump the `@guardian/ab-core` peer dependency within `@guardian/ab-react` too.**

### Testing with Jest

Uses Jest, see `.test.ts` files.

### Yarn Link & Peer Dependencies

You might need to `yarn link` in ab-core and `yarn link @guardian/ab-core` in ab-react as ab-core is a peer dependency. You will need to `yarn link` them both if you're testing in a platform.

### Building the library with Microbundle

Packages up with [microbundle](https://github.com/developit/microbundle). It publishes a modern (in module) and legacy (in main) bundle of each package.

### Constructor and Provider Patterns

The ab testing library uses the constructor pattern in [`ab-core`](packages/ab-core/src/ab.ts). It uses the Provider pattern in [`ab-react`](packages/ab-react/src/ab-react.tsx). We expose the types to public in [index.tsx](packages/ab-core/src/index.ts).

## What's Next

-   Integrate into Frontend
-   Review usability across other platforms and required APIs
-   Review opt-in methods (localstorage)
-   Investigate tree-shakeable-ness of methods
-   Investigate exposing API methods outside of the configuration, to allow usage inside of modules without passing a prop
