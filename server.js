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
var http = require('http'),
WebSocket = require('ws');
var {spawn} = require("child_process");

const https = require('https');

var pythonProcess = spawn('python',["./python/camera.py"]);

console.log(pythonProcess.pid);

var port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`App started in port ${port}`);
  })
  
app.use(express.static(__dirname + '/public'));

app.use('/scripts', express.static(__dirname + '/node_modules/materialize-css/dist/'));

//To upload
app.use(fileUpload());

app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

console.log("server runnning");

app.get('/', function(req,res){
    res.sendFile(__dirname + "/index.html"); 
 });

 app.get('/live', function(req,res){
    res.sendFile(__dirname + "/live-stream.html"); 
 });

 app.get('/verify', function(req,res){
    res.sendFile(__dirname + "/test.html"); 
 });

 app.get('/showMap', function(req,res){
    res.sendFile(__dirname + "/gmap.html"); 
 });

 app.post("/enroll", (req, res)=>{
     res.setHeader('Content-Type', 'application/json');  
     if(req.files!=undefined){ 
        req.body.imageSrc = "data:image/png;base64,".concat(new Buffer(req.files.imageSrc.data).toString('base64'));
    }
    console.log("Inside ");       
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






// if (process.argv.length < 3) {
// 	console.log(
// 		'Usage: \n' +
// 		'node websocket-relay.js <secret> [<stream-port> <websocket-port>]'
// 	);
// 	process.exit();
// }

var STREAM_SECRET = process.argv[2],
	STREAM_PORT = process.argv[3] || 9990,
	WEBSOCKET_PORT = process.argv[4] || 8082,
	RECORD_STREAM = false;
	var i=0;
// Websocket Server

const Secureserver = new https.createServer();

var socketServer = new WebSocket.Server({server:Secureserver}); 
console.log(socketServer);
socketServer.connectionCount = 0;
socketServer.on('connection', function(socket, upgradeReq) {
	socketServer.connectionCount++;
	

	console.log(
		'New WebSocket Connection: ', 
		(upgradeReq || socket.upgradeReq).socket.remoteAddress,
		(upgradeReq || socket.upgradeReq).headers['user-agent'],
		'('+socketServer.connectionCount+' total)'
	);
	socket.on('close', function(code, message){
		socketServer.connectionCount--;
		console.log(
			'Disconnected WebSocket ('+socketServer.connectionCount+' total)'
		);
	});
});
socketServer.broadcast = function(data) {
	
//childProcess
	socketServer.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
};

// HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
var streamServer = http.createServer( function(request, response) {
	var params = request.url.substr(1).split('/');

	// if (params[0] !== STREAM_SECRET) {
	// 	console.log(
	// 		'Failed Stream Connection: '+ request.socket.remoteAddress + ':' +
	// 		request.socket.remotePort + ' - wrong secret.'
	// 	);
	// 	response.end();
	// }

	response.connection.setTimeout(0);
	console.log(
		'Stream Connected: ' + 
		request.socket.remoteAddress + ':' +
		request.socket.remotePort
	);
	request.on('data', function(data){
		socketServer.broadcast(data);
		console.log(data);
		if (request.socket.recording) {
			request.socket.recording.write(data);
		}
	});
	request.on('end',function(){
		console.log('close');
		if (request.socket.recording) {
			request.socket.recording.close();
		}
	});

	// Record the stream to a local file?
	if (RECORD_STREAM) {
		var path = 'recordings/' + Date.now() + '.ts';
		request.socket.recording = fs.createWriteStream(path);
	}
}).listen(STREAM_PORT);

console.log('Listening for incomming MPEG-TS Stream on http://127.0.0.1:'+STREAM_PORT+'/<secret>');
console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
