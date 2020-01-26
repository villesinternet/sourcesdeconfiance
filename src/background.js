//import store from './store';
// global.browser = require('webextension-polyfill');

// alert(`Hello ${store.getters.foo}!`);

var HttpClient = function() {
	console.log('HttpClient');
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
        	console.log(anHttpRequest.readyState, anHttpRequest.status == 200);
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
    }
}

/*
Log that we received the message.
Then display a notification. The notification contains the URL,
which we read from the message.
*/
function notify(message) {


  if (message.type && message.type != 'territoire-plus') {
  	console.log('message dismissed');
  	return;
  }
  console.log("background script received message=", message);

	// var client = new HttpClient();
	
	// client.get('http://tp-webfront.test', function(response) {
 //    	// do something with response
 //    	console.log('response:', response);
	// });

}

/*
Assign `notify()` as a listener to messages from the content script.
*/
browser.runtime.onMessage.addListener(notify);
