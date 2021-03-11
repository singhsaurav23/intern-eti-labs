var http = require('http'),
	url = require('url'),
	path = require('path'), 
	fs = require('fs');

var db = require('./web-modules/config/mongoose') ;
var machineNew = require('./web-modules/models/table-content') ;

var mimeTypes = {
	'html': 'text/html',
	'css': 'text/css',
	'js': 'text/javascript',

	'json': 'application/json', 
	'pdf': 'application/pdf',
	'doc': 'application/msword',

	'ico': 'image/x-icon',
	'png': 'image/png',
	'jpeg': 'image/jpeg',
	'jpg': 'image/jpeg',
	'svg': 'image/svg+xml',

	'wav': 'audio/wav',
	'mp3': 'audio/mpeg'
};

responseTypes = {
	"OK": {"responseCode":200, "contentType":"text/html", "responseText":""},
	"Not Found": {"responseCode":404, "contentType":"text/plain", "responseText":"Not Found"},
	"Not Allowed": {"responseCode":405, "contentType":"text/plain", "responseText":"Not Allowed"}
}

http.createServer(function(req, res) {
	// var request= req;
	// var resp = res;
	var urlAll = url.parse(req.url, true); 
	var uri = urlAll.pathname; // it is the main redirect path
	var queryParams = urlAll.query; //fetchs the query from the requested url after the parse req
	var querySearch = urlAll.search ;
	var dynamicPath = path.join(process.cwd(), "web-modules", unescape(uri).split("/")[1], "index.js");
	console.log("Dynamic path: " + dynamicPath);
	try {   
        //dynamically load the js file base on the url path
        var handler = require(dynamicPath);
        console.log("router:route() selected handler: " + handler);
 
        //make sure we got a correct instantiation of the module
        if (typeof handler["get"] === 'function' || typeof handler["post"] == 'function' || typeof handler["delete"] == 'function')   {
			//route to the right method in the module based on the HTTP action
			var response;
			console.log("inside handler");
            if(req.method.toLowerCase() == 'get') { 
                response = handler["get"](uri, queryParams, querySearch, urlAll, req, res);
			}
			else if (req.method.toLowerCase() == 'post') {
                response = handler["post"](uri, queryParams, req, res);
			}
			else if (req.method.toLowerCase() == 'put') {
                response = handler["put"](uri, queryParams, req, res);
			}
			else if (req.method.toLowerCase() == 'delete') {
                response = handler["delete"](uri, queryParams, req, res);
			}
			// res.writeHead(responseTypes[response[0]].responseCode, {'Content-Type': responseTypes[response[0]].contentType});
			// if(response[0] == "OK"){
			// 	res.write(response[1]);
			// }
			// else{
			// 	res.write(responseTypes[response[0]].responseText);
			// }
			//res.end();

            return;
        } 
	}
	catch(err) {
		// console.log(err);
		console.log("No dynamic path");
		var filename = path.join(process.cwd(), "static" , unescape(uri));  // //access the static folder
		console.log("Static path: " + filename);
		
		if(fs.existsSync(filename) && fs.lstatSync(filename).isFile()){
			console.log("Static path exists"); 
			var mimeType = mimeTypes[path.extname(filename).split(".").reverse()[0]];
			console.log('mimetype check',mimeType );
			res.writeHead(200, {'Content-Type': mimeType} );

			var fileStream = fs.createReadStream(filename); 
			try{
				fileStream.pipe(res);
			}
			catch(err){
				console.log("not a file: ");
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.write('404 Not Found\n');
				res.end();
				return;
			}
		}
		else{
			console.log("No static path",err);
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('404 Not Found\n');
			res.end(); 
			return;
		}
	}
}).listen(3000);