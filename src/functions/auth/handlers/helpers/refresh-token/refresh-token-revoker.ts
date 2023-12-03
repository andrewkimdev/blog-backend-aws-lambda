import { db } from '@libs/database/mysqldb.connection';
import { now } from '@libs/time-helper';

export async function revokeRefreshToken(userId: number): Promise<void> {
  const revokeRefreshTokenQuery: string = `UPDATE refresh_tokens SET revoked = true, revokedAt = ${now()} WHERE user_id = ?`;
  try {
    await db.update(revokeRefreshTokenQuery, [userId]);
  } catch (error) {
    console.error('Error while revoking refresh token: ', error);
    throw error;
  }
}
