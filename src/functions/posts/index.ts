import postSchema from './post-schema';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handlers/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'posts/{id}',
      },
    },
    {
      http: {
        method: 'get',
        path: 'posts',
      },
    },
    {
      http: {
        method: 'delete',
        path: 'posts/{id}',
      },
    },
    {
      http: {
        method: 'post',
        path: 'posts',
        request: {
          schemas: {
            'application/json': postSchema,
          },
        },
      },
    },
    {
      http: {
        method: 'put',
        path: 'posts/{id}',
        request: {
          schemas: {
            'application/json': postSchema,
          },
        },
      },
    },
  ],
};
