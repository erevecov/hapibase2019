import md5 from 'md5'
import { db } from '../../config/db'
//import { db } from '../../config/dbr'

let uuid = 1

const findUser = async (email, password) => {
    try {
        let res = await db.find({
            selector: {
                _id: {
                    $gt: 0
                },
                type: 'user',
                email: email,
                password: md5(password),
                status: 'enabled'
            }
        })

        if(res) {
            return res.docs[0] || null
        }
        
    } catch (err) {
        throw err
    }
}

/*
const findUserR = async (email, password) => {
    try {
        let [rows, fields] = await db.execute(`
            SELECT *
            FROM user
            WHERE 
                email = '${email}'
            AND
                password = '${md5(password)}';
        `)

        console.log(rows)

        db.end()

        if(rows) {    
            return rows
        } else {
            return null
        }
        
    } catch (err) {
        throw err
    }
}
*/

export default {
    method: ['GET', 'POST'],
    path: '/login',
    options: {
        handler: async (request, h) => {
            if(request.auth.isAuthenticated) return h.redirect('/')

            let account = null
            
            if(request.method === 'post') {
                if(!request.payload.email || !request.payload.password) {
                    return h.view('login', {message: 'Email y contraseña requeridos.'}, {layout:false})
                } else {
                    try {
                        account = await findUser(request.payload.email, request.payload.password)
                        if(!account) {
                            return h.view('login', {message: 'Email o contraseña incorrecto.'}, {layout:false})
                        } else {
                            const sid = String(++uuid)
                            //delete account._id
                            delete account.password
                            delete account._rev
                            await request.server.app.cache.set(sid, { account }, 0)
                            request.cookieAuth.set({ sid })

                            return h.redirect('/')
                        }
                    } catch (err) {
                        throw err
                    }
                    
                }
            }

            if(request.method === 'get') return h.view('login', {}, {layout:false})
        },
        auth: {mode: 'try'},
        plugins: {'hapi-auth-cookie': {redirectTo:false}}
    }
}