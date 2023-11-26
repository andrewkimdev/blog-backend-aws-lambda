import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';

import { login } from './login-handler';
import { logout } from './logout-handler';
import { signup } from './signup-handler';
import { refresh } from './refresh-handler';

// @ts-ignore
const auth: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event, context, cb) => {
  switch (event.path) {
    case '/auth/login':
      return login(event, context, cb);
    case '/auth/refresh':
      return refresh(event, context, cb);
    case '/auth/signup':
      return signup(event, context, cb);
    case '/auth/logout':
      return logout(event, context, cb);
  }
};

export const main = auth;
