import * as dotenv from 'dotenv';
dotenv.config();

// environment
const NODE_ENV: string = process.env.NODE_ENV || 'development';

// author
const AUTHOR: string = process.env.AUTHOR || 'Chnirt';

// application
const PRIMARY_COLOR: string = process.env.PRIMARY_COLOR || '#87e8de';
const DOMAIN: string = process.env.DOMAIN || 'localhost';
const PORT: number = +process.env.PORT || 3000;
const END_POINT: string = process.env.END_POINT || 'graphql';
const VOYAGER: string = process.env.VOYAGER || 'voyager';
const FE_URL: string = process.env.FE_URL || 'xxx';
const RATE_LIMIT_MAX: number = +process.env.RATE_LIMIT_MAX || 10000;
const GRAPHQL_DEPTH_LIMIT: number = +process.env.GRAPHQL_DEPTH_LIMIT || 3;

// mlab
const MLAB_USER = process.env.MLAB_USER || 'admin';
const MLAB_PASS = process.env.MLAB_PASS || 'chnirt1803';
const MLAB_HOST = process.env.MLAB_HOST || 'ds045017.mlab.com';
const MLAB_PORT = +process.env.MLAB_PORT || 45017;
const MLAB_DATABASE = process.env.MLAB_DATABASE || 'nestjsv7';
const MLAB_URL =
  process.env.MLAB_URL ||
  `mongodb://${MLAB_USER}:${MLAB_PASS}@${MLAB_HOST}:${MLAB_PORT}/${MLAB_DATABASE}`;

// typeorm
const enviroment = {
  development: {
    url: MLAB_URL,
  },
  testing: {
    url: MLAB_URL,
  },
  staging: {
    url: MLAB_URL,
    // host: 'localhost',
    // port: MONGO_PORT!,
    // username: '',
    // password: '',
    // database: MONGO_DB!,
  },
  production: {
    url: MLAB_URL,
  },
};
const TYPEORM = enviroment[NODE_ENV];

// jsonwebtoken
const ISSUER: string = process.env.ISSUER || 'Chnirt corp';
const AUDIENCE: string = process.env.AUDIENCE || 'http://chnirt.github.io';
const ACCESS_TOKEN: string = process.env.ACCESS_TOKEN || 'access-token';
const ACCESS_TOKEN_SECRET: string =
  process.env.ACCESS_TOKEN_SECRET || 'access-token-key';
const REFRESH_TOKEN: string = process.env.REFRESH_TOKEN || 'refresh-token';
const REFRESH_TOKEN_SECRET: string =
  process.env.REFRESH_TOKEN_SECRET || 'refresh-token-key';

// bcrypt
const BCRYPT_SALT: number = +process.env.BCRYPT_SALT || 10;

export {
  NODE_ENV,
  AUTHOR,
  PRIMARY_COLOR,
  DOMAIN,
  PORT,
  END_POINT,
  VOYAGER,
  FE_URL,
  RATE_LIMIT_MAX,
  GRAPHQL_DEPTH_LIMIT,
  TYPEORM,
  ISSUER,
  AUDIENCE,
  ACCESS_TOKEN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN,
  REFRESH_TOKEN_SECRET,
  BCRYPT_SALT,
};
