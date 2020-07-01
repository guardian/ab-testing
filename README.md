![AB Testing Logo](./images/logo.png)

Ab rendering is a client-side ab testing

-   Initialises with an Id that can be set by the server for fast user bucketing
-   Run a/b testing on theguardian.com for five years
-   Url opt-in to force variants for testing
-   Simple integration with Ophan, with impression and success methods built in to the library

There’s some background to the early requirements to the library as well as docs (copy over), there’s some notes about the migration of ab tests here.

Contents

-   links

## Use ab tests

@guardian/ab
@guardian/ab-react

## How it works

1. AB Test library is initialised with generic values
1. Ab tests are defined as is objects and passed to the initialisation as an array
    - side note, for Frontend and DCR, there is currently a requirement to copy and paste
1. Users are bucketed by the mvt id passed in initialisation for each of the ab tests
1.

## differences from previous Frontend library

-   no localtlrage see deprication
-   Only concurrent tests, this library does not concern itself with epics or banner tests
-   Public api reduced to the usage
-   Some public methods renamed like isuserInvariant

## initialisation in js

```ts
import { AB } from '@guardian/ab-rendering';

// See config object values below
const coreConfig = {};
const ophanConfig = {};

const abTests = new AB(config);

// Provides access to:
// test being a single AB tests
// [tests] being an array of ab tests
abTests.runnableTest(test);
abTests.firstRunnableTest([tests]);
abTests.isUserInVariant(test, variantId);

// [tests] being an array of *runnable* ab tests
abTest.registerCompleteEvents([tests]);
abTest.registerImpressionEvents([tests]);
abTest.trackABTests([tests]);
```

## initialisation with react

## config object

| Config              | Type                                                 | Example                          |
| ------------------- | ---------------------------------------------------- | -------------------------------- |
| mvtMaxValue         | number                                               | `10000`                          |
| mvtCookieId         | number                                               | getCookie('mvtCookie')           |
| pageIsSensitive     | boolean                                              | guardian.config.page.isSensitive |
| abTestSwitches      | Record                                               | {'TestOne': true}                |
| forcedTestVariant   | Optional: { testId: ABTest['id']; variant: Variant } |                                  |
| forcedTestException | Optional: ABTest['id']                               |                                  |
| arrayOfTestObjects  | ABTest[]                                             |                                  |
| ServerSideTets      | ServerSideTests                                      |                                  |
| errorReporter       | ErrorReporterFunc                                    |                                  |
| ophanRecord         | OphanRecordFunction                                  |                                  |

### Frontend and DCR

The initialisation values are populated on these platforms like so:

| Config              | Note                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| mvtMaxValue         | MVT % is calculated from 0 to mvtMaxValue                                                                                         |
| mvtCookieId         | The user's MVT ID to calculate what tests and variants they fall into                                                             |
| pageIsSensitive     | Sensitive pages must have explicit settings in AB tests                                                                           |
| abTestSwitches      | An object containing all of the boolean values of abTestSwitches, in Frontend from page.config.switches.abTests                   |
| forcedTestVariant   | In Frontend this might be set by the URL override, but otherwise can be used to force a user into a test and variant at init time |
| forcedTestException | Can be used to force a user out of a test (in Frontend, again with url override)                                                  |
| arrayOfTestObjects  | Pass all tests definitions into the config                                                                                        |
| ServerSideTets      | ServerSideTets are accessed via window config in Frontend                                                                         |
| errorReporter       | Pass an error reporter, probably Sentry                                                                                           |
| ophanRecord         | Probably Ophan's 'record' function                                                                                                |

## AB testing API

## Deprecation/Descoping of localstorage

This library does not currently handle the overriding of ab tests into local storage. To override _and_ persist you’ll need to set an mvt id- on theguardian.com that’s the cookie, you can calculate the mvt is required with the calculator below.

## MVTId calculator

[Use this simple calculator](https://ab-tests.netlify.app/) to see what MVT ID your test variant will fall into.

## Full example

### Ab test definition

### initialisation

### usage with api

### usage with impression and completion events

## contributions

### testing

### lerna

### modules
