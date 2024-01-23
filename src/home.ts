import { Express } from 'express-serve-static-core'

export function home(app: Express, idp: string) {
  app.get('/', function (req, res) {
    res.send(`
    <script src="https://italia.github.io/spid-smart-button/spid-button.min.js"></script>
    <div id="spid-button">
      <noscript>
          Il login tramite SPID richiede che JavaScript sia abilitato nel browser.
      </noscript>
    </div>
    <script>
      SPID.init({
        url: '/login?idp={{idp}}',
        supported: [
            'https://demo.spid.gov.it/',
        ],
        extraProviders: [{
            "protocols": ["SAML"],
            "entityName": "IDP test",
            "logo": "spid-idp-aruba.svg",
            "entityID": "${idp}",
            "active": true
        },{
          "protocols": ["SAML"],
          "entityName": "IDP demo",
          "logo": "spid-idp-aruba.svg",
          "entityID": "https://demo.spid.gov.it/",
          "active": true
        }]
      });
    </script>
    `)
  })
}
