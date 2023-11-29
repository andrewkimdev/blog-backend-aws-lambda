import { formatJSONResponse } from '@libs/api-gateway';
import { HttpStatus } from '@libs/status-code.type';

export function internalServerErrorResponse() {
  return formatJSONResponse({
      message: 'Something went wrong. Try again'
    },
    HttpStatus.InternalServerError);
}

export function invalidCredentialsResponse() {
  return formatJSONResponse({
    error: { message: 'Invalid credentials.' },
    httpStatus: HttpStatus.Conflict,
  })
}

export function sessionExpiredResponse() {
  return formatJSONResponse({
    error: { message: 'Login session expired. Login again.' }
  }, HttpStatus.Unauthorized);
}
