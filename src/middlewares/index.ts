import { Request, Response } from "express";

export const validateWholeBody = (req: Request, res: Response) => {
	const { body } = req;
	for (let input in body) {
		if (input !== "password") {
			if (//)
		}
	}
}