import { APIGatewayProxyHandler } from 'aws-lambda';
import { deleteAllUsers } from '../data/user';

export const main: APIGatewayProxyHandler = async () => {
  const deletedDoc = await deleteAllUsers();
  const response = {
    statusCode: 200,
    body: JSON.stringify(deletedDoc),
  };

  return response;
};
