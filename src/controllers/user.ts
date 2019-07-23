import { Request, Response } from "express";
import { check, validationResult } from "express-validator/check";
import { JWTPayload } from "../types";
import JWT from "jsonwebtoken";
import User from "../models/User";
import { promisify } from "util";

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

		const user = await User.findOne({ where: { email: req.body.email } });
		console.log(user);

		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		// save the user
		try {
			await User.create({ ...req.body });
			return res.sendStatus(201);
		} catch (error) {
			return res.status(500).json({ errors: "Could not create user" });
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
			if (!r) {
				return false;
			}
			return true;
		}),

	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		const r = req as Request & { user: User };
		if (!errors.isEmpty()) {
			return res.sendStatus(401);
		}

		// Set the payload
		const payload: JWTPayload = {
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
		return res.send(200);
	}

];
