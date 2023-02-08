const axios = require("axios");
const dotenv = require("dotenv");
const aws = require("aws-sdk");

dotenv.config();

const accessKeyId = process.env.SES_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.SES_AWS_SECRET_ACCESS_KEY;
const region = process.env.SES_AWS_REGION;
aws.config.update({
  accessKeyId,
  secretAccessKey,
  region,
});
let ses = new aws.SES();

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

async function sendMail(to: string, subject: string, emailContent: string) {
  const sender = "Espektro 2023 <espektro@gdsckgec.in>";
  const charset = "UTF-8";
  var params = {
    Source: sender,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: charset,
      },
      Body: {
        Html: {
          Data: emailContent,
          Charset: charset,
        },
      },
    },
  };
  try {
    const data = await ses.sendEmail(params).promise();
    console.log("Email sent: " + to);
    return {
      hasError: false,
      response: data,
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
