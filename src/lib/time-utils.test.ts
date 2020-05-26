// @flow
import { isExpired } from './time-utils';
const startDate = new Date();
describe('Check if isExpired', () => {
	it('It should return true if expired', () => {
		const datePrev = new Date().setDate(startDate.getDate() - 2);
		const datePrevString = new Date(datePrev).toString();

		expect(isExpired(datePrevString)).toBeTruthy();
	});

	it('It should return false if not expired', () => {
		const dateFuture = new Date().setDate(startDate.getDate() + 2);
		const dateFutureString = new Date(dateFuture).toString();

		expect(isExpired(dateFutureString)).toBeFalsy();
	});

	it('It should return false if the time is 11am on the day of expiry', () => {
		const dateToday11am = new Date().setHours(11);
		const dateToday11amString = new Date(dateToday11am).toString();

		expect(isExpired(dateToday11amString)).toBeFalsy();
	});

	it('It should return false if the date passed is far future', () => {
		expect(isExpired('9999-01-01')).toBeFalsy();
	});
});
