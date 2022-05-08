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

var userreq = new mongoose.Schema({
  email: String,
  sent: Number,
  accept: Number,
  sentreq: Array,
  pending: Array,
  acceptreq: Array,
});

const img = new mongoose.model("user_sent_accept_reqest", userreq);

module.exports = img;
