const handleDatabaseError = (error) => {
  // Check for Sequelize Database Errors
  if (error.name === 'SequelizeDatabaseError') {
    const parent = error.parent || error.original;

    if (parent) {
      // Table doesn't exist (ER_NO_SUCH_TABLE)
      if (parent.code === 'ER_NO_SUCH_TABLE' || parent.errno === 1146) {
        return {
          success: false,
          code: 400, // Bad Request or 500? Use 400 for validation-like behavior
          message: `Validation Error: Table missing. ${parent.sqlMessage}. Please sync your database or run migrations.`,
          error_type: 'DATABASE_TABLE_MISSING'
        };
      }

      // Database doesn't exist (ER_BAD_DB_ERROR)
      if (parent.code === 'ER_BAD_DB_ERROR' || parent.errno === 1049) {
        return {
          success: false,
          code: 500,
          message: `Configuration Error: Database not found. ${parent.sqlMessage}.`,
          error_type: 'DATABASE_NOT_FOUND'
        };
      }

      // Column not found (ER_BAD_FIELD_ERROR)
      if (parent.code === 'ER_BAD_FIELD_ERROR' || parent.errno === 1054) {
        return {
          success: false,
          code: 400,
          message: `Schema Error: ${parent.sqlMessage}. Please check your database structure.`,
          error_type: 'DATABASE_COLUMN_MISSING'
        };
      }
    }
  }

  // Handle Joi validation errors if they bubble up
  if (error.isJoi) {
    return {
      success: false,
      code: 400,
      message: error.details[0]?.message || 'Validation failed',
      error_type: 'VALIDATION_ERROR'
    };
  }

  // Default Internal Server Error
  return {
    success: false,
    code: 500,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  handleDatabaseError,
  asyncHandler
};