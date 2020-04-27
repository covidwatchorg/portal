import bodyParser from "body-parser";
import express from "express";

import { pool } from "../config";

const organizationRouter = express.Router();
organizationRouter.use(bodyParser.json());

// TODO: routes here

// simple query to test server

const getOrgs = async (req, res, next) => {
  try {
    const client = await pool.connect();
    const results = await client.query("SELECT * FROM Organizations");
    res.status(200).json(results.rows);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
};

organizationRouter.route("/").get(getOrgs);

export default organizationRouter;
