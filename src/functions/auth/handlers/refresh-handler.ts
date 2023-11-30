import { JwtPayload } from 'jsonwebtoken';
import { APIGatewayProxyEventHeaders, APIGatewayProxyResult } from 'aws-lambda';

import { HttpStatus } from '@libs/status-code.type';
import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { internalServerErrorResponse, invalidCredentialsResponse } from '@libs/responses';

import { decodeJwtFromHeader, issueUserAccessToken, validateRefreshToken } from './helpers';


interface CustomJwtPayload {
  email: string;
  roles: string[];
}

export const refresh: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event): Promise<APIGatewayProxyResult> => {
  const clientSentRefreshToken = getClientSentRefreshToken(event.headers);

  // 1. Decode JWT.
  let jwt: JwtPayload & CustomJwtPayload;
  try {
    const { decoded } = decodeJwtFromHeader(event.headers);
    if (typeof decoded.payload === 'string') {
      console.error('something went wrong with payload type');
      return internalServerErrorResponse();
    }
    jwt = decoded.payload as JwtPayload & CustomJwtPayload;
  } catch (error) {
    return invalidCredentialsResponse();
  }

  // 2. Validate user-sent refresh token
  const refreshTokenErrors = await validateRefreshToken(clientSentRefreshToken, jwt.email);
  if (refreshTokenErrors) {
    throw refreshTokenErrors;
  }

  // 3. Re-issue access token
  const { email, id, roles } = jwt;
  const updatedAccessToken = await issueUserAccessToken({ email, id, roles })
  return formatJSONResponse({
    message: 'Access token refreshed',
    access_token: updatedAccessToken,
  }, HttpStatus.OK);
}

function getClientSentRefreshToken(headers: APIGatewayProxyEventHeaders): string {
  return headers['Refresh-Token'] ?? '';
}
