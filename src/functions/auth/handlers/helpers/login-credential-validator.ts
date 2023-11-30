import * as bcrypt from 'bcryptjs';
import { db } from '@libs/database/mysqldb.connection';

import { UserAuth } from '@functions/auth/handlers/types';
import { invalidCredentialResponse } from '@libs/responses';

export const validateUserLoginCredentials = async (email: string, password: string): Promise<{ user: UserAuth }> => {
  const userEmailLookupQuery: string = 'SELECT id, email, password FROM users WHERE email = ?';
  const userLookupResult = await db.query(userEmailLookupQuery, [email]);
  const user: UserAuth = userLookupResult[0];

  // 1. User does not exist by the email
  if (!user) {
    throw invalidCredentialResponse();
  }

  // 2. User password does  not match
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    throw invalidCredentialResponse();
  }

  // User exists and credentials match. Good to go.
  return { user }
}
