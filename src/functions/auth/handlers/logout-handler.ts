import { revokeRefreshToken } from '@functions/auth/handlers/helpers';
import { decodeRefreshJwt, getClientSentRefreshTokenValue } from '@functions/auth/handlers/refresh-handler';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { HttpStatus } from '@libs/status-code.type';
import { APIGatewayProxyResult } from 'aws-lambda';

export const logout: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event): Promise<APIGatewayProxyResult> => {
  const jwt = getClientSentRefreshTokenValue(event.headers);
  const { userId } = await decodeRefreshJwt(jwt);
  await revokeRefreshToken(userId)

  return formatJSONResponse({}, HttpStatus.NoContent);
};
