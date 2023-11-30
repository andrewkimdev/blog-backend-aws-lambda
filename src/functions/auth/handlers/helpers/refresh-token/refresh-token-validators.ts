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

/**
 * This function validates a refresh token sent by the client.
 * @param {string} clientSentRefreshToken - The refresh token sent by the user's client.
 * @param {string} email - The user's email
 * @return {Promise<APIGatewayProxyResult|null>} A JSON response where necessary or null if validation is successful.
 * @throws {Error} An error could be thrown in case of underlying function failure
 *
 * @async
 * @function validateRefreshToken
 */
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

/**
 * Refresh Token Revoked Response
 *
 * This method generates a JSON response indicating that the login session has been revoked and the user needs to login again.
 *
 * @returns {APIGatewayProxyResult} The response object containing the error message and HTTP status code.
 */
function refreshTokenRevokedResponse(): APIGatewayProxyResult {
  return formatJSONResponse({
    error: { message: 'Login session revoked. Login again.' }
  }, HttpStatus.Unauthorized);
}

/**
 * This fetches the refresh token record associated to a user from the database.
 * @param {string} email - The user's email.
 * @return {Promise<RefreshTokenRecord>} A Promise that resolves to the refresh token record of the user.
 * @throws {Error} An error could be thrown if the retrieval of the record from the database fails.
 *
 * @async
 * @function getRefreshTokenFromStore
 */
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
