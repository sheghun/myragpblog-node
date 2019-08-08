import path from "path";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config({ path: path.join(`${__dirname}/../.env`) });

console.log(
	process.env.DB_NAME as string,
	process.env.DB_USERNAME as string,
	process.env.DB_PASSWORD as string
);
// Connect to the mysql Database
// Connect to the mysql Database
export const sequelize = new Sequelize(
	process.env.DB_NAME as string,
	process.env.DB_USERNAME as string,
	process.env.DB_PASSWORD as string,
	{
		dialect: "mysql",
		host: "localhost"
	}
);
export const ENVIRONMENT = process.env.NODE_ENV;
