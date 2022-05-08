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
  name: String,
  count: Number,
});

const imgwithmail = new mongoose.model(
  "userwithreqcount",
  imagewithemailSchema
);

module.exports = imgwithmail;
