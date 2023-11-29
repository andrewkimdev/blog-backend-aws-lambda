import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';

export const logout: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
  // todo - revoke refresh token
  return formatJSONResponse({
    body: event.body,
    event,
  });
};
