import { db } from '@libs/database/mysqldb.connection';
import { formatJSONResponse } from '@libs/api-gateway';
import { now } from '@libs/time-helper';
import { HttpStatus } from '@libs/status-code.type';
import { internalServerErrorResponse, sessionExpiredResponse } from '@libs/responses';

import { revokeRefreshToken } from './refresh-token-revoker';
import { APIGatewayProxyResult } from 'aws-lambda';

interface RefreshTokenRecord {
  user_id: number;
  token: string;
  expiresIn: number;
  issuedAt: number;
  revoked: boolean;
  revokedAt: number;
}

export const validateRefreshToken = async (clientSentRefreshToken: string, email: string): Promise<APIGatewayProxyResult|null> => {
  // Find refresh token reference in DB
  try {
    const { user_id, token, revoked, expiresIn }: RefreshTokenRecord = await getRefreshTokenFromStore(email);
    if (token !== clientSentRefreshToken) {
      await revokeRefreshToken(user_id);
      return refreshTokenRevokedResponse();
    }
    if (revoked) {
      return refreshTokenRevokedResponse();
    }
    if (expiresIn < now()) {
      return sessionExpiredResponse();
    }
    return null;
  } catch (error) {
    console.error ('Something went wrong: ' + error);
    return internalServerErrorResponse();
  }
}

function refreshTokenRevokedResponse(): APIGatewayProxyResult {
  return formatJSONResponse({
    error: { message: 'Login session revoked. Login again.' }
  }, HttpStatus.Unauthorized);
}

async function getRefreshTokenFromStore(email: string): Promise<RefreshTokenRecord> {
  try {
    const findRefreshTokenQuery: string = `SELECT user_id, token, expiresIn, issuedAt, revoked, revokedAt FROM refresh_tokens rt WHERE  
                                                  EXISTS (SELECT * FROM users u WHERE u.id = rt.user_id AND u.email = ?)`;
    return await db.getrow<RefreshTokenRecord>(findRefreshTokenQuery, [email]);
  } catch (error) {
    console.error('[ERROR retrieving refresh token from store] ' + error);
    // 사용자에게 직접 이것이 가는지?
    throw new Error('Something went wrong. Login again.');
  }
}
