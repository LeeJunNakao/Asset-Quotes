const setErrorResponse = (ctx, error) => {
    ctx.status = error.code;
    ctx.body = {
        data: null,
        error: {
            status: error.code,
            name: error.name,
            message: error.message,
            details: {}
        }
    }
}

module.exports = { setErrorResponse }