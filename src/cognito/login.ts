import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

export const login = async ({
  username,
  password,
  clientId,
}: {
  username: string;
  password: string;
  clientId: string;
}) => {
  const client = new CognitoIdentityProviderClient({ region: 'ap-southeast-1' });

  const command = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
    ClientId: clientId,
  });

  return client.send(command);
};
