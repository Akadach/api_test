const express = require("express");
//const router = express.Router();
//module.exports = router;
const bodyParser = require("body-parser");
const cors = require("cors");
const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "test"
  }
});
const app = express();
const port = 9999;

app.use((req, res, next) => {
  req.knex = knex;
  next();
});
app.use(bodyParser.json());
app.use(cors());

app.get("/student/:id", async (req, res) => {
  try {
    console.log(req.params.id); // http://localhost:7001/?id=6139010007  // query
    if (req.params.id) {
      //   let rows = await knex('teacher_teach').where("std_code","=",req.params.id)
      let rows = await knex.raw(
        `SELECT  std_code,std_name,cou_code,cou_thai,cou_unit,grade  FROM teacher_teach WHERE std_code=${
          req.params.id
        }`
      );
      let rows1 = await knex.raw(
        `SELECT ROUND(sum(cou_unit*grade)/sum(cou_unit),2) as total  FROM teacher_teach WHERE std_code=${
          req.params.id
        }`
      );
      console.log("hello");
      res.send({
        ok: 1,
        student: rows[0],
        avg_grade: rows1[0]
      });
    }
    console.log("std");
  } catch (error) {
    res.send({ ok: 0, error: error.message });
  }
});
app.post("/student/update/:code_up", async (req, res) => {
  console.log("update=", req.body);
  if (!req.body.cou_code) {
    res.send({ ok: 0, error: "cou_code missing" });
    return; // จบการทำงาน
  }
  await req
    .knex("teacher_teach")
    .where("cou_code", "=", req.body.cou_code)
    .where("std_code", "=", req.body.std_code)
    .update({
      grade: req.body.grade
    });
  res.send({ ok: 1, update: "success" });
});
app.post("/student/insert/:code", async (req, res) => {
  // 1. ตรวจสอบความถูกต้อง
  // req.params req.query req.body
  console.log(req.body);
  if (!req.body.std_code) {
    res.send({ ok: 0, error: "fisrt name missing" });
    return; //จบการทำงาน
  }
  // 2. หาข้อมูลนักเรียน
  let rows = await req
    .knex("teacher_teach")
    .where("std_code", "=", req.body.std_code);
  console.log("rows=", rows.length);
  if (rows.length === 0) {
    // insert
    await req.knex("teacher_teach").insert({
      std_code: req.body.std_code,
      std_name: req.body.std_name,
      cou_code: req.body.cou_code,
      cou_thai: req.body.cou_thai,
      cou_unit: req.body.cou_unit,
      grade: req.body.grade
    });
  }
  res.send({ ok: 1 });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
