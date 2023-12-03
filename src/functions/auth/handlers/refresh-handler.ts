import { getUserIdWithLoginTokenId } from '@functions/auth/handlers/helpers/refresh-token/login-token-id';
import { ApiError } from '@libs/api-error';
import { db } from '@libs/database/mysqldb.connection';
import { verify } from 'jsonwebtoken';
import { APIGatewayProxyEventHeaders, APIGatewayProxyResult } from 'aws-lambda';

import { HttpStatus } from '@libs/status-code.type';
import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import * as process from 'process';

import { issueUserAccessToken } from './helpers';

export const refresh: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event): Promise<APIGatewayProxyResult> => {
  // 1. Validate user-sent refresh token
  const tokenValue = getClientSentRefreshTokenValue(event.headers);

  // 2. Decode JWT.
  const { loginTokenId, userId } = await decodeRefreshJwt(tokenValue);

  // 3. Verify if uid matches in DB.
  const tokenKey = getClientSentRefreshTokenKey(event.headers);
  await existsRefreshTokenKeyInDb(tokenKey);

  // 4. Re-issue access token
  const updatedAccessToken = await issueUserAccessToken({ userId, loginTokenId })
  return formatJSONResponse({
    message: 'Access token refreshed',
    access_token: updatedAccessToken,
  }, HttpStatus.OK);
}

export async function decodeRefreshJwt(token: string) {
  const decoded = verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
  const loginTokenId = decoded?.sub as string;
  const userId = await getUserIdWithLoginTokenId(loginTokenId);
  return { loginTokenId, userId };
}

export function getClientSentRefreshTokenValue(headers: APIGatewayProxyEventHeaders): string {
  const res = headers['Refresh-Token-Value'];
  if (!res) {
    throw new ApiError('Refresh-Token-Value missing', HttpStatus.InternalServerError);
  }
  return res;
}
function getClientSentRefreshTokenKey(headers: APIGatewayProxyEventHeaders): string {
  const res = headers['Refresh-Token-Key'];
  if (!res) {
    throw new ApiError('Refresh-Token-Key missing', HttpStatus.BadRequest);
  }
  return res;
}

async function existsRefreshTokenKeyInDb(tokenKey: string): Promise<boolean> {
  const query: string = 'SELECT user_id FROM user_one_time_id WHERE login_token_id = ?';

  try {
    const result = await db.getval<number>(query, [tokenKey]);
    return result > 0;
  } catch (error) {
    console.error(error);
    throw new ApiError('Error querying refresh token key', HttpStatus.InternalServerError);
  }
}
