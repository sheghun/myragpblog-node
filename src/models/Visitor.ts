import {DataTypes, Model} from "sequelize";
import {sequelize} from "../util/secrets";

class Visitor extends Model {
  public id!: number;
  public email!: string;
  public username!: string;
}

Visitor.init({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED
  },
  email: {
    type: DataTypes.STRING(30)
  },
  username: {
    type: DataTypes.STRING(25)
  },
}, {
  tableName: "visitors",
  modelName: "visitor",
  timestamps: true,
  sequelize: sequelize
});
export default Visitor;
