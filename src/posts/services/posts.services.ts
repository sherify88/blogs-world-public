import { Post, PostAttributes } from '../models/post.model';
import { User } from '../../users/models/user.model';
import createError from 'http-errors';
import { GetPostsDto } from '../dto/get-posts.dto';
import { uploadImageToS3 } from '../../config/awsS3.config';
import { PostLikes } from '../models/postLikes.model';
import { triggerPostNotification } from '../../users/services/sqsService';
import { Comment } from '../../comments/models/comments.model';
import { WhereOptions } from 'sequelize';

export const createPost = async (userId: string, title: string, content: string, image?: Express.Multer.File) => {
    // Verify if the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new createError.NotFound('User not found');
    }
  
    let imageUrl = '';
    if (image && process.env.IS_LOCAL !== 'true') {
      try {
        // Define a unique key for the image in the S3 bucket
        const key = `images/posts/${Date.now()}-${image.originalname}`;
  
        // Upload image to S3 using the helper function
        const result = await uploadImageToS3(key, image.buffer, image.mimetype,);
        imageUrl = result.Location;  // Retrieve and store the image URL
      } catch (error) {
        console.error('Error uploading image to S3:', error);
        throw new createError.InternalServerError('Error uploading image to S3');
      }
    }
  
    // Create post with the optional image URL
    const newPost= await Post.create({ title, content, userId, imageUrl });
     // Trigger notification for followers
  await triggerPostNotification(userId, newPost.id);
  
  return newPost;
  };
export const getPostsForUser = async (userId: string) => {
  return await Post.findAll({ where: { userId } });
};

export const getAllPostsWithPagination = async (dto: GetPostsDto) => {
  let { limit, page,authorId } = dto;
  page=Number(page??1);
    limit=Number(limit??10);
  const offset = ((page ?? 1) - 1) * (limit ?? 10);
  let where :WhereOptions<PostAttributes> | undefined;
  if(authorId) where = { userId: authorId };
  const items= await Post.findAndCountAll({ limit, offset, where, include: [{ model: User, as: 'user', attributes: ['id','firstName', 'lastName','imageUrl',] }] });
  const meta:{totalItems:number,itemCount:number,itemsPerPage:number,totalPages:number,currentPage:number} = {
    totalItems: items.count,
    itemCount: items.rows.length,
    itemsPerPage: limit ?? 10,
    totalPages: Math.ceil(items.count / (limit ?? 10)),
    currentPage: page ?? 1,
  };
    return { items: items.rows,meta };
};

// Get post by id with user firstName + lastName and likesCount
export const getPostById = async (id: string) => {
  // Fetch the post along with the associated user (author), comments, and sub-comments
  const post = await Post.findByPk(id, { 
    include: [
      { model: User, as: 'user', attributes: ['firstName', 'lastName', 'imageUrl'] }, // Author details
      {
        model: Comment,
        as: 'comments',
        where: { parentCommentId: null }, // Only top-level comments
        required: false, // Make it optional in case there are no comments
        include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName', 'imageUrl'] },
          {
            model: Comment,
            as: 'subComments',
            include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'imageUrl'] }],
          },
        ],
      },
    ],
  });

  if (!post) {
    return null;
  }

  // Fetch the count of likes for the post
  const likesCount = await PostLikes.count({ where: { postId: id } });

  // Add the likesCount to the post object
  return {
    ...post.toJSON(),
    likesCount,
  };
};

export const updatePost = async (id: string,userId:string,userRole:string, title: string, content: string, image?: Express.Multer.File) => {
  const post = await Post.findByPk(id, { include: [{ model: User , as:'user' }] });
  if (!post) {
    throw new createError.NotFound('Post not found');
  }
  if (post.userId !== userId && userRole !== 'admin') {
    throw new createError.Forbidden('You are not authorized to update this post');
  }

  let imageUrl = post.imageUrl;
  if (image && process.env.IS_LOCAL !== 'true') {
    try {
      const key = `images/posts/${Date.now()}-${image.originalname}`;
      const result = await uploadImageToS3(key, image.buffer, image.mimetype);
      imageUrl = result.Location;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new createError.InternalServerError('Error uploading image to S3');
    }
  }

  if(title) post.title = title;
  if(content) post.content = content
  post.imageUrl = imageUrl;
  await post.save();
  return post;
};

export const deletePost = async (id: string) => {
  const post = await Post.findByPk(id);
  if (!post) {
    throw new createError.NotFound('Post not found');
  }

  await post.destroy();
};
/**
 * Function to like a post
 */
export const likePost = async (postId: string, userId: string) => {
  await PostLikes.create({ postId, userId });
};

/**
 * Function to unlike a post
 */
export const unlikePost = async (postId: string, userId: string) => {
  await PostLikes.destroy({ where: { postId, userId } });
};

/**
 * Check if a user has liked a post
 */
export const isPostLikedByUser = async (postId: string, userId: string) => {
  const like = await PostLikes.findOne({ where: { postId, userId } });
  return !!like;
};

/**
 * Get likes count for a post
 */
export const getLikesCount = async (postId: string) => {
  return await PostLikes.count({ where: { postId } });
};