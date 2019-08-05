import { Model, DataTypes } from "sequelize";
import { sequelize } from "../util/secrets";

class Transaction extends Model {
	public id!: number;
	public reference!: string;
	public username!: string;
	public amount!: number;
	public detail!: string;
	public description!: string;
	public successful!: string;
}

Transaction.init({

	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: DataTypes.INTEGER.UNSIGNED
	},
	reference: {
		type: DataTypes.STRING(100),
		allowNull: false
	},
	amount: {
		type: DataTypes.INTEGER.UNSIGNED
	},
	username: {
		type: DataTypes.STRING(30),
		key: "idx_username",
		allowNull: false
	},
	description: {
		type: DataTypes.STRING(100)
	},
	detail: {
		type: DataTypes.STRING(100)
	},
	successful: {
		type: DataTypes.DATE
	}

}, {
		timestamps: true,
		modelName: "transaction",
		tableName: "transactions",
		sequelize
	}
);

export default Transaction;
