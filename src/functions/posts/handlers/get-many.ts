import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';

export const getMany: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  return formatJSONResponse({
    message: `[GET] POSTS MANY MANY`,
    method: event.httpMethod,
    event,
    // res,
  });
};
