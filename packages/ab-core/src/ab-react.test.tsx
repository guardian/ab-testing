/* eslint-disable no-console */
import React from 'react';
import { render, screen } from '@testing-library/react';

import { useAB, ABProvider } from './ab-react';

const DummyTest = {
	id: 'DummyTest',
	audienceCriteria: 'n/a',
	audienceOffset: 0,
	audience: 1,
	author: 'n/a',
	canRun: (): boolean => {
		return true;
	},
	description: 'n/a',
	start: '0001-01-01',
	expiry: '9999-12-12',
	successMeasure: 'n/a',
	variants: [
		{ id: 'control', test: () => null },
		{ id: 'variant', test: () => null },
	],
};

const Example = () => {
	const AB = useAB();
	if (AB.isUserInVariant('DummyTest', 'variant')) return <p>InTheTest</p>;
	return <p>NotInTest</p>;
};

describe('AB', () => {
	it('throws an error if you try to use AB outside of a provider', () => {
		// We disable console.error for this test to keep our jest output clean

		// eslint-disable-next-line @typescript-eslint/unbound-method
		const originalError = console.error;
		// eslint-disable-next-line @typescript-eslint/unbound-method
		console.error = jest.fn();

		expect(() => render(<Example />)).toThrow(
			'useAB must be used within the ABProvider',
		);

		// eslint-disable-next-line @typescript-eslint/unbound-method
		console.error = originalError;
	});

	it('puts a user in the test bucket when test is valid and mvtId value is in scope', () => {
		render(
			<ABProvider
				tests={[DummyTest]}
				switches={{ DummyTest: true }}
				mvtId={19}
				isSensitive={false}
			>
				<Example />
			</ABProvider>,
		);

		expect(screen.getByText('InTheTest')).toBeTruthy();
	});

	it('does not put user in bucket when mvtId out of scope', () => {
		render(
			<ABProvider
				tests={[DummyTest]}
				switches={{ DummyTest: true }}
				mvtId={20}
				isSensitive={false}
			>
				<Example />
			</ABProvider>,
		);

		expect(screen.getByText('NotInTest')).toBeTruthy();
	});

	it('does not put user in bucket when test is turned off with a switch', () => {
		render(
			<ABProvider
				tests={[DummyTest]}
				switches={{ DummyTest: false }}
				mvtId={19}
				isSensitive={false}
			>
				<Example />
			</ABProvider>,
		);

		expect(screen.getByText('NotInTest')).toBeTruthy();
	});

	it('does not put user in bucket when isSensitive is true', () => {
		render(
			<ABProvider
				tests={[DummyTest]}
				switches={{ DummyTest: true }}
				mvtId={19}
				isSensitive={true}
			>
				<Example />
			</ABProvider>,
		);

		expect(screen.getByText('NotInTest')).toBeTruthy();
	});

	it('does not put user in bucket when test is expired', () => {
		render(
			<ABProvider
				tests={[{ ...DummyTest, expiry: '2001-01-01' }]}
				switches={{ DummyTest: true }}
				mvtId={19}
				isSensitive={false}
			>
				<Example />
			</ABProvider>,
		);

		expect(screen.getByText('NotInTest')).toBeTruthy();
	});
});
