import { Table, Column, Model, ForeignKey, DataType } from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'user_followers',
  timestamps: true,
})
export class UserFollowers extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  bloggerId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  followerId!: string;
}
