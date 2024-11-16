import { Table, Column, Model, ForeignKey, DataType } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Post } from './post.model';

@Table({
  tableName: 'post_likes',
  timestamps: true,
})
export class PostLikes extends Model {
  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  postId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;
}
