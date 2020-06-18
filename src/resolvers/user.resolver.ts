import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { getMongoRepository, getMongoManager } from 'typeorm';
import { v1 as uuidv1 } from 'uuid';
import { UserEntity } from '../entities/user.entity';
import { RegisterUserInput } from '../generator/graphql.schema';

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
    return uuidv1();
  }

  @Query()
  async users(): Promise<UserEntity[]> {
    const users = await getMongoRepository(UserEntity).find();
    return users;
  }

  @Mutation()
  async register(@Args('input') input: RegisterUserInput): Promise<boolean> {
    const user = new UserEntity({ ...input });

    const createdUser = await getMongoManager().save(user);

    return createdUser ? true : false;
  }
}
