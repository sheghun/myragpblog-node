import { check, validationResult } from "express-validator/check";
import { Response, Request } from "express";
import Package from "../models/Package";
import Paystack from "paystack";
import Transaction from "../models/Transaction";
import User from "../models/User";

export const payOnce = [
	check("id").exists().isLength({ min: 1 }).toInt()
		.custom(async (id, { req }) => {
			const pack = await Package.findOne({ where: { id } }) as Package;
			if (pack === null) {
				return false;
			}
			// Append to the body of the application
			req.body.pack = pack;
			return true;
		}),
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		const pack = req.body.pack as Package;
		const reference = Date.now();
		const user = await User.findOne({ where: { username: req.body.username } as User as any }) as User;
		try {
			await Transaction.create<Transaction>({
				amount: pack.amount,
				reference,
				description: `Registration of ${pack.name} package`,
				username: user.username
			});
		} catch (error) {
			return res.status(500);
		}

		const { data } = await Paystack(process.env.PAYSTACK_SECRET_KEY).transaction.initialize({
			amount: pack.amount * 100,
			reference,
			email: user.email
		});
		return res.status(200).json({ authorizationUrl: data.authorization_url });
	}
];

export const verifyPayment = [
	check("trxref").exists().isLength({ min: 1 }),
	check("reference").exists().isLength({ min: 1 }),

	async (req: Request, res: Response) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.sendStatus(400);
		}

		// Get the transaction


		return res.sendStatus(401);
	}
];
