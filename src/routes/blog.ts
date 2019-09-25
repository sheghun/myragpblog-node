import { Router } from "express";
import * as BlogController from "../controllers/blog";

const BlogRoutes = (router: Router): Router => {
	router.get("/", BlogController.getUser);
	router.get("/subscribe", BlogController.subscribe);
	return router;
};

export default BlogRoutes;
