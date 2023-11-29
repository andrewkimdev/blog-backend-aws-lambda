import { db } from '@libs/database/mysqldb.connection';
import { now } from '@libs/time-helper';
import { generateRandomString } from './random-string-generator';

export const generateAndStoreRefreshTokenForUserId = async (userId: number): Promise<{
  refreshToken: string;
  expiresIn: number;
  error?: any;
}> => {
  const refreshToken = generateRandomString(127);
  const expiresInSeconds = 60 * 60 * 24 * (+process.env.REFRESH_TOKEN_LIFETIME_IN_DAYS || 1);
  const expiresIn = now() + expiresInSeconds;
  const upsertRefreshTokenQuery: string = `INSERT INTO refresh_tokens (user_id, token, expiresIn, issuedAt, revoked, revokedAt) 
                                                VALUES (?, ?, ?, ?, ?, ?)
                                                ON DUPLICATE KEY UPDATE 
                                                token = VALUES(token), 
                                                expiresIn = VALUES(expiresIn), 
                                                issuedAt = VALUES(issuedAt), 
                                                revoked = VALUES(revoked),
                                                revokedAt = VALUES(revokedAt)`
  const { affectedRows } = await db.query(upsertRefreshTokenQuery, [userId, refreshToken, expiresIn, now(), false, 0]);

  return affectedRows > 0
    ? {
      refreshToken,
      expiresIn,
      error: null,
    }
    : {
      refreshToken: null,
      expiresIn: null,
      error: { message: 'Error in generating refresh token' },
    };
}
