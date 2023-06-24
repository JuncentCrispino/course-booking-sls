import {
  ConfirmSignUpCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

export interface IConfirmSignup {
  clientId: string;
  username: string;
  code: string;
}
export const confirmSignUp = async ({ clientId, username, code }: IConfirmSignup) => {
  const client = new CognitoIdentityProviderClient({ region: 'ap-southeast-1' });

  const command = new ConfirmSignUpCommand({
    ClientId: clientId,
    Username: username,
    ConfirmationCode: code,
  });

  return client.send(command);
};
