import { db } from '@libs/database/mysqldb.connection';
import { now } from '@libs/time-helper';

/**
 * This function revokes all refresh tokens for a specific user in the database by setting the 'revoked' field to true.
 *
 * @param {number} userId - The ID of the user for whom the refresh token will be revoked.
 * @return {Promise<void>} A promise that resolves when the refresh tokens are successfully revoked.
 *
 * @async
 * @function revokeRefreshToken
 * @throws {Error} Will throw an error if the database query fails.
 */
export async function revokeRefreshToken(userId: number): Promise<void> {
  const revokeRefreshTokenQuery: string = `UPDATE refresh_tokens SET revoked = true, revokedAt = ${now()} WHERE user_id = ?;`;

  try {
    await db.execute(revokeRefreshTokenQuery, [userId]);
  } catch (error) {
    console.error("Error while revoking refresh token: ", error);
    throw error;
  }
}
