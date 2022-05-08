const express = require("express");
const multer = require("multer");
var mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const validator = require("mongoose-validator");
// const upload = multer({ dest: __dirname + "/uploads/images" });

const app = express();
const PORT = 3005;

// app.use("view engine", "ejs");

mongoose.connect(
  "mongodb+srv://tejas:ab@cluster0.bczol.mongodb.net/Galary_app",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("connected");
  }
);

// Step 3 - this is the code for ./models.js
var Usermessage = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

//Image is a model which has a schema imageSchema

const login = new mongoose.model("User_Messages", Usermessage);

module.exports = login;
