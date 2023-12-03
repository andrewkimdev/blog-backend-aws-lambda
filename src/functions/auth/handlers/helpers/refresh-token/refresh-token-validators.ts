import { formatJSONResponse } from '@libs/api-gateway';
import { db } from '@libs/database/mysqldb.connection';
import { internalServerErrorResponse, sessionExpiredResponse } from '@libs/responses';
import { HttpStatus } from '@libs/status-code.type';
import { now } from '@libs/time-helper';
import { APIGatewayProxyResult } from 'aws-lambda';

import { revokeRefreshToken } from './refresh-token-revoker';

interface RefreshTokenRecord {
  user_id: number;
  token: string;
  expiresIn: number;
  issuedAt: number;
  revoked: boolean;
  revokedAt: number;
}

export const validateRefreshToken = async (clientSentRefreshToken: string, email: string): Promise<APIGatewayProxyResult | null> => {
  // Find refresh token reference in DB
  try {
    const res: RefreshTokenRecord | null = await getRefreshTokenFromStore(email);
    if (!res) {
      return formatJSONResponse({}, HttpStatus.NoContent);
    }
    const { user_id, token, revoked, expiresIn } = res;
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
    console.error('Something went wrong: ' + error);
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
                                                  EXISTS (SELECT * FROM users u WHERE u.id = rt.user_id AND u.email = ?)
                                                  AND rt.revoked = false`;
    return await db.getrow<RefreshTokenRecord>(findRefreshTokenQuery, [email]);
  } catch (error) {
    console.error('[ERROR retrieving refresh token from store] ' + error);
    // 사용자에게 직접 이것이 가는지?
    throw new Error('Something went wrong. Login again.');
  }
}
