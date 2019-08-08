import { Router } from "express";
import * as PaymentController from "../controllers/payment";
import { promisify } from "util";
import { IJWTPayload } from "../types";
import JWT, { JsonWebTokenError } from "jsonwebtoken";

const PaymentRoutes = (router: Router): Router => {
	/**
	 * Verify user is logged in and token exists before
	 * Carrying out any payment option
	 */
	router.use(async (req, res, next) => {
		if (!req.cookies[process.env.USER_TOKEN_COOKIE as string]) {
			return res.sendStatus(403);
		}
		// Try decoding the jwt
		const verify = promisify(JWT.verify);
		try {
			const d = await verify(req.cookies.__sheghuntk__, process.env.JWT_TOKEN as string) as IJWTPayload;
			req.body.username = d.username;
			// Call the next function
			next();
		} catch (error) {
			const err = error as JsonWebTokenError;
			return res.status(403).json(err);
		}
	});
	router.post("/pay-once", PaymentController.payOnce);
	router.post("/verify-payment", PaymentController.verifyPayment);
	return router;
};

export default PaymentRoutes;
