import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { IUserInfo, User, updateUser } from '../data/user';

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const userInfo = JSON.parse(event.body as string) as IUserInfo;
  const email = event?.pathParameters?.email as string;
  const ogUser = new User({ email });
  const userUpdate = new User(userInfo);
  const doc = await updateUser(ogUser, userUpdate);
  const response = {
    statusCode: 200,
    body: JSON.stringify(doc),
  };

  return response;
};
