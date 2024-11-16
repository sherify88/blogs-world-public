// src/posts/routes/posts.route.ts

import { Router } from 'express';
import multer from 'multer';
import {
  createPost,
  getPostsForUser,
  updatePost,
  deletePost,
  getAllPostsWithPagination,
  getPostById,
  likePost,
  unlikePost,
  checkIfLiked
} from '../controllers/posts.controller';
import { validateDto } from '../../middlewares/validate-dto'; 
import { CreatePostDto } from '../dto/create-post.dto';
import { extractUser, jwtAuth } from '../../middlewares/authMiddleware';
import { GetPostsDto } from '../dto/get-posts.dto';

const router = Router();
const upload = multer();  // Initializes multer to parse multipart/form-data

router.post('/', jwtAuth, extractUser, upload.single('image'), validateDto(CreatePostDto), createPost); 
router.get('/user/:userId', getPostsForUser); 
router.get('/', validateDto(GetPostsDto), getAllPostsWithPagination); 
router.get('/:id', getPostById);
router.patch('/:id',jwtAuth,extractUser,upload.single('image'), updatePost); 
router.delete('/:id', deletePost); 
router.post('/:postId/like', jwtAuth,extractUser, likePost);
router.post('/:postId/unlike', jwtAuth,extractUser, unlikePost);
router.get('/:postId/isLiked',jwtAuth,extractUser, checkIfLiked);

export default router;
