import { handlerPath } from '@libs/handler-resolver';
import loginSchema from './schema/login-schema';
import signupSchema from './schema/signup-schema';

export default {
  handler: `${ handlerPath(__dirname) }/handlers/index.main`,
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
        path: 'auth/refresh',
      },
    },
    {
      http: {
        method: 'post',
        path: 'auth/logout',
      },
    },
  ],
};
