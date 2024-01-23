import { Express } from 'express-serve-static-core'

export function user(app: Express) {
  const user = {
    spidCode: 'AGID-001',
    fiscalNumber: 'TINIT-GDASDV00A01H501J',
    email: 'spid.tech@agid.gov.it',
    attributes: {
      spidCode: 'AGID-001',
      fiscalNumber: 'TINIT-GDASDV00A01H501J',
      email: 'spid.tech@agid.gov.it',
    },
  }
  app.get('/users', function (req, res) {
    res.render(
      'users',
      {
        title: 'User page',
        layout: null,
        user,
        userJSON: JSON.stringify(user),
      },
      function (err, html) {
        if (err) {
          console.log(err)
          res.send(err)
        }
        res.send(html)
      },
    )
  })
}
