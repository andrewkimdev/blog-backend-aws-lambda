import * as bcrypt from 'bcryptjs';

import { formatJSONResponse } from '@libs/api-gateway';
import { db } from '@libs/mysqldb.connection';
import { HttpStatus } from '@libs/status-code.type';


const invalidCredentialRes = formatJSONResponse({
  message: 'Invalid user or password',
}, HttpStatus.NotAcceptable);

export const validateUserLoginCredentials = async (email: string, password: string) => {
  const _userFindQuery: string = 'SELECT id, email, password FROM users WHERE email = ?';
  const _userFindQueryRes = await db.query(_userFindQuery, [email]);
  const user: { id: number, email: string, password: string, roles: string[]} = _userFindQueryRes[0];

  // 1. User does not exist by the email
  if (!user) {
    return { error: invalidCredentialRes };
  }

  // 2. User password does  not match
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    return { error: invalidCredentialRes };
  }

  // User exists and credentials match. Good to go.
  return { user }
}
