import signupSchema from './schema/signup-schema';
import loginSchema from './schema/login-schema';
import logoutSchema from './schema/logout-schema';

import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${ handlerPath(__dirname) }/handlers/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'auth/signup',
        request: {
          schemas: {
            'application/json': signupSchema,
          },
        },
      },
    },
    {
      http: {
        method: 'post',
        path: 'auth/login',
        request: {
          schemas: {
            'application/json': loginSchema,
          },
        },
      },
    },
    {
      http: {
        method: 'post',
        path: 'auth/logout',
        request: {
          schemas: {
            'application/json': logoutSchema,
          },
        },
      },
    },
  ],
};
