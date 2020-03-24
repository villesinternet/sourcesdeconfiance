logoUrl = browser.runtime.getURL('assets/icons/tp-icon-24.png');

searchUrl = 'http://tp-webfront.test';

document.getElementById('hdtb-msb').innerHTML += `<div id="tp_item" class="hdtb-mitem hdtb-imb" aria-hidden="true">
  		<a id="tp_anchor" class="q qs" href="#">
			Confiance
		</a>
	</div>`;

if (document.getElementById('tp_item')) {
  document.getElementById('tp_item').addEventListener('click', showTp);
} else console.log('not adding click');

function showTp(e) {
  queryString = document.getElementsByName('q')[0].value;

  console.log('query =', queryString);
}
