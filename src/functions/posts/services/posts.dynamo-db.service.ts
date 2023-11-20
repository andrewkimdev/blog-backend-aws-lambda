import {
  // ScanCommand,
  PutCommand,
  // GetCommand,
  // DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

import { dynamo } from '@libs/dynamo-db';

const tableName = 'posts';

export const putPost = async (body: { id: string, title: string }) => {
  return await dynamo.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        id: body.id,
        created_at: new Date().getTime(),
        title: body.title,
      }
    }),
  )
}
