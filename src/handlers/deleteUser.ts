import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { User, deleteUser } from '../data/user';

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const email = event.pathParameters?.email as string;
  console.log({ email });
  const user = new User({ email });
  const deletedDoc = await deleteUser(user);
  const response = {
    statusCode: 200,
    body: JSON.stringify(deletedDoc),
  };

  return response;
};
