// import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';

let client: DynamoDBClient | null = null;
// let options: DynamoDBClientConfig = {};

// if (process.env.STAGE === 'dev') {
//   options = {
//     region: 'localhost',
//     endpoint: 'http://localhost:8000',
//   };
// }
export const getClient = (): DynamoDBDocumentClient => {
  if (!client) {
    client = new DynamoDBClient({
      requestHandler: new NodeHttpHandler({
        connectionTimeout: 2000,
        requestTimeout: 2000,
      }),
      // ...options,
    });
  }
  const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      // Whether to automatically convert empty strings, blobs, and sets to `null`.
      convertEmptyValues: true, // false, by default.
      // Whether to remove undefined values while marshalling.
      removeUndefinedValues: false, // false, by default.
      // Whether to convert typeof object to map attribute.
      convertClassInstanceToMap: false, // false, by default.
    },
    unmarshallOptions: {
      // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
      wrapNumbers: false, // false, by default.
    },
  });
  return docClient;
};
