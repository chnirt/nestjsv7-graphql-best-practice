import {
  Resolver,
  Query,
  Mutation,
  Args,
  Subscription,
  Context,
} from '@nestjs/graphql';
import { getMongoRepository, getMongoManager } from 'typeorm';
import { uuidv4 } from '../utils';
import { UserEntity } from '../entities/user.entity';
import { RegisterUserInput } from '../generator/graphql.schema';
import { hashPassword } from '../utils';
import { ForbiddenError } from 'apollo-server-core';

@Resolver('User')
export class UserResolver {
  @Query()
  async hello(): Promise<string> {
    return 'world';
  }

  @Query()
  async today(): Promise<Date> {
    return new Date();
  }

  @Query()
  async uuid(): Promise<string> {
    return uuidv4();
  }

  @Query()
  async users(): Promise<UserEntity[]> {
    const users = await getMongoRepository(UserEntity).find();
    return users;
  }

  @Mutation()
  async register(@Args('input') input: RegisterUserInput): Promise<boolean> {
    const { username } = input;

    const existedUser = await getMongoManager().find(UserEntity, {
      username,
    });

    if (existedUser.length > 0) {
      throw new ForbiddenError('Username is existed.');
    }

    const user = new UserEntity({
      ...input,
      password: await hashPassword(input.password),
    });

    const createdUser = await getMongoManager().save(user);

    return createdUser ? true : false;
  }

  @Subscription(() => UserEntity)
  async userAdded(@Context('pubSub') pubSub: any): Promise<UserEntity> {
    return pubSub.asyncIterator('userAdded');
  }
}
