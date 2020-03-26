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

window.addEventListener('load', function() {
  // get SERP results
  const resultslist = document.getElementsByClassName('g');
  var resultjson = [];
  // console.log(resultslist);

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
      //console.log(i + "/" + resultslist.length + " > " + resultslist[i].querySelector('.rc').querySelector('.r').querySelector('a').href);
    }
  }
  console.log(resultjson);

  // SIMULATION DU MODULE FILTRE
  // fake filter with enriched resultjson as input and enrichedjson as output
  var enrichedjson = resultjson;
  for (var i = 0; i < resultjson.length; i++) {
    if (enrichedjson[i].id == 0 || enrichedjson[i].id == 1 || enrichedjson[i].id == 2 || enrichedjson[i].id == 5) {
      enrichedjson[i].trusted = true;
    }
  }

  // parse enriched enrichedjson to set a 'trusted' class to corresponding elements
  var firstNeutralResult = 0;
  var firstNeutralResultFound = false;
  for (var i = 0; i < enrichedjson.length; i++) {
    if (enrichedjson[i].trusted == true) {
      resultslist[enrichedjson[i].id].querySelector('.rc').classList.add('trusted');
    } else {
      if (firstNeutralResultFound == false) {
        firstNeutralResult = enrichedjson[i].id;
        firstNeutralResultFound = true;
      }
    }
  }

  // get all trusted nodes
  var trustedresults = document.getElementsByClassName('trusted');

  // identify first neutral or untrusted result
  let parentDiv = document.getElementsByClassName('g')[0];
  let firstChildNode = document.getElementsByClassName('g')[0].getElementsByClassName('rc')[firstNeutralResult];
  console.log(parentDiv);
  console.log(firstChildNode);
  console.log('First Neutral Result : ' + firstNeutralResult + '(' + firstNeutralResultFound + ')');

  // apply new style to trusted nodes
  for (var i = 0; i < trustedresults.length; i++) {
    trustedresults[i].style.backgroundColor = '#F4FEE9';
    trustedresults[i].querySelector('.r').querySelector('a').style.color = '#249bee';
    trustedresults[i].querySelector('.r').querySelector('a').marginBottom = '20px';
    let newNode = trustedresults[i];
    parentDiv.insertBefore(newNode, firstChildNode); // move the trusted result up the first neutral result
  }
});
