import Hapi from 'hapi'
import hapiRouter from 'hapi-router'
import Vision from 'vision'
import Inert from 'inert'
import Handlebars from 'handlebars'
import Extend from 'handlebars-extend-block'
import hapiAuthCookie from 'hapi-auth-cookie'
import Moment from 'moment'
import dotEnv from 'dotenv'
import Boom from 'boom'

dotEnv.load()

const server = Hapi.server({
    host: '0.0.0.0',
    port: process.env.SERVER_PORT || 3000,
    cache: {
        engine: require("catbox-redis"),
        options: {
            host: '127.0.0.1',
            partition: "cache"
        }
    },
    routes: {
        validate: {
            failAction: (request, h, err) => {
                console.error('ValidationError:', err.message);
                throw Boom.badRequest(err);
            }
        }
    }
})

const init = async() => {
    try {
        await server.register([
            Vision,
            Inert,
            hapiAuthCookie, 
            {
                plugin: require('good'),
                options: {
                    ops: {
                        interval: 1000
                    },
                    reporters: {
                        myConsoleReporter: [
                            {
                                module: 'good-squeeze',
                                name: 'Squeeze',
                                args: [{ log: '*', response: '*'}]
                            },
                            {
                                module: 'good-console'
                            },
                            'stdout'
                        ]
                    }
                }
            }
        ])
    } catch (err) {
        throw err
    }

    try {
        const cache = server.cache({segment: 'sessions', expiresIn: Moment.duration(365, 'days').asMilliseconds() })
        server.app.cache = cache

        server.auth.strategy('session', 'cookie', {
            password: 'password-should-be-32-characters',
            cookie: 'sid-hapi2019base',
            redirectTo: '/login',
            isSecure: false,
            validateFunc: async (request, session) => {
                const cached = await cache.get(session.sid)
                const out = {
                    valid: !!cached
                }

                if(out.valid) {
                    out.credentials = cached.account
                }

                return out
            }
        })

        server.auth.default('session')
    } catch (err) {
        throw `ERROR IN SESSIONS (COOKIE): ${err}`        
    }

    try {
        await server.register({
            plugin: hapiRouter,
            options: {
                routes: 'routes/**/*.js'
            }
        })
    } catch (err) {
        throw `ERROR IN ROUTES: ${err}`
    }

    try {
        await server.views({
            engines: {
                html: {
                    module: Extend(Handlebars),
                    isCached: false
                }
            },
            path: 'views',
            layoutPath: 'views',
            layout: 'layout'
        })
    } catch (err) {
        throw `ERROR IN VIEWS: ${err}`
    }

    await server.start()
    console.log(`Server started listening on ${server.info.uri}`)
   
    process.on('unhandledRejection', (err) => {
        throw err
        process.exit(1)
    })
}

init()