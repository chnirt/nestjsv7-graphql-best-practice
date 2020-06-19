import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Expose, plainToClass } from 'class-transformer';
import { uuidv4 } from '../utils';

@Entity({
  name: 'users',
  orderBy: {
    _id: 'ASC',
  },
})
export class UserEntity {
  @Expose()
  @ObjectIdColumn()
  _id: string;

  @Expose()
  @Column()
  username: string;

  @Expose()
  @Column()
  password: string;

  @Expose()
  @Column()
  age: number;

  constructor(user: Partial<UserEntity>) {
    if (user) {
      console.log(user);
      Object.assign(
        this,
        plainToClass(UserEntity, user, {
          excludeExtraneousValues: true,
        }),
      );
      this._id = this._id || uuidv4();
    }
  }
}
