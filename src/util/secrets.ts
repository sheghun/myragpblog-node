import path from "path";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config({ path: path.join(`${__dirname}/../.env`) });

// Connect to the mysql Database
export const sequelize = new Sequelize(process.env.DB_URL as string, {});
export const ENVIRONMENT = process.env.NODE_ENV;
