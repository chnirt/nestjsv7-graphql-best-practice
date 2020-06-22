import {
  Resolver,
  Query,
  Mutation,
  Args,
  Subscription,
  Context,
} from '@nestjs/graphql';
import { getMongoRepository, getMongoManager } from 'typeorm';
import { ForbiddenError } from 'apollo-server-core';
import { PubSub } from 'graphql-subscriptions';
import { uuidv4, hashPassword, comparePassword } from '@utils';
import { UserEntity } from '@entities';
import {
  RegisterUserInput,
  LoginResponse,
  LoginUserInput,
  User,
} from '@generator';
import { generateToken } from '@auth';
import { USER_ADDED } from '../constant';

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

  @Mutation(() => Boolean)
  async register(
    @Args('input') input: RegisterUserInput,
    @Context('pubSub') pubSub: PubSub,
  ): Promise<boolean> {
    const { username, password } = input;

    const existedUser = await getMongoManager().find(UserEntity, {
      username,
    });

    if (existedUser.length > 0) {
      throw new ForbiddenError('Username is existed.');
    }

    const user = new UserEntity({
      ...input,
      password: await hashPassword(password),
    });

    const createdUser = await getMongoManager().save(user);

    pubSub.publish(USER_ADDED, { userAdded: createdUser });

    return createdUser ? true : false;
  }

  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginUserInput): Promise<LoginResponse> {
    const { username, password } = input;

    const foundUser = await getMongoManager().findOne(UserEntity, {
      username,
    });

    if (!foundUser) {
      throw new ForbiddenError('Username is not existed.');
    }

    const validatePassword = await comparePassword(
      password,
      foundUser.password,
    );

    if (!validatePassword) {
      throw new ForbiddenError('Username or Password is not correct.');
    }

    const accessToken = await generateToken(foundUser, 'accessToken');
    const refreshToken = await generateToken(foundUser, 'refreshToken');

    return {
      accessToken,
      refreshToken,
    };
  }

  @Subscription(() => User)
  async userAdded(@Context('pubSub') pubSub: PubSub): Promise<any> {
    return pubSub.asyncIterator(USER_ADDED);
  }
}
