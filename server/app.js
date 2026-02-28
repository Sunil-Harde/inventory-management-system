const mongoose = require("mongoose")
const express = require("express")
const connectToMongodb = require("./config/db")
const useSupplier = require('./routes/supplier.routes')
const app = express()


app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "api is runnign "
    })
})

connectToMongodb()

app.use('/api', useSupplier)

app.listen(5000, console.log("Server Created  5000"))