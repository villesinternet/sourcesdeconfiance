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
  // MODULE GET SERP RESULTS
  //--------------------------
  const resultslist = document.getElementsByClassName('g');
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
  console.log(resultjson); //This should be passed to the FILTER MODULE

  // MODULE FILTER (SIMULATION)
  //--------------------------
  // fake filter with enriched resultjson as input and enrichedjson as output
  var enrichedjson = resultjson;
  for (var i = 0; i < resultjson.length; i++) {
    if (enrichedjson[i].id == 0 || enrichedjson[i].id == 1 || enrichedjson[i].id == 2 || enrichedjson[i].id == 5) {
      enrichedjson[i].trusted = true;
    }
  }
  console.log(enrichedjson); //This should be the FILTER MODULE output

  // MODULE HIGLIGHT
  //--------------------------
  // parse enrichedjson and apply new style and position to trusted results
  var firstNeutralResult = 0;
  var firstNeutralResultFound = false;
  for (var i = 0; i < enrichedjson.length; i++) {
    // If result is trusted
    if (enrichedjson[i].trusted == true) {
      console.log(
        'styling : ' +
          resultslist[enrichedjson[i].id]
            .querySelector('.rc')
            .querySelector('.r')
            .querySelector('a').href +
          ' ; id = ' +
          i
      );
      resultslist[enrichedjson[i].id].classList.add('trusted');
      resultslist[enrichedjson[i].id].style.backgroundColor = '#F4FEE9';
      resultslist[enrichedjson[i].id]
        .querySelector('.rc')
        .querySelector('.r')
        .querySelector('a').style.color = '#249bee';
      resultslist[enrichedjson[i].id]
        .querySelector('.rc')
        .querySelector('.r')
        .querySelector('a').marginBottom = '20px';
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
      console.log(parentDiv);
      console.log(firstChildNode);
      console.log('First Neutral Result : ' + firstNeutralResult + '(' + firstNeutralResultFound + ')');
    }
  }
});
