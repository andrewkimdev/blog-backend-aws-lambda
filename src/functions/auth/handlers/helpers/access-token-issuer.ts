import * as jwt from 'jsonwebtoken';
import { db } from '@libs/mysqldb.connection';

export const issueUserAccessToken = async (user: { email: string; id: number; roles: string[]}) => {
  const _userRoleQuery: string = 'SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?'
  const _userRoleQueryRes = await db.query(_userRoleQuery, [user.id]);
  user.roles = _userRoleQueryRes.map(({ name }) => name);

  const { JWT_PRIVATE_SECRET, JWT_EXPIRES_IN, JWT_ISSUER } = process.env;

  const payload = {
    email: user.email,
    roles: user.roles
  };

  return jwt.sign(payload, JWT_PRIVATE_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
  });
}
