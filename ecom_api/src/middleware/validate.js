module.exports = (schema) => {
  return (req, res, next) => {
    try {
      const bodyData = req.body.data ? JSON.parse(req.body.data) : req.body;

      const { error } = schema.validate(bodyData, {
        abortEarly: false,
        allowUnknown: true
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: error.details.map(err => err.message)
        });
      }

      req.validatedBody = bodyData; // 🔥 clean data pass
      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format"
      });
    }
  };
};