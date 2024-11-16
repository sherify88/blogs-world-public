'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'notificationRecurrence', {
      type: Sequelize.STRING,
      allowNull: true,  // Allow null values for users who haven't set a recurrence
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'notificationRecurrence');
  }
};
