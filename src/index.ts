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
  const {SP, IDP, SSL_KEY_FILE, SSL_CERT_FILE} = process.env;

  // express setup
  // parse request bodies (req.body)
  app.use(express.urlencoded({ extended: true }))
  app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
  }));
  app.set('view engine', 'hbs');
  app.set('views', path.join(__dirname, 'views'))


  // route setup
  spid(app);
  home(app, IDP)
  user(app)

  const httpsOptions = {
    key: fs.readFileSync(SSL_KEY_FILE),
    cert: fs.readFileSync(SSL_CERT_FILE),
  }
  https.createServer(httpsOptions, app).listen(4000, () => {
    console.log(SP)
    console.log(IDP)
  })
}
run().catch(console.error)
