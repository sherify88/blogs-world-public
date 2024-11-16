import { Post } from '../../posts/models/post.model';
import { User, UserCreationAttributes } from '../models/user.model';
import sequelize from '../../config/sequelize.config';
import { OptimisticLockError, Transaction } from 'sequelize';
import { UserRole } from '../../enums/roles.enum';
import createError from 'http-errors';
import { GetUsersDto } from '../dto/get-users.dto';
import { Group } from '../../groups/models/group.model';
import { CreateUserDto } from '../dto/create-user.dto';
import { uploadImageToS3 } from '../../config/awsS3.config';
import { UserFollowers } from '../models/userFollowers.model';
import { subscribeEmailToTopic } from './snsService';


export const createUserWithPostsAndGroups = async (dto: CreateUserDto) => {
  const { posts = [], groups = [], image, } = dto;
  const transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ });

  try {
    console.log({ posts, groups, dto });
    console.log({ image });


    const existingUser = await User.findOne({ where: { email: dto.email }, transaction });
    if (existingUser) {
      throw new createError.Conflict('User already exists');
    }
    let imageUrl = '';
    if (image && process.env.IS_LOCAL !== 'true') {
      try {
        // Define a unique key for the image in the S3 bucket
        const key = `images/users/${Date.now()}-${image.originalname}`;

        // Upload image to S3 using the helper function
        const result = await uploadImageToS3(key, image.buffer, image.mimetype,);
        imageUrl = result.Location;  // Retrieve and store the image URL
      } catch (error) {
        console.error('Error uploading image to S3:', error);
        throw new createError.InternalServerError('Error uploading image to S3');
      }
    }
    const newUser = await User.create({ ...dto, imageUrl }, { transaction });

    if (posts.length > 0) {
      const postPromises = posts.map((post) =>
        Post.create({ title: post.title, content: post.content, userId: newUser.id }, { transaction })
      );
      await Promise.all(postPromises);
    }

    if (groups.length > 0) {
      const groupPromises = groups.map(async (group) => {
        const [createdGroup] = await Group.findOrCreate({
          where: { name: group.name },
          defaults: { name: group.name },
          transaction,
        });
        return createdGroup;
      });

      const createdGroups = await Promise.all(groupPromises);
      await newUser.addGroups(createdGroups, { transaction });
    }

    await subscribeEmailToTopic(newUser.email);

    await transaction.commit();
    return newUser;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const findOrCreateGoogleUser = async ({ googleId, email, name }: { googleId: string; email: string; name: string; }) => {
  console.log({ code: '00055', googleId, email, name });

  // Use the created flag to check if the user is newly created
  const [user, created] = await User.findOrCreate({
    where: { email },
    defaults: { googleId, email, firstName: name, lastName: '', role: UserRole.BLOGGER, isActive: true },
  });

  // Subscribe the user to the SNS topic if they are newly created
  if (created) {
    await subscribeEmailToTopic(user.email);
    console.log(`User ${user.email} subscribed to SNS topic.`);
  }

  return user;
};

export const getUsersWithPostsAndGroups = async (pagination: GetUsersDto) => {
  const { limit, page } = pagination;
  const offset = (page ?? 1 - 1) * (limit ?? 10);

  return User.findAndCountAll({
    include: [Post, Group],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
};

export const getUserWithPosts = async (id: string) => {
  const user = await User.findByPk(id, { include: [Post] });
  if (!user) {
    throw new createError.NotFound('User not found');
  }
  return user;
};

export const getTopBloggersWithPosts = async () => {
  return User.findAll({
    attributes: {
      include: [[sequelize.fn('COUNT', sequelize.col('posts.id')), 'postCount']],
    },
    include: [{ model: Post, attributes: [] }],
    where: { role: UserRole.BLOGGER },
    having: sequelize.literal('COUNT(posts.id) > 0'),
    group: ['User.id'],
    order: [[sequelize.literal('"postCount"'), 'DESC']],
    limit: 10,
    subQuery: false,
  });
};

export const updateUserWithLock = async (id: string, dto: Partial<UserCreationAttributes>) => {
  const transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ });

  try {
    const user = await User.findOne({
      where: { id },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!user) {
      throw new createError.NotFound('User not found');
    }

    await user.update(dto, { transaction });
    await transaction.commit();
    return user;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Update user notification schedule and create/update the EventBridge rule.
 * @param userId - ID of the user
 * @param groupId - ID of the group
 * @param recurrence - User-defined recurrence period (e.g., 'rate(6 hours)')
 */
export const updateUserNotificationSchedule = async (userId: string, groupId: string, recurrence: string) => {
  // console.log({ userId, groupId, recurrence });
  // const user = await User.findByPk(userId);
  // if (!user) {
  //   throw new createError.NotFound('User not found');
  // }
  // console.log({ user });

  // // Update user's recurrence preference in the database if needed
  // user.notificationRecurrence = recurrence;  // Assuming this field exists
  // await user.save();

  // // Call EventBridge service to create or update the rule
  // console.log({ userId, groupId, recurrence, lambdaArn: process.env.NOTIFICATION_LAMBDA_ARN });
  // await createOrUpdateRule(userId, groupId, recurrence, process.env.NOTIFICATION_LAMBDA_ARN!);
};

export const updateUserWithOptimisticLocking = async (id: string, dto: Partial<UserCreationAttributes>) => {
  const transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ });

  try {
    const user = await User.findOne({ where: { id }, transaction });

    if (!user) {
      throw new createError.NotFound('User not found');
    }

    await user.update(dto, { transaction });
    await transaction.commit();
    return user;
  } catch (error) {
    await transaction.rollback();
    if (error instanceof OptimisticLockError) {
      throw new createError.Conflict('Update failed due to a version conflict. Please retry with the latest data.');
    }
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new createError.NotFound('User not found');
  }
  await user.destroy();
};
// Follow a user
export const followUser = async (followerId: string, bloggerId: string) => {
  if (followerId === bloggerId) {
    throw new createError.BadRequest("You can't follow yourself");
  }

  const [follow, created] = await UserFollowers.findOrCreate({
    where: { followerId, bloggerId },
  });

  if (!created) {
    throw new createError.Conflict('Already following this user');
  }

  return follow;
};

// Unfollow a user
export const unfollowUser = async (followerId: string, bloggerId: string) => {
  const result = await UserFollowers.destroy({
    where: { followerId, bloggerId },
  });

  if (result === 0) {
    throw new createError.NotFound('Not following this user');
  }

  return { message: 'Unfollowed successfully' };
};

// Get followers of a user
export const getFollowers = async (userId: string) => {
  const user = await User.findByPk(userId, {
    include: [{ model: User, as: 'followers' }],
  });
  if (!user) {
    throw new createError.NotFound('User not found');
  }
  return user.followers;
};

// Get users the user is following
export const getFollowing = async (userId: string) => {
  const user = await User.findByPk(userId, {
    include: [{ model: User, as: 'following' }],
  });
  if (!user) {
    throw new createError.NotFound('User not found');
  }
  return user.following;
};

export const isUserFollowing = async (bloggerId: string, followerId: string): Promise<boolean> => {
  const followerRecord = await UserFollowers.findOne({
    where: {
      bloggerId,
      followerId,
    },
  });

  return !!followerRecord; // Returns true if the record exists, otherwise false
};