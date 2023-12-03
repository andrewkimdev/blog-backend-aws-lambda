import { ApiError } from '@libs/api-error';
import { db } from '@libs/database/mysqldb.connection';
import { HttpStatus } from '@libs/status-code.type';
import { now } from '@libs/time-helper';
import { sign } from 'jsonwebtoken';
import { generateRandomString } from './random-string-generator';

export interface RefreshTokenRecord {
  refreshToken: {
    key: string;
    value: string;
  }
}

export const generateAndStoreRefreshTokenForUserId = async (userId: number, uid: string): Promise<RefreshTokenRecord> => {
  const refreshTokenId = generateRandomString(127);
  const expiresIn = getExpiresInTimestamp();
  const upsertRefreshTokenQuery: string = getUpsertQueryString();
  const refreshTokenValue = createRefreshTokenValue({ uid, expiresIn });

  let affectedRows = 0;
  let success = false;
  try {
    affectedRows = await db.update(upsertRefreshTokenQuery, [userId, refreshTokenId, expiresIn, now(), false, 0]);
    success = affectedRows > 0;
  } catch (error) {
    const message = 'Error upserting refresh token: ' + error;
    console.error(message);
    throw new ApiError(message, HttpStatus.InternalServerError);
  }
  if (success) {
    return {
      refreshToken: {
        key: refreshTokenId,
        value: refreshTokenValue
      }
    };
  } else {
    throw new ApiError('Error generating refresh token', HttpStatus.InternalServerError);
  }
}

export function createRefreshTokenValue(input: { expiresIn: number, uid: string }) {
  const { JWT_REFRESH_TOKEN_SECRET, JWT_ISSUER } = process.env;

  const { expiresIn, uid } = input;

  // Turn into a jwt string
  return sign({}, JWT_REFRESH_TOKEN_SECRET, {
    expiresIn,
    issuer: JWT_ISSUER,
    subject: uid,
  });
}

function getExpiresInTimestamp(): number {
  const expiresInSeconds = 60 * 60 * 24 * (+process.env.REFRESH_TOKEN_LIFETIME_IN_DAYS || 1);
  return now() + expiresInSeconds;
}

function getUpsertQueryString(): string {
  return `INSERT INTO refresh_tokens (user_id, token, expiresIn, issuedAt, revoked, revokedAt)
                                                VALUES (?, ?, ?, ?, ?, ?)
                                                ON DUPLICATE KEY UPDATE
                                                token = VALUES(token),
                                                expiresIn = VALUES(expiresIn),
                                                issuedAt = VALUES(issuedAt),
                                                revoked = VALUES(revoked),
                                                revokedAt = VALUES(revokedAt)`;
}
