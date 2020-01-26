logoUrl = browser.runtime.getURL("assets/icons/tp-icon-24.png");
console.log('logoUrl=', logoUrl);

searchUrl="http://tp-webfront.test";
//searchUrl=" ";

document.getElementById("hdtb-msb").innerHTML+= 
	`<div id="tp_item" class="hdtb-mitem hdtb-imb" aria-hidden="true">
 		<a id="tp_anchor" class="q qs" href="`+ searchUrl + `">
 			<span style="height:16px;width:16px;display:inline-block;fill:currentColor;margin-right:5px;vertical-align:text-bottom;">
 				<img src="`+ logoUrl + `" alt="" data-atf="1">
 			</span>
 		</a>
	</div>`;

if (document.getElementById("tp_item")) {
	document.getElementById("tp_item").addEventListener("click", showTp); 
}
else console.log('not adding click');

// function notifyExtension(e) 
// {

// 	var target = e.target;

// 	console.log("content script sending message");
//   	browser.runtime.sendMessage(e);
// }

function showTp(e)
{
	queryString=document.getElementsByName("q")[0].value;
	document.getElementById("tp_anchor").href="http://tp-webfront.test/search?query=" + queryString;

	// var query = document.getElementsByName("q");

	// console.log('query =', query);

	//notifyExtension({'type':'territoire-plus', 'message': 'click'});

	// console.log('showTp');
	// browser.runtime.sendMessage({"url": "the url"});

	// var client = new HttpClient();
	// 	client.get('http://example.com', function(response) {
 //    		console.log('an got answer');
    		
 //    	}
	// );
	//showContent(httpGet("http://example.com"));
	//httpGetAsync("http://example.com", showContent);
}

// function showContent(content)
// {
// 	console.log('showContent',content);
// 	document.body.textContent = "";
// 	// var header = document.createElement('h1');
// 	// header.textContent = "This page has been eaten";
// 	document.body.appendChild(content);
// }

// function getUrlParams(search) {
//   let hashes = search.slice(search.indexOf('?') + 1).split('&')
//   return hashes.reduce((params, hash) => {
//       let [key, val] = hash.split('=')
//       return Object.assign(params, {[key]: decodeURIComponent(val)})
//   }, {})
//}

