//const axios = require("axios");
import dotenv from "dotenv";
// import aws from "aws-sdk";
import FormData from "form-data";
import Mailgun from "mailgun.js";

dotenv.config();

// const accessKeyId = process.env.SES_AWS_ACCESS_KEY_ID;
// const secretAccessKey = process.env.SES_AWS_SECRET_ACCESS_KEY;
// const region = process.env.SES_AWS_REGION;
// aws.config.update({
//   accessKeyId,
//   secretAccessKey,
//   region,
// });
// const ses = new aws.SES();

//  sendgrid email sender 

// async function sendMail(to: string, subject: string, emailContent: string) {
//   let dataToSend = {
//     personalizations: [
//       {
//         to: [
//           {
//             email: to,
//           },
//         ],
//         subject: subject,
//       },
//     ],
//     from: {
//       email: String(process.env.SENDGRID_EMAIL),
//     },
//     content: [
//       {
//         type: "text/html",
//         value: emailContent,
//       },
//     ],
//   };

//   const options = {
//     method: "POST",
//     url: "https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send",
//     headers: {
//       "content-type": "application/json",
//       "X-RapidAPI-Key": String(process.env.X_RAPIDAPI_KEY),
//       "X-RapidAPI-Host": String(process.env.X_RAPIDAPI_HOST),
//     },
//     data: dataToSend,
//   };
//   return axios
//     .request(options)
//     .then(function (response: any) {
//       console.log("Email sent: " + to);
//       return {
//         hasError: false,
//         response,
//       };
//     })
//     .catch(function (error: any) {
//       console.log("Email not sent: " + to);
//       return {
//         hasError: true,
//         error,
//       };
//       //console.error(error);
//     });
// }

// aws ses email sender function
// async function sendMail(to: string, subject: string, emailContent: string) {

//   // Set the sender email, email charset type and create a new SES email object with appropriate parameters set.
//   const sender = "Espektro 2023 <espektro@gdsckgec.in>";
//   const charset = "UTF-8";
//   const params = {
//     Source: sender,
//     Destination: {
//       ToAddresses: [to],
//     },
//     Message: {
//       Subject: {
//         Data: subject,
//         Charset: charset,
//       },
//       Body: {
//         Html: {
//           Data: emailContent,
//           Charset: charset,
//         },
//       },
//     },
//   };

//   try {

//     // Call the SES service to send the message asynchronously and wait for the promise to resolve.
//     const data = await ses.sendEmail(params).promise();

//     // Print success message with recipient email in console log and return an object with 'hasError' false and the response data.
//     console.log("Email sent: " + to);
//     return {
//       hasError: false,
//       response: data,
//     };

//   } catch (err) {

//     // If there is any error while sending the email, print error details in console log and return an object with 'hasError' true and the error data.
//     console.log("Email not sent: " + to);
//     console.error(err);
//     return {
//       hasError: true,
//       error: err,
//     };
//   }
// }

async function sendMail(to: string, subject: string, emailContent: string) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({ username: "api", key: process.env.MAILGUN_API_KEY || "", url: "https://api.eu.mailgun.net" });
  const base_domain = process.env.MAILGUN_SENDER_EMAIL_DOMAIN || "communications.espektro.in";
  const email_user = process.env.MAILGUN_SENDER_EMAIL_USER || "no-reply";
  try {
    const res = await mg.messages.create(base_domain, {
      from: email_user + "@" + base_domain,
      to,
      subject,
      html: emailContent,
    });
    console.log("Email sent: " + to);
    return {
      hasError: false,
      response: res,
    };
  } catch (err) {
    console.log("Email not sent: " + to);
    console.error(err);
    return {
      hasError: true,
      error: err,
    };
  }
}


export default sendMail;
