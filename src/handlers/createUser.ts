import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { IUserInfo } from '../data/user';
import { signUp } from '../cognito/signup';

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const userInfo = JSON.parse(event.body as string) as IUserInfo;
  const doc = await signUp({
    ...userInfo,
    clientId: process.env.COGNITO_CLIENT_ID as string,
    password: userInfo.password as string,
  });
  const response = {
    statusCode: 200,
    body: JSON.stringify(doc),
  };

  return response;
};
