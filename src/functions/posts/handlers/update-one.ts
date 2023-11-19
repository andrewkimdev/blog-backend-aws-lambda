import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';

export const updateOne: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  return formatJSONResponse({
    message: `[PUT] Update Post - ${event.pathParameters?.id}`,
    method: event.httpMethod,
    body: event.body,
    pathParameters: event.pathParameters,
    event,
  });
};
