import { ApiError } from '@libs/api-error';
import { db } from '@libs/database/mysqldb.connection';
import { HttpStatus } from '@libs/status-code.type';

let cachedRoles = null;

let lastFetchTime = 0;

export async function fetchRoles(): Promise<{ id: number; name: string}[]> {
  const now = Date.now();
  if (cachedRoles && (now - lastFetchTime) < 604800000) { // one week
    return cachedRoles;
  }
  const retrieveAllUserRolesQuery: string = 'SELECT r.id, r.name FROM roles r';
  try {
    cachedRoles = await db.getall<{ id: number, name: string}[]>(retrieveAllUserRolesQuery);
  } catch(error) {
    throw new ApiError('Error fetching roles from DB', HttpStatus.InternalServerError);
  }
  lastFetchTime = now;

  return cachedRoles;
}
