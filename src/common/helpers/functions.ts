export function generateOtp(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export function createOtpExpiry(minutes = 5): string {
  const expires = new Date(Date.now() + minutes * 60 * 1000);
  return expires.toISOString();
}

export function isOtpExpired(expiresAt: string | Date): boolean {
  const now = new Date();
  const exp = new Date(expiresAt);
  return exp.getTime() < now.getTime();
}
