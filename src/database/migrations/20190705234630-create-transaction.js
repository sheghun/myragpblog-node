'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('transactions', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER.UNSIGNED
			},
			reference: {
				type: Sequelize.STRING(100),
				allowNull: false
			},
			username: {
				type: Sequelize.STRING(30),
				allowNull: false
			},
			amount: {
				type: Sequelize.INTEGER(8).UNSIGNED,
				allowNull: false
			},
			successful: {
				type: Sequelize.DATE,
				allowNull: false
			},
			detail: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			description: {
				type: Sequelize.STRING(100),
				allowNull: false
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
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('Transactions');
	}
};