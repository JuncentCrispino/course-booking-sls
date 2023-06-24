import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { Course, getCourse } from '../data/course';

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const course_name = event.pathParameters?.course as string;
  const instructor = event.pathParameters?.instructor as string;
  const course = new Course({
    instructor,
    course_name,
  });
  const doc = await getCourse(course);
  const response = {
    statusCode: 200,
    body: JSON.stringify(doc),
  };

  return response;
};
