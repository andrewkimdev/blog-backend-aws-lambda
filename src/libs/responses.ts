import { formatJSONResponse } from '@libs/api-gateway';
import { HttpStatus } from '@libs/status-code.type';
import { APIGatewayProxyResult } from 'aws-lambda';

export function internalServerErrorResponse(): APIGatewayProxyResult {
  return formatJSONResponse({
      message: 'Something went wrong. Try again'
    },
    HttpStatus.InternalServerError);
}

export function invalidCredentialsResponse(): APIGatewayProxyResult {
  return formatJSONResponse({
    error: { message: 'Invalid credentials.' },
    httpStatus: HttpStatus.Conflict,
  })
}

export function sessionExpiredResponse(): APIGatewayProxyResult {
  return formatJSONResponse({
    error: { message: 'Login session expired. Login again.' }
  }, HttpStatus.Unauthorized);
}

export function invalidCredentialResponse(): APIGatewayProxyResult {
  return formatJSONResponse({
      message: 'Invalid user or password',
    }, HttpStatus.NotAcceptable
  );
}
