from fastapi import HTTPException


class BrailleBaseException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str = "UNKNOWN_ERROR"):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code


class AuthenticationError(BrailleBaseException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(401, detail, "AUTH_ERROR")


class AuthorizationError(BrailleBaseException):
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(403, detail, "AUTHZ_ERROR")


class NotFoundError(BrailleBaseException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(404, f"{resource} not found", "NOT_FOUND")


class ConflictError(BrailleBaseException):
    def __init__(self, detail: str = "Resource conflict"):
        super().__init__(409, detail, "CONFLICT")


class ValidationError(BrailleBaseException):
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(422, detail, "VALIDATION_ERROR")


class MLModelError(BrailleBaseException):
    def __init__(self, detail: str = "ML model inference failed"):
        super().__init__(500, detail, "ML_ERROR")


class FileProcessingError(BrailleBaseException):
    def __init__(self, detail: str = "File processing failed"):
        super().__init__(422, detail, "FILE_ERROR")


class StorageError(BrailleBaseException):
    def __init__(self, detail: str = "Storage operation failed"):
        super().__init__(500, detail, "STORAGE_ERROR")


class ModelNotLoadedError(BrailleBaseException):
    def __init__(self, model_name: str = "Model"):
        super().__init__(503, f"{model_name} is not loaded", "MODEL_NOT_LOADED")