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

var imageSchema = new mongoose.Schema({
  name: String,
  img: {
    key: String,
  },
  title: String,
  desc: String,
  postdate: Date,
  usermail: String,
  nameofuser: String,
});

const img = new mongoose.model("image", imageSchema);

module.exports = img;
