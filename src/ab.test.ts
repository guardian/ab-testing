import { ab } from './ab';

describe('AB entry', () => {
	it('Should work', () => {
		expect(ab()).toEqual('it works');
	});
});
