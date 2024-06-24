export const otpTemplate = (name: string, otp: string): string => (`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your OTP Code</title>
</head>
<body>
  <h1>Your OTP Code</h1>
  <p>Dear ${name},</p>
  <p>Your OTP code is: <strong>${otp}</strong></p>
  <p>Please use this code to complete your login.</p>
  <p>If you did not request this code, please ignore this email.</p>
</body>
</html>
`);

export const registrationTemplate = (name: string): string => (`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Our Service</title>
</head>
<body>
  <h1>Welcome, ${name}!</h1>
  <p>Thank you for registering at our service. We are excited to have you on board.</p>
  <p>If you have any questions, feel free to reach out to our support team.</p>
  <p>Best regards,</p>
  <p>The Team</p>
</body>
</html>
`);