import { userLoginCredentialsError } from '@functions/auth/handlers/helpers/login-credential-validator';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import * as jwt from 'jsonwebtoken'
import 'dotenv';

export const login: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
  const body: { email: string; password: string } = JSON.parse(event.body as string);
  const { email, password } = body;


  // 1. Verify user login credential.
  const userCredentialCheckError = await userLoginCredentialsError(email, password);
  if (userCredentialCheckError) {
    return userCredentialCheckError;
  }

  // 2. Login Success. Give JWT Token to user. Redirection must happen in user end.
  const privateKey = process.env.JWT_PRIVATE_KEY;
  const payload = {
    foo: 'bar'
  };
  const token = jwt.sign(payload, privateKey)
  console.log(token);

  return formatJSONResponse({
    token,
    body: event.body,
    event,
  });
};
