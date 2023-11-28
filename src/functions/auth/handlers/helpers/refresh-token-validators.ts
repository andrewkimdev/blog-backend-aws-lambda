import { now } from '@libs/time-helper';
import { formatJSONResponse } from '@libs/api-gateway';
import { HttpStatus } from '@libs/status-code.type';
import { db } from '@libs/mysqldb.connection';

interface RefreshTokenWrapper {
  user_id: number;
  token: string;
  expiresIn: number;
  issuedAt: number;
  revoked: boolean;
  revokedAt: number;
}

export async function validateRefreshToken(clientSentRefreshToken: string, email: string) {
  // Find refresh token reference in DB
  const storedRefreshTokenWrapper: RefreshTokenWrapper = await getRefreshTokenFromStore(email);
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
  return null;
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

async function getRefreshTokenFromStore(email: string): Promise<RefreshTokenWrapper> {
  const findRefreshTokenQuery: string = `SELECT user_id, token, expiresIn, issuedAt, revoked, revokedAt FROM refresh_tokens rt WHERE  
                                                EXISTS (SELECT * FROM users u WHERE u.id = rt.user_id AND u.email = ?)`;
  return await db.getrow<RefreshTokenWrapper>(findRefreshTokenQuery, [email]);
}

async function revokeRefreshToken(userId: number): Promise<void> {
  const revokeRefreshTokenQuery: string = `UPDATE refresh_tokens SET revoked = true, revokedAt = ${now()} WHERE user_id = ?;`;
  await db.execute(revokeRefreshTokenQuery, [userId]);
}
