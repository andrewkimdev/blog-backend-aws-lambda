import * as jwt from 'jsonwebtoken';
import { db } from '@libs/database/mysqldb.connection';
import { UserAuth } from '@functions/auth/handlers/types';

/**
 * This function issues a JWT token for a user
 * @param {object} user - A user object
 * @return {Promise<string>} A promise that resolves into a JWT token
 */
export const issueUserAccessToken = async (user: Omit<UserAuth, "password">): Promise<string> => {
  const userRoleLookupQuery: string = 'SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?'

  let userRoleLookupResult: { name: string; }[];
  try {
    userRoleLookupResult = await db.query(userRoleLookupQuery, [user.id]);
  } catch (error) {
    console.error('Error executing userRoleLookupQuery: ', error);
    throw error;
  }
  user.roles = userRoleLookupResult.map(({ name }) => name);

  const { JWT_PRIVATE_SECRET, JWT_EXPIRES_IN, JWT_ISSUER } = process.env;

  const payload = {
    email: user.email,
    roles: user.roles
  };

  try {
    return jwt.sign(payload, JWT_PRIVATE_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: JWT_ISSUER,
    });
  } catch (error) {
    console.error('Error issuing JWT: ', error);
    throw error;
  }
}
