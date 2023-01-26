const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

async function sendMail(to: string, subject: string, emailContent: string) {
  const options = {
    method: "POST",
    url: "https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": String(process.env.X_RAPIDAPI_KEY),
      "X-RapidAPI-Host": String(process.env.X_RAPIDAPI_HOST),
    },
    data: `{
            "personalizations": [
              {
                "to": [
                  {
                    "email": "${to}"
                  }
                ],
                "subject": "${subject}"
              }
            ],
            "from": {
              "email": "${process.env.SENDGRID_EMAIL}"
            },
            "content": [
              {
                "type": "text/plain",
                "value": "${emailContent}"
              }
            ]
          }
          `,
  };
  return axios
    .request(options)
    .then(function (response: any) {
      console.log("Email sent: " + to);
      return {
        hasError: false,
        response,
      };
    })
    .catch(function (error: any) {
      console.log("Email not sent: " + to);
      return {
        hasError: true,
        error,
      };
      //console.error(error);
    });
}

export default sendMail;