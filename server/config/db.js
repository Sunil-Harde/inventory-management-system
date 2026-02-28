const mongoose = require("mongoose")


const connectToMongodb = () => {

    mongoose.connect("mongodb://127.0.0.1:27017/inventory")
        .then(() => console.log("MongoDB Connected"))
        .catch(err => console.log(err.message))

}


module.exports = connectToMongodb