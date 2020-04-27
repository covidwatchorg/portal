import dotenv from 'dotenv';
import {Pool} from 'pg';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// const connectionString =
//     `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${
//         process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
const connectionString =
    'postgres://iydpncmhthewfo:7cd68c7941af414c0644840790130cd88673c4c11087cc877cb80b43d28755cc@ec2-18-233-137-77.compute-1.amazonaws.com:5432/djppvnusl0spa';

export const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: true
});