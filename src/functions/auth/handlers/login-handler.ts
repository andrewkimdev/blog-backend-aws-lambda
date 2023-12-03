import { getLoginTokenId } from '@functions/auth/handlers/helpers/refresh-token/login-token-id';

import { UserAuth } from '@functions/auth/handlers/types';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { HttpStatus } from '@libs/status-code.type';
import { APIGatewayProxyResult } from 'aws-lambda';

import {
  createRefreshToken,
  issueUserAccessToken,
  RefreshTokenRecord,
  validateUserLoginCredentials,
} from './helpers';

export const login: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event): Promise<APIGatewayProxyResult> => {
  const body: { email: string; password: string } = JSON.parse(event.body as string);
  const { email, password } = body;

  // 1. Verify user login credential.
  const user: UserAuth = await validateUserLoginCredentials(email, password);

  // 2. Create LoginTokenId
  const loginTokenId = await getLoginTokenId(user.id);

  // 3. Get signed jwt to user
  const accessToken: string = await issueUserAccessToken({ userId: user.id, loginTokenId });

  // 4. Get refresh token and store in DB.
  const refreshTokenRecord: RefreshTokenRecord = await createRefreshToken(user.id, loginTokenId);

  return formatJSONResponse({
    message: 'Login success!',
    access_token: accessToken,
    refresh_token: refreshTokenRecord,
  }, HttpStatus.OK);
};
