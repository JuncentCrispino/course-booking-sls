import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { Course, ICourseInfo, updateCourse } from '../data/course';

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const instructor = event?.pathParameters?.instructor as string;
  const course_name = event?.pathParameters?.course_name as string;
  const courseInfo = JSON.parse(event.body as string) as ICourseInfo;
  const ogCourse = new Course({ instructor, course_name });
  const courseUpdate = new Course(courseInfo);
  const doc = await updateCourse(ogCourse, courseUpdate);
  const response = {
    statusCode: 200,
    body: JSON.stringify(doc),
  };

  return response;
};
