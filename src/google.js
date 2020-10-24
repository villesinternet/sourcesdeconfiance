//import Config from './config/config.js';
import * as sdc from './sdc.js';
import * as Google from './search_engines/google.js';

console.log('Google SDC instance creation');

// We only need to run SDC on the "All" Google pane (not images, news, etc)
// And... off we go !
if (!new URLSearchParams(window.location.search).get('tbm')) sdc.run(Google);
else console.log('not launching. tbm=' + search.get('tbm'));
