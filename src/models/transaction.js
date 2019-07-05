'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    reference: DataTypes.STRING,
    username: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    successful: DataTypes.DATE,
    detail: DataTypes.STRING,
    description: DataTypes.STRING
  }, {});
  Transaction.associate = function(models) {
    // associations can be defined here
  };
  return Transaction;
};