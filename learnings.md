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
- Mongoose always return `objects` as response. 
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

---
- Install packages `bcrypt`, `jsonwebtoken`, `mongoose-aggregate-paginate-v2`. 
- Use bcrypt, jwt where the encryption needed, for now in User.models.js.
- Use `pre` hook provided by mongoose/middleware that helps us to perform tasks just before happening something, for now in User.models.js.
- Use this funciton to check value is modified or not. 
  ```js
  this.isModified("password");
  ```
- We can also inject own methods over anything using mongoose `methods` hook. and `hash` and `compare` the password as well, like this. 
  ```js
  userSchema.pre("save", async function (next) { // function on validation "save", mongoose docs
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10);
    next();
  });

  userSchema.methods.isPasswordCorrect = async function(password){
      return await bcrypt.compare(password, this.password);
  }  
  ```
- `JsonWebToken` (jwt) is a type of key, like if someone has the jwt key, it is suitable to recieve the data and successfully access the data. 
- `File handling` is not the part of frontend, it is the part of backend. 
- `Cloudinary` is a cloud-based, API-first platform that provides solutions for managing, transforming, optimizing, and delivering images and videos. It `automates` the entire media lifecycle, from upload and storage to delivery, using AI and automation to enhance user experiences and streamline workflows. Cloudinary offers a wide range of features, including AI-powered transformations, responsive image and video optimization, and a media library for easy management, INSTALL IT .
- configure the cloudinary in project using the cloudinary docs, same as for `express-fileupload` and `multer`.   
- `Express.js`, a popular Node.js web framework, does not inherently handle multipart/form-data requests, which are typically used for file uploads. Therefore, external middleware is required to process file uploads in Express. The two most common and widely used solutions for this purpose are `express-fileupload` and `multer`, INSTALL BOTH OF THEM.
- The Node.js `fs` module, which stands for `File System`, is a built-in core module that provides an API for interacting with the file system on the operating system. It allows Node.js applications to perform various file-related operations like `reading files`, `writing files`, etc.
 
--- 
### 🌐 Understanding HTTP (HyperText Transfer Protocol)

**HTTP** is the foundation of data communication on the **World Wide Web**. It defines how **clients (like browsers)** and **servers** communicate via **requests** and **responses**.

- It’s a **stateless**, **application-layer protocol**.
- Uses methods like `GET`, `POST`, `PUT`, `DELETE` to interact with resources.
- Data is transferred in **plain text**, though it’s often used with encryption (via HTTPS).

### 📡 HTTP Headers Overview

HTTP headers are metadata sent as key-value pairs between the client and server in both **requests** and **responses**. They help control behaviors like **caching**, **authentication**, **content negotiation**, and more.

| **Header Type**       | **Direction**        | **Purpose / Explanation**                                                                 |
|-----------------------|----------------------|--------------------------------------------------------------------------------------------|
| **Request Headers**   | Client → Server      | Sent from client to server. Used to pass user-agent info, authentication tokens, etc.     |
| **Response Headers**  | Server → Client      | Sent from server to client. Contains cache rules, cookies, server type, CORS policies.    |
| **Representation Headers** | Both Directions | Describe the format of the message body (e.g., `Content-Type`, `Content-Encoding`).        |
| **Payload Headers**   | Usually Client → Server | Provide metadata about the request body content (e.g., `Content-Length`, `Transfer-Encoding`). |
| **General Headers**   | Both Directions      | Apply to both request and response messages, but not the actual content (e.g., `Cache-Control`). |

### 🔑 Common Use Cases
- **Caching**: Control how responses are stored/reused (`Cache-Control`, `ETag`).
- **Authentication**: Pass credentials (`Authorization`, `WWW-Authenticate`).
- **Content Negotiation**: Specify acceptable media types or languages (`Accept`, `Accept-Language`).
- **User State Management**: Use cookies or tokens to manage sessions (`Cookie`, `Set-Cookie`).

### 🧾 Most Common HTTP Headers

These headers are frequently used in modern web applications for API communication, security, user sessions, and content handling.

### 🔄 Request & Response Headers

| **Header**              | **Purpose / Example**                                                   |
|-------------------------|-------------------------------------------------------------------------|
| `Accept`                | Informs the server what content type the client expects. <br>📌 `Accept: application/json` |
| `User-Agent`            | Identifies the client application (e.g., browser or app).               |
| `Authorization`         | Sends authentication credentials. <br>📌 `Authorization: Bearer <token>` |
| `Content-Type`          | Describes the format of the request or response body. <br>📌 `Content-Type: application/json` |
| `Cookie`                | Sends stored cookies for session or user-specific data. <br>📌 `Cookie: sessionId=abc123` |
| `Cache-Control`         | Defines caching policies (e.g., no-store, max-age). <br>📌 `Cache-Control: max-age=3600` |


### 🌍 CORS (Cross-Origin Resource Sharing)

Used to control access between different origins (domains).

| **Header**                        | **Purpose / Example**                                                                       |
|----------------------------------|---------------------------------------------------------------------------------------------|
| `Access-Control-Allow-Origin`    | Specifies which origins can access the resource. <br>📌 `Access-Control-Allow-Origin: *`    |
| `Access-Control-Allow-Credentials` | Indicates whether cookies and credentials are included. <br>📌 `true`                       |
| `Access-Control-Allow-Methods`   | Lists allowed HTTP methods (e.g., `GET`, `POST`). <br>📌 `Access-Control-Allow-Methods: GET` |

---

### 🔐 Security Headers

Enhance security and reduce vulnerabilities like XSS, clickjacking, etc.

| **Header**                        | **Purpose / Example**                                                                         |
|----------------------------------|-----------------------------------------------------------------------------------------------|
| `Cross-Origin-Embedder-Policy`   | Controls loading of cross-origin resources. <br>📌 `require-corp`                             |
| `Cross-Origin-Opener-Policy`     | Isolates browsing context to prevent side-channel attacks. <br>📌 `same-origin`               |
| `Content-Security-Policy`        | Restricts sources for scripts, images, etc. <br>📌 `default-src 'self';`                      |
| `X-XSS-Protection`               | Enables browser’s built-in XSS filters. <br>📌 `X-XSS-Protection: 1; mode=block`              |

### 🚀 HTTP Methods

HTTP methods define the set of actions that can be performed to interact with server resources.

| **Method** | **Purpose**                                |
|------------|---------------------------------------------|
| `GET`      | Retrieve data from the server.              |
| `HEAD`     | Same as `GET` but returns only headers.     |
| `OPTIONS`  | Describes the allowed methods for a resource.|
| `TRACE`    | Debugging tool to trace request path.       |
| `DELETE`   | Remove the specified resource.              |
| `PUT`      | Replace a resource or create if not exists. |
| `POST`     | Submit data to create a new resource.       |
| `PATCH`    | Apply partial modifications to a resource.  |

### 📊 HTTP Status Codes

HTTP status codes indicate the result of a request. They are grouped into categories based on the response type.

| **Code Range** | **Category**      | **Meaning**                                             |
|----------------|-------------------|----------------------------------------------------------|
| `1XX`          | Informational     | Request received, continuing process                    |
| `2XX`          | Success           | Request was successfully received and processed         |
| `3XX`          | Redirection       | Further action needed to complete the request           |
| `4XX`          | Client Error      | The request has an error or is invalid                  |
| `5XX`          | Server Error      | Server failed to fulfill a valid request                |

### 🔍 Common Status Codes

| **Code** | **Meaning**                        |
|----------|------------------------------------|
| `100`    | Continue — Initial part received, continue with request |
| `102`    | Processing — Request accepted but not completed yet     |
| `200`    | OK — Successful response                              |
| `201`    | Created — New resource has been created               |
| `204`    | No Content — Successful, but no content to return     |
| `301`    | Moved Permanently — Resource has a new URL            |
| `302`    | Found — Temporary redirect                            |
| `304`    | Not Modified — Use cached version                     |
| `400`    | Bad Request — Invalid syntax or parameters            |
| `401`    | Unauthorized — Authentication required                |
| `403`    | Forbidden — Access is not allowed                     |
| `404`    | Not Found — Resource does not exist                   |
| `409`    | Conflict — Resource state conflict                    |
| `500`    | Internal Server Error — General server failure        |
| `502`    | Bad Gateway — Invalid response from upstream server   |
| `503`    | Service Unavailable — Server is temporarily down      |
| `504`    | Gateway Timeout — Upstream server failed to respond   |
---
- Write controllers from here 
- Continue with `routes` and create express routers using `router()` fnc. 
- req and res in async function both can access the cookies using the `req/res.cookie()` 
- Both the req and res is objects that are avilable in application environment.
  
  ```js
  const router = Router();
  router.route("/register").post(
      upload.fields([ // middleware to handle multiple file uploads
          // jate hoye ham se milte jana 
          {
            name: "avatar", 
            maxCount: 1
          }, 
          {
            name: "coverImage",
            maxCount: 1
          }
      ]), 
      registerUser
  )
  ```

### 🧩 Explanation

| **Component**     | **Purpose**                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| `"/register"`     | Defines the endpoint path to handle user registration.                       |
| `.post()`         | Specifies the HTTP method to be handled (POST in this case).                 |
| `upload.fields()` | Middleware to handle multiple file uploads (`avatar`, `coverImage`).         |
| `registerUser`    | Controller function that handles the business logic after middleware passes. |

> 💬 The middleware `upload.fields()` acts like a checkpoint — “**jate hue ham se milte jana**” — making sure all required files are processed before handing control to the controller.

--- 

Haha 😄 — **yes, you got it** and I got you!
So to lock it down:

> 🧠 Upload flow summary:
>
> 1. User sends file (Postman/form)
> 2. Multer saves it **locally**
> 3. You upload it to **Cloudinary**
> 4. You `fs.unlinkSync()` to **delete the local file** after successful upload

That’s exactly how **real-world servers** manage temporary uploads. 🔥


### *I must check for these later*
* Cloudinary config best practices
* Try-catch safety for unlinking
* Async version of `unlink`
* Or anything else you're curious about

--- 
- ACCESS TOKEN VS REFRESH TOKEN 
  - Access tokens and refresh tokens are both used for authentication and authorization in web applications, but they have distinct purposes and lifespans. Access tokens are short-lived tokens that grant access to specific resources, while refresh tokens are long-lived tokens used to obtain new access tokens when the old ones expire, without requiring the user to re-authenticate. 
  Here's a more detailed breakdown: 
  
  ### Access Token: 
  • Purpose: Grants access to protected resources (e.g., APIs, websites). 
  • Lifespan: Short, typically lasting from minutes to a few hours. 
  • Security: Includes security features like signatures to prevent tampering. 
  • Usage: Sent with each request to access protected resources. 
  • Example: A user logs in and receives an access token. This token is then used to access their profile information on the website. 

  ### Refresh Token: 

  • Purpose: Used to obtain a new access token when the current one expires.  
  • Lifespan: Longer than access tokens, potentially lasting days or months. 
  • Security: Stored securely on the client-side (e.g., in an HTTP-only cookie) and in the backend database. 
  • Usage: Sent to the server when the access token expires to request a new one.  
  • Example: When the access token expires, the refresh token is used to get a new access token without requiring the user to log in again. 

  In essence: 

  • Access tokens are like single-use tickets, granting access to a specific event or service for a short duration. 
  • Refresh tokens are like season passes, allowing you to obtain new tickets without needing to purchase them each time. 

  Key Differences Summarized: 

  | Feature | Access Token | Refresh Token  |
  | --- | --- | --- |
  | Purpose | Grant access to resources | Obtain new access tokens  |
  | Lifespan | Short | Long  |
  | Storage | Sent with each request, also stored in cookies/localStorage | Stored securely on the client and server  |
  | Security | Less secure due to short lifespan | More secure due to longer lifespan and secure storage  |
  | Compromise | Easier to mitigate due to short lifespan | More severe if compromised, but mitigated by rotation and secure storage  |

  Benefits of using both access and refresh tokens: [1]  

  • Improved security: Short-lived access tokens minimize the impact of a compromised token. [8, 22]  
  • Enhanced user experience: Users don't need to log in repeatedly as refresh tokens handle token renewal. 
  • Flexibility: Allows for different token lifespans based on security requirements. [8, 14]  
  • Rotation: Refresh tokens can be rotated (new refresh token issued upon use) to further enhance security. 
