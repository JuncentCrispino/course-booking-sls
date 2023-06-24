import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { Course, ICourseInfo, createCourse } from '../data/course';

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const courseInfo = JSON.parse(event.body as string) as ICourseInfo;
  const course = new Course(courseInfo);
  const doc = await createCourse(course);
  const response = {
    statusCode: 200,
    body: JSON.stringify(doc),
  };

  return response;
};
