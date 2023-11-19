import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';

export const deleteById: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  return formatJSONResponse({
    message: `[DELETE] BY ID`,
    method: event.httpMethod,
    pathParameters: event.pathParameters,
    event,
  });
};
