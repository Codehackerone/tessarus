# tessarus

Backend for Expectro'23 Ticketing System

# Deployment URLs

- https://tessarus.gdsckgec.in/
- https://tessarus-staging.gdsckgec.in/

# Documentation

Click [here](https://documenter.getpostman.com/view/15506921/2s8ZDczzci) to view the documentation.

# Install and Start

`yarn install`

`yarn build`

`yarn start`

# 3rd Party Services Used

- MongoDB
- AWS
  - S3(Storing Files)
  - SES(Emailing)
  - EC2(Deployment)
- Cloudinary (Depreciated)
- SendGrid (RapidAPI) (Depreciated)

# Start app

- `git clone`
- create .env
- `yarn install`
- `yarn build`
- `mkdir uploads`
- `yarn test`
- `yarn start`

# Contributing

- Fork the repo
- Create a new branch with format 'dev-(your name)'
- After making changes, dont forget to run
  - `yarn preffyfix` (This will format your code)
  - `yarn test`
- Commit your changes
- Push your changes to your forked repo
- Create a pull request to the main repo with the following details
  - Title
  - Description
  - Screenshots (if any)
  - Link to the issue (if any)
- Make sure all the checks pass
