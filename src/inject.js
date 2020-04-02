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
  highlight2(enrichedjson);
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
  //Cette version de highlight déplace les éléments en haut des résultas de recherche (et ne tient pas compte des publicités ou encadrés spéciaux)
  const resultslist = document.getElementsByClassName('g');
  var firstNeutralResult = 0;
  var firstNeutralResultFound = false;
  for (var i = 0; i < enrichedjson.length; i++) {
    // If result is trusted
    if (enrichedjson[i].status == 'trusted') {
      resultslist[enrichedjson[i].id].classList.add('trusted'); //apply .trusted class
      /*  resultslist[enrichedjson[i].id]
        .querySelector('.rc')
        .querySelector('.r')
        .querySelector('cite').style.color = '#44ba3a';*/
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
    border-left: solid #44ba3a 2px;
    margin-left: -10px;
    padding-left: 10px;
  }
/*
  .trusted cite {
    color: #44ba3a;
  }
*/
  .trusted cite:before {
    content: " ✔️ ";
    color: #44ba3a;

  }

  `;

  var styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = newstyles;
  document.head.appendChild(styleSheet);
}

function highlight2(enrichedjson) {
  //Cette fonction déplacement les résultats de confiance tout en haut de page
  const resultslist = document.getElementsByClassName('g');
  var firstNeutralResult = 0;
  var firstResultFound = false;
  for (var i = 0; i < enrichedjson.length; i++) {
    // If result is trusted
    if (enrichedjson[i].status == 'trusted') {
      resultslist[enrichedjson[i].id].classList.add('trustedtwo'); //apply .trusted class
      resultslist[enrichedjson[i].id].classList.add('tooltip'); //apply .trusted class
      /*  resultslist[enrichedjson[i].id]
        .querySelector('.rc')
        .querySelector('.r')
        .querySelector('cite').style.color = '#44ba3a';*/
      // If this trusted result needs to be moved upwards
      var para = document.createElement('span');
      para.classList.add('tooltiptext');
      para.appendChild(document.createTextNode('Source de confiance '));
      let newNode = resultslist[enrichedjson[i].id];
      newNode.appendChild(para);

      if (firstResultFound == false) {
        var paratitle = document.createElement('div');
        paratitle.classList.add('firsttitle');
        paratitle.appendChild(document.createTextNode(''));
        var parentDiv = document.getElementById('rso');
        var firstChildNode = document.getElementById('rso').firstElementChild;
        newNode.insertBefore(paratitle, newNode.firstElementChild);
        parentDiv.insertBefore(newNode, firstChildNode);
        firstResultFound = true;
      }
    }
    // If result is neutral
    else if (0) {
      firstNeutralResult = enrichedjson[i].id;
      firstNeutralResultFound = true;
      var parentDiv = document.getElementById('rso');
      //var firstChildNode = document.getElementById('rso').getElementsByClassName('g')[firstNeutralResult];
      var firstChildNode = document.getElementById('rso').firstElementChild;
      console.log('First Neutral Result : ' + firstNeutralResult + '(' + firstNeutralResultFound + ')');
    }
  }
  var pictourl = browser.runtime.getURL('assets/icons/picto_sdc-24px.png');
  // CSS injection - Define style for .trusted class
  var newstyles = `
    .g.trustedtwo {
      padding: 16px 5px 5px 16px;
      border: 1px solid #dfe1e5;
      border-radius: 8px;
      box-shadow: none;
      width:630px;    }

      .trustedtwo cite:after {
        /*content: " | source de confiance ";*/
        /*color: #44ba3a;*/
        font-weight:bold;
      }

      .trustedtwo cite {
        color: #44ba3a;
      }

      .trustedtwo:before {
        content: " ";
        color: #44ba3a;
        width:24px;
        height:24px;
        display:block;
        float:right;
        margin-left:-15px;
        margin-top:-17px;
        background-image:url(${pictourl});
      }

/* First Title */
.firsttitle {
  color:#333;
  margin-bottom:10px;
  font-weight:bold;
}

      /* Tooltip container */
.tooltip {
 position: relative;
 display: inline-block;
}

/* Tooltip text */
.tooltip .tooltiptext {
 visibility: hidden;
 width: 120px;
 background-color: #777;
 color: #fff;
 text-align: center;
 padding: 5px 0;
 border-radius: 6px;

 /* Position the tooltip text */
 position: absolute;
 z-index: 1;
 bottom: 101%;
 left: 100%;
 margin-left: -70px;

 /* Fade in tooltip */
 opacity: 0;
 transition: opacity 0.3s;
}

/* Tooltip arrow */
.tooltip .tooltiptext::after {
 content: "";
 position: absolute;
 top: 100%;
 left: 50%;
 margin-left: -5px;
 border-width: 5px;
 border-style: solid;
 border-color: #777 transparent transparent transparent;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
 visibility: visible;
 opacity: 1;
}


    `;

  var styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = newstyles;
  document.head.appendChild(styleSheet);
}
