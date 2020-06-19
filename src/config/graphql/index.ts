import { Injectable, Logger } from '@nestjs/common';
import { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql';
import { AuthenticationError } from 'apollo-server-core';
import { MemcachedCache } from 'apollo-server-cache-memcached';
import { GraphQLError } from 'graphql';
import { GraphQLResponse } from 'apollo-server-types';
import { PubSub } from 'graphql-subscriptions';
import * as depthLimit from 'graphql-depth-limit';
import * as chalk from 'chalk';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import { MockList } from 'apollo-server-express';
import {
  NODE_ENV,
  END_POINT,
  FE_URL,
  ACCESS_TOKEN,
  GRAPHQL_DEPTH_LIMIT,
  PRIMARY_COLOR,
} from '../../environments';
import schemaDirectives from './schemaDirectives';
import { verifyToken } from '../../auth';

const pubSub = new PubSub();

@Injectable()
export class GraphqlService implements GqlOptionsFactory {
  async createGqlOptions(): Promise<GqlModuleOptions> {
    return {
      typePaths: ['./**/*.(gql|graphql)'],
      resolvers: {
        JSON: GraphQLJSON,
        JSONObject: GraphQLJSONObject,
      },
      mocks: NODE_ENV === 'testing' && {
        String: (): string => 'Chnirt',
        Query: (): any => ({
          users: (): any => new MockList([2, 6]),
        }),
      },
      resolverValidationOptions: {
        requireResolversForResolveType: false,
      },
      path: `/${END_POINT}`,
      cors:
        NODE_ENV === 'production'
          ? {
              origin: FE_URL,
              credentials: true, // <-- REQUIRED backend setting
            }
          : true,
      bodyParserConfig: { limit: '50mb' },
      onHealthCheck: (): Promise<any> => {
        return new Promise((resolve, reject) => {
          // Replace the `true` in this conditional with more specific checks!
          if (true) {
            resolve();
          } else {
            reject();
          }
        });
      },
      schemaDirectives,
      validationRules: [
        depthLimit(
          GRAPHQL_DEPTH_LIMIT,
          { ignore: [/_trusted$/, 'idontcare'] },
          depths => {
            if (depths[''] === GRAPHQL_DEPTH_LIMIT - 1) {
              Logger.warn(
                `⚠️  You can only descend ${chalk
                  .hex(PRIMARY_COLOR)
                  .bold(GRAPHQL_DEPTH_LIMIT)} levels.`,
                'GraphQL',
                false,
              );
            }
          },
        ),
      ],
      introspection: true,
      playground: NODE_ENV !== 'production' && {
        settings: {
          'editor.cursorShape': 'underline', // possible values: 'line', 'block', 'underline'
          'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
          'editor.fontSize': 14,
          'editor.reuseHeaders': true, // new tab reuses headers from last tab
          'editor.theme': 'dark', // possible values: 'dark', 'light'
          'general.betaUpdates': true,
          'queryPlan.hideQueryPlanResponse': false,
          'request.credentials': 'include', // possible values: 'omit', 'include', 'same-origin'
          'tracing.hideTracingResponse': false,
        },
        // tabs: [
        //   {
        //     name: 'default',
        //     endpoint: END_POINT,
        //     query: { hello },
        //   },
        // ],
      },
      tracing: NODE_ENV === 'development',
      cacheControl: NODE_ENV === 'production' && {
        defaultMaxAge: 5,
        stripFormattedExtensions: false,
        calculateHttpHeaders: false,
      },
      context: async ({ req, res, connection }): Promise<any> => {
        let currentUser;

        if (connection) {
          currentUser = connection.context.currentUser;
        } else {
          const token = req.headers[ACCESS_TOKEN] || '';

          if (token) {
            currentUser = await verifyToken(token, 'accessToken');
          }
        }

        return {
          req,
          res,
          pubSub,
          currentUser,
        };
      },
      formatError: (error: GraphQLError): any => ({
        message: error.message,
        code: error.extensions && error.extensions.code,
        locations: error.locations,
        path: error.path,
      }),
      formatResponse: (response: GraphQLResponse): any => response,
      subscriptions: {
        path: `/${END_POINT}`,
        keepAlive: 1000,
        onConnect: async (connectionParams: unknown): Promise<any> => {
          NODE_ENV !== 'production' &&
            Logger.debug(`🔗  Connected to websocket`, 'GraphQL');

          const token = connectionParams[ACCESS_TOKEN];

          if (token) {
            const currentUser = await verifyToken(token, 'accessToken');

            if (!currentUser) {
              throw new AuthenticationError(
                'Authentication token is invalid, please try again.',
              );
            }

            return { currentUser };
          }

          throw new AuthenticationError(
            'Authentication token is invalid, please try again.',
          );
        },
        onDisconnect: (): any => {
          NODE_ENV !== 'production' &&
            Logger.error('❌  Disconnected to websocket', '', 'GraphQL', false);
        },
      },
      persistedQueries: {
        cache: new MemcachedCache(
          ['memcached-server-1', 'memcached-server-2', 'memcached-server-3'],
          { retries: 10, retry: 10000 }, // Options
        ),
      },
      installSubscriptionHandlers: true,
      uploads: {
        maxFieldSize: 2, // 1mb
        maxFileSize: 20, // 20mb
        maxFiles: 5,
      },
    };
  }
}
