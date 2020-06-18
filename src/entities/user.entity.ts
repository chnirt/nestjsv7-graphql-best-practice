import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { v1 as uuidv1 } from 'uuid';
import { Expose, plainToClass } from 'class-transformer';

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
      this._id = this._id || uuidv1();
    }
  }
}
