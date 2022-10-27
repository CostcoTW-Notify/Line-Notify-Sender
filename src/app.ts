import "express-async-errors";
import express from "express";
import morgan from "morgan";
import expressJSDocSwagger from "express-jsdoc-swagger";
import { SampleController } from "@/controllers/sampleController";
import { LineNotifyController } from "@/controllers/lineNotifyController";
import { validationErrorHandler } from "@/middleware/validationErrorHandler";

const app = express();

const swaggerSetting = {
  info: {
    version: "1.0.0",
    title: "Line Notify Sender",
    license: {
      name: "MIT",
    },
  },
  baseDir: __dirname,
  // Glob pattern to find your jsdoc files (multiple patterns can be added in an array)
  filesPattern: ["./**/*.ts"],
  swaggerUIPath: "/api-doc",
};

app.use(express.json());
app.use(morgan("dev"));

SampleController.registerRouter(app);
LineNotifyController.RegisterRoute(app);

const spec = expressJSDocSwagger(app)(swaggerSetting);

app.use(validationErrorHandler);

app.listen(8000, () => {
  let conn_str = process.env.mongo_conn_str;
  let message_collection = process.env.line_notify_message;
  if (conn_str === undefined) throw "env: mongo_conn_str not setup...";
  if (message_collection === undefined)
    throw "env: line_notify_message not setup...";
  console.log("Server is running on port", 8000);
});
