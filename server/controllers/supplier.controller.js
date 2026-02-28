const Suppliers = require('../models/supplier.module')

const handelCreateSupplier = async (req, res) => {
    try {

        const body = req.body
        console.log(body);


        const suppliersCreate = new Suppliers(body)
        const newSuppliers = await suppliersCreate.save()

        // const newSuppliers = await Suppliers


        res.status(201).json({
            status: "success",
            // count: Suppliers.length,
            data: newSuppliers
        })

    }

    catch (err) {
        res.json(err)
    }
}

module.exports = {
    handelCreateSupplier
}