const mongoose = require("mongoose");
const dotenv = require("dotenv");
// reading the variables from the file and save them ino node.js environment variables:
dotenv.config({ path: `${__dirname}/.env` });

const app = require(`${__dirname}/app.js`);

// console.log(process.env);
// const db = process.env.DATABASE_LOCAL;
const db = process.env.NODE_ENV === "development" ? process.env.DATABASE_LOCAL : process.env.DATABASE_ATLAS_STRING ;
// console.log(process.env.DATABASE_LOCAL);
// console.log(process.env.DATABASE_ATLAS_STRING);

// this connect method is returing a promise so we have to handle it using then.
mongoose.connect(db).then(() => console.log("is it connected ?"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log("===================== Welcome to " + db + " on port "+port+" =====================");
  console.log("Start");
});

// anytime there is an unhandled rejection of a promise (async functions) somewhere in the application,
// this piece of code makes proccess obj will emitt an obj called unhandled rejection
process.on("unhandledRejection", (error) => {
  console.log(error.name, error.message);
  /*
  by doing server.close(),
  we give the server, basically time to finish all the request
  that are still pending or being handled at the time,
  and only after that, the server is then basically killed
  */
  server.close(() => {
    process.exit(1); // killing code .
  });
});

// anytime there is an uncaught exception (a sync function) somewhere in the application,
// this piece of code makes proccess obj will emitt an obj called unhandled rejection
process.on("uncaughtException", (error) => {
  console.log(error.name, error.message);
  server.close(() => {
    process.exit(1); // killing code .
  });
});
