import { urlencoded } from 'express'
import { Express } from 'express-serve-static-core'
import fs from 'fs-extra'
import Redis from 'ioredis'
import passport from 'passport'
import { Cache, SamlSpidProfile, SpidConfig, SpidStrategy } from 'passport-spid'
import {
  VerifiedCallback,
  VerifyWithoutRequest,
} from 'passport-spid/dist/src/strategy'
const {
  IDP,
  SP,
  IDP_METADATA_FILE,
  PRIVATE_KEY_FILE,
  CERTIFICATE_FILE,
  BINDING,
  SIG_ALG,
  AUTHN_CONTEXT_INT,
  EMAIL,
} = process.env

export async function spid(app: Express) {
  const redis = new Redis('redis://redis')

  const idpMetadata = (await fs.readFile(IDP_METADATA_FILE)).toString()
  const privateKey = (await fs.readFile(PRIVATE_KEY_FILE)).toString()
  const spCert = (await fs.readFile(CERTIFICATE_FILE)).toString()
  const email = EMAIL
  // you can use a normal Map (not recommended)
  // const cache = new Map();
  const cachePrefix = 'spid_request_'
  const cache: Cache = {
    get(key: string) {
      return redis.get(cachePrefix + key)
    },
    set(key: string, value: string) {
      return redis.set(cachePrefix + key, value)
    },
    delete(key: string) {
      return redis.del(cachePrefix + key)
    },
    expire(key: string, ms: number) {
      return redis.pexpire(cachePrefix + key, ms)
    },
  }
  const config: SpidConfig = {
    saml: {
      authnRequestBinding:
        BINDING === 'HTTP-POST' ? 'HTTP-POST' : 'HTTP-Redirect', // or HTTP-Redirect
      attributeConsumingServiceIndex: '0', // index of 'acs' array
      signatureAlgorithm: SIG_ALG === 'sha256' ? 'sha256' : 'sha512',
      digestAlgorithm: SIG_ALG === 'sha256' ? 'sha256' : 'sha512',
      callbackUrl: `${SP}/login/cb`,
      logoutCallbackUrl: `${SP}/logout/cb`,
      racComparison: 'minimum',
      privateKey,
      audience: SP,
    },
    spid: {
      getIDPEntityIdFromRequest: () => IDP,
      IDPRegistryMetadata: idpMetadata,
      authnContext:
        AUTHN_CONTEXT_INT === '1' ? 1 : AUTHN_CONTEXT_INT === '2' ? 2 : 3, // spid level (1/2/3)
      serviceProvider: {
        type: 'public',
        entityId: SP,
        certificate: spCert,
        acs: [
          {
            name: 'acs0',
            attributes: ['spidCode', 'email', 'fiscalNumber', 'familyName'],
          },
          {
            name: 'acs1',
            attributes: ['email'],
          },
        ],
        organization: {
          it: {
            name: 'example',
            displayName: 'example',
            url: SP,
          },
        },
        contactPerson: {
          IPACode: 'ipacode',
          email,
        },
      },
    },
    cache,
  }
  const verify: VerifyWithoutRequest = (
    profile: SamlSpidProfile,
    done: VerifiedCallback,
  ) => {
    done(null, profile)
  }
  const strategy = new SpidStrategy(config, verify, verify)
  const metadata = await strategy.generateSpidServiceProviderMetadata()
  passport.use('spid', strategy)
  const passportOptions = {
    session: false,
  }
  app.use(passport.initialize())
  app.get('/metadata', async (req, res) => {
    res.contentType('text/xml')
    res.send(metadata)
  })
  app.get('/login', passport.authenticate('spid', passportOptions))
  app.post(
    '/login/cb',
    urlencoded({ extended: false }),
    passport.authenticate('spid', passportOptions),
    (req, res) => {
      const user = req.user as SamlSpidProfile
      // you can save request and response
      const samlRequest = user.getSamlRequestXml()
      const samlResponse = user.getSamlResponseXml()
      res.render(
        'users',
        {
          title: 'User page',
          layout: null,
          user,
          userJSON: JSON.stringify(user),
          samlRequest,
          samlResponse,
        },
        function (err, html) {
          if (err) {
            console.log(err)
            res.send(err)
          }
          res.send(html)
        },
      )
    },
  )
}
