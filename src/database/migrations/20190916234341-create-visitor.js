'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('visitors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        // @ts-ignore
        type: Sequelize.INTEGER.UNSIGNED
      },
      email: {
        type: Sequelize.STRING(30)
      },
      username: {
        type: Sequelize.STRING(25)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, _) => {
    return queryInterface.dropTable('visitors');
  }
};
