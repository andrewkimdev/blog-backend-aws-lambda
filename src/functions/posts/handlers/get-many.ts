import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { putPost } from '@functions/posts/services/posts.dynamo-db.service';

export const getMany: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {

  await putPost({ id: 'abcd', title: 'my new title'});
  return formatJSONResponse({
    message: `[GET] POSTS MANY MANY`,
    method: event.httpMethod,
    event,
  });
};
