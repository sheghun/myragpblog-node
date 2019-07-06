import { Request, Response } from "express";
import { check, validationResult } from "express-validator/check";
import User from "../models/User";

export const create = [
	check("phoneNumber", "Phone number is required and must be 11 digits").exists().isLength({ min: 11, max: 11 }),
	check("firstName", "First name is required").exists().isLength({ min: 1 }),
	check("lastName", "Last name is required").exists().isLength({ min: 1 }),
	check("email", "E-mail is required and must be valid").isEmail().custom(async (email, { req }) => {
		// Check if the email exists
		const user = await User.findOne({ where: { email } });
		if (user !== null) {
			return false;
		}
		return true;
	}),
	check("username", "Username is required").exists()
		.custom(async (username, { req }) => {
			// Check if the username exists
			const user = await User.findOne({ where: { username } });
			if (user !== null) {
				return false;
			}
			return true;
		})
		.withMessage("Username has already been used")
		.isLength({ min: 4 }),
	check("password", "Password is required and must contain at least 6 characters").exists().isLength({ min: 6 }),
	check("referralId", "Referral ID is required").exists().isLength({ min: 4 }),

	async (req: Request, res: Response) => {
		// Check if the req contains errors
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		// save the user
		try {
			const user = await User.create({ ...req.body });
			console.log(user);
			return res.sendStatus(200);
		} catch (error) {
			console.log(error.message);
			return res.status(500).json({ errors: "Could not create user" });
		}



	}
];
