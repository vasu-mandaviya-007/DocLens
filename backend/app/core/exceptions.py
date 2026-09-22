class AppException(Exception):
    """
    Base class for all custom, expected errors in the app.
    Har specific exception isi se inherit karega.
    """
    status_code = 400   
    code = "APP_ERROR" 

    def __init__(self, message: str, fields: dict | None = None):
        self.message = message
        self.fields = fields  # None = general error, dict = field-specific error(s)
        super().__init__(message) 


class ValidationAppError(AppException): 
    """Jab input galat ho lekin Pydantic ke level pe nahi (business rule check)."""
    status_code = 422
    code = "VALIDATION_ERROR" 
 

class NotFoundError(AppException):
    """Jab requested resource (document, user, etc.) exist na kare."""
    status_code = 404
    code = "NOT_FOUND"
 

class ConflictError(AppException):
    """Jab request current state se clash kare (e.g. resource already exists)."""
    status_code = 409
    code = "CONFLICT"
 

class PermissionDeniedError(AppException):
    """Jab user ke paas resource access karne ka right na ho."""
    status_code = 403
    code = "PERMISSION_DENIED" 


class UnauthorizedError(AppException):
    """Jab user login hi nahi he ya token invalid/expired ho."""
    status_code = 401
    code = "UNAUTHORIZED"


class RateLimitError(AppException):
    """Jab daily/usage quota khatam ho chuki ho."""
    status_code = 429
    code = "RATE_LIMIT_EXCEEDED"
    

class ServiceUnavailableError(AppException):
    """Jab koi external service (LLM API, embedding service) down ho."""
    status_code = 503
    code = "SERVICE_UNAVAILABLE"