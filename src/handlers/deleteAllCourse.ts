import { APIGatewayProxyHandler } from 'aws-lambda';
import { deleteAllCourses } from '../data/course';

export const main: APIGatewayProxyHandler = async () => {
  const deletedDoc = await deleteAllCourses();
  const response = {
    statusCode: 200,
    body: JSON.stringify(deletedDoc),
  };

  return response;
};
