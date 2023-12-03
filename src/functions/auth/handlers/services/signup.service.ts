import { ApiError } from '@libs/api-error';
import { db } from '@libs/database/mysqldb.connection';
import { HttpStatus } from '@libs/status-code.type';
import { now } from '@libs/time-helper';
import * as bcrypt from 'bcryptjs';

import { emailValidator, fetchRoles } from '../helpers';

export async function createUser(email: string, password: string): Promise<{ userId: number }> {
  // 1. Validate email address
  await emailValidator(email);

  // 2. Save user and user role to database
  return await db.transaction(async (): Promise<{ userId: number }> => {
    const { userId } = await saveUserToDb({ email, password });
    await saveDefaultUserRole(userId);
    return { userId };
  });
}

async function saveUserToDb(auth: { email: string, password: string }): Promise<{ userId: number }> {
  // 1. Data Init
  let userId: number;
  let success: boolean;

  const { email, password } = auth;
  const userAddQuery: string = 'INSERT INTO users (email, password, created_at) values (?, ?, ?)';

  // 2. Create password hash
  const hash = await createPasswordHash(password);

  try {
    const res = await db.query(userAddQuery, [email, hash, now()]);
    userId = res.insertId;
    success = res.affectedRows > 0;
  } catch (error) {
    throw new ApiError('Error creating user account', HttpStatus.InternalServerError);
  }

  if (!success) {
    throw new ApiError('Error creating user account', HttpStatus.InternalServerError);
  }
  return { userId };
}

async function createPasswordHash(password: string): Promise<string> {
  const saltRounds = +process.env.JWT_SALT_ROUNDS;
  return await bcrypt.hash(password, saltRounds);
}

async function saveDefaultUserRole(userId: number): Promise<void> {
  const saveDefaultUserRoleQuery = 'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)';

  const roles = await fetchRoles();
  const userRoleId = roles.find((r) => r.name === process.env.DEFAULT_BLOG_USER_ROLE).id;
  try {
    await db.insert(saveDefaultUserRoleQuery, [userId, userRoleId]);
  } catch (error) {
    throw new ApiError('Error saving user role. Try again later.', HttpStatus.InternalServerError)
  }
}
