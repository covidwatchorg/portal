import express from "express";
import bodyParser from "body-parser";
import { pool } from "../config";

const permissionRouter = express.Router();
permissionRouter.use(bodyParser.json());

// TODO: routes here



export default permissionRouter;