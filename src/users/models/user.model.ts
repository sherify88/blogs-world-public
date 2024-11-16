import { Table, Column, Model, DataType, PrimaryKey, Default, BeforeFind, HasMany, AfterFind, BeforeCreate } from 'sequelize-typescript';
import { BelongsToMany } from 'sequelize-typescript';
import { DataTypes, Optional } from 'sequelize';
import { Post } from '../../posts/models/post.model';
import { Group } from '../../groups/models/group.model';
import { UserGroup } from '../../groups/models/userGroup.model';
import { UserFollowers } from './userFollowers.model';
import { PostLikes } from '../../posts/models/postLikes.model';
var bcrypt = require('bcryptjs');

export interface UserAttributes {
  id?: string;  
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  isActive?: boolean;
  role?: string;
  version?: number;  
  notificationRecurrence?: string;  // New field to store recurrence period
  fcmToken?: string;  // New field to store FCM token
  imageUrl?: string;
  googleId?: string;


}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

@Table({
  tableName: 'users',
  timestamps: true,
  version: true  
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
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
  firstName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName!: string;

  @Column({
    type: DataType.ENUM('admin', 'blogger', 'customer'),  
    allowNull: false,
    defaultValue: 'customer',
  })
  role!: string; 

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  notificationRecurrence!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  fcmToken!: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  password?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  googleId?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false
  })
  isActive!: boolean;


  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imageUrl?: string;  

  @HasMany(() => Post)  
  posts!: Post[];  

  @BelongsToMany(() => Group, () => UserGroup)
  groups!: Group[];

  @BelongsToMany(() => Post, () => PostLikes)
  likedPosts!: Post[];
  
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,  
  })
  version!: number;


  @BelongsToMany(() => User, () => UserFollowers, 'followerId', 'bloggerId')
  following!: User[];

  @BelongsToMany(() => User, () => UserFollowers, 'bloggerId', 'followerId')
  followers!: User[];


  





  @BeforeCreate
  static async hashPassword(instance: User) {
    if (instance.password) {
      const salt = await bcrypt.genSaltSync(10);
      instance.password = await bcrypt.hashSync(instance.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compareSync(password, this.password);
  }


    public addGroups!: (group: Group | Group[], options?: any) => Promise<void>;
    public getGroups!: () => Promise<Group[]>;
    public setGroups!: (groups: Group[]) => Promise<void>;
    public removeGroup!: (group: Group | Group[]) => Promise<void>;

    public addLikedPosts!: (post: Post | Post[], options?: any) => Promise<void>;
    public getLikedPosts!: () => Promise<Post[]>;
    public setLikedPosts!: (posts: Post[]) => Promise<void>;
    public removeLikedPost!: (post: Post | Post[]) => Promise<void>;

    public addFollowing!: (user: User | User[], options?: any) => Promise<void>;
    public getFollowing!: () => Promise<User[]>;
    public setFollowing!: (users: User[]) => Promise<void>;
    public removeFollowing!: (user: User | User[]) => Promise<void>;
    // public getFollowers!: () => Promise<User[]>;

}
