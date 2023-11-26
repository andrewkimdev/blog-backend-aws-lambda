import { formatJSONResponse } from '@libs/api-gateway';
import { db } from '@libs/mysqldb.connection';
import { isEmailFormatValid } from '@libs/email-format-validator';
import { HttpStatus } from '@libs/status-code.type';

export const emailValidator = async (email: string) => {
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

async function isEmailAlreadyTaken(email: string): Promise<boolean> {
  const emailExistsQuery = `SELECT COUNT(*) FROM users u where u.email = ?`;
  const emailExistsRes = await db.query(emailExistsQuery, [email]);
  return emailExistsRes[0]?.['count(*)'] > 0;
}

