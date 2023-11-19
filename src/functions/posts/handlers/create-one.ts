import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';

export const createOne: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  return formatJSONResponse({
    message: `POSTS ${event.queryStringParameters?.name}, Meow meow!`,
    method: event.httpMethod,
    pathParameters: event.pathParameters,
    event,
  });
};
