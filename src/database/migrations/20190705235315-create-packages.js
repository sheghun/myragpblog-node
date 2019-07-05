'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('packages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      name: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.INTEGER(5).UNSIGNED
      },
      level: {
        type: Sequelize.TINYINT(2).UNSIGNED
      },
      pv: {
        type: Sequelize.TINYINT(3).UNSIGNED
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('packages');
  }
};