import Transaction from "../models/Transaction";
import User from "../models/User";
import Package from "../models/Package";

/**
 * This is the payment distribution algorithm for
 * distributing pvs and payment commissions
 *
 * @param transaction
 * @param user
 */
export const distributePayment = async (transaction: Transaction, user: User) => {
	// Fetch all the package at once
	const allPackage = await Package.findAll();
	// We are paying to the 15th level
	for (let level = 1; level <= 15; level++) {
		// Get the package
		const pack = allPackage.find((p) => p.id === user.packageId) as Package;

		let percentage = 0;
		// Check if the package level is above the current generation
		if (pack.level >= level) {
			// Calculate for percentage
			switch (true) {
				case level <= 5:
					percentage = 5 / 100;
					break;
				case level > 5 && level <= 10:
					percentage = 2 / 100;
					break;
				case level > 10 && level <= 15:
					percentage = 1 / 100;
					break;
			}
			let commission = transaction.amount * percentage;
			commission = Number(commission.toFixed(2));
			let wallet = Number(user.wallet);
			wallet = commission + wallet;
			user.wallet = wallet;

			if (user.transactions !== null) {
				let trans = JSON.parse(user.transactions) as Array<{ id: number, level: number }>;
				// Append the new transaction to the beginning of the array
				trans.unshift({ id: transaction.id, level });
				user.transactions = JSON.stringify(trans);
			}

			// Append the transaction
			// Check if the former transaction is equal to null
			if (user.transactions === null) {
				user.transactions = JSON.stringify([{ id: transaction.id, level }]);
			}

			// Save the user
			await user.save();

			if (user.referalId === null) {
				break;
			}

			// Get the next user from the database
			user = await User.findOne({ where: { username: user.referalId } as User as any }) as User;

		}
	}
};
