import { Router } from 'express';
import {
  createUserWithPosts,
  getUsersWithPosts,
  updateUserWithLock,
  deleteUser,
  getUserWithPosts,
  getTopBloggersWithPosts,
  updateUserWithOptimisticLocking,
  updateUserNotificationSchedule,
  bloggerSignup,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing
} from '../controllers/users.controller';
import { validateDto } from '../../middlewares/validate-dto'; 
import { GetUsersDto } from '../dto/get-users.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { authorize, extractUser, jwtAuth } from '../../middlewares/authMiddleware';
import { UserRole } from '../../enums/roles.enum';
import { createUserRules } from '../rules/create-user-rules';
import { validateRules } from '../../middlewares/validate-rules';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserNotificationScheduleDto } from '../dto/update-user-notifications-schedule.dto';
import multer from 'multer';

const router = Router();
const upload = multer();  // Initializes multer to parse multipart/form-data

router.post('/withValidationRules', jwtAuth, authorize([UserRole.ADMIN]), validateRules(createUserRules), createUserWithPosts);
router.post('/', jwtAuth, authorize([UserRole.ADMIN]), validateDto(CreateUserDto), createUserWithPosts); 
router.post('/blogger/signup', upload.single('image'), validateDto(CreateUserDto), bloggerSignup); 
router.get('/', jwtAuth, validateDto(GetUsersDto), getUsersWithPosts);
router.get('/top-users', jwtAuth, authorize([UserRole.ADMIN]), getTopBloggersWithPosts);
router.get('/:id', getUserWithPosts);
router.patch('/:id', validateDto(UpdateUserDto), updateUserWithLock);
router.patch('/optimisticLock/:id', validateDto(UpdateUserDto), updateUserWithOptimisticLocking);
router.delete('/:id', deleteUser);
router.patch('/:id/notification-schedule', jwtAuth, authorize([UserRole.ADMIN]), validateDto(UpdateUserNotificationScheduleDto), updateUserNotificationSchedule);
router.post('/:id/follow',jwtAuth, extractUser, followUser);
router.post('/:id/unfollow',jwtAuth, extractUser, unfollowUser);
router.get('/:id/isFollowing', jwtAuth,extractUser, isFollowing);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);


export default router;
