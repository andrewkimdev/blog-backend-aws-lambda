import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import { JwtPayload } from 'jsonwebtoken';

import { HttpStatus } from '@libs/status-code.type';
import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';

import { decodeJwtFromHeader } from './helpers/access-token-validator';
import { issueUserAccessToken } from './helpers/access-token-issuer';
import { validateRefreshToken } from './helpers/refresh-token-validators';


interface CustomJwtPayload {
  email: string;
  roles: string[];
}

export const refresh: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
  const clientSentRefreshToken = getClientSentRefreshToken(event.headers);

  // 1. Decode JWT.
  let jwt: JwtPayload & CustomJwtPayload;
  try {
    const { decoded } = decodeJwtFromHeader(event.headers);
    if (typeof decoded.payload === 'string') {
      console.error('something went wrong with payload type');
      return internalServerError();
    }
    jwt = decoded.payload as JwtPayload & CustomJwtPayload;
  } catch (error) {
    return invalidCredentials();
  }

  // 2. Validate user-sent refresh token
  const refreshTokenErrors = await validateRefreshToken(clientSentRefreshToken, jwt.email);
  if (refreshTokenErrors) {
    return refreshTokenErrors;
  }

  // 3. Re-issue access token
  const { email, id, roles } = jwt;
  const updatedAccessToken = await issueUserAccessToken({ email, id, roles })
  return formatJSONResponse({
    message: 'Access token refreshed',
    access_token: updatedAccessToken,
  }, HttpStatus.OK);
}

function getClientSentRefreshToken(headers: APIGatewayProxyEventHeaders) {
  return headers['Refresh-Token'] ?? '';
}

function internalServerError() {
  return formatJSONResponse({
      message: 'Something went wrong. Try again'
    },
    HttpStatus.InternalServerError);
}

function invalidCredentials() {
  return formatJSONResponse({
    error: { message: 'Invalid credentials.' },
    httpStatus: HttpStatus.Conflict,
  })
}
