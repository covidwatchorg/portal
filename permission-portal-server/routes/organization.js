import express from "express";
import bodyParser from "body-parser";
import { pool } from "../config";

const organizationRouter = express.Router();
organizationRouter.use(bodyParser.json());

// TODO: routes here

// simple query to test server

const getOrgs = async (req, res, next) => {
  try {
    const results = await pool.query("SELECT * FROM Organizations");
    res.status(200).json(results.rows);
  } catch (err) {
    throw err;
  }
};

organizationRouter.route("/")
.get(getOrgs);


export default organizationRouter;