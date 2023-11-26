import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import { JwtPayload } from 'jsonwebtoken';

import { db } from '@libs/mysqldb.connection';
import { HttpStatus } from '@libs/status-code.type';
import { decodeJwtFromHeader } from '@functions/auth/handlers/helpers/access-token-validator';
import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { now } from '@libs/time-helper';

import { issueUserAccessToken } from './helpers/access-token-issuer';

interface RefreshTokenWrapper {
  user_id: number;
  token: string;
  expiresIn: number;
  issuedAt: number;
  revoked: boolean;
  revokedAt: number;
}

interface CustomJwtPayload {
  email: string;
  roles: string[];
  iat: number;
  exp: number;
  iss: string;
}

export const refresh: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
  const clientSentRefreshToken = getClientSentRefreshToken(event.headers);

  let jwt: JwtPayload & CustomJwtPayload;
  try {
    const { decoded } = decodeJwtFromHeader(event.headers);
    if (typeof decoded.payload === 'string') {
      console.error('something went wrong with payload type');
      return internalServerError();
    }
    jwt = decoded.payload as JwtPayload & CustomJwtPayload;
  } catch (error) {
    return invalidCredentials();
  }

  // 2. find refresh token reference in DB
  const storedRefreshTokenWrapper: RefreshTokenWrapper = await getRefreshTokenFromStore(jwt.email);

  // 3. User submitted refresh token & token at server match
  if (storedRefreshTokenWrapper.token !== clientSentRefreshToken) {
    await revokeRefreshToken(storedRefreshTokenWrapper.user_id);
    return sessionRevokedResponse();
  }

  if (storedRefreshTokenWrapper.revoked) {
    return sessionRevokedResponse();
  }

  if (storedRefreshTokenWrapper.expiresIn < now()) {
    return sessionExpiredResponse();
  }

  const { email, id, roles } = jwt;
  const updatedAccessToken = await issueUserAccessToken({ email, id, roles })
  return formatJSONResponse({
    message: 'Access token refreshed',
    access_token: updatedAccessToken,
  }, HttpStatus.OK);
}

function getClientSentRefreshToken(headers: APIGatewayProxyEventHeaders) {
  return headers['Refresh-Token'] ?? '';
}

function sessionRevokedResponse() {
  return formatJSONResponse({
    error: { message: 'Login session revoked. Login again.' }
  }, HttpStatus.Unauthorized);
}

function sessionExpiredResponse() {
  return formatJSONResponse({
    error: { message: 'Login session expired. Login again.' }
  }, HttpStatus.Unauthorized);
}

function internalServerError() {
  return formatJSONResponse({
    message: 'Something went wrong. Try again' },
    HttpStatus.InternalServerError);
}

function invalidCredentials() {
  return formatJSONResponse({
    error: { message: 'Invalid credentials.' },
    httpStatus: HttpStatus.Conflict,
  })
}
async function getRefreshTokenFromStore(email: string): Promise<RefreshTokenWrapper> {
  const findRefreshTokenQuery: string = `SELECT user_id, token, expiresIn, issuedAt, revoked, revokedAt FROM refresh_tokens rt WHERE  
                                                EXISTS (SELECT * FROM users u WHERE u.id = rt.user_id AND u.email = ?)`;
  return await db.getrow<RefreshTokenWrapper>(findRefreshTokenQuery, [email]);
}

async function revokeRefreshToken(userId: number): Promise<void> {
  const revokeRefreshTokenQuery: string = `UPDATE refresh_tokens SET revoked = true, revokedAt = ${now()} WHERE user_id = ?;`;
  await db.execute(revokeRefreshTokenQuery, [userId]);
}
