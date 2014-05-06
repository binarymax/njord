# Njörðr

Session-persistent HTTP client

Connect to a form-based login API, and execute requests

## Installation

```
npm install njord
```

## Example

```js
var njord = require('njord');
var session = njord.session('http://example.com/');
session.login('login/','username','password',function(err){
	
	if(err) {
		console.error('Could not login:', err);
	} else {
		session.get('myaccount/',{},function(err,accountdata){
			if(err) {
				console.error('Could not get account:', err);
			} else {
				console.log(accountdata);
			}
		});
	}

});

```
