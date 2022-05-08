const express = require("express");
const multer = require("multer");
var mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const validator = require("mongoose-validator");

mongoose.connect(
  "mongodb+srv://tejas:ab@cluster0.bczol.mongodb.net/Galary_app",

  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("connected");
  }
);

var imagewithemailSchema = new mongoose.Schema({
  email: String,
  imagekey: String,
});

const imgwithmail = new mongoose.model("image_with_email", imagewithemailSchema);

module.exports = imgwithmail;
