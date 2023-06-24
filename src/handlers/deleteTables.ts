import { APIGatewayProxyHandler } from 'aws-lambda';
import { deleteUsersTable } from '../data/user';
import { deleteCoursesTable } from '../data/course';

export const main: APIGatewayProxyHandler = async () => {
  const deletedDoc = await Promise.all([deleteUsersTable(), deleteCoursesTable()]);
  const response = {
    statusCode: 200,
    body: JSON.stringify(deletedDoc),
  };

  return response;
};
