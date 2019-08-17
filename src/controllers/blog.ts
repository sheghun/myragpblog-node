import { Request, Response } from "express";
import User from "../models/User";

export const getUser = async (req: Request, res: Response) => {
	// Get the username
	const username = req.query.username;
	if (!username) {
		return res.sendStatus(404);
	}

	// Get the user
	const user = await User.findOne({ where: { username } as User as any });

	if (user === null) {
		return res.sendStatus(404);
	}

	const payload = {
		firstName: user.firstName,
		image: user.image,
		lastName: user.lastName,
		ragpReferalId: user.ragpReferalId,
		whatsappNumber: user.whatsappNumber
	};

	res.json(payload);
};
