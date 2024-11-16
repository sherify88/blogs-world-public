import {
    Table,
    Column,
    Model,
    ForeignKey,
    DataType,
    BelongsTo,
    PrimaryKey,
    Default,
    HasMany,
  } from 'sequelize-typescript';
  import { User } from '../../users/models/user.model';
  import { Post } from '../../posts/models/post.model';
import { Optional } from 'sequelize';
  
  export interface CommentAttributes {
    id?: string;
    postId: string;
    userId: string;
    details: string;
    parentCommentId?: string;
  }
  
  export interface CommentCreationAttributes extends Optional<CommentAttributes, 'id' | 'parentCommentId'> {}
  
  @Table({
    tableName: 'comments',
    timestamps: true,
  })
  export class Comment extends Model<CommentAttributes, CommentCreationAttributes> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({
      type: DataType.UUID,
      allowNull: false,
      defaultValue: DataType.UUIDV4,
    })
    id!: string;
  
    @ForeignKey(() => Post)
    @Column({
      type: DataType.UUID,
      allowNull: false,
    })
    postId!: string;
  
    @BelongsTo(() => Post)
    post!: Post;
  
    @ForeignKey(() => User)
    @Column({
      type: DataType.UUID,
      allowNull: false,
    })
    userId!: string;
  
    @BelongsTo(() => User)
    user!: User;
  
    @Column({
      type: DataType.TEXT,
      allowNull: false,
    })
    details!: string;
  
    @ForeignKey(() => Comment)
    @Column({
      type: DataType.UUID,
      allowNull: true,
    })
    parentCommentId?: string;
  
    @BelongsTo(() => Comment, { foreignKey: 'parentCommentId', as: 'parent' })
    parentComment?: Comment;
  
    @HasMany(() => Comment, { foreignKey: 'parentCommentId', as: 'subComments' })
    subComments?: Comment[];
  
   
  }
  