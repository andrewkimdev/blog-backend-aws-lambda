import { APIGatewayProxyResult } from 'aws-lambda';

import { formatJSONResponse } from '@libs/api-gateway';
import { HttpStatus } from '@libs/status-code.type';

export function successServerResponse(message = 'Success'): APIGatewayProxyResult {
  return formatJSONResponse({ message }, HttpStatus.NotAcceptable);
}

export function internalServerErrorResponse(message = 'Something went wrong. Try again'): APIGatewayProxyResult {
  return formatJSONResponse({ message }, HttpStatus.InternalServerError);
}

export function invalidCredentialsResponse(message = 'Invalid credentials.'): APIGatewayProxyResult {
  return formatJSONResponse({ error: { message }, httpStatus: HttpStatus.Conflict });
}

export function sessionExpiredResponse(message = 'Login session expired. Login again.'): APIGatewayProxyResult {
  return formatJSONResponse({ error: { message } }, HttpStatus.Unauthorized);
}

export function invalidCredentialResponse(message = 'Invalid user or password'): APIGatewayProxyResult {
  return formatJSONResponse({ message }, HttpStatus.NotAcceptable);
}
