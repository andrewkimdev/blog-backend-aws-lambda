import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';

export const getOneById: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  return formatJSONResponse({
    message: `[GET] POST BY ID - ${event.pathParameters?.id}`,
    method: event.httpMethod,
    pathParameters: event.pathParameters,
    event,
  });
};
