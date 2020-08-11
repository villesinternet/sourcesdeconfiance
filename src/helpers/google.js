// export function extractFromSERP(doc) {
//   console.log('>extractFromSERP');
// }

//Extract results from the the document's SERP
export function extractFromSERP(doc) {
  console.log('>extractFromSERP');

  const elements = doc.getElementsByClassName('g');
  var results = [];
  for (var i = 0; i < elements.length; i++) {
    var el = elements[i].getElementsByClassName('rc'); // test if result has expected child. prevents code from breaking when a special info box occurs.
    if (el.length > 0 && !elements[i].classList.contains('kno-kp')) {
      //quickfix do not analyse knowledge boxes. Could be a specific analysis instead
      var url = elements[i].querySelector('.rc a').href;
      var name = elements[i].querySelector('.rc .r a h3').textContent;
      var snippet = elements[i].querySelector('.rc .s .st') ? elements[i].querySelector('.rc .s .st').textContent : '';
      results.push({
        id: i,
        url: url,
        name: name,
        snippet: snippet,
      });
    }
  }

  return results;
}
