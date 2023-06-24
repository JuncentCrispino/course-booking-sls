import fetch from 'isomorphic-fetch';

export async function verifyRecaptcha(key: string): Promise<boolean> {
  try {
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${key}`;
    const verifyReq = await fetch(url, {
      method: 'POST',
    });
    const verifyRes = await verifyReq.json();
    if (verifyRes.success === true) {
      return true;
    } else {
      return false;
    }
  } catch (error: unknown) {
    if (typeof error === 'string') {
      throw new Error(error);
    }
    console.log(error);
    return false;
  }
}
