import { PreAuthenticationTriggerEvent } from 'aws-lambda';
import { verifyRecaptcha } from '../libs/recaptcha';

export const main = async (event: PreAuthenticationTriggerEvent) => {
  const userAttributes = event.request.userAttributes;
  const { validationData } = event.request;

  if (!validationData?.recaptcha) {
    throw new Error('Missing Validation Data');
  }

  if (!verifyRecaptcha(validationData.recaptcha)) {
    throw new Error('Invalid Recaptcha');
  }

  console.log(JSON.stringify(userAttributes));

  return event;
};
