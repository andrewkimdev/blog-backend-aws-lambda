import { db } from '@libs/database/mysqldb.connection';
import * as bcrypt from 'bcryptjs';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';

import { HttpStatus } from '@libs/status-code.type';
import { now } from '@libs/time-helper';

import { emailValidator } from './helpers';

export const signup: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
  const body: { email: string; password: string } = JSON.parse(event.body as string);
  const { email, password } = body;

  // 1. Reject invalid email address - duplicate / invalid format
  const emailValidatorError = await emailValidator(email);
  if (emailValidatorError) {
    return emailValidatorError;
  }

  // 2. Create password hash
  const saltRounds = +process.env.JWT_SALT_ROUNDS;
  const hash = await bcrypt.hash(password, saltRounds);

  // 4. Create new user
  const userAddQuery: string = 'INSERT INTO users (email, password, created_at) values (?, ?, ?)';
  const success = await db.execute(userAddQuery, [email, hash, now()]);

  return formatJSONResponse({
    message: success ? 'Account created!': 'Something went wrong. Try again later.',
  }, success? HttpStatus.Created : HttpStatus.InternalServerError);
};

