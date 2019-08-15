import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import errorHandler from "errorhandler";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import "./util/secrets";
import { sequelize } from "./util/secrets";
import UserRoutes from "./routes/user";
import OtherRoutes from "./routes/others";
import PaymentRoutes from "./routes/payment";


// Sync the sequelize
sequelize.sync();


const app = express();

// middleware
app.use(express.static(__dirname + "/assets"));
app.use((() => {
	return (
		process.env.NODE_ENV !== "production" ? errorHandler() :
			(req: Request, res: Response, next: NextFunction) => {
				next();
			}
	);
})());

app.get("/", (req, res) => {
	return res.json({
		message: "You probably shouldn't be here, but...",
		data: {
			"service": "myragpblog-api",
			"version": "1.0"
		}
	});
});

const corsOptions = (): CorsOptions => {
	return {
		credentials: true,
		origin: [
			"http://localhost:3000",
			"http://localhost:3003",
			"http://127.0.0.1:3000",
			"https://myragpblog.com"
		],
		optionsSuccessStatus: 200
	};
};

// Use the body parser
app.use(bodyParser.json());
// Enable cookies
app.use(cookieParser());
// Use cors
app.use(cors(corsOptions()));

app.use("/", OtherRoutes(express.Router()));

app.use("/user", UserRoutes(express.Router()));

app.use("/payment", PaymentRoutes(express.Router()));

export default app;
