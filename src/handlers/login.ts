import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { login } from '../cognito/login';

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const info = JSON.parse(event.body as string);
  const data = await login({
    clientId: '3a2011ichijjviiikhu8vemci1',
    username: info.username,
    password: info.password,
  });
  const response = {
    statusCode: 200,
    body: JSON.stringify(data),
  };

  return response;
};
