'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('posts', 'content', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('posts', 'content', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  }
};