import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';

import { HttpStatus } from '@libs/status-code.type';

import {
  generateAndStoreRefreshTokenForUserId,
  issueUserAccessToken, UserAuth,
  validateUserLoginCredentials,
} from './helpers';
import { APIGatewayProxyResult } from 'aws-lambda';


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

  // 2. Get signed jwt to user
  const accessToken: string = await issueUserAccessToken(user);

  // 3. Get refresh token and store in DB.
  const res = await generateAndStoreRefreshTokenForUserId(user.id);
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
      token: res.refreshToken,
      expiresIn: res.expiresIn,
    },
  }, HttpStatus.OK);
};
