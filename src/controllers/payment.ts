import { check, validationResult } from "express-validator/check";
import { Response, Request } from "express";
import Package from "../models/Package";
import Paystack from "paystack";

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
		// Get the package
		const paystack = Paystack("name of the boy");

		const pack = req.body.pack as Package;
		return res.status(200).json(pack);
	}
];

