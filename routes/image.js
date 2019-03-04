const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
require('dotenv').config()

AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2'
  })

const s3 = new AWS.S3();

  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'jobstates',
      key (req, file, cb) {
        const ext = path.extname(file.originalname);
        const text = file.originalname;
        let ascii = "";
        for(index in text){
          ascii += text.charCodeAt(index);
        }
        cb(null, `original/${+new Date()}${ascii}${ext}`)
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }
  })

router.post('/',upload.single('img'),async(req,res)=>{
    try{
        res.json({ url: req.file.location, key: req.file.key });
    }catch(err){
        res.send(err);
    }
})
module.exports = router;
