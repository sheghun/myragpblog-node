import { Request, Response } from "express";
import { check, validationResult } from "express-validator/check";
import { IJWTPayload } from "../types";
import JWT from "jsonwebtoken";
import User from "../models/User";
import { promisify } from "util";
import Package from "../models/Package";
import Transaction from "../models/Transaction";

export const create = [
	check("referalId", "Referal ID is required").exists().isLength({ min: 4 })
		.custom(async (referalId, { req }) => {
			const user = await User.count({ where: { username: referalId } as User as any });
			// If user does not exist fail
			if (user === 0) {
				return false;
			}
			return true;
		})
		.withMessage("Referal ID doest not exist"),
	check("phoneNumber", "Phone number is required and must be 11 digits").exists().isLength({ min: 11, max: 11 }),
	check("firstName", "First name is required").exists().isLength({ min: 1 }),
	check("lastName", "Last name is required").exists().isLength({ min: 1 }),
	check("email", "E-mail is required and must be valid").isEmail()
		.custom(async (email, { req }) => {
			// Check if the email exists
			const user = await User.findOne({ where: { email } });
			console.log("Fuck you");
			if (user !== null) {
				return false;
			}
			return true;
		})
		.withMessage("E-mail has already be used"),
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


	async (req: Request, res: Response) => {
		// Check if the req contains errors
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		// save the user
		try {
			await User.create({ ...req.body, packageId: 1 } as User);
			return res.sendStatus(201);
		} catch (error) {
			return res.status(500).json({ errors: ["Could not create user"] });
		}



	}
];


export const login = [
	check("username").exists().not().matches(/\W+/)
		.custom(async (username, { req }) => {
			const user = await User.findOne({ where: { username } as User as any });
			if (!user) {
				return false;
			}

			// Inject the user to the request object
			(req as any).user = user;
			return true;
		}),

	check("password").exists().not().isEmpty()
		.custom(async (password, { req }) => {
			let r = req as any;
			r = await (r.user as User).comparePassword(password);
			console.log(r);
			if (!r) {
				return false;
			}
			return true;
		}),

	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		const r = req as Request & { user: User };
		console.log(errors.array());
		if (!errors.isEmpty()) {
			return res.sendStatus(401);
		}

		// Set the payload
		const payload: IJWTPayload = {
			username: r.user.username,
			iat: Date.now()
		};

		const options: JWT.SignOptions = {
			expiresIn: "30m"
		};

		// Generate the token and add it as a cookie
		const signToken = promisify(JWT.sign);

		/// @ts-ignore
		const token = await signToken(payload, process.env.JWT_TOKEN as string, options);
		res.cookie(process.env.USER_TOKEN_COOKIE as string, token);

		if (r.user.whatsappNumber === null) {
			return res.status(200).json({ notDone: true });
		}

		if (r.user.paid === null) {
			return res.status(200).json({ notPaid: true });
		}
		return res.send(200);
	}

];

export const update = [
	check("firstName", "Must contain only strings").optional()
		.escape().isLength({ min: 1 }),
	check("lastName", "Can't be empty").optional().escape().isLength({ min: 1 }),
	check("email", "E-mail is invalid").optional().escape().isLength({ min: 1 })
		.custom(async (email, { req }) => {
			// Check if the email exists
			const user = await User.findOne({ where: { email } });
			if (user !== null) {
				return false;
			}
			return true;
		})
		.withMessage("E-mail already exists, can't use two emails"),
	check("password", "Must contain minimum of 6 letters").optional().escape().isLength({ min: 1 }),
	check("bankAccountName").optional().escape().isLength({ min: 1 }),
	check("bankAccountNumber", "Minimum of 10 digits").optional().escape().isLength({ min: 10 }),
	check("whatsappNumber").optional().escape().isLength({ min: 1 }),
	check("bank").optional().escape().isLength({ min: 1 }),
	check("phoneNumber", "Minimum of 11 digits").optional().escape().isLength({ min: 11 }),
	check("ragpReferalId").optional().escape().isLength({ min: 1 }),

	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		// From the decoded token;
		const username = req.body.username;

		if (!errors.isEmpty()) {
			return res.status(422).json(errors.array());
		}

		try {
			// @ts-ignore
			const user = await User.findOne({ where: { username } as any as User }) as User;
			await user.update({ ...req.body });
			return res.sendStatus(200);
		} catch (error) {
			return res.status(500).send(error);
		}

	}
];

/**
 * User dashboard details
 */
export const dashboard = async (req: Request, res: Response) => {
	const username = req.body.username;

	let details = await User.findOne({
		where: { username } as User as any,
		attributes: ["cummulativePv", "pv", "wallet", "transactions"]
	}) as any;

	const network = await User.count({ where: { referalId: username } as User as any }) as number;
	details = details.toJSON() as { cummulativePv: number; pv: number; wallet: number; transactions: string };

	// Get the transactions
	type transArray = { id: number; level: number };
	const transactions = [];
	let transArray = JSON.parse(details.transactions) as Array<transArray>;

	for (let trans of transArray) {

		let { amount, description, username } = await Transaction.findOne({
			where: { id: trans.id },
			attributes: ["amount", "description", "username"]
		}) as Transaction;
		let percentage = 0;
		// Calculate the percentage
		switch (true) {
			case trans.level <= 5:
				percentage = 5 / 100;
				break;
			case trans.level > 5 && trans.level <= 10:
				percentage = 2 / 100;
				break;
			case trans.level > 10 && trans.level <= 15:
				percentage = 1 / 100;
				break;
		}

		const t = [amount * percentage, username, description ];

		transactions.push(t);
	}



	const data = {
		...details,
		network,
		notifications: [],
		transactions
	};
	return res.status(200).json(data);

};
