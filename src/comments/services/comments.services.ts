import { Comment } from '../models/comments.model';
import { User } from '../../users/models/user.model';
import createError from 'http-errors';
import { Op } from 'sequelize';

// Service to create a new comment
export const createComment = async (userId: string, postId: string, details: string, parentCommentId?: string) => {
  const newComment = await Comment.create({ userId, postId, details, parentCommentId });
  return newComment;
};

// Get all comments for a specific post (including sub-comments)
export const getCommentsForPost = async (postId: string) => {
    return await Comment.findAll({
      where: { postId, parentCommentId: { [Op.is]: null } as any },
      include: [
        { model: Comment, as: 'subComments', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }] },
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  };

// Get replies for a specific comment
export const getRepliesForComment = async (commentId: string) => {
  return await Comment.findAll({
    where: { parentCommentId: commentId },
    include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }],
    order: [['createdAt', 'ASC']]
  });
};

// Get a single comment by ID
export const getCommentById = async (commentId: string) => {
  const comment = await Comment.findByPk(commentId, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] },
      { model: Comment, as: 'subComments', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }] }
    ]
  });

  if (!comment) {
    throw new createError.NotFound('Comment not found');
  }
  return comment;
};

// Update a comment
export const updateComment = async (commentId: string, userId: string, details: string) => {
  const comment = await Comment.findByPk(commentId);
  if (!comment) throw new createError.NotFound('Comment not found');
  if (comment.userId !== userId) throw new createError.Forbidden('You are not authorized to update this comment');

  comment.details = details;
  await comment.save();
  return comment;
};

// Delete a comment
export const deleteComment = async (commentId: string, userId: string) => {
  const comment = await Comment.findByPk(commentId);
  if (!comment) throw new createError.NotFound('Comment not found');
  if (comment.userId !== userId) throw new createError.Forbidden('You are not authorized to delete this comment');

  await comment.destroy();
};
