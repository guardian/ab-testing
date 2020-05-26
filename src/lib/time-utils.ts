// Ideally this would be in a npm lib folder
export const isExpired = (testExpiry: string): boolean => {
	// new Date(test.expiry) sets the expiry time to 00:00:00
	// Using SetHours allows a test to run until the END of the expiry day
	const startOfToday = new Date().setHours(0, 0, 0, 0);
	const theTestExpiry = new Date(testExpiry).valueOf();
	return startOfToday > theTestExpiry;
};
