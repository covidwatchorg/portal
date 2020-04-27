import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import userRouter from "./routes/user";
import organizationRouter from "./routes/organization";
import permissionRouter from "./routes/permission";

(async () => {
  const app = express();
  app.disable("x-powered-by");
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());

  app.use("/user", userRouter);
  app.use("/organization", organizationRouter);
  app.use("/permission", permissionRouter);

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
})();
