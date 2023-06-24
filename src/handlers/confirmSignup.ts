import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { confirmSignUp } from '../cognito/confirmSignup';

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const info = JSON.parse(event.body as string);
  const data = await confirmSignUp({
    clientId: process.env.COGNITO_CLIENT_ID as string,
    username: info.username,
    code: info.code,
  });
  const response = {
    statusCode: 200,
    body: JSON.stringify(data),
  };

  return response;
};
