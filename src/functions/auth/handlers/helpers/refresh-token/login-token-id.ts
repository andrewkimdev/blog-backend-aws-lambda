import { ApiError } from '@libs/api-error';
import { db } from '@libs/database/mysqldb.connection';
import { HttpStatus } from '@libs/status-code.type';
import { randomUUID } from 'crypto';

export const getUserIdWithLoginTokenId = async (loginTokenId: string): Promise<number> => {
  try {
    const getUserIdByUidQuery: string = 'SELECT user_id FROM user_one_time_id oid WHERE oid.login_token_id = ?';
    return await db.getval<number>(getUserIdByUidQuery, [loginTokenId]);
  } catch (error) {
    throw new ApiError('Error fetching user info from DB', HttpStatus.InternalServerError);
  }
};

export const getLoginTokenId = async (userId: number): Promise<string> => {
  const loginTokenId = randomUUID().toString();
  const loginTokenIdInsertQuery: string = `INSERT INTO user_one_time_id (user_id, login_token_id) VALUES (?, ?)
                                          ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), login_token_id = VALUES(login_token_id)`;
  try {
    await db.insert(loginTokenIdInsertQuery, [userId, loginTokenId]);
    return loginTokenId;
  } catch (error) {
    throw new ApiError('ERROR Saving one-time user-id to database', HttpStatus.InternalServerError);
  }
};
