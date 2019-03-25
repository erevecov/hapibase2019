export default {
    method: 'GET',
    path: '/public/{path*}',
    options: {
        auth: false,
        handler: {
            directory: {
                path: './public',
                listing: false,
                index: false
            }
        }
    }
}