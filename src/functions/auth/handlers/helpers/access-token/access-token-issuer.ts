import { ApiError } from '@libs/api-error';
import { db } from '@libs/database/mysqldb.connection';
import { HttpStatus } from '@libs/status-code.type';
import { sign } from 'jsonwebtoken';

type Principal = {
  loginTokenId: string;
  userId: number;
};

export const issueUserAccessToken = async (principal: Principal): Promise<string> => {
  const payload = {
    roles: await findUserRolesByUserId(principal.userId)
  };

  try {
    return sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
      issuer: process.env.JWT_ISSUER,
      subject: principal.loginTokenId,
    });
  } catch (error) {
    console.error('Error issuing JWT: ', error);
    throw error;
  }
}

async function findUserRolesByUserId(userId: number) {
  const userRoleLookupQuery: string = 'SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?';

  try {
    return await db.getvals<string>(userRoleLookupQuery, [userId]);
  } catch (error) {
    throw new ApiError('Error executing userRoleLookupQuery', HttpStatus.InternalServerError);
  }
}
