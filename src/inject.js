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
