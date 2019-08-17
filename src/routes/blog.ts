import { Router } from "express";
import * as BlogController from "../controllers/blog";

const BlogRoutes = (router: Router): Router => {
	router.get("/", BlogController.getUser);
	return router;
};

export default BlogRoutes;
