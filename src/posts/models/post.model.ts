import { Table, Column, Model, ForeignKey, DataType, BelongsTo, PrimaryKey, Default, BelongsToMany, HasMany } from 'sequelize-typescript';
import { DataTypes, Optional } from 'sequelize';
import { User } from '../../users/models/user.model';
import { PostLikes } from './postLikes.model';
import { Comment } from '../../comments/models/comments.model';

export interface PostAttributes {
  id?: string; 
  title: string;
  content: string;
  userId: string;
  imageUrl?: string;
}

export interface PostCreationAttributes extends Optional<PostAttributes, 'id'> { }

@Table({
  tableName: 'posts',
  timestamps: true
})
export class Post extends Model<PostAttributes, PostCreationAttributes> {

  @PrimaryKey
  @Default(DataType.UUIDV4) 
  @Column({
    type: DataType.UUID,  
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  id!: string; 

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imageUrl?: string;  

  @ForeignKey(() => User)
  @Column
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @BelongsToMany(() => User, () => PostLikes)
  likers!: User[];

  // New association with comments
  @HasMany(() => Comment, { as: 'comments', foreignKey: 'postId' })
  comments!: Comment[];

  /**
   * Static method to get likes count for a post
   */
  static async getLikesCount(postId: string): Promise<number> {
    const count = await PostLikes.count({
      where: { postId }
    });
    return count;
  }
}
