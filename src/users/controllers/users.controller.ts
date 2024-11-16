import { NextFunction, Request, Response } from 'express';
import * as userService from '../services/users.services';
import { GetUsersDto } from '../dto/get-users.dto';
import { UserRole } from '../../enums/roles.enum';

export const createUserWithPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newUser = await userService.createUserWithPostsAndGroups(req.body);  
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};
export const bloggerSignup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = UserRole.BLOGGER;
    req.body.role = role;
    req.body.image=req.file;
    const newUser = await userService.createUserWithPostsAndGroups(req.body);  
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const getUsersWithPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto= req.query as unknown as GetUsersDto;
    const users = await userService.getUsersWithPostsAndGroups(dto);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserNotificationSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { groupId, recurrence } = req.body; // Extract recurrence and group ID from request body
    await userService.updateUserNotificationSchedule(req.params.id, groupId, recurrence);
    res.status(200).json({ message: 'Notification schedule updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserWithPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.getUserWithPosts(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getTopBloggersWithPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const topUsers = await userService.getTopBloggersWithPosts();
    res.status(200).json(topUsers);
  } catch (error) {
    next(error);
  }
};

export const updateUserWithLock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.updateUserWithLock(req.params.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserWithOptimisticLocking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.updateUserWithOptimisticLocking(req.params.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
// Follow a user
export const followUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bloggerId = req.params.id;
    const followerId = req.user?.id ?? '';

    const result = await userService.followUser(followerId, bloggerId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Unfollow a user
export const unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bloggerId = req.params.id;
    const followerId = req.user?.id ?? '';
    const result = await userService.unfollowUser(followerId, bloggerId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Get followers of a user
export const getFollowers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const followers = await userService.getFollowers(userId);
    res.status(200).json(followers);
  } catch (error) {
    next(error);
  }
};

// Get users the user is following
export const getFollowing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const following = await userService.getFollowing(userId);
    res.status(200).json(following);
  } catch (error) {
    next(error);
  }
};

export const isFollowing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bloggerId = req.params.id;
    const followerId = req.user?.id; // Assuming `req.user` is set by authentication middleware

    const isFollowing = await userService.isUserFollowing(bloggerId, followerId!);
    res.status(200).json({ isFollowing });
  } catch (error) {
    next(error);
  }
};