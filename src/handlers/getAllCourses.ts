import { APIGatewayProxyHandler } from 'aws-lambda';
import { getAllCourses } from '../data/course';

export const main: APIGatewayProxyHandler = async () => {
  const courses = await getAllCourses();
  const response = {
    statusCode: 200,
    body: JSON.stringify(courses),
  };

  return response;
};
