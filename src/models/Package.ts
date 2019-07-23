import {
	Model,
	DataTypes
} from "sequelize";
import { sequelize } from "../util/secrets";


class Package extends Model {
	public id!: number;
	public name!: string;
	public level!: number;
	public amount!: number;
}

Package.init({

	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: DataTypes.INTEGER.UNSIGNED
	},
	name: {
		type: DataTypes.STRING(30),
		allowNull: false
	},
	level: {
		type: DataTypes.TINYINT({ length: 2 })
	},
	amount: {
		type: DataTypes.INTEGER({ length: 5 }).UNSIGNED
	},
	pv: {
		type: DataTypes.INTEGER({ length: 5 }).UNSIGNED
	}

}, {
		tableName: "packages",
		modelName: "package",
		timestamps: false,
		sequelize: sequelize
	}
);

export default Package;
