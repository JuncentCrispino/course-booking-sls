import { APIGatewayProxyHandler } from 'aws-lambda';
import { getAllUsers } from '../data/user';

export const main: APIGatewayProxyHandler = async () => {
  const users = await getAllUsers();
  const response = {
    statusCode: 200,
    body: JSON.stringify(users),
  };

  return response;
};
