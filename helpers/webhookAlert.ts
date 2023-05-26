import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// webhooks alerts for discord

// alert notification
export const alert = (route: any, err: any) => {
  try {
    // if webhook alert is disabled
    if (process.env.ENABLE_WEBHOOK_ALERT === "false") return;
    // config for webhook
    const config = {
      method: "post",
      url: process.env.WEBHOOK_URL,
      headers: {
        "Content-Type": "application/json",
        Cookie:
          "__cfruid=257502c84f1745d2429addf6027ba51622d0925d-1675790042; __dcfduid=d17f8678a70a11ed9ddd125d62ef2dd2; __sdcfduid=d17f8678a70a11ed9ddd125d62ef2dd231c15e4abb88051b42fc96c542483dcc2bd4bbb222b39648c7c575906fdb760e",
      },
      // data to be sent
      data: JSON.stringify({
        username: "API WatchDog",
        avatar_url:
          "https://tessarus.s3.ap-south-1.amazonaws.com/1a9d66b96b836ae17396cc0a7c12ab25",
        content: "SERVER_ERROR",
        embeds: [
          {
            title: "API WatchDog Environment - " + process.env.ENV,
            color: 0xfdd017,
            fields: [
              {
                // error message and details to be sent
                name: "Error ar Route " + route,
                value: "```" + err + "```",
              },
            ],
          },
        ],
      }),
    };

    // send webhook
    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (err) {
    console.log(err);
  }
};

// deploy/restart notification
export const deploy = () => {
  try {
    if (process.env.ENABLE_WEBHOOK_ALERT === "false") return;
    if (process.env.ENV === "dev") return;

    let deployUrl: any = "";
    switch (process.env.ENV) {
    case "dev":
      deployUrl = "http://localhost:" + process.env.PORT;
      break;
    case "staging":
      deployUrl = process.env.STAGING_URL;
      break;
    case "prod":
      deployUrl = process.env.PRODUCTION_URL;
      break;
    }

    const config = {
      method: "post",
      url: process.env.WEBHOOK_URL,
      headers: {
        "Content-Type": "application/json",
        Cookie:
          "__cfruid=257502c84f1745d2429addf6027ba51622d0925d-1675790042; __dcfduid=d17f8678a70a11ed9ddd125d62ef2dd2; __sdcfduid=d17f8678a70a11ed9ddd125d62ef2dd231c15e4abb88051b42fc96c542483dcc2bd4bbb222b39648c7c575906fdb760e",
      },
      data: JSON.stringify({
        username: "API WatchDog",
        avatar_url:
          "https://tessarus.s3.ap-south-1.amazonaws.com/1a9d66b96b836ae17396cc0a7c12ab25",
        content: "New Deployment",
        embeds: [
          {
            title: "API WatchDog Environment - " + process.env.ENV,
            color: 0x00bfff,
            fields: [
              {
                name: "New Deployment at " + deployUrl,
                value:
                  "```" +
                  "New Deployment on " +
                  //date in ist
                  new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Kolkata",
                  }) +
                  "```",
              },
            ],
          },
        ],
      }),
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (err) {
    console.log(err);
  }
};
