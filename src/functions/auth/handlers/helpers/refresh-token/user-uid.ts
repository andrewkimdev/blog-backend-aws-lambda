import { ApiError } from '@libs/api-error';
import { db } from '@libs/database/mysqldb.connection';
import { HttpStatus } from '@libs/status-code.type';
import { randomUUID } from 'crypto';

export const getUserIdWithUid = async (uid: string): Promise<number> => {
  try {
    const getUserIdByUidQuery: string = 'SELECT user_id FROM user_one_time_id oid WHERE oid.uid = ?';
    return await db.getval<number>(getUserIdByUidQuery, [uid]);
  } catch (error) {
    throw new ApiError('Error fetching user info from DB', HttpStatus.InternalServerError);
  }
};

export const generateAndSaveUidForUser = async (userId: number): Promise<string> => {
  const uid = randomUUID().toString();
  const uidInsertQuery: string = `INSERT INTO user_one_time_id (user_id, uid) VALUES (?, ?)
                                          ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), uid = VALUES(uid)`;
  try {
    await db.insert(uidInsertQuery, [userId, uid]);
    return uid;
  } catch (error) {
    throw new ApiError('ERROR Saving one-time user-id to database', HttpStatus.InternalServerError);
  }
};
