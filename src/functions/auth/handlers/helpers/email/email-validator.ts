import { db } from '@libs/database/mysqldb.connection';
import { HttpStatus } from '@libs/status-code.type';
import { ApiError } from '@libs/api-error';

import { isEmailFormatValid } from './email-format-validator';

/**
 * This function validates an email address.
 * @param {string} email - The email address to validate.
 * @return {Promise<void>} Returns nothing. Errors will simply throw ApiError.
 */
export const emailValidator = async (email: string): Promise<void> => {
  /* SYNC TEST */
  // Verify email address format
  if (!isEmailFormatValid(email)) {
    throw new ApiError( 'Invalid email address format.', HttpStatus.BadRequest);
  }

  /* ASYNC TEST */
// TODO: Send email to user to verify.
// 2. Verify if email already exists
  if (await isEmailAlreadyTaken(email)) {
    throw new ApiError('Email already taken. Try a different one.', HttpStatus.Conflict);
  }
}

/**
 * This function checks if an email address is already used in the database.
 * @param {string} email - The email address to check.
 * @return {Promise<boolean>} Return a promise that resolves into a boolean value indicating whether the email is already taken.
 */
async function isEmailAlreadyTaken(email: string): Promise<boolean> {
  const emailCheckQuery: string = 'SELECT EXISTS(SELECT 1 FROM users u WHERE u.email = ?)';
  try {
    const accountsWithEmailCount = await db.getval<number>(emailCheckQuery, [email]);
    return accountsWithEmailCount > 0;
  } catch (error) {
    console.error(`Error while checking if email is already taken: ${error}`);
    return false;
  }
}
