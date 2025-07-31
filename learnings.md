# Key Learnings and steps to init the production grade project
- `npm init` - Initialization a node package manager with all information   
- `touch <file name>` - A command for file creation through terminal bash 
- Create `Readme.md` file for basic initialization.
- C
- reate `public` folder for holds the public stuff.  
- `.gitkeep` - for pushing and tracking the empty folders by git on github as project needed
- `.env and .env.sample` - for protecting the secrets and push sample on github
- `.gitignore generator` - [click here](https://mrkandreev.name/snippets/gitignore-generator/)
- `A new resume` - [click here](https://mrkandreev.name)
- `nodemon` - A npm package for hot reloading on save for backend practices
- `dependencies vs devDependencies` - Dependencies is the object where the necessary packages are hold that are going to push to the production environment, on the other hand devDependencies is a object is used for holding those dependencies that are needed while development processes not in production pushes like `nodemon` for hotreloading while working on backend. 
- `dev` - A script which is going to use to start the `server` through npm with `nodemon`
- `ls` - A command for list the files in directory 
- `mkdir <folder name>` - A command for create the folder (4 main folders are created for handle major work of the project). 
- `prettier` - A npm package for managing the code style all through out the project. 
  
---- 

# Database connections

- `Mongodb atlas` - we use Mongodb atlas as our database manager.
- After login into the mongodb atlas dashboard, create `org`, and create `new project`. 
- Set `Network access IPs` for accessing the database, generally the only `host machine's IP` is put in Network access tab from where backend source code is served.   
- While working with `mongodb atlas` we never set the allow network access from anywhere.

- Now set the `env variables` in .env file for finalizing the connection set up in our Backend like `PORT`, `DATABASE_URI`.
- Set the database name in the `constants.js` file like `DB_NAME = "backendPractice"` so that in the future, we only need to change it in one place instead of multiple locations.

- Download the three main necessary npm packages `dotenv`, `mongoose`, `express` 

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
- Mongoose always return `object` as response 