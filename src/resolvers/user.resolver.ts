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
import { uuidv4, hashPassword, comparePassword } from '../utils';
import { UserEntity } from '../entities/user.entity';
import {
  RegisterUserInput,
  LoginResponse,
  LoginUserInput,
} from '../generator/graphql.schema';
import { generateToken } from 'src/auth';

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
  async register(@Args('input') input: RegisterUserInput): Promise<boolean> {
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

    return createdUser ? true : false;
  }

  @Mutation(() => String)
  async login(@Args('input') input: LoginUserInput): Promise<LoginResponse> {
    console.log(input);
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

  @Subscription(() => UserEntity)
  async userAdded(@Context('pubSub') pubSub: any): Promise<UserEntity> {
    return pubSub.asyncIterator('userAdded');
  }
}
