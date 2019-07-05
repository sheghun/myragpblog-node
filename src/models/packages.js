'use strict';
module.exports = (sequelize, DataTypes) => {
  const Packages = sequelize.define('Packages', {
    name: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    level: DataTypes.TINYINT,
    pv: DataTypes.TINYINT
  }, {});
  Packages.associate = function(models) {
    // associations can be defined here
  };
  return Packages;
};