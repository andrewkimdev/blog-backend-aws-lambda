import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { HttpStatus } from '@libs/status-code.type';
import * as bcrypt from 'bcryptjs';

import { db } from '@libs/mysqldb.connection';

export const login: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
  const body: { email: string; password: string } = JSON.parse(event.body as string);
  const { email, password } = body;


  // 1. Retrieve user auth info.
  const _userFindQuery: string = 'SELECT email, password FROM users WHERE email = ?';

  const _userFindQueryRes = await db.query(_userFindQuery, [email]);
  const user: { email: string, password: string } = _userFindQueryRes[0];

  const invalidCredentialRes = formatJSONResponse({
    message: 'Invalid user or password',
  }, HttpStatus.NotAcceptable);

  if (!user) {
    return invalidCredentialRes
  }

  // 2. Compare password to the stored hash
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    return invalidCredentialRes;
  }

  // 3. Login Success. Give JWT Token to user. Redirection must happen in user end.

  return formatJSONResponse({
    body: event.body,
    event,
  });
};
