import { db } from '@libs/mysqldb.connection';
import { now } from '@libs/time-helper';
import { generateRandomString } from '@libs/random-string-generator';

export const generateAndStoreRefreshTokenForUserId = async (userId: number): Promise<{
  refreshToken: string;
  expiresIn: number;
  error?: any;
}> => {
  const refreshToken = generateRandomString(127);
  const expiresInSeconds = 60 * 60 * 24 * (+process.env.REFRESH_TOKEN_LIFETIME_IN_DAYS || 1);
  const expiresIn = now() + expiresInSeconds;

  const saved = await db.transaction(async (_db) => {
    // 1. See if record already exists.
    const existsRefreshTokenQuery = 'SELECT COUNT(*) FROM refresh_tokens WHERE user_id = ?';
    return _db.getrow<any>(existsRefreshTokenQuery, [userId]).then((existsRefreshTokenQueryRes) => {
      const existsRefreshTokenInDb = +existsRefreshTokenQueryRes?.['count(*)'];

      if (existsRefreshTokenInDb === 0) {
        // 2. If not exists, simply insert.
        const insertRefreshTokenQuery: string = 'INSERT INTO refresh_tokens (user_id, token, expiresIn, issuedAt, invalidated) values(?, ?, ?, ?, ?)';
        return _db.insert(insertRefreshTokenQuery, [userId, refreshToken, expiresIn, now(), false]);
      } else {
        // 3. If exists, update row.
        const updateRefreshTokenQuery: string = 'UPDATE refresh_tokens SET token = ?, expiresIn = ?, issuedAt = ?, invalidated = ? WHERE user_id = ?';
        return _db.update(updateRefreshTokenQuery, [refreshToken, expiresIn, now(), false, userId]);
      }
    }).then((affectedRows) => {
      return affectedRows > 0;
    }).catch((err) => {
      console.error(err);
    });
  });

  return saved
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
