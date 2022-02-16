function errorsMiddleware(err, req, res, next) {
    console.error('[Errors Middleware]: \n', err.stack);
    res.status(500).send({ succcess: false, message: error.message });
}

export default errorsMiddleware;