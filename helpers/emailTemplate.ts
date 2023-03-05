export const sendOTPTemplate = (name: string, otp: string) => {
  return `<html>
    <body>
    <p>
        <h3>Hello ${name},<br>        
        Welcome to Especkro 2023.</h3><br>

        Please use the following OTP to verify your account.<br>
        <b>OTP: ${otp}</b><br>
        
        <br>
        Note: This OTP is valid for 2 minutes.<br>
    </p>
    </body>
    </html>
    `;
};

export const registerTemplate = (name: string) => {
  return `<html>
        <body>
        <p>
            <h3>Hello ${name},<br>        
            Welcome to Especkro 2023.</h3><br>

            You have successfully registered for Espektro 2023.<br>
            
            Using this platform, you can register for events, check-in for events, and much more.<br>
            Here are some of the rules you need to follow:<br>
            <ul>
                <li>Be on time for the events.</li>                
                <li>Follow the rules of the event.</li>
                <li>Have fun!</li>
            </ul>
            
            <br>
            Contact us for any queries.<br>            
            <br>
        </p>
        </body>
        </html>
        `;
};

export const sendOTPResetPasswordTemplate = (otp: string) => {
  return `<html>
        <body>
        <p>
            <h3>Hello participant,<br>        
            You requested to reset your password.</h3><br>

            Please use the following OTP to reset your password.<br>
            <b>OTP: ${otp}</b><br>

            <br>Note: This OTP is valid for 2 minutes.<br>
        </p>
        </body>
        </html>
        `;
};

export const addVolunteerTemplate = (
  name: string,
  email: string,
  password: string,
  volunteerName = "Admin",
) => {
  return `<html>
        <body>
        <p>
            <h3>Hello ${name},<br>        
            You are added as a volunteer for Espektro 2023 by ${volunteerName}.</h3><br>


            Please use the following credentials to login from the volunteer app.<br>
            <b>Email: ${email}</b><br>
            <b>Password: ${password}</b><br>
            
            <br>
        </p>
        </body>
        </html>
        `;
};

export const inviteParticipantTemplate = (
  name: string,
  referralCode: string,
  url: string,
) => {
  return `<html>
        <body>
        <p>
            <h3>Hello,<br>        
            ${name} has invited you to Espektro 2023
            </h3><br>

            Please use the following link to register for events at Espektro 2023.<br>
            <b>Link: ${url}?referralcode=${referralCode} </b><br>
            or use the following referral code to register.<br>
            <b>Referral Code: ${referralCode}</b><br>
            <br>
        </p>
        </body>
        </html>
        `;
};
