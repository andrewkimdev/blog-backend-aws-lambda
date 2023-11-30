import { formatJSONResponse } from '@libs/api-gateway';
import { db } from '@libs/database/mysqldb.connection';
import { HttpStatus } from '@libs/status-code.type';

import { isEmailFormatValid } from './email-format-validator';

/**
 * This function validates an email address.
 * @param {string} email - The email address to validate.
 * @return {Promise<object|null>} An object with an error message and HTTP status, or null if email is valid and unique.
 */
export const emailValidator = async (email: string): Promise<object|null> => {
  // Verify email address format
  if (!isEmailFormatValid(email)) {
    return formatJSONResponse({
      message: 'Invalid email address format.'
    }, HttpStatus.BadRequest);
  }
// TODO: Send email to user to verify.

// 2. Verify if email already exists
  if (await isEmailAlreadyTaken(email)) {
    return formatJSONResponse({
      message: 'Email already taken. Try a different one.'
    }, HttpStatus.Conflict);
  }
// If normal, return null.
  return null;
}

/**
 * This function checks if an email address is already used in the database.
 * @param {string} email - The email address to check.
 * @return {Promise<boolean>} Return a promise that resolves into a boolean value indicating whether the email is already taken.
 */
async function isEmailAlreadyTaken(email: string): Promise<boolean> {
  const emailCheckQuery = `SELECT COUNT(*) FROM users u where u.email = ?`;
  try {
    const emailCheckResult = await db.query(emailCheckQuery, [email]);
    return emailCheckResult[0]?.['count(*)'] > 0;
  } catch (error) {
    console.error(`Error while checking if email is already taken: ${error}`);
    return false;
  }
}
