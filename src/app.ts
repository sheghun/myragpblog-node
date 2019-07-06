import express, { Router, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import errorHandler from "errorhandler";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import "./util/secrets";
import { sequelize } from "./util/secrets";
import UserRoutes from "./routes/user";


// Sync the sequelize
sequelize.sync();


const app = express();

// middleware
app.use(express.static("public"));
app.use((() => {
	return (
		process.env.NODE_ENV !== "production" ? errorHandler() :
			(req: Request, res: Response, next: NextFunction) => {
				next();
			}
	);
})());

const corsOptions = (): CorsOptions => {
	return {
		credentials: true,
		origin: ["http://localhost:3000"],
		optionsSuccessStatus: 200
	};
};

// Use the body parser
app.use(bodyParser.json());
// Enable cookies
app.use(cookieParser());
// Use cors
app.use(cors(corsOptions()));

app.use("/user", UserRoutes(express.Router()));

export default app;
