require("dotenv").config();
const express = require("express");
const uniqid = require("uniqid");

const app = express();
const port = 3003;

//multer to store file in local directory.
const multer = require("multer");

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});
 
const upload = multer({ storage }).single("image");

//add if not configure.

// const SESConfig = {
//   apiVersion: "2010-12-01",
//   accessKeyId: process.env.AWS_KEY,
//   accessSecretKey: process.env.AWS_SECERE,
//   region: "us-east-1",
// };
// AWS.config.update(SESConfig);

//aws s3 access object
const S3 = require("aws-sdk/clients/s3");
const AWS = require("aws-sdk");
 
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECERE,
});

//get data from bucket
app.get("/list", async (req, res) => {
  // getting data from aws bucket
  const data = await s3
    .listObjectsV2({ Bucket: process.env.AWS_BUCK })
    .promise();
  // console.log(data);
  res.send(data);
});

//upload object to bucket.
app.post("/upload", upload, (req, res) => {
  console.log(req.file);
  let myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];

  const params = {
    Bucket: process.env.AWS_BUCK,
    Key: `${uniqid()}.${fileType}`,
    Body: req.file.buffer,
  };

  s3.upload(params, (error, data) => {
    if (error) {
      res.status(500).send(error);
    } 

    res.status(200).send(data);
  });
    
});

//to get data from frontend with key of object.
//eg. <img src="localhost:3000/id"/>
app.get("/:id", (req, res) => {
  const dp = {
    Key: req.params.id,
    Bucket: process.env.AWS_BUCK,
  };
  const a = s3.getObject(dp).createReadStream();
  a.pipe(res);
});


app.listen(port, () => {
  console.log(`Server is up at ${port}`);
});
