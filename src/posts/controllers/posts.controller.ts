import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import * as postService from '../services/posts.services';
import { GetPostsDto } from '../dto/get-posts.dto';

// Controller for creating a new post
export const createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { title, content } = req.body;
  const userId = req.user?.id ?? '';
  
  const image = req.file;  // Access the uploaded file

  try {
    // Pass all post data to the service layer
    const newPost = await postService.createPost(userId, title, content, image);
    res.status(201).json(newPost);
  } catch (error) {
    console.log({error})
    next(new createError.InternalServerError(`Error creating post: ${error}`));
  }
};


export const getPostsForUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.id ?? '';

  try {
    const posts = await postService.getPostsForUser(userId);
    res.status(200).json(posts);
  } catch (error) {
    return next(new createError.InternalServerError('Error fetching posts for user'));
  }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  console.log({id});
  try {
    const post = await postService.getPostById(id);
    res.status(200).json(post);
  } catch (error) {
    return next(new createError.InternalServerError(`Error fetching post with id ${id}, ${error}`));
  }
};

export const getAllPostsWithPagination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const dto = req.query as unknown as GetPostsDto;

  try {
    const posts = await postService.getAllPostsWithPagination(dto);
    res.status(200).json(posts);
  } catch (error) {
    return next(new createError.InternalServerError('Error fetching posts'));
  }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('updatePost')
  const { id } = req.params;
  const { title, content } = req.body;
  const image = req.file;  // Access the uploaded file
  const userId = req.user?.id ?? '';
  const userRole = req.user?.role ?? '';

  try {
    const updatedPost = await postService.updatePost(id,userId,userRole, title, content,image);
    res.status(200).json(updatedPost);
  } catch (error) {
    console.log({error})
    return next(new createError.InternalServerError(`Error updating post with id ${id} ${error}`));
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    await postService.deletePost(id);
    res.status(204).send();
  } catch (error) {
    return next(new createError.InternalServerError('Error deleting post'));
  }
};
export const likePost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  const userId = req.user?.id; // Assuming `req.user.id` is set from the token

  try {
    await postService.likePost(postId, userId!);
    res.status(200).json({ message: 'Post liked' });
  } catch (error) {
    next(error);
  }
};

export const unlikePost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  const userId = req.user?.id;

  try {
    await postService.unlikePost(postId, userId!);
    res.status(200).json({ message: 'Post unliked' });
  } catch (error) {
    next(error);
  }
};

export const checkIfLiked = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;
  const userId = req.user?.id;

  try {
    const isLiked = await postService.isPostLikedByUser(postId, userId!);
    res.status(200).json({ isLiked });
  } catch (error) {
    next(error);
  }
};