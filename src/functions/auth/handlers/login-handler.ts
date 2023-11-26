import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';

import { getUserToken } from './helpers/jwt-signer';
import { validateUserLoginCredentials } from './helpers/login-credential-validator';

import { HttpStatus } from '@libs/status-code.type';


export const login: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
  const body: { email: string; password: string } = JSON.parse(event.body as string);
  const { email, password } = body;

  // 1. Verify user login credential.
  const { user, error: loginError } = await validateUserLoginCredentials(email, password);
  if (loginError) {
    return loginError;
  }

  // 2. Get signed jwt to user
  const token: string = await getUserToken(user);

  return formatJSONResponse({
    token,
    message: 'Login success!'
  }, HttpStatus.OK);
};
