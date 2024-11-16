import { Router } from 'express';

import { validateDto } from '../../middlewares/validate-dto';
import { extractUser, jwtAuth } from '../../middlewares/authMiddleware';
import { createComment, deleteComment, getCommentById, getCommentsForPost, getRepliesForComment, updateComment } from '../controller/comments.controller';
import { CreateCommentDto } from '../dto/createComments.dto';
import { GetCommentsDto } from '../dto/getComments.dto';

const router = Router();

// Route to create a comment
router.post('/', jwtAuth, extractUser, validateDto(CreateCommentDto), createComment);

// Route to get all comments for a specific post (top-level comments only)
router.get('/',validateDto(GetCommentsDto), getCommentsForPost);

// Route to get replies for a specific comment (sub-comments)
router.get('/:commentId/replies', getRepliesForComment);

// Route to get a single comment by its ID
router.get('/:commentId', getCommentById);

// Route to update a comment
router.patch('/:commentId', jwtAuth, extractUser, updateComment);

// Route to delete a comment
router.delete('/:commentId', jwtAuth, extractUser, deleteComment);

export default router;
