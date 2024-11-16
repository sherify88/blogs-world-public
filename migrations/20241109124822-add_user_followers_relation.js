'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the 'user_followers' table
    await queryInterface.createTable('user_followers', {
      bloggerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      followerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      }
    });

    // Add a composite primary key on 'bloggerId' and 'followerId'
    await queryInterface.addConstraint('user_followers', {
      fields: ['bloggerId', 'followerId'],
      type: 'primary key',
      name: 'user_followers_pkey'
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop the 'user_followers' table
    await queryInterface.dropTable('user_followers');
  }
};
