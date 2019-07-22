import { Router } from "express";
import * as UserController from "../controllers/user";

const UserRoutes = (router: Router): Router => {

	router.post("/", UserController.create);
	router.post("/login", UserController.login);

	return router;
};

export default UserRoutes;
