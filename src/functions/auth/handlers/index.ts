import { ApiError } from '@libs/api-error';
import { formatJSONResponse } from '@libs/api-gateway';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { HttpStatus } from '@libs/status-code.type';

import { login } from './login-handler';
import { logout } from './logout-handler';
import { signup } from './signup-handler';
import { refresh } from './refresh-handler';

// @ts-ignore
const auth: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event, context, cb) => {
  try {
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
  } catch (error) {
    console.error(error);

    return error instanceof ApiError
      ? formatJSONResponse({ error: error.message }, error.statusCode)
      : formatJSONResponse({ message: 'Internal server error' }, HttpStatus.InternalServerError);
  }
};

export const main = auth;
