import { randomUUID } from 'crypto';
import { db } from '@libs/database/mysqldb.connection';
import { APIGatewayProxyResult } from 'aws-lambda';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { UserAuth } from '@functions/auth/handlers/types';

import { HttpStatus } from '@libs/status-code.type';

import {
  generateAndStoreRefreshTokenForUserId,
  issueUserAccessToken,
  RefreshTokenRecord,
  validateUserLoginCredentials,
} from './helpers';


export const login: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event): Promise<APIGatewayProxyResult> => {
  const body: { email: string; password: string } = JSON.parse(event.body as string);
  const { email, password } = body;

  // 1. Verify user login credential.
  let user: UserAuth;
  try {
    const res = await validateUserLoginCredentials(email, password);
    user = res.user;
  } catch (error) {
    return error;
  }

  // 2. Create uid
  const uid = randomUUID().toString();
  const uidInsertQuery: string = `INSERT INTO user_one_time_id (user_id, uid) VALUES (?, ?)
                                          ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), uid = VALUES(uid)`;
  try {
    await db.insert(uidInsertQuery, [user.id, uid]);
  } catch (error) {
    console.error('ERROR Saving one-time user-id to database');
    return error;
  }
  // 2. Get signed jwt to user
  const accessToken: string = await issueUserAccessToken(user, uid);

  // 3. Get refresh token and store in DB.
  const res: RefreshTokenRecord = await generateAndStoreRefreshTokenForUserId(user.id, uid);
  if (res.error) {
    console.error(res.error);
    return formatJSONResponse({
      error: 'Internal server error',
    }, HttpStatus.InternalServerError)
  }

  return formatJSONResponse({
    message: 'Login success!',
    access_token: accessToken,
    refresh_token: {
      ...res.refreshToken,
    },
  }, HttpStatus.OK);
};
