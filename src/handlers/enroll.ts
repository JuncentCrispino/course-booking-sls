import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { Course, ICourseInfo } from '../data/course';
import { IUserInfo, User, enroll } from '../data/user';

interface IEnrollInfo {
  courseInfo: ICourseInfo;
  userInfo: IUserInfo;
}
export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { courseInfo, userInfo } = JSON.parse(event.body as string) as IEnrollInfo;
  try {
    const course = new Course(courseInfo);
    const user = new User(userInfo);
    const doc = await enroll(user, course);
    const response = {
      statusCode: 200,
      body: JSON.stringify(doc),
    };

    return response;
  } catch (error) {
    const message = error.message || 'Something went wrong';
    return {
      statusCode: 500,
      body: JSON.stringify({ message }),
    };
  }
};
