import { db } from '@libs/database/mysqldb.connection';
import { now } from '@libs/time-helper';

export async function revokeRefreshToken(userId: number): Promise<void> {
  const revokeRefreshTokenQuery: string = `UPDATE refresh_tokens SET revoked = true, revokedAt = ${now()} WHERE user_id = ?;`;
  await db.execute(revokeRefreshTokenQuery, [userId]);
}
