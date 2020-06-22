# ab-rendering

Client-side ab testing framework (broken out from Frontend)

## API

### Initialise AB Tests

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

#### coreConfig

| Config              | Type                                                 | Example                          | Note                                                                                                                              |
| ------------------- | ---------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| mvtMaxValue         | number                                               | `10000`                          | MVT % is calculated from 0 to mvtMaxValue                                                                                         |
| mvtId               | number                                               | getCookie('mvtCookie')           | The user's MVT ID to calculate what tests and variants they fall into                                                             |
| pageIsSensitive     | boolean                                              | guardian.config.page.isSensitive | Sensitive pages must have explicit settings in AB tests                                                                           |
| abTestSwitches      | Record<string, boolean>                              | {'TestOne': true}                | An object containing all of the boolean values of abTestSwitches, in Frontend from page.config.switches.abTests                   |
| forcedTestVariant   | Optional: { testId: ABTest['id']; variant: Variant } |                                  | In Frontend this might be set by the URL override, but otherwise can be used to force a user into a test and variant at init time |
| forcedTestException | Optional: ABTest['id']                               |                                  | Can be used to force a user out of a test (in Frontend, again with url override)                                                  |
| arrayOfTestObjects  | ABTest[]                                             |                                  | Pass all tests definitions into the config                                                                                        |
| ServerSideTets      | ServerSideTests                                      |                                  | ServerSideTets are accessed via window config in Frontend                                                                         |
| errorReporter       | ErrorReporterFunc                                    |                                  | Pass an error reporter, probably Sentry                                                                                           |
| ophanRecord         | OphanRecordFunction                                  |                                  | Probably Ophan's 'record' function                                                                                                |

## TODO

-   Generate flow types from Typescript definition https://github.com/joarwilk/flowgen
-   Move time-utils to a packaged lib folder
