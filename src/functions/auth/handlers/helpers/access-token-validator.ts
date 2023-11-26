import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

const { JWT_PRIVATE_SECRET } = process.env;

export const decodeJwtFromHeader = (headers: APIGatewayProxyEventHeaders) => {
  const accessToken = headers['Authorization'].split(' ')[1];

  // 1. Validate jwt
  try {
    return { decoded: jwt.verify(accessToken, JWT_PRIVATE_SECRET, { complete: true }) };
  } catch (error) {
    console.error(error);
    throw new Error('Invalid credentials');
  }
}
