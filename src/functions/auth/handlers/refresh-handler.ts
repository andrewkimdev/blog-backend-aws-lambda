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

  // 3. Verify if login_token_id  matches in DB.
  const tokenKey = getClientSentRefreshTokenKey(event.headers);
  const canRefreshToken = await isRefreshTokenCredentialsValid(loginTokenId, tokenKey);
  if (!canRefreshToken) {
    return formatJSONResponse({ message: 'Invalid credentials. Login again' }, HttpStatus.Unauthorized);
  }

  // 4. Re-issue access token
  const updatedAccessToken = await issueUserAccessToken({ userId, loginTokenId })
  return formatJSONResponse({
    message: 'Access token refreshed',
    access_token: updatedAccessToken,
  }, HttpStatus.OK);
}

async function isRefreshTokenCredentialsValid(loginTokenId: string, tokenKey: string): Promise<boolean> {
  const query: string = `SELECT rt.user_id 
                          FROM refresh_tokens rt
                          INNER JOIN user_one_time_id uot ON rt.user_id = uot.user_id
                          WHERE rt.token = ? 
                          AND rt.revoked = false 
                          AND rt.expiresIn > UNIX_TIMESTAMP()
                          AND uot.login_token_id = ?`;
  try {
    const result = await db.getval<number>(query, [tokenKey, loginTokenId]);
    console.log(result);
    return result > 0;
  } catch (error) {
    console.error(error);
    throw new ApiError('Error querying refresh token key', HttpStatus.InternalServerError);
  }
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
