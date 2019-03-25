import mysql from 'mysql2/promise'
import dotEnv from 'dotenv'
dotEnv.load()

let db = async () => {
    let connection = null

    try {
        connection = await mysql.createConnection({
            host     : '127.0.0.1',
            user     : 'root',
            password : '',
            database : 'hapibase2019'
        })
        
        return connection
    } catch (error) {
        console.log('ERROR MYSQL: ',error)
    }
}


export { db }
