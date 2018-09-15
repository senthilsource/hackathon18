var express = require("express");
//var { mongoose } = require("./db/mongoose");
var app = express();
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
//App
// var path = require('path');
// var favicon = require('serve-favicon');
// var bodyParser = require('body-parser');
// var compression = require('compression');
// var socket_io = require("socket.io");
// // App 
// var http = require('http');
// var _ = require("lodash");
// var fs = require("fs");
// var kairosApi = require("./kairos/kairos-api");
// var { faceIdentityModel } = require("./models/schema");
// var { fetchAllUserLocation, reportUserDetails } = require('./db/userdb');
var http = require('http');
//     WebSocket = require('ws');
// var { spawn } = require("child_process");
// var path = require('path');
// var url = require('url');
// var imageDir = './public/photos/';
//To upload
//app.use(fileUpload());

app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
const googleMapsApi = require('@google/maps');

// var gMapClient = googleMapsApi.createClient({
//     key: 'AIzaSyDJQ1uY01MsI8SS0WWuktKxvYhxmDYVprI',
//     Promise: Promise
// });

// var io = socket_io();
// app.io = io;

// app.get('/map', (req, res) => res.sendFile(__dirname + "/map.html"));

// app.get('/getDirections', async(req, res) => {
//     res.setHeader('Content-Type', 'application/json');
//    // var name = req.param('id');
//     var userrs = await fetchAllUserLocation();
//     prepareUserDirections(userrs).then((response) => {
//         res.send(response);
//     }).catch((err) => res.send(err));

// });

// app.get('/report-user', (req, res) => {
//     try {
//         var id = req.query.id;
//         res.setHeader('Content-Type', 'application/json');
//         reportUserDetails(id);
//     } catch (e) {
//         console.log(e);
//     }
//     res.send('{}');
// });

// app.get('/train', function(req, res) {
//     res.sendFile(__dirname + "/train.html");
// });

// app.post("/trainme", (req, res) => {
//     res.setHeader('Content-Type', 'application/json');
//     if (req.files != undefined) {
//         fs.writeFile('./known_people/' + req.body.personName + '.jpeg', req.files.file0.data, (err) => {
//             if (err) {
//                 //  console.log("Error::", err);
//                 res.status(500).send(err);
//             };
//         });
//     }
//     var pythonProcess = spawn('python', ["./python/train.py"]);
//     // console.log(pythonProcess.pid);
//     res.send("File has been trained successfully");

// });


// var prepareUserDirections = async(userDetails) => {
//     var n = userDetails.length;
//     console.log(userDetails);
//     var originPts = { "lat": "" + userDetails[0].lat, "lng": "" + userDetails[0].lng };
//     var destinationPts = { "lat": "" + userDetails[n - 1].lat, "lng": "" + userDetails[n - 1].lng };
//     var wayPoints = [];
//     if (n > 2) {
//         for (var i = 1; i < n - 1; i++) {
//             wayPoints.push({ "lat": "" + userDetails[i].lat, "lng": "" + userDetails[i].lng });
//         }
//     }

//     var params = {
//         origin: originPts,
//         destination: destinationPts,
//         mode: 'driving',
//         waypoints: wayPoints,
//         transit_mode: 'bus'
//     };

//     return new Promise((resolve, reject) => {
//         gMapClient.directions(params).asPromise().then((data) => {
//             //  console.log(userDetails);
//             _.assign(data, { photoPath: userDetails[0].path + ".jpeg" });
//             //  console.log(data);
//             resolve(data);
//         }).catch((err) => {
//             reject(err);
//         });
//     }).catch((err) => {
//         console.log(err);
//     });

// }

// app.use(express.static(__dirname + '/public'));

// //App
// app.use('/scripts', express.static(__dirname + '/node_modules/materialize-css/dist/'));
// app.use('/scripts/axios', express.static(__dirname + '/node_modules/axios/dist/'));
// app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io-client/dist/'));


// app.get('/', function(req, res) {
//     res.sendFile(__dirname + "/index.html");
// });

app.get('/traink', function(req, res) {
    res.sendFile(__dirname + "/index1.html");
});

// app.get('/live', function(req, res) {
//     res.sendFile(__dirname + "/live-stream.html");
// });

// app.get('/verify', function(req, res) {
//     res.sendFile(__dirname + "/test.html");
// });

// app.get('/load-photos', function(req, res) {
//     getImages(imageDir, function(err, files) {
//         var imageLists = '<ul>';
//         var name = '';
//         for (var i = 0; i < files.length; i++) {
//             name = files[i].split('.')[0];
//             imageLists += '<li><img alt="' + name + ' "id="' + name + '" src="/photos/' + files[i] + '"></li>' +
//                 '<input type="button" id="' + name + '" class="btn btn-primary btnspace" width="100" value="Train" id="verifyActn"/><input type="button" id="' + name + '"class="btn btn-primary btnspace" width="100" value="Report" onClick="javascript:reportUser(\'' + name + '\');"/><br>';
//         }
//         imageLists += '</ul>';
//         res.writeHead(200, { 'Content-type': 'text/html' });
//         res.end(imageLists);
//     });

//     function readIndividualFile() {
//         var query = url.parse(req.url, true).query;
//         var pic = query.image;
//         fs.readFile(imageDir + pic, function(err, content) {
//             if (err) {
//                 res.writeHead(400, { 'Content-type': 'text/html' })
//                 console.log(err);
//                 res.end("No such image");
//             } else {
//                 //specify the content type in the response will be an image
//                 res.writeHead(200, { 'Content-type': 'image/jpg' });
//                 res.end(content);
//             }
//         });
//     }

//     function getImages(imageDir, callback) {
//         var fileType = '.jpeg',
//             files = [],
//             i;
//         fs.readdir(imageDir, function(err, list) {
//             for (i = 0; i < list.length; i++) {
//                 if (path.extname(list[i]) === fileType) {
//                     files.push(list[i]); //store the file name into the array files
//                 }
//             }
//             callback(err, files);
//         });
//     }
// });

// app.get('/load', function(req, res) {
//     res.sendFile(__dirname + "/load.html");
// });

// app.get('/showMap', function(req, res) {
//     res.sendFile(__dirname + "/gmap.html");
// });

// app.post("/enroll", (req, res) => {
//     res.setHeader('Content-Type', 'application/json');
//     if (req.files != undefined) {
//         req.body.imageSrc = "data:image/png;base64,".concat(new Buffer(req.files.imageSrc.data).toString('base64'));
//     }
//     console.log("Inside ");
//     kairosApi.enroll(req.body).then((response) => {
//         var values = _.pick(response.body, ["face_id"]);
//         var faceIdModel = new faceIdentityModel({
//             faceId: values.face_id
//         });

//         faceIdModel.save().then((results) => {
//             // res.send(results);
//             res.status(response.status).send(response.body);
//         }, (err) => {
//             res.status(400).send(err);
//         });


//     }).catch((err) => {
//         // console.error(err);
//         res.status(500).send(err[0].Message);
//     });
// });

app.post("/recognize", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.files != undefined) {
        req.body.imageSrc = "data:image/png;base64,".concat(new Buffer(req.files.imageSrc.data).toString('base64'));
    }
    kairosApi.recognize(req.body).then((response) => {
        //console.log(response);  
        res.status(response.status).send(response.body);
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err[0].Message);
    });
});


//var pythonProcess = spawn('python', ["./python/camera.py"]);

//console.log(pythonProcess.pid);

var port = process.env.PORT || 3000;

//App
//var train = require('./server/routes/train');
//var run = require('./server/routes/run')(app.io);
//var run = require('./server/routes/run');

//app.use('/train', train);
//app.use('/run', run);

////var server = http.createServer(app);
//app.io.attach(server);

app.listen(port, () => {
    console.log(`App started in port ${port}`);
});
