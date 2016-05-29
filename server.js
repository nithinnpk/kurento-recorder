// Load required modules
var port     =  443;
var https    = require("https");              // http server core module
var express  = require("express");           // web framework external module
var io       = require("socket.io");         // web socket external module
var fsPath   = require('fs-path');

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var httpApp = express();
httpApp.use(express.static(__dirname + "/static/"));

var fs = require('fs');
var options = {
    key: fs.readFileSync('/home/ubuntu/kurento-recorder/cert/trainybee.key'),
    cert: fs.readFileSync('/home/ubuntu/kurento-recorder/cert/recording.trainybee.com.crt')
};
// Start Express http server on port 90
var webServer = https.createServer(options, httpApp).listen(port);

// Start Socket.io so it attaches itself to Express server
var socketServer = io.listen(webServer, {"log level":1});
console.log('Server Running At '+port);

socketServer.sockets.on('connection', function (socket) {
  console.log('connected');
  // wait for the event raised by the client
  socket.on('getSlideDetails', function (path) {  
    console.log('getSlideDetails '+path); 
    socket.emit('slideData', getCount(path));
    
  });
  socket.on('removeAllDataOnInit', function (path) { 
    console.log('removeAllDataOnInit '+path); 
    rmDir(path);
    
  });
  socket.on('saveSlide', function (data,path) {  
      console.log('saveSlide '+data+'----'+path); 
      fsPath.writeFile(path, data, function(err){
        if(err) {
          throw err;
        } else {
          console.log('wrote a file like DaVinci drew machines');
        }
      });
  });
  rmDir = function(dirPath) {
      try { var files = fs.readdirSync(dirPath); }
      catch(e) { return; }
      if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
          var filePath = dirPath + '/' + files[i];
          if (fs.statSync(filePath).isFile())
            fs.unlinkSync(filePath);
          else
            rmDir(filePath);
        }
      fs.rmdirSync(dirPath);
    };
  function getCount (dir){
    var files = fs.readdirSync(dir);
    var count = 0;
    for (var i in files){
        count++;
    }
    return count;
}

});

