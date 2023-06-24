import {
  SignUpCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { IUserInfo } from '../data/user';

interface ISignup extends IUserInfo {
  clientId: string;
  password: string;
}
export const signUp = async ({
  clientId,
  password,
  email,
  given_name,
  family_name,
  phone_number,
}: ISignup) => {
  const client = new CognitoIdentityProviderClient({ region: 'ap-southeast-1' });

  const command = new SignUpCommand({
    ClientId: clientId,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'given_name', Value: given_name },
      { Name: 'family_name', Value: family_name },
      { Name: 'phone_number', Value: phone_number },
    ],
  });

  return client.send(command);
};
