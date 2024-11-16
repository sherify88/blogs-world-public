import { Request, Response, NextFunction, query } from 'express';
import createError from 'http-errors';
import * as commentService from '../services/comments.services';

// Controller for creating a new comment
export const createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { postId, details, parentCommentId } = req.body;
  const userId = req.user?.id ?? '';

  try {
    const newComment = await commentService.createComment(userId, postId, details, parentCommentId);
    res.status(201).json(newComment);
  } catch (error) {
    console.error({ error });
    next(new createError.InternalServerError(`Error creating comment: ${error}`));
  }
};

// Get all comments for a specific post
export const getCommentsForPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // get postId from query params
    console.log({query:req.query});
    const postId  = req.query.postId as string;
    console.log({postId});

  try {
    const comments = await commentService.getCommentsForPost(postId);
    res.status(200).json(comments);
  } catch (error) {
    console.error({ error });
    return next(new createError.InternalServerError(`Error fetching comments for post with id ${postId} ${error}`));
  }
};

// Get replies for a specific comment
export const getRepliesForComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { commentId } = req.params;

  try {
    const replies = await commentService.getRepliesForComment(commentId);
    res.status(200).json(replies);
  } catch (error) {
    return next(new createError.InternalServerError('Error fetching replies for comment'));
  }
};

// Get a single comment by ID
export const getCommentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { commentId } = req.params;

  try {
    const comment = await commentService.getCommentById(commentId);
    res.status(200).json(comment);
  } catch (error) {
    return next(new createError.InternalServerError(`Error fetching comment with id ${commentId}`));
  }
};

// Update a comment
export const updateComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { commentId } = req.params;
  const { details } = req.body;
  const userId = req.user?.id ?? '';

  try {
    const updatedComment = await commentService.updateComment(commentId, userId, details);
    res.status(200).json(updatedComment);
  } catch (error) {
    console.error({ error });
    return next(new createError.InternalServerError('Error updating comment'));
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { commentId } = req.params;
  const userId = req.user?.id ?? '';

  try {
    await commentService.deleteComment(commentId, userId);
    res.status(204).send();
  } catch (error) {
    return next(new createError.InternalServerError('Error deleting comment'));
  }
};
