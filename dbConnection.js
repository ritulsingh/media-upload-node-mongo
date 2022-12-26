const mongoose = require("mongoose");

module.exports = async function connection() {
    try {
        const connectionParams = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        await mongoose.connect(process.env.DATABASE, connectionParams);
        console.log("Connected To Database");
    } catch (err) {
        console.log("Could not connect to database: " + err);
    }
};