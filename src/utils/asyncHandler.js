// using promises
const asyncHandler = (requestHandler) => {
   (req, res, next) => {
      Promise.resolve(requestHandler(req, res, next)).catch((error) =>
         next(error)
      );
   };
};

export { asyncHandler };

/*
// use higher order funcitons with try-catch 
const asyncHandler = (requestHandler) => async (req, res, next) => {
    try {
        await requestHandler(req, res, next)
    } catch (error) {
        res.status(error.code || 500).json({
            succss: false, 
            message: error.message
        })
    }
}
*/
