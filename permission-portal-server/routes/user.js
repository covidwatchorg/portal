import express from "express";
import bodyParser from "body-parser";
import { pool } from "../config";

const userRouter = express.Router();
userRouter.use(bodyParser.json());

// TODO: routes here

export default userRouter;
