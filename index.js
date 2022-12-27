require("dotenv").config();
const upload = require("./routes/upload");
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const connection = require("./dbConnection");
const express = require("express");
const app = express();

const port = process.env.PORT || 3000;

let gfs, gridfsBucket;
connection();

const conn = mongoose.connection;
conn.once("open", function () {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'photos'
    });
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("photos");
});


app.use("/file", upload);

// media routes
app.get('/file/:filename', async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }
        // Till version 5+ we were using this 
        // const readStream = gfs.createReadStream(file.filename);
        // readStream.pipe(response);
        // For version 6+, Replace these two lines with the lines below

        console.log(file.filename);
        const readStream = gridfsBucket.openDownloadStream(file._id);
        readStream.pipe(res);
    }
    catch (error) {
        res.status(404).json({
            err: 'Not an image'
        });
        console.log("We got an error " + error);
    }
});

app.delete("/file/:filename", async (req, res) => {
    try {
        await gfs.files.deleteOne({ filename: req.params.filename });
        res.send("success");
    } catch (error) {
        console.log(error);
        res.send("An error occurred.");
    }
});

// start the server on port 3000
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});