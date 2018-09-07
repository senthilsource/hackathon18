var express = require("express");
var { mongoose } = require("./db/mongoose");
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
var _ = require("lodash");
var fs = require("fs");
var kairosApi = require("./kairos/kairos-api");
var {faceIdentityModel} = require("./models/schema");

var port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`App started in port ${port}`);
  })
  
app.use(express.static(__dirname + '/public'));

//To upload
app.use(fileUpload());

app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

console.log("server runnning");

app.get('/', function(req,res){
    res.sendFile(__dirname + "/index.html"); 
 });

 app.get('/verify', function(req,res){
    res.sendFile(__dirname + "/test.html"); 
 });

 app.post("/enroll", (req, res)=>{
     res.setHeader('Content-Type', 'application/json');         
     kairosApi.enroll(req.body).then((response)=>{  
        var values =  _.pick(response.body,["face_id"]);     
        var faceIdModel = new faceIdentityModel({
            faceId: values.face_id          
          });

        faceIdModel.save().then((results) => {
           // res.send(results);
            res.status(response.status).send(response.body);
         }, (err) => {
            res.status(400).send(err);
         });

        
     }).catch((err)=>{
        // console.error(err);
         res.status(500).send(err[0].Message);
     });   
 });

 app.post("/recognize", (req, res)=>{   
    res.setHeader('Content-Type', 'application/json');   
    if(req.files!=undefined){ 
        req.body.imageSrc = "data:image/png;base64,".concat(new Buffer(req.files.imageSrc.data).toString('base64'));
    }
    kairosApi.recognize(req.body).then((response)=>{     
        //console.log(response);  
       res.status(response.status).send(response.body);
    }).catch((err)=>{
        console.error(err);
        res.status(500).send(err[0].Message);
    });   
});