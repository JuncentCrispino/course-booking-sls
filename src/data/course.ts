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
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { pick, catchAsync } from '../libs';

const client = getClient();
const USERS_TABLE = process.env.USERS_TABLE;
const COURSES_TABLE = process.env.COURSES_TABLE;

export interface ISchedule {
  day: Date;
  start: Date;
  duration: number;
}

export interface ICourseInfo {
  course_name: string;
  instructor: string;
  description?: string;
  schedule?: string;
  available_slots?: number;
  price?: number;
  is_active?: boolean;
  enrollees?: { PK: string; SK: string }[];
}

export class Course extends Item {
  course_name: string;
  instructor: string;
  description?: string;
  schedule?: string;
  available_slots?: number;
  price?: number;
  is_active?: boolean;
  enrollees?: { PK: string; SK: string }[];

  constructor(data: ICourseInfo) {
    super();
    this.course_name = data.course_name;
    this.description = data.description;
    this.instructor = data.instructor;
    this.schedule = data.schedule;
    this.available_slots = data.available_slots;
    this.price = data.price;
    this.is_active = data.is_active || true;
    this.enrollees = data.enrollees || [];
  }

  static fromItem(item?: Record<string, AttributeValue>): Course {
    if (!item) throw new Error('No Item found!');
    return unmarshall(item) as Course;
  }

  get pk() {
    return `instructor@${this.instructor.split(' ').join('-')}`;
  }

  get sk() {
    return `course@${this.course_name.split(' ').join('-')}`;
  }

  toItem(): Record<string, unknown> {
    return {
      ...this.keys(),
      course_name: this.course_name,
      description: this.description,
      instructor: this.instructor,
      schedule: this.schedule,
      available_slots: this.available_slots,
      price: this.price,
      is_active: this.is_active,
      enrollees: this.enrollees,
    };
  }
}

export const createCourse = catchAsync(async (course: Course) => {
  const putCommand = new PutCommand({
    TableName: COURSES_TABLE,
    Item: course.toItem(),
    ConditionExpression: 'attribute_not_exists(PK)',
  });
  await client.send(putCommand);

  return course;
});

export const getCourse = catchAsync(async (course: Course) => {
  const getComannd = new GetCommand({
    TableName: COURSES_TABLE,
    Key: course.keys(),
  });
  const res = await client.send(getComannd);
  if (!res.Item) {
    throw new Error('Course not found');
  }
  return res.Item as Course;
});

export const updateCourse = catchAsync(async (ogCourse: Course, updateCourse: Course) => {
  await getCourse(ogCourse);
  if (ogCourse.pk === updateCourse.pk && ogCourse.sk === updateCourse.sk) {
    const command = new UpdateCommand({
      TableName: COURSES_TABLE,
      Key: updateCourse.keys(),
      UpdateExpression:
        'SET course_name = :n, description = :d, instructor = :i, schedule = :s, available_slots = :as, price = :p, is_active = :ia, enrollees = :e',
      ExpressionAttributeValues: {
        ':n': updateCourse.course_name,
        ':d': updateCourse.description,
        ':i': updateCourse.instructor,
        ':s': updateCourse.schedule,
        ':as': updateCourse.available_slots,
        ':p': updateCourse.price,
        ':ia': updateCourse.is_active,
        ':e': updateCourse.enrollees,
      },
      ReturnValues: 'ALL_NEW',
    });
    const res = await client.send(command);
    return res.Attributes;
  } else {
    const command = new TransactWriteCommand({
      TransactItems: [
        {
          Delete: {
            TableName: COURSES_TABLE,
            Key: ogCourse.keys(),
          },
        },
        {
          Put: {
            TableName: COURSES_TABLE,
            Item: updateCourse.toItem(),
            ConditionExpression: 'attribute_not_exists(PK)',
          },
        },
      ],
    });
    await client.send(command);
    return updateCourse;
  }
});

export const deleteCourse = catchAsync(async (course: Course) => {
  const deleteCommand = new DeleteCommand({
    TableName: COURSES_TABLE,
    Key: course.keys(),
  });
  const response = await client.send(deleteCommand);
  return response;
});

export const getAllCourses = catchAsync(async () => {
  const command = new ScanCommand({
    TableName: COURSES_TABLE,
  });
  const items = await client.send(command);
  return items.Items;
});

export const deleteAllCourses = catchAsync(async () => {
  const command = new ScanCommand({
    TableName: COURSES_TABLE,
  });
  const items = await client.send(command);
  const promiseArr: DeleteCommand[] = [];
  items.Items?.forEach((item) =>
    promiseArr.push(
      new DeleteCommand({
        TableName: COURSES_TABLE,
        Key: pick(item, ['PK', 'SK']),
      }),
    ),
  );
  return await Promise.all(promiseArr.map((cmd) => client.send(cmd)));
});

export const deleteCoursesTable = catchAsync(async () => {
  const command = new DeleteTableCommand({
    TableName: COURSES_TABLE,
  });

  const response = await client.send(command);
  return response;
});
