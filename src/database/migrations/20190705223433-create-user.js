'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      firstName: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      wallet: {
        type: Sequelize.DECIMAL(10, 2).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING(11),
      },
      whatsappNumber: {
        type: Sequelize.STRING(11),
      },
      bankAccountNumber: {
        type: Sequelize.STRING(16),
      },
      bankAccountName: {
        type: Sequelize.STRING(30),
      },
      bank: {
        type: Sequelize.STRING(2),
      },
      bankAccountType: {
        type: Sequelize.STRING(10),
      },
      pv: {
        type: Sequelize.MEDIUMINT(7).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      cummulativePv: {
        type: Sequelize.MEDIUMINT(7).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      pvDate: {
        type: Sequelize.DATE,
      },
      transactions: {
        type: Sequelize.TEXT('long'),
      },
      upFront: {
        type: Sequelize.TINYINT(2).UNSIGNED,
      },
      image: {
        type: Sequelize.STRING(100),
      },
      packageId: {
        type: Sequelize.TINYINT(2).UNSIGNED,
      },
      referalId: {
        type: Sequelize.STRING(30),
      },
      ragpReferalId: {
        type: Sequelize.STRING(30),
      },
      paymentMethod: {
        type: Sequelize.STRING(10),
      },
      paid: {
        type: Sequelize.DATE,
      },
      aboutMe: {
        type: Sequelize.STRING(160),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  },
};
