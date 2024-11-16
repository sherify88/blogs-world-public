'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make the password column nullable
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the password column back to not nullable if needed
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
