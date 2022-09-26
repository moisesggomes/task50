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
  - `server.js`:
    - Initializes the app and it's where does all routing management and sessions
    - In the beginning of the file, it imports the modules, helper funcions, start the application with `app.listen(/* ... */)` and set some configurations:
      - Set the sqlite as the database for managing sessions
        ```js
        const SQLiteStore = better_sqlite3_session_store(session)
        ```
      - The middlewares for serving static files, session configurations and JSON parsing with
        ```js
        app.use(/* ... */)
        ```
      - And tells Express to use the EJS templating
        ```js
        app.set("view engine", "ejs")
        ```
    - After that first part, we have the routes to interact with the application
      - `/` manages the user tasks itself. It requires that the user is logged in, otherwise, it will be redirected to the `/login` route
      - `/login` and `/signup` are only available if the user is not logged in. If so, the user can type the username and password to be validated by the database and these actions will call the respective helper function from `utils/login_signup.js`
        - If an error happens with the authentication or validation of the data typed, it will show in the screen for the user below the form for login/signup in red. If not, the session will be created for the user.
      - `/logout` destroys the current session
    - And finally, the `/tasks` path provides an API for getting, creating, updating and deleting tasks, according to the method used.
      - The middleware ```getUser``` checks if the user is authenticated, if it exists in the database and returns the data from it according to the `'user'` key get from the session. Every action in the database, will use not only the data sent by the user (like `PUT` or `DELETE` for example), but the actual data stored in the session itself for doing these operations. This prevents a user from trying to update or delete data related to another user by changing the data sent to the server like the taskId, for example.
      - The `GET` method gets all tasks from the server
      - The `POST` method creates a new task
      - The `PUT` method updates an existing task every time a change is submited by the user (like marking a task as finished or by updating the task description)
      - The `DELETE` method takes an array of tasks to be deleted by the user

      - These routes use some helper functions from `utils/tasks.js` to do operations in the database. If an error occurs with any of these operations, a string with an error message is returned. Otherwise, the tasks will be returned with some info.
  - `package*.json`:
    - These are the files to keep track of all dependencies and scripts (like `npm start`)
  - `Dockerfile`:
    - The "blueprint" to generate the image to be run with Docker
  - `.*ignore`:
    - Files to prevent from pushing unnecessary files to Github or Docker Hub
- `databases/database.sqlite`:
  - This is the file to store all data
    - It stores session data in a table called _sessions_
    - It stores all tasks in a single table _tasks_
    - And it stores the users username and hashed password in a table called _users_
- `public`:
  - Here are all static content served by the server. All `.css`
  - `public/home.js`:
    - This file contains all logic when the user is interacting with the application
    - It has the logic for show/hide elements and the main logic for getting, creating, updating, deleting and sending the request to the server using the **`fetch API`** and **`XMLHttpRequest API`**
    - I tried to split up the logic a little bit by using functions for commom code tasks like creating elements and sub-elements, writing and selecting tasks to be deleted
  - `public/assets`:
    - Contains all source `.svg` images used
- `utils`:
  - 