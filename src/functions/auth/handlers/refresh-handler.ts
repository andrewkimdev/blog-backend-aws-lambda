import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';

import { HttpStatus } from '@libs/status-code.type';

import * as jwt from 'jsonwebtoken';
import { db } from '@libs/mysqldb.connection';

export const refresh: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
  const clientSentRefreshToken = event.headers['Refresh-Token'] ?? '';
  const accessToken = event.headers['Authorization'].split(' ')[1];

  const { JWT_PRIVATE_SECRET } = process.env;

  let verified: any;

  // 1. Validate jwt
  try {
    verified = jwt.verify(accessToken, JWT_PRIVATE_SECRET, { complete: true });
  } catch (error) {
    console.error(error);
    return formatJSONResponse({
      error: { message: 'Invalid credentials.' },
    }, HttpStatus.Conflict)
  }

  const accessTokenDecoded: { email: string; roles: string[]; iat: number; exp: number; iss: string; } = verified.payload;

  // 2. find refresh token reference in DB
  const findRefreshTokenQuery: string = `SELECT rt.token, rt.expiresIn, rt.invalidated FROM refresh_tokens rt
         JOIN users u ON u.id = rt.user_id WHERE u.email = ?;`
  const refreshTokenWrapper = await db.getrow(findRefreshTokenQuery, [accessTokenDecoded.email]);

  // 3. User submitted refresh token & token at server match
  if (refreshTokenWrapper.token === clientSentRefreshToken) {
    // todo: Issue another access token to user.
  } else {
    // todo: Revoke current refresh token at server, force user to login.
  }

  return formatJSONResponse({
    message: 'refresh tokens match',
    accessTokenDecoded,
    clientSentRefreshToken,
    refreshToken: refreshTokenWrapper.token,
    refreshTokenWrapper,
    match: clientSentRefreshToken.trim() === ('' + refreshTokenWrapper.token).trim(),
  }, HttpStatus.OK);
}
