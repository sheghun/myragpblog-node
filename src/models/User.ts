import {
	Model,
	HasManyHasAssociationMixin, HasManyCountAssociationsMixin,
	HasManyCreateAssociationMixin,
	HasManyGetAssociationsMixin,
	HasManyAddAssociationMixin,
	Association,
	DataTypes,
	HasManySetAssociationsMixin
} from "sequelize";
import { sequelize } from "../util/secrets";
import bcrypt from "bcrypt";

class User extends Model {
	public id!: number;
	public firstName!: string;
	public lastName!: string;
	public username!: string;
	public email!: string;
	public wallet!: number;
	public password!: string;
	public phoneNumber!: string;
	public whatsappNumber!: string;
	public bankAccountNumber!: string;
	public bankAccountName!: string;
	public bank!: string;
	public bankAccountType!: string;
	public pv!: number;
	public cummulativePv!: number;
	public pvDate!: Date;
	public transactions!: string;
	public upFront!: number;
	public image!: string;
	public packageId!: number;
	public referalId!: string;
	public ragpReferalId!: string;
	public paid!: string;
	public aboutMe!: string;


	// timestamps!
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	public toJSON(): User {
		// Get the values
		const user = <User>{ ...this.get() };
		// Delete values before returning to the client
		delete user.password;
		// @ts-ignore
		delete user.createdAt;
		// @ts-ignore
		delete user.updatedAt;
		return user;
	}
	/**
	 * Compare
	 * For checking if the password is correct
	 *
	 * @param password The pass in password to compare
	 */
	async comparePassword(password: string): Promise<boolean> {
		return await bcrypt.compare(password, this.password);
	}

}

// Init the user
User.init({
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: DataTypes.INTEGER.UNSIGNED
	},
	firstName: {
		type: DataTypes.STRING(30),
		allowNull: false
	},
	lastName: {
		type: DataTypes.STRING(30),
		allowNull: false
	},
	username: {
		type: DataTypes.STRING(30),
		allowNull: false,
		unique: true
	},
	email: {
		type: DataTypes.STRING(30),
		allowNull: false,
		unique: true
	},
	wallet: {
		type: DataTypes.DECIMAL(10, 2).UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	password: {
		type: DataTypes.STRING(100),
		allowNull: false
	},
	phoneNumber: {
		type: DataTypes.STRING(11)
	},
	whatsappNumber: {
		type: DataTypes.STRING(11)
	},
	bankAccountNumber: {
		type: DataTypes.STRING(16)
	},
	bankAccountName: {
		type: DataTypes.STRING(30)
	},
	bank: {
		type: DataTypes.STRING(30)
	},
	bankAccountType: {
		type: DataTypes.STRING(10)
	},
	pv: {
		type: DataTypes.MEDIUMINT({ length: 7 }).UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	cummulativePv: {
		type: DataTypes.MEDIUMINT({ length: 7 }).UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	pvDate: {
		type: DataTypes.DATE
	},
	transactions: {
		type: DataTypes.TEXT("long")
	},
	upFront: {
		type: DataTypes.TINYINT({ length: 2 }).UNSIGNED
	},
	image: {
		type: DataTypes.STRING(100)
	},
	packageId: {
		type: DataTypes.TINYINT({ length: 2 }).UNSIGNED
	},
	referalId: {
		type: DataTypes.STRING(30)
	},
	ragpReferalId: {
		type: DataTypes.STRING(30)
	},
	paid: {
		type: DataTypes.DATE
	},
	aboutMe: {
		type: DataTypes.STRING(160)
	}


},
	{
		tableName: "users",
		modelName: "user",
		timestamps: true,
		sequelize: sequelize
	}
);


// Add hooks to the user

User.addHook("beforeCreate", async (user: User, options) => {
	// Hash the password
	let password = user.password;
	password = await bcrypt.hash(password, 10);
	user.password = password;
});

export default User;
