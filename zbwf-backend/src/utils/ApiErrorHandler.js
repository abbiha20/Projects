
class ApiError extends Error {
constructor(
    statusCode,
    message = "Something wrong",
    errors = [],
    stack = "",

){
    super(message)
    this.message = message,
    this.errors = errors,
    this.data = null,
    this.statusCode = statusCode


    if(stack){
        this.stack = stack
    } else{
        Error.captureStackTrace(this,this.constructor)
    }
}

}

export {ApiError}