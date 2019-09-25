import { Router } from "express";
import fs from "fs";
import path from "path";
import Visitor from "../models/Visitor"
import { promisify } from "util";

const OtherRoutes = (router: Router) => {
	router.get("/banks", async (_, res) => {
		const readFile = promisify(fs.readFile);
		let contents = await readFile(path.join(__dirname, "/../_data/banks.json"), "utf-8");
		contents = JSON.parse(contents);
		return res.json(contents);
	});

	return router;
};

export default OtherRoutes;
