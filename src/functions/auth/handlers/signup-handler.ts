import { HttpStatus } from '@libs/status-code.type';
import { APIGatewayProxyResult } from 'aws-lambda';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';

import * as signupService from '@functions/auth/handlers/services/signup.service';

export const signup: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event): Promise<APIGatewayProxyResult> => {
  const { email, password } = JSON.parse(event.body as string);

  await signupService.createUser(email, password);
  return formatJSONResponse({ message: 'Account created' }, HttpStatus.Created);
};
