export function one() {
  var i = Math.floor(Math.random() * 1000);
  this.url = 'http://example.com/fake_directory' + i;
  this.snippet = 'Fake snippet n° ' + i;
  this.name = 'Fake name ' + i;
  this.status = Math.random() > 0.5 ? 'trusted' : 'unknown';
}

export function get(nCount) {
  console.log('>FakeResults.get: nResults=' + nCount);

  this.results = [];

  for (var i = 0; i < nCount; i++) {
    var result = new one();
    this.results.push(result);
  }
}

export function hello() {
  console.log('Hello from Fakeresults');
}
