import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';

import { createOne } from './create-one';
import { getOneById } from './get-one-by-id';
import { getMany } from './get-many';
import { updateOne } from './update-one';
import { deleteById } from './delete-by-id';

// @ts-ignore
const posts: ValidatedEventAPIGatewayProxyEvent<void> = async (event, context, cb) => {
  switch(event.httpMethod) {
    case 'GET':
      return !!event.pathParameters ? getOneById(event, context, cb) : getMany(event, context, cb)
    case 'DELETE':
      return deleteById(event, context, cb);
    case 'POST':
      return createOne(event, context, cb);
    case 'PUT':
      return updateOne(event, context, cb);
  }
};

export const main = posts;
