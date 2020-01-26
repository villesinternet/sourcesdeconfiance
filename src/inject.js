logoUrl = browser.runtime.getURL("assets/icons/tp-icon-24.png");
console.log('logoUrl=', logoUrl);
searchUrl="http://tp-webfront.test/search?query=macron";

document.getElementById("hdtb-msb").innerHTML+= `
	<div id="tp_item" class="hdtb-mitem hdtb-imb" aria-hidden="true">
 		<a class="q qs" href="`+ searchUrl + `">
 		<span style="height:16px;width:16px;display:inline-block;fill:currentColor;margin-right:5px;vertical-align:text-bottom;">
 			<img src="`+ logoUrl + `" alt="" data-atf="1">
 		</span>
	</div> `;

if (document.getElementById("tp_item")) {
	document.getElementById("tp_item").addEventListener("click", showTp); 
}
else console.log('not adding click');

function notifyExtension(e) 
{

	var target = e.target;

	console.log("content script sending message");
  	browser.runtime.sendMessage(e);
}


function showTp(e)
{
	
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

function showContent(content)
{
	console.log('showContent',content);
	document.body.textContent = "";
	// var header = document.createElement('h1');
	// header.textContent = "This page has been eaten";
	document.body.appendChild(content);
}