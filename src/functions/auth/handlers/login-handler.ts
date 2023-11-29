import { generateAndStoreRefreshTokenForUserId } from '@functions/auth/handlers/helpers/refresh-token/refresh-token-generator';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';

import { HttpStatus } from '@libs/status-code.type';

import { issueUserAccessToken } from '@functions/auth/handlers/helpers';
import { validateUserLoginCredentials } from './helpers/login-credential-validator';


export const login: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
  const body: { email: string; password: string } = JSON.parse(event.body as string);
  const { email, password } = body;

  // 1. Verify user login credential.
  const { user, error: loginError } = await validateUserLoginCredentials(email, password);
  if (loginError) {
    return loginError;
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
