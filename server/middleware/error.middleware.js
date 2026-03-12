const errorHandling = ((err, req, res, next) => {


    const status = err.status || 500
    const message = err.message || "Back End Error"
    const extraDetails = err.extraDetails || "Details"


    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];

        return res.status(400).json({
            status: "error",
            message: `${value} already exists`,
        });
    }

    return res.status(status).json({
        status: "Error",
        error: message,
        Details: extraDetails
    })


})


module.exports = errorHandling;