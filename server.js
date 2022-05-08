require("dotenv").config();
const express = require("express");
const uniqid = require("uniqid");

// All db's
const image = require("./DB/image_db");
const login = require("./DB/login");
const userreq = require("./DB/user_sent_accept_req");
const userpostcnt = require("./DB/username_with_their_post_cnt");
const usermessage = require("./DB/user_message");

const app = express();
const port = 3004;
const cors = require("cors");

app.use(cors());
//multer to store file in local directory.
const multer = require("multer");

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const upload = multer({ storage }).single("file");

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
const bodyParser = require("body-parser");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECERE,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.get('/',(req,res)=>{
 res.send("ok")
})

//get user feedback.
app.post("/savecontactinfo", (req, res) => {
  console.log("ok");
  const newobj = new usermessage(req.body);
  newobj.save();
  res.send("ok");
  
});

// user accept request
app.post("/acceptreq", async (req, res) => {
  let old_objwhoaccept = await userreq.find({ email: req.body.userwhooaccept });
  let old_objwhoseacept = await userreq.find({ email: req.body.reqofthisuser });

  let new_from = old_objwhoaccept[0];
  let new_to = old_objwhoseacept[0];

  //update for who accept request
  new_from.accept++;
  new_from.acceptreq.push(req.body.reqofthisuser);
  new_from.pending = new_from.pending.filter((item) => {
    return item != req.body.reqofthisuser;
  });

  //update for whose req. is accepted.
  new_to.accept++;
  new_to.sent--;
  new_to.acceptreq.push(req.body.userwhooaccept);
  new_to.sentreq = new_to.sentreq.filter((item) => {
    return item != req.body.userwhooaccept;
  });

  userreq.updateOne(
    { email: req.body.userwhooaccept },
    new_from,
    (req, res) => {
      console.log("succesfully accepter updated!!");
    }
  );

  userreq.updateOne({ email: req.body.reqofthisuser }, new_to, (req, res) => {
    console.log("succesfully sender updated!!");
  });
});

//to delete post on user request.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.post("/deletepost", async (req, res) => {
  let old = await image.find({});
  old = old.filter((item) => {
    return item.img.key != req.body.key;
  });
  const qq = { img: { key: req.body.key } };

  image.deleteOne(qq, (err, ok) => {
    if (err) console.log(err);
    else console.log(ok);
  });

  let thisuser = await userpostcnt.find({ name: req.body.nameofuser });
  thisuser[0].count--;
  userpostcnt.updateOne(
    { name: req.body.nameofuser },
    thisuser[0],
    (err, ok) => {
      if (err) console.log(err);
      else console.log(ok);
    }
  );
  // userpostcnt.updateOne({name:req.body.nameofuser},);
});

//get data from bucket
app.get("/list", async (req, res) => {
  // getting data from aws bucket
  const data = await s3
    .listObjectsV2({ Bucket: process.env.AWS_BUCK })
    .promise();

  const datafromimagedb = await image.find({});

  let datatosent = [];
  for (let i = 0; i < data.Contents.length; i++) {
    let key = data.Contents[i].Key;
    let boo = false;
    for (let j = 0; j < datafromimagedb.length; j++) {
      if (datafromimagedb[j].img.key == key) {
        boo = true;
        // console.log(datafromimagedb[j]);
        data.Contents[i].name = datafromimagedb[j].name;
        data.Contents[i].desc = datafromimagedb[j].desc;
        data.Contents[i].postdate = datafromimagedb[j].postdate;
        data.Contents[i].nameofuser = datafromimagedb[j].usermail;
        data.Contents[i].currnamenotmail = datafromimagedb[j].nameofuser;
      }
    }
    if (boo) {
      datatosent.push(data.Contents[i]);
    }
  }
  // console.log(datatosent);
  res.send(datatosent);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
//route for getting loginuser reqests and friend.
app.get("/getuserfriend", async (req, res) => {
  let allusers = await userreq.find({});
  res.send(allusers);
});

//routes to get all login user.
app.get("/getallloginuser", async (req, res) => {
  const listofloginuser = await login.find({});
  res.status(200).send(listofloginuser);
});

//upload object to bucket.
app.post("/upload", upload, async (req, res) => {
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

    const new_image_obj = new image({
      name: req.body.name,
      img: {
        key: data.Key,
      },
      desc: req.body.discription,
      postdate: req.body.date,
      usermail: req.body.usermail,
      nameofuser: req.body.nameofuser,
    });

    new_image_obj.save();

    res.status(200).send(data);
  });
  let alldocs = await userpostcnt.find({});
  for (let i = 0; i < alldocs.length; i++) {
    if (alldocs[i].name == req.body.nameofuser) {
      const qq = {
        name: alldocs[i].name,
        count: alldocs[i].count + 1,
      };
      userpostcnt.updateOne(alldocs[i], qq, (err, ok) => {
        if (err) console.log(err);
        else console.log(ok);
      });
      break;
    }
  }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.post("/loginuser", async (req, res) => {
  let userexist = [];
  userexist = await login.find({ email: req.body.email });

  // store in database if user is new
  if (userexist.length == 0) {
    req.body.status = "Moderate";
    const obj = new login(req.body);
    const userreqs = new userreq({
      email: req.body.email,
      sent: 0,
      accept: 0,
      sentreq: [],
      pending: [],
      acceptreq: [],
    });
    userreqs.save(); // send req initial status of user
    obj.save(); // save current user in DB
    const doc = new userpostcnt({
      name: req.body.name,
      count: 0,
    });
    doc.save();
  }

  res.send("ok");
});

app.get("/alltop5user", async (req, res) => {
  const alll = await userpostcnt.find({});
  res.status(200).send(alll);
});

//Route to get data from frontend with key of object.
//eg. <img src="localhost:3000/id"/>
app.get("/:id", (req, res) => {
  if (req.params.id === "favicon.ico") {
    res.send("ss");
  } else {
    const dp = {
      Key: req.params.id,
      Bucket: process.env.AWS_BUCK,
    };
    const a = s3.getObject(dp).createReadStream();
    a.pipe(res);
  }
});

//Route to sent reqests.
app.post("/sentreq", async (req, res) => {
  // update values for sender

  const oldobj = await userreq.find({ email: req.body.userfrom });
  let newobj = oldobj[0];
  // console.log(newobj);
  let isalreadysent = [];
  isalreadysent = newobj.sentreq.find((item) => {
    return item == req.body.userto;
  });
  newobj.sent++;
  newobj.sentreq.push(req.body.userto);

  // console.log(isalreadysent);

  if (isalreadysent == undefined) {
    userreq.updateOne({ email: req.body.userfrom }, newobj, (err, res) => {
      if (err) console.log(err);
      console.log("update for sender.");
    });
  }
  //update values for receiver

  const oldobj1 = await userreq.find({ email: req.body.userto });
  let newobj1 = oldobj1[0];
  newobj1.pending.push(req.body.userfrom);

  // console.log(req.body.userto);
  if (isalreadysent == undefined) {
    userreq.updateOne({ email: req.body.userto }, newobj1, (err, res) => {
      if (err) console.log(err);
      console.log("update for receiver.");
    });
  }
});

app.listen(port, () => {
  console.log(`Server is up at ${port}`);
});
