import express from 'express'
import https from 'https'
import fs from 'fs-extra'
import { spid } from './spid'
import { home } from './home'
import { user } from './user'
import path from 'path'
import hbs from "express-hbs"

async function run() {
  const app = express()
  const idp = 'https://localhost:8443'
  const sp = 'https://localhost:4000'

  // express setup
  // parse request bodies (req.body)
  app.use(express.urlencoded({ extended: true }))
  app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
  }));
  app.set('view engine', 'hbs');
  app.set('views', path.join(__dirname, 'views'))


  // route setup
  spid(app, sp, idp);
  home(app, idp)
  user(app)

  const httpsOptions = {
    key: fs.readFileSync('./certs/ssl-key.pem'),
    cert: fs.readFileSync('./certs/ssl-cert.pem'),
  }
  https.createServer(httpsOptions, app).listen(4000, () => {
    console.log(sp)
    console.log(idp)
  })
}
run().catch(console.error)
