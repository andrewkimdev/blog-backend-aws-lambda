import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { mongodbHandler } from '@libs/mongodb.connection';

export const getMany: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  const res = await mongodbHandler();

  return formatJSONResponse({
    message: `[GET] POSTS MANY MANY`,
    method: event.httpMethod,
    event,
    res,
  });
};
