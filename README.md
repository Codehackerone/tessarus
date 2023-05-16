# tessarus

Backend for Expectro'23 Ticketing System

# Features

- Attendees can easily book tickets and pay securely using multiple payment methods.
- Has features for admins to create, update, and delete events, and for volunteers to quickly scan tickets and check-in participants using generated QR codes.
- Implemented a unique password generation system for individual event participants at check-in, streamlining the registration process while also improving event security

# Deployment URLs

- https://tessarus.gdsckgec.in/ (Link may be broken)
- https://tessarus-staging.gdsckgec.in/

# Documentation

Click [here](https://documenter.getpostman.com/view/15506921/2s8ZDczzci) to view the POSTMAN documentation.

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
