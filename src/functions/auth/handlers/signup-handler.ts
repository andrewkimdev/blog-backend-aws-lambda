import { HttpStatus } from '@libs/status-code.type';
import { APIGatewayProxyResult } from 'aws-lambda';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';

import { ApiError } from '@libs/api-error';
import * as signupService from '@functions/auth/handlers/services/signup.service';

export const signup: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event): Promise<APIGatewayProxyResult> => {
  try {
    const { email, password } = JSON.parse(event.body as string);

    await signupService.createUser(email, password);
    return formatJSONResponse({ message: 'Account created' }, HttpStatus.Created);
  } catch (error) {
    console.error(error);

    return error instanceof ApiError
      ? formatJSONResponse({ error: error.message }, error.statusCode)
      : formatJSONResponse({ message: 'Internal server error' }, HttpStatus.InternalServerError);
  }
};
