# Task50

#### Video Demo:  [Introductory Video](URL)

#### Description:

Hi :wave: ! This project provides a place in the web to setup tasks to get organized and keep track of daily tasks, goals and schedule by log in with an account, creating, editing and deleting tasks when needed.

I used Javascript in the Backend of this project. This application uses the [ExpressJS](https://expressjs.com) framework for creating the server and managing routes, and [express-session](https://github.com/expressjs/session#readme) module for session management. The templating of pages uses [EJS](https://ejs.co/). For storing user and session data I decided to use [sqlite](https://www.sqlite.org). The connection between the application and the database uses the [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) module.

#### How to run this application
1. The most easy way, I believe, is by running it on [Docker](https://www.docker.com/)

   If you have Docker installed (and running), you can run
   ```
   docker run -p 8080:8080 moisesggomes/task50
   ```

   This command will download the application from the cloud and run it automatically. You will see something like:
   ```
   > task50@1.0.0 start
   > node server.js

   Server is running 'http://localhost:8080/'
   ```
   This means you can open your browser and start interacting with the application

2. If you have [`NodeJS`](https://nodejs.org/en/download/) and [Git](https://git-scm.com/downloads) installed, you can download this repository by opening your terminal and running the following commands:
    ```
    git clone https://github.com/moisesggomes/task50.git
    ```
    After downloading the repository, run `cd task50` to go to the root directory. Create an `.env` file in the **root** of the repository and add the following content to it:
    ```
    PORT=8080
    SESSION_SECRET="foo"
    SALT_LENGTH=8
    HASHED_PASSWORD_LENGTH=64
    ```
    This file will set environment variables to be be used later by the application

    Now, open `server.js` and add the following line to the **beginning** of the file:
    ```js
    require("dotenv").config()
    // Rest of the file
    ```

    - Now, run `npm install` to install the dependencies
    - And, finally, run `npm start` to start the application
      - The default port is **8080**, but you can choose another one by changing the `PORT` variable
    - **NOTE**
      - If you got some error related to the **better-sqlite3** after running `npm install`, be sure that you also have sqlite3 installed
      - Maybe this could help:
        - https://stackoverflow.com/questions/57241886/ive-a-problem-for-install-better-sqlite3

#### Structure of the project
- Root:
  - Here, we have the `server.js` file, which initializes our app.