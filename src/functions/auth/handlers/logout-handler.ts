import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { APIGatewayProxyResult } from 'aws-lambda';

export const logout: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event): Promise<APIGatewayProxyResult> => {
  // todo - revoke refresh token
  return formatJSONResponse({
    body: event.body,
    event,
  });
};
