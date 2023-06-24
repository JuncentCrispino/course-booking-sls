import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { User, getUser } from '../data/user';

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const email = event.pathParameters?.email as string;
  const user = new User({ email });
  const doc = await getUser(user);
  const response = {
    statusCode: 200,
    body: JSON.stringify(doc),
  };

  return response;
};
