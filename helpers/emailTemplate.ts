export const sendOTPTemplate = (name: string, otp: string) => {
  return `<html>
    <body>
    <p>
        <h3>Hello ${name},<br>        
        Welcome to Especkro 2023.</h3><br>

        Thank you for registering with us.<br>
        Please use the following OTP to verify your account.<br>
        <b>OTP: ${otp}</b><br>
        
        <br>
        Note: This OTP is valid for 10 minutes.<br>
    </p>
    </body>
    </html>
    `;
};

export const sendOTPResetPasswordTemplate = (name: string, otp: string) => {
  return `<html>
        <body>
        <p>
            <h3>Hello ${name},<br>        
            You requested to reset your password.</h3><br>

            Please use the following OTP to reset your password.<br>
            <b>OTP: ${otp}</b><br>

            <br>Note: This OTP is valid for 10 minutes.<br>
        </p>
        </body>
        </html>
        `;
};
