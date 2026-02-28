const mongoose = require("mongoose")


const connectToMongodb = () => {

    mongoose.connect("mongodb+srv://sunilharde10_db_user:68FQvqbwA0Rlz4X7@app.uz9ggtm.mongodb.net/miracle-app?appName=App")
        .then(() => console.log("MongoDB Connected"))
        .catch(err => console.log(err.message))

}


module.exports = connectToMongodb