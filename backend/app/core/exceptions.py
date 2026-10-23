class AppException(Exception):
    
    status_code = 400   
    code = "APP_ERROR" 

    def __init__(self, message: str, fields: dict | None = None):
        self.message = message
        self.fields = fields  # None = general error, dict = field-specific error(s)
        super().__init__(message) 


class BadRequestError(AppException):
 
    status_code = 400
    code = "BAD_REQUEST"
 


class ValidationAppError(AppException): 
    status_code = 422
    code = "VALIDATION_ERROR" 
 

class NotFoundError(AppException):
    status_code = 404
    code = "NOT_FOUND"
 

class ConflictError(AppException):
    status_code = 409
    code = "CONFLICT"
 

class PermissionDeniedError(AppException):
    status_code = 403
    code = "PERMISSION_DENIED" 


class EmailNotVerifiedError(PermissionDeniedError):
 
    code = "EMAIL_NOT_VERIFIED"


class UnauthorizedError(AppException):
    status_code = 401
    code = "UNAUTHORIZED"


class RateLimitError(AppException):
    status_code = 429
    code = "RATE_LIMIT_EXCEEDED"
    

class ServiceUnavailableError(AppException):
    status_code = 503
    code = "SERVICE_UNAVAILABLE"