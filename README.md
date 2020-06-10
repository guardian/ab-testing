# ab-rendering

Client-side ab testing framework (broken out from Frontend)

## API

The AB test libary is split into x modules:

-   AB Test Core, for initalisation of the ab test framework
-   AB Test Ophan, for initialisation of Ophan tracking for AB tests

### Initialise AB Tests

```ts
import { initalise } from '@guardian/ab-rendering';

// See config object values below
const coreConfig = {};
const ophanConfig = {};

const abTests = intialise(coreConfig, ophanConfig);

// Provides access to:
// test being a single AB tests
// [tests] being an array of ab tests
abTests.core.runnableTest(test);
abTests.core.allRunnableTests([tests]);
abTests.core.firstRunnableTest([tests]);

// [tests] being an array of *runnable* ab tests
abTest.ophan.registerCompleteEvents([tests]);
abTest.ophan.registerImpressionEvents([tests]);
abTest.ophan.trackABTests([tests]);
```

#### coreConfig

| Config              | Type                                                 | Example                          | Note                                                                                                                              |
| ------------------- | ---------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| mvtMaxValue         | number                                               | `10000`                          | MVT % is calculated from 0 to mvtMaxValue                                                                                         |
| mvtCookieId         | number                                               | getCookie('mvtCookie')           | The user's MVT ID to calculate what tests and variants they fall into                                                             |
| pageIsSensitive     | boolean                                              | guardian.config.page.isSensitive | Sensitive pages must have explicit settings in AB tests                                                                           |
| abTestSwitches      | Record<string, boolean>                              | {'TestOne': true}                | An object containing all of the boolean values of abTestSwitches, in Frontend from page.config.switches.abTests                   |
| forcedTestVariant   | Optional: { testId: ABTest['id']; variant: Variant } |                                  | In Frontend this might be set by the URL override, but otherwise can be used to force a user into a test and variant at init time |
| forcedTestException | Optional: ABTest['id']                               |                                  | Can be used to force a user out of a test (in Frontend, again with url override)                                                  |

#### ophanConfig

| Config         | Type                | Example | Note                                                      |
| -------------- | ------------------- | ------- | --------------------------------------------------------- |
| ServerSideTets | ServerSideTests     |         | ServerSideTets are accessed via window config in Frontend |
| errorReporter  | ErrorReporterFunc   |         | Pass an error reporter, probably Sentry                   |
| ophanRecord    | OphanRecordFunction |         | Probably Ophan's 'record' function                        |

## TODO

-   Generate flow types from Typescript definition https://github.com/joarwilk/flowgen
-   Move time-utils to a packaged lib folder
