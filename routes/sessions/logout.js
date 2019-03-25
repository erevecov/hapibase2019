export default {
    method: ['GET', 'POST'],
    path: '/logout',
    options: {
        handler: (request, h) => {
            request.cookieAuth.clear()
            return h.redirect('/')
        }
    }
}