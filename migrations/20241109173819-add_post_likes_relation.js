'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the 'post_likes' table
    await queryInterface.createTable('post_likes', {
      postId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
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
      },
    });

    // Add a composite primary key on 'postId' and 'userId'
    await queryInterface.addConstraint('post_likes', {
      fields: ['postId', 'userId'],
      type: 'primary key',
      name: 'post_likes_pkey'
    });
  },

  async down(queryInterface) {
    // Drop the 'post_likes' table
    await queryInterface.dropTable('post_likes');
  },
};
