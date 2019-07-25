const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')


const db = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'check_db'
  }
})
const app = express()

app.use(express.static('./public'))
app.use(cors())
app.use(fileUpload());
app.use(bodyParser.json())// ใช้ได้ทุก url
// app.use('/api', bodyParser.json())
app.post('/member',async (req, res) => {
    try {
      let id= await db('member').insert({
        username: req.body.username,
        password: req.body.pass,
        status: req.body.status,
      })
    } catch (error) {
      res.send({
        status: 'error',
        error: E })
    } 
    res.send({
      insert:"ok",
   })
})

app.get('/', (req, res) => {
  res.send({ ok: 1,status: req.query })
   if(req.query.fname == "oak"){
     console.log("alongkorn")
   }
})
// localhost:7001/std/6139010005
app.get('/std/:code?', (req, res) => {
  res.send({ ok: 1,status: req.params })
})
app.post('/teacher',(req, res) => {
   console.log(req.body)
  res.send({ ok: 1,status: req.body })
})

app.post('/api/login', bodyParser.json(), async (req, res) => {
  try {
    let row = await db('teacher')
      .where({ user: req.body.user, pass: req.body.pass })
      .then(rows => rows[0])
    if (!row) {
      throw new Error('user/pass incorrect')
    }
    res.send({ ok: 1, user: row })
  } catch (e) {
    res.send({ ok: 0, error: e.message })
  }
})

app.get('/api/student', async (req, res) => {
  try {
    let rows = await db('student')
      .where({ tid: req.query.tid || 0 })
      .orderBy('code', 'asc')
    res.send({
      ok: 1,
      students: rows,
    })
  } catch (e) {
    res.send({ ok: 0, error: e.message })
  }
})

app.get('/api/student/:id', async (req, res) => {
  try {
    let row = await db('student')
      .where({ id: req.params.id || 0})
      .then(rows => rows[0])
    if (!row) {
      throw new Error('student not found')
    }
    res.send({
      ok: 1,
      student: row,
    })
  } catch (e) {
    res.send({ ok: 0, error: e.message })
  }
})


app.post('/api/student', async (req, res) => {
  // TODO:
  try {
    if (!req.body.code || !req.body.name || !req.body.tid) {
      throw new Error('code, name, tid is required')
    }
    let row = await db('student').where({code: req.body.code}).then(rows => rows[0])
    if (!row) {
      let ids = await db('student').insert({
        code: req.body.code,
        name: req.body.name,
        tid: req.body.tid,
        birth: req.body.birth,
      })
      res.send({ ok: 1, id: ids[0] })
    } else {
      await db('student')
        .where({code: req.body.code})
        .update({
          name: req.body.name,
          tid: req.body.tid,
          birth: req.body.birth,
        })
      res.send({ ok: 1, id: row.id })
    }
  } catch (e) {
    res.send({ ok: 0, error: e.message })
  }
})

app.get('/api/photo/:id', async (req, res) => {
  res.sendFile(path.resolve(`./public/photo/${req.params.id}.jpg`))
})

app.listen(7001, () => {
  console.log('ready on 7001')
})