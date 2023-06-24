import { AttributeValue, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { Item } from './base';
import { getClient } from './client';
import {
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
  ExecuteTransactionCommand,
  TransactWriteCommand,
  BatchGetCommand,
} from '@aws-sdk/lib-dynamodb';
import { pick, catchAsync } from '../libs';
import { Course, getCourse } from './course';

const client = getClient();
const USERS_TABLE = process.env.USERS_TABLE;
const COURSES_TABLE = process.env.COURSES_TABLE;

export interface IUserInfo {
  email: string;
  given_name?: string;
  family_name?: string;
  phone_number?: string;
  password?: string;
  enrolled_courses?: { PK: string; SK: string }[];
}

export class User extends Item {
  email: string;
  given_name?: string;
  family_name?: string;
  phone_number?: string;
  enrolled_courses: { PK: string; SK: string }[];

  constructor(data: IUserInfo) {
    super();
    this.email = data.email;
    this.given_name = data.given_name;
    this.family_name = data.family_name;
    this.phone_number = data.phone_number;
    this.enrolled_courses = data.enrolled_courses || [];
  }

  static fromItem(item?: Record<string, AttributeValue>): User {
    if (!item) throw new Error('No Item found!');
    return unmarshall(item) as User;
  }

  get pk() {
    return this.email;
  }

  get sk() {
    return this.email;
  }

  toItem(): Record<string, unknown> {
    return {
      ...this.keys(),
      email: this.email,
      given_name: this.given_name,
      family_name: this.family_name,
      phone_number: this.phone_number,
      enrolled_courses: this.enrolled_courses,
    };
  }
}

export const createUser = catchAsync(async (user: User) => {
  console.log(user.toItem());
  const putCommand = new PutCommand({
    TableName: USERS_TABLE,
    Item: user.toItem(),
    ConditionExpression: 'attribute_not_exists(PK)',
  });
  await client.send(putCommand);

  return user;
});

export const getUser = catchAsync(async (user: User): Promise<User> => {
  const getComannd = new GetCommand({
    TableName: USERS_TABLE,
    Key: user.keys(),
  });
  const response = await client.send(getComannd);
  if (!response.Item) {
    throw new Error('User not found.');
  }
  return response.Item as User;
});

export const updateUser = catchAsync(async (ogUser: User, updateUser: User) => {
  await getUser(ogUser);
  if (ogUser.pk === updateUser.pk) {
    const commad = new UpdateCommand({
      TableName: USERS_TABLE,
      Key: updateUser.keys(),
      UpdateExpression: 'SET given_name = :gn, family_name = :fn, phone_number = :pn',
      ExpressionAttributeValues: {
        ':gn': updateUser.given_name,
        ':fn': updateUser.family_name,
        ':pn': updateUser.phone_number,
      },
      ReturnValues: 'ALL_NEW',
    });
    const response = await client.send(commad);
    return response.Attributes;
  } else {
    const command = new TransactWriteCommand({
      TransactItems: [
        {
          Delete: {
            TableName: USERS_TABLE,
            Key: ogUser.keys(),
          },
        },
        {
          Put: {
            TableName: USERS_TABLE,
            Item: updateUser.toItem(),
            ConditionExpression: 'attribute_not_exists(PK)',
          },
        },
      ],
    });
    await client.send(command);
    return updateUser;
  }
});

export const deleteUser = catchAsync(async (user: User) => {
  const deleteCommand = new DeleteCommand({
    TableName: USERS_TABLE,
    Key: user.keys(),
  });
  const response = await client.send(deleteCommand);
  return response;
});

export const getAllUsers = catchAsync(async () => {
  const command = new ScanCommand({
    TableName: USERS_TABLE,
  });
  const items = await client.send(command);
  return items.Items;
});

export const deleteAllUsers = catchAsync(async () => {
  const command = new ScanCommand({
    TableName: USERS_TABLE,
  });
  const items = await client.send(command);
  const promiseArr: DeleteCommand[] = [];
  items.Items?.forEach((item) =>
    promiseArr.push(
      new DeleteCommand({
        TableName: USERS_TABLE,
        Key: pick(item, ['PK', 'SK']),
      }),
    ),
  );
  return await Promise.all(promiseArr.map((cmd) => client.send(cmd)));
});

export const deleteUsersTable = catchAsync(async () => {
  const command = new DeleteTableCommand({
    TableName: USERS_TABLE,
  });

  const response = await client.send(command);
  console.log(response);
  return response;
});

export const enroll = catchAsync(async (user: User, course: Course) => {
  const enrolledCourses = (await getUser(user)).enrolled_courses;
  const enrolledUser = (await getCourse(course)).enrollees;

  const isEnrolled =
    enrolledCourses.find((obj) => obj.PK === course.pk) ||
    enrolledUser?.find((obj) => obj.PK === user.pk);

  if (isEnrolled) {
    throw new Error('Already enrolled to course');
  }

  const command = new TransactWriteCommand({
    TransactItems: [
      {
        Update: {
          TableName: COURSES_TABLE,
          Key: pick(course.toItem(), ['PK', 'SK']),
          UpdateExpression: 'SET #e = list_append(if_not_exists(#e, :el), :e)',
          ExpressionAttributeNames: {
            '#e': 'enrollees',
          },
          ExpressionAttributeValues: {
            ':e': [pick(user.toItem(), ['PK', 'SK'])],
            ':el': [],
          },
        },
      },
      {
        Update: {
          TableName: USERS_TABLE,
          Key: pick(user.toItem(), ['PK', 'SK']),
          UpdateExpression: 'SET #ec = list_append(if_not_exists(#ec, :el), :ec)',
          ExpressionAttributeNames: {
            '#ec': 'enrolled_courses',
          },
          ExpressionAttributeValues: {
            ':ec': [pick(course.toItem(), ['PK', 'SK'])],
            ':el': [],
          },
        },
      },
    ],
  });
  const res = await client.send(command);
  return res;
});

export const getEnrolledCourses = catchAsync(async (user: User) => {
  const getUser = new GetCommand({
    TableName: USERS_TABLE,
    Key: user.keys(),
  });

  const existUser = await client.send(getUser);
  if (!existUser.Item) {
    throw new Error('User not found');
  }

  const userAttributes = existUser.Item as User;

  if (userAttributes.enrolled_courses.length < 1) {
    throw new Error('No Enrolled Courses');
  }

  const enrolledCoursesCommand = new BatchGetCommand({
    RequestItems: {
      [`${COURSES_TABLE}`]: {
        Keys: userAttributes.enrolled_courses,
        ProjectionExpression: 'course_name, instructor, description',
      },
    },
  });

  const response = await client.send(enrolledCoursesCommand);

  if (!response?.Responses || !response.Responses?.[`${COURSES_TABLE}`]) return null;
  return response?.Responses[`${COURSES_TABLE}`];
});
