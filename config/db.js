import Cloudant from '@cloudant/cloudant'
import dotEnv from 'dotenv'

dotEnv.load()

const env_status = process.env.STATUS
const url = process.env.CLOUDANT_URL
const dbs = {}

if (env_status == 'dev') {
    dbs.db = process.env.DEV_DB
} else if (env_status == 'prod') {
    dbs.db = process.env.PROD_DB
}

const cloudant = new Cloudant({
    url,
    plugins: [
        'promises',
        {
            'retry': {
                retryAttempts: 5,
                retryTimeout: 1000
            }
        }
    ]
})

let db = cloudant.db.use(dbs.db)

export { db, cloudant }