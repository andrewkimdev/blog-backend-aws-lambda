import { sign } from 'jsonwebtoken';
import { db } from '@libs/database/mysqldb.connection';
import { now } from '@libs/time-helper';
import { generateRandomString } from './random-string-generator';

export interface RefreshTokenRecord {
  refreshToken: {
    key: string;
    value: string;
  }
  error?: any;
}

export const generateAndStoreRefreshTokenForUserId = async (userId: number, uid: string): Promise<RefreshTokenRecord> => {
  const refreshTokenId = generateRandomString(127);
  const expiresIn = getExpiresInTimestamp();
  const upsertRefreshTokenQuery: string = getUpsertQueryString();
  const refreshTokenValue = createRefreshTokenValue({ uid, expiresIn });

  try {
    const { affectedRows } = await db.query(upsertRefreshTokenQuery, [userId, refreshTokenId, expiresIn, now(), false, 0]);
    return affectedRows > 0
      ? {
        refreshToken: {
          key: refreshTokenId,
          value: refreshTokenValue
        },
        error: null,
      }
      : {
        refreshToken: null,
        error: { message: 'Error in generating refresh token' },
      };
  } catch (error) {
    console.error('Error while upserting refresh token: ', error);
    return {
      refreshToken: null,
      error,
    };
  }
}

export function createRefreshTokenValue(input: { expiresIn: number, uid: string }) {
  const { JWT_REFRESH_TOKEN_SECRET, JWT_ISSUER } = process.env;

  const { expiresIn, uid } = input;

  const payload = {
    uid,
  }

  // Turn into a jwt string
  return sign(payload, JWT_REFRESH_TOKEN_SECRET, {
    expiresIn,
    issuer: JWT_ISSUER,
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
