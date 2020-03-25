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
  for (var i = 0; i < resultslist.length - 1; i++) {
    var el = resultslist[i].getElementsByClassName('rc'); // test if result has expected child. prevents code from breaking when a special info box occurs.
    if (el.length > 0) {
      resultjson.push({
        id: i,
        url: resultslist[i]
          .querySelector('.rc')
          .querySelector('.r')
          .querySelector('a').href,
      });
      // console.log(i + "/" + resultslist.length + " > " + resultslist[i].querySelector('.rc').querySelector('.r').querySelector('a').href);
    }
  }
  console.log(resultjson);

  // Tests - editition d'un résultat
  resultslist[2]
    .querySelector('.rc')
    .querySelector('.r')
    .querySelector('a').innerHTML += `<span title="Confiance : publication d'une entité publique" style="color:green;font-size:20px;">&nbsp; ✅
     </span>
     `;
  resultslist[2]
    .querySelector('.rc')
    .querySelector('.r')
    .querySelector('a').style.color = 'green';

  resultslist[3]
    .querySelector('.rc')
    .querySelector('.r')
    .querySelector('a').innerHTML += `<span title="Confiance : article de presse" style="color:blue;font-size:20px;">&nbsp; 📰
        </span>
        `;
  resultslist[2]
    .querySelector('.rc')
    .querySelector('.r')
    .querySelector('a').style.color = '#249bee';
});
