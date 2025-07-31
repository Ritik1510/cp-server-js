# Key Learnings and steps to init the production grade project
- `npm init` - Initialization a node package manager with all information   
- `touch <file name>` - A command for file creation through terminal bash 
- Create `Readme.md` file for basic initialization.
- Create `public` folder for holding the public stuff.  
- `.gitkeep` - for pushing and tracking the empty folders by git on github as project needed
- `.env and .env.sample` - for protecting the secrets and push sample on github
- `.gitignore generator` - [click here](https://mrkandreev.name/snippets/gitignore-generator/)
- `A new resume` - [click here](https://mrkandreev.name)
- `nodemon` - A npm package for hot reloading on save for backend practices
- `dependencies vs devDependencies` - dependencies is an object that holds the essential packages required for the application to run in the production environment. In contrast, devDependencies contains packages needed only during development, such as nodemon for hot-reloading in a backend workflow. 
- `dev` - A script which is going to use to start the `server` using npm command with `nodemon`
- `ls` - A command for list the all files in directory 
- `mkdir <folder name>` - A command for create the folder (4 main folders are created for handle major work of the project). 
- `prettier` - A npm package for managing the code style all through out the project. 

---- 

# Database connections 

* We use `MongoDB Atlas` as our cloud database service.

* After logging into the MongoDB Atlas dashboard, create an `Organization`, then a `Project`.

* Under the **Network Access** section, add the IP address of the machine that will run the backend server. Avoid using **"Allow access from anywhere"** for security reasons.

* Create a `.env` file and define environment variables such as:

  * `PORT` – the port your backend will run on.
  * `DATABASE_URI` – the MongoDB connection string provided by Atlas.

* In `constants.js`, define your database name like:

  ```js
  const DB_NAME = "backendPractice";
  ```

  This allows easy updates in the future from a single location.

* Install the essential packages using npm:

  ```bash
  npm install dotenv mongoose express
  ```

---
#### DB is on another continent 
- Whenever we try to connect to the database from the backend, we often encounter errors. To handle such situations, we use the `try-catch` approach and `promises` with `async await` for better error handling & safe connection, defenately it takes time to connect .
- we have main 2 approaches to deail with this problem. 
    - `First Approach:` using Traditonal functions and IFEEs. 

    ```javascript   
    // Normal first approach 
    functon connectDB(){

    }

    connectDB(); // simple execution 
    ```

    ```javascript   
    // Modular first approach (IFEEs) 
    import mongoose from "mongoose";
    import { DB_NAME } from "./constants";
    import express from "express";

    const app = express();
    ; (async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            app.on("error", (err) => {
                console.error("ERROR", err);
                throw err;
            }); 

            app.listen(process.env.PORT, () => {
                console.log(`Server is running on port ${process.env.PORT}`);
            });
            
        } catch (error) {
            console.error("ERROR", error);
            throw error; 
        }
    })()
    ```

    - `Second Modular Approach`: we import all the connection logic from another file declared in db connection related directory, in our case is `./db/index,js`.
  
    ```javascript 
    import dotenv from "dotenv"
    import connectDB from "./db/index.js"; // from here the logic is imported 

    dotenv.config({
        path: './env'
    })

    connectDB(); 

    ```
- Mongoose always return `object` as response. 
- `app.use()` method is only used for middleware configurations and middleware settings. 
- After setting up the `app.js` file by using express.js then install `cors` and `cookie-parser`, and use it in app.js file. 
- Set the cors configuration by looking the cors offical npm docs.
- Since the data is comming in many forms like `json`, `form data`, `url-data-response`, we must manage the data incommings. 
- Set json limit 
    ```js
    app.use(express.json({ limit: "20kb" })); 
    ```
- Set url encoding practices for handling the url related data request hits.
    ```js
    app.use(express.urlencoded()); 
    ```
---
### **Middleware & Error Handling Setup**

* Set up `cookie-parser` to manage cookie-related data (like session tokens, authentication, etc.). Install it and use it as middleware in your Express app:

  ```bash
  npm install cookie-parser
  ```

  ```js
  const cookieParser = require("cookie-parser");
  app.use(cookieParser());
  ```

* Create an `asyncHandler.js` utility file to simplify handling of asynchronous operations in routes and controllers. This makes the code **modular**, **clean**, and **reusable** by automatically catching errors in async functions and forwarding them to the global error handler.
  Example:

  ```js
  const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

  module.exports = asyncHandler;
  ```

* There are generally two common ways to handle asynchronous logic:

  * Using `try-catch` blocks inside each controller function.
  * Wrapping route handlers in `Promise-based` middleware like `asyncHandler` to centralize error handling and reduce code repetition.

* Create utility classes like `ApiError` and `ApiResponse`:

  * `ApiError`: Standardizes the structure for all thrown errors (e.g., custom message, HTTP status code, stack trace).
  * `ApiResponse`: Provides a consistent structure for sending successful responses, making your API cleaner and easier to consume.

  Example `ApiError.js`:

  ```js
  class ApiError extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
      Error.captureStackTrace(this, this.constructor);
    }
  }

  module.exports = ApiError;
  ```

  Example `ApiResponse.js`:

  ```js
  class ApiResponse {
    constructor(statusCode, data, message = "Success") {
      this.statusCode = statusCode;
      this.message = message;
      this.data = data;
    }
  }

  module.exports = ApiResponse;
  ```

* Finally, set up a **global error handler** middleware in your main `app.js` or `server.js` file to handle all errors thrown using `ApiError` or caught via `asyncHandler`.

