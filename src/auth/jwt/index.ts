import { sign, verify } from 'jsonwebtoken';
import { getMongoRepository } from 'typeorm';
import { AuthenticationError } from 'apollo-server-core';
import { UserEntity } from '@entities';
import { LoginResponse } from '@generator';
import {
  ISSUER,
  AUDIENCE,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from '@environments';

type TokenType = 'accessToken' | 'refreshToken';

const common = {
  accessToken: {
    privateKey: ACCESS_TOKEN_SECRET,
    signOptions: {
      expiresIn: '30d', // 15m
    },
  },
  refreshToken: {
    privateKey: REFRESH_TOKEN_SECRET,
    signOptions: {
      expiresIn: '7d', // 7d
    },
  },
};

/**
 * Returns token.
 *
 * @remarks
 * This method is part of the {@link auth/jwt}.
 *
 * @param user - 1st input
 * @param type - 2nd input
 *
 * @returns The access token mean of `user`
 *
 * @beta
 */
export const generateToken = async (
  user: UserEntity,
  type: TokenType,
): Promise<string> => {
  return await sign(
    {
      _id: user._id,
    },
    common[type].privateKey,
    {
      issuer: ISSUER,
      subject: user.username,
      audience: AUDIENCE,
      algorithm: 'HS256',
      expiresIn: common[type].signOptions.expiresIn, // 15m
    },
  );
};

/**
 * Returns user by verify token.
 *
 * @remarks
 * This method is part of the {@link auth/jwt}.
 *
 * @param token - 1st input
 * @param type - 2nd input
 *
 * @returns The user mean of `token`
 *
 * @beta
 */
export const verifyToken = async (
  token: string,
  type: TokenType,
): Promise<UserEntity> => {
  let currentUser;

  await verify(token, common[type].privateKey, async (err, data) => {
    if (err) {
      throw new AuthenticationError(
        'Authentication token is invalid, please try again.',
      );
    }

    const { _id } = data;

    currentUser = await getMongoRepository(UserEntity).findOne({
      _id,
    });
  });

  return currentUser;
};

/**
 * Returns login response by trade token.
 *
 * @remarks
 * This method is part of the {@link auth/jwt}.
 *
 * @param user - 1st input
 *
 * @returns The login response mean of `user`
 *
 * @beta
 */
export const tradeToken = async (user: UserEntity): Promise<LoginResponse> => {
  const accessToken = await generateToken(user, 'accessToken');
  const refreshToken = await generateToken(user, 'refreshToken');

  return { accessToken, refreshToken };
};
