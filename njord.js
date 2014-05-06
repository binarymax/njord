//Njörðr HTTP Client

var url = require('url');

var protocol;

var Client = module.exports = {};

//Gets the proper connection library (http or https);
var connection = function(uri) { return require(uri.protocol.substr(0,uri.protocol.length-1)); };

//Parses a URI and adds defaults 
var parseurl = function(uri,agent) {
	uri = url.parse(uri);
	uri.headers = { 'user-agent': (agent||'Njörðr Client/1.0') };
} 

// -------------------------------
// Gets a callback response data builder
var response = function (callback) {
	return function (res) {
		var resData = "";
		res.setEncoding('utf8');
		res.on('data',function(chunk) { resData+=chunk; });
		res.on('end', function() { callback(res,resData); });
	};
};

// ===================================================================================================
// Gets a new client session, for persistent session connectivity
Client.session = function(root) {

	//Public methods
	var session = {};

	//Session cookie
	var cookie = [];

	//Connection protocol library (http/https)
	var protocol = connection(url.parse(root));

	// -------------------------------
	// Returns the base options that are required for a client HTTP request
	var route = function(path,method,type,length) {
		
		//Get the HTTP request options
		var options = url.parse(root+path);
		options.headers = { 'user-agent': 'Ragnarok Test Bot/1.0' };
		
		//Set the session cookie if it exists
		if (cookie.length) options.headers.cookie = cookie[0];
		
		//Set verb and content headers if provided
		if (method) options.method = method;
		if (type)   options.headers['Content-Type'] = type;
		if (length) options.headers['Content-Length'] = length;

		return options;
	};

	// -------------------------------
	// Gets an HTTPS(S) verb request function
	var request = function(method) {
		return function(path,data,callback) {
			if (typeof data === 'object') data = querystring.stringify(data);
			var options = route(path,method,'application/x-www-form-urlencoded',data.length);
			var request = protocol.request(options,response(callback)).on('error',callback);
			request.write(data);
			request.end();
		};
	};

	// -------------------------------
	// Handles a Login request to set the cookie
	session.login = function(path,username,password,callback){
		request('POST')(path,{username:username,password:password},function(res,data){
			cookie = res.headers['set-cookie'];
			callback(res,data);
		});
	};

	// -------------------------------
	// Handles a GET request to the api
	session.get = function(path,callback) {
		protocol.get(route(path),response(callback)).on('error',callback);;
	};

	// -------------------------------
	// Handles a POST request to the api
	session.post = request('POST');

	// -------------------------------
	// Handles a PUT request to the api
	session.put = request('PUT');

	// -------------------------------
	// Handles a DELETE request to the api
	session.del = request('DELETE');

	return session;

};
