import 'dotenv/config';
import Db from 'mysql2-async';

const MYSQL_DB_USERNAME = process.env.MYSQL_PLANETSCALE_USERNAME;
const MYSQL_DB_PASSWORD = process.env.MYSQL_PLANETSCALE_PASSWORD;
const MYSQL_DB_SERVER = process.env.MYSQL_PLANETSCALE_SERVER
const MYSQL_DB_BLOG = process.env.MYSQL_PLANETSCALE_DB_BLOG

export const db = new Db({
  database: MYSQL_DB_BLOG,
  host: MYSQL_DB_SERVER,
  user: MYSQL_DB_USERNAME,
  password: MYSQL_DB_PASSWORD,
  ssl: { 'rejectUnauthorized': true },
  pool: 4,
});
