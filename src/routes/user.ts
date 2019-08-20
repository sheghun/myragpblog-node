import { Router } from "express";
import * as UserController from "../controllers/user";
import JWT, { JsonWebTokenError } from "jsonwebtoken";
import { promisify } from "util";
import { IJWTPayload } from "../types";

const UserRoutes = (router: Router): Router => {

	router.post("/", UserController.create);
	router.post("/login", UserController.login);
	router.get("/logout", UserController.logout);

	router.use(async (req, res, next) => {
		if (!req.cookies[process.env.USER_TOKEN_COOKIE as string]) {
			return res.sendStatus(403);
		}
		// Try decoding the jwt
		const verify = promisify(JWT.verify);
		try {
			const d = await verify(req.cookies.__sheghuntk__, process.env.JWT_TOKEN as string) as IJWTPayload;
			req.body.username = d.username;
			// Append the request to the request object the body might lose it contents
			// @ts-ignore
			req.username = d.username;
			// Call the next function
			next();
		} catch (error) {
			const err = error as JsonWebTokenError;
			return res.status(403).json(err);
		}
	});

	router.put("/", UserController.update);
	router.get("/dashboard", UserController.dashboard);
	router.get("/profile", UserController.profile);


	return router;
};

export default UserRoutes;
