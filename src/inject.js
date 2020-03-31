var browser = require('webextension-polyfill');

// On insere un texte Confiance dans la toolbar
document.getElementById('hdtb-msb').innerHTML += `<div id="tp_item" class="hdtb-mitem hdtb-imb" aria-hidden="true">
  		<a id="tp_anchor" class="q qs" href="#">
			Confiance
		</a>
	</div>`;

// On met un listener sur ce texte
if (document.getElementById('tp_item')) {
  document.getElementById('tp_item').addEventListener('click', showTp);
} else console.log('not adding click');

function showTp(e) {
  // Le texte a été cliqué
  queryString = document.getElementsByName('q')[0].value;

  console.log('query =', queryString);
}

// (MODULE 1) GET SERP RESULTS
//----------------------------
// Scrap the Search Engine Result Page and send resultjson to the filter module

window.addEventListener('load', function() {
  const resultslist = document.getElementsByClassName('g');
  const querystring = document.getElementsByName('q')[0].value;
  var resultjson = [];
  // fo each result, store id (from array index) and url (from href) in the resultjson array
  for (var i = 0; i < resultslist.length; i++) {
    var el = resultslist[i].getElementsByClassName('rc'); // test if result has expected child. prevents code from breaking when a special info box occurs.
    if (el.length > 0) {
      resultjson.push({
        id: i,
        url: resultslist[i]
          .querySelector('.rc')
          .querySelector('.r')
          .querySelector('a').href,
      });
    }
  }

  var requestjson = { request: querystring, results: resultjson, type: 'GET_SERP' };

  notifyBackgroundPage(requestjson);
});

// (MODULE 2) FILTER
//--------------------------
// Send a single message to event listeners within the extension
// Response will be processed in background.js and sent back through the handler
function handleResponse(enrichedjson) {
  console.log(`Launch the highlight !`);
  console.log(enrichedjson);
  highlight(enrichedjson);
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

function notifyBackgroundPage(json) {
  var sending = browser.runtime.sendMessage(json);
  console.log('json sent');
  sending.then(handleResponse, handleError);
}

// (MODULE 3) HIGHLIGHT
//-------------------------
// Parse enrichedjson and apply new style and position to trusted results

function highlight(enrichedjson) {
  const resultslist = document.getElementsByClassName('g');
  var firstNeutralResult = 0;
  var firstNeutralResultFound = false;
  for (var i = 0; i < enrichedjson.length; i++) {
    // If result is trusted
    if (enrichedjson[i].status == 'trusted') {
      resultslist[enrichedjson[i].id].classList.add('trusted'); //apply .trusted class
      resultslist[enrichedjson[i].id]
        .querySelector('.rc')
        .querySelector('.r')
        .querySelector('a').style.color = '#44ba3a';
      // If this trusted result needs to be moved upwards
      if (firstNeutralResultFound) {
        let newNode = resultslist[enrichedjson[i].id];
        parentDiv.insertBefore(newNode, firstChildNode);
      }
    }
    // If result is neutral
    else if (firstNeutralResultFound == false) {
      firstNeutralResult = enrichedjson[i].id;
      firstNeutralResultFound = true;
      var parentDiv = document.getElementById('rso');
      var firstChildNode = document.getElementById('rso').getElementsByClassName('g')[firstNeutralResult];
      console.log('First Neutral Result : ' + firstNeutralResult + '(' + firstNeutralResultFound + ')');
    }
  }

  // CSS injection - Define style for .trusted class
  var newstyles = `
  .g.trusted {
    border-left: solid #44ba3a 4px;
    margin-left: -10px;
    padding-left: 10px;
  }
  `;

  var styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = newstyles;
  document.head.appendChild(styleSheet);
}
