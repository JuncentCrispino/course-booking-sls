import { PostConfirmationConfirmSignUpTriggerEvent } from 'aws-lambda';
import { User, createUser } from '../data/user';

export const main = async (event: PostConfirmationConfirmSignUpTriggerEvent) => {
  const { email, given_name, family_name, phone_number } = event.request.userAttributes;
  const user = new User({ email, given_name, family_name, phone_number });
  const doc = await createUser(user);
  console.log(JSON.stringify(doc));
  return event;
};
