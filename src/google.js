import Vue from 'vue';
import sdcTab from './sdcTab';
import sdcFrame from './sdcFrame';

// Start the Vue engine for our space
//
// First the agregate frame itself
// Shared agreates data with Vue view (getters & setters)
// var agregates = {
//   get a() {
//     return frameVue.agregates;
//   },
//   set a(b) {
//     console.log('dans laffectation');
//     frameVue.agregates = b;
//   },
// };

const frameDiv = document.createElement('div');
document.getElementById('cnt').append(frameDiv);
var frameVue = new Vue({
  el: frameDiv,
  render: h => {
    return h(sdcFrame);
  },
});

// Then the menu Tab
const menuDiv = document.createElement('div');
document.getElementById('hdtb-msb-vis').append(menuDiv);
var tabVue = new Vue({
  el: menuDiv,
  render: h => {
    return h(sdcTab, {
      props: {
        frameVue: frameVue,
      },
    });
  },
});

// INITIALIZATION
var browser = require('webextension-polyfill');

const getStoredSettings = browser.storage.local.get();
getStoredSettings.then(getSerp, onError);
function onError(e) {
  console.error(e);
}

// EDIT SERP INTERFACE FOR SDC
// function addElement() {
//   var sdcButton = document.createElement('a');
//   sdcButton.id = 'sdc';
//   sdcButton.setAttribute('class', 'hdtb-mitem');
//   var newContent = document.createTextNode('Sources de confiance');
//   sdcButton.appendChild(newContent);
//   sdcButton.addEventListener('click', sdcFrame);
//   var currentDiv = document.getElementById('hdtb-msb');
//   currentDiv.appendChild(sdcButton);
// }

//addElement();
// function sdcFrame() {
//   var selectedMenuItem = document.getElementsByClassName('hdtb-msel');
//   if (selectedMenuItem.length > 0) {
//     selectedMenuItem[0].classList.remove('hdtb-msel');
//   }
//   document.getElementById('sdc').classList.add('hdtb-msel');
//   document.getElementById('appbar').remove();
//   var node = document.getElementById('rcnt');
//   node.querySelectorAll('*').forEach(n => n.remove());
//   var sdcR = document.createElement('p');
//   sdcR.appendChild(document.createTextNode('Hello world !'));
//   node.appendChild(sdcR);

//   document.getElementById('footcnt').remove();
// }

// (MODULE 1) GET SERP RESULTS
//----------------------------
// Scrap the Search Engine Result Page and send request to the filter module
//function getSerp(storedSettings) {
// if (storedSettings.extensionswitch != 'off') {
//   //if extension is switched on, proceed
//   const resultslist = document.getElementsByClassName('g');
//   const querystring = document.getElementsByName('q')[0].value;
//   var resultjson = [];
//   // fo each result, store id (from array index) and url (from href) in the resultjson array
//   for (var i = 0; i < resultslist.length; i++) {
//     var el = resultslist[i].getElementsByClassName('rc'); // test if result has expected child. prevents code from breaking when a special info box occurs.
//     if (el.length > 0 && !resultslist[i].classList.contains('kno-kp')) {
//       //quickfix do not analyse knowledge boxes. Could be a specific analysis instead
//       resultjson.push({
//         id: i,
//         url: resultslist[i]
//           .querySelector('.rc')
//           .querySelector('.r')
//           .querySelector('a').href,
//       });
//     }
//   }
//   var apiserver = 'https://sourcesdeconfiance.org/api/trusted';
//   if (storedSettings.apiserver) {
//     apiserver = storedSettings.apiserver;
//     console.log('using ' + apiserver);
//   }

//   // Calculate results per page
//   var results = document.querySelectorAll('.g .rc');
//   var startResult = 0;
//   var currentPage = 1;
//   var resultsPerPage = 10;
//   var url = new URL(window.location.href);
//   if (window.location.href.indexOf('?start=') != -1 || window.location.href.indexOf('&start=') != -1) {
//     var startResult = parseInt(url.searchParams.get('start'));
//     var currentPage = 1 + startResult / resultsPerPage;
//   }
//   if (currentPage == 1 && results.length > 10) {
//     //quickfix for first SERP results number variable due to knowledge boxes
//     resultsPerPage = Math.round(results.length / 10) * 10;
//   }
//   var nextResultIndex = resultsPerPage + startResult;

//   var requestjson = {
//     request: querystring,
//     results: resultjson,
//     userAgent: window.navigator.userAgent,
//     apiserver: apiserver,
//     searchengine: 'google',
//     resultsPerPage: resultsPerPage,
//     currentPage: currentPage,
//     nextResultIndex: nextResultIndex,
//     type: 'GET_SERP',
//   };
//   //notify background page
//   browser.runtime.sendMessage(requestjson);

//test results search on page 2
// console.log('startResult ' + startResult);
// console.log('resultsPerPage : ' + resultsPerPage);
// console.log('currentPage : ' + currentPage);
// console.log('Next result index : ' + nextResultIndex);
// var testjson = {
//   request: querystring,
//   userAgent: window.navigator.userAgent,
//   apiserver: apiserver,
//   searchengine: 'google',
//   resultsPerPage: resultsPerPage,
//   currentPage: currentPage,
//   nextResultIndex: nextResultIndex,
//   type: 'GET_NEXT_RESULTS',
// };
// browser.runtime.sendMessage(testjson);
// } else {
//   console.log('extension is switched off');
// }
//}

// (MODULE 2) FILTER
//--------------------------
// Send a single message to event listeners within the extension
// Response will be processed in background.js and sent back through the handler
// function filterTrusted(el) {
//   return el.status == 'trusted';
// }

// function handleMessage(request, sender, sendResponse) {

//   console.log("handleMessage=" + request.message);

//   if (request.message === 'HIGHLIGHT') {
//     highlight(request.json);
//   }
//   if (request.message === 'NEXT_RESULTS') {
//     console.log('Next results :');
//     console.log(request.json);
//     console.log('Next trusted results :');
//     console.log(request.json.filter(filterTrusted));
//   }
//   if (request.message === 'KB_DELIB') {
//     console.log('Deliberations :');
//     console.log(request.json.filter(filterTrusted));
//   }
//   if (request.message === 'KB_LOI') {
//     console.log('Lois :');
//     console.log(request.json.filter(filterTrusted));
//   }
//   if (request.message === 'KB_GOUV') {
//     console.log('Gouv :');
//     console.log(request.json.filter(filterTrusted));
//   }
// }

//browser.runtime.onMessage.addListener(handleMessage);

// (MODULE 3) HIGHLIGHT
//-------------------------
// Parse API response and apply new style and position to trusted results

// function highlight(enrichedjson) {
//   console.log('inject.js higlight');
//   const resultslist = document.getElementsByClassName('g');
//   //check if it is the first result page, to apply specific style to the first result entry
//   if (window.location.href.indexOf('&start=0') != -1) {
//     firstresult = true;
//   } else if (window.location.href.indexOf('?start=') != -1) {
//     firstresult = false;
//   } else if (window.location.href.indexOf('&start=') != -1) {
//     firstresult = false;
//   } else {
//     var firstresult = true;
//   }

//   for (var i = 0; i < enrichedjson.length; i++) {
//     if (enrichedjson[i].status == 'trusted') {
//       resultslist[enrichedjson[i].id].classList.add('trusted');

//       if (firstresult) {
//         resultslist[enrichedjson[i].id].classList.add('trustedfirst');
//         resultslist[enrichedjson[i].id].classList.add('tooltip');
//         var para = document.createElement('span');
//         para.classList.add('tooltiptext');
//         para.appendChild(document.createTextNode('Source de confiance '));
//         let newNode = resultslist[enrichedjson[i].id];
//         newNode.appendChild(para);
//         var parentDiv = document.getElementById('rso');
//         var firstChildNode = document.getElementById('rso').firstElementChild;
//         parentDiv.insertBefore(newNode, firstChildNode);
//         firstresult = false;
//         if (resultslist[enrichedjson[i].id].classList.contains('g-blk')) {
//           //styling - only if the first trusted result is a special box mnr-c g-blk - could be improved
//           resultslist[enrichedjson[i].id].classList.remove('trustedfirst');
//           resultslist[enrichedjson[i].id].classList.add('trusted');
//         }
//       }
//     }
//   }

// var pictourl = browser.runtime.getURL('assets/icons/sdc-24.png');
// var pictooffurl = browser.runtime.getURL('assets/icons/sdc-off-24.png');

// var styleSheet = document.createElement('style');
// styleSheet.type = 'text/css';
// styleSheet.innerText = newstyles;
// document.head.appendChild(styleSheet);

//CSS injection - Define style for .trusted class
// var newstyles = `
//   a#sdc {
//     cursor: pointer;
//   }
//   a#sdc:before {
//     content: " ";
//     color: #44ba3a;
//     width:24px;
//     height:24px;
//     display:block;
//     float:left;
//     background-image:url(${pictooffurl});
//   }

//   .g.trusted {
//  }

//   .trusted cite {
//     color: #34a853;
//   }

//   .trusted:before {
//     content: " ";
//     color: #44ba3a;
//     width:24px;
//     height:24px;
//     display:block;
//     float:left;
//     margin-left:-26px;
//     background-image:url(${pictourl});
//   }
//   .g.trustedfirst {
//     padding: 16px 5px 5px 16px;
//     border: 1px solid #dfe1e5;
//     border-radius: 8px;
//     box-shadow: none;
//     width:630px;    }
//     .trustedfirst cite {
//       color: #34a853;
//     }
//     .trustedfirst:before {
//       content: " ";
//       color: #44ba3a;
//       width:24px;
//       /* height:40px; */
//       height:24px;
//       display:block;
//       float:right;
//       margin-left:-15px;
//       margin-top:-17px;
//       background-image:url(${pictourl});
//     }
//     /* Tooltip container */
//     .tooltip {
//      position: relative;
//      display: inline-block;
//     }
//     /* Tooltip text */
//     .tooltip .tooltiptext {
//      visibility: hidden;
//      width: 150px;
//      background-color: #BBB;
//      color: #fff;
//      text-align: center;
//      padding: 5px 0;
//      border-radius: 6px;
//      /* Position the tooltip text */
//      position: absolute;
//      z-index: 1;
//      bottom: 100%;
//      left: 100%;
//      margin-left: -92px;
//      margin-bottom: 6px;
//      /* Fade in tooltip */
//      opacity: 0;
//      transition: opacity 0.3s;
//     }
//     /* Tooltip arrow */
//     .tooltip .tooltiptext::after {
//      content: "";
//      position: absolute;
//      top: 100%;
//      left: 50%;
//      margin-left: -5px;
//      border-width: 5px;
//      border-style: solid;
//      border-color: #BBB transparent transparent transparent;
//     }
//     /* Show the tooltip text when you mouse over the tooltip container */
//     .tooltip:hover .tooltiptext {
//      visibility: visible;
//      opacity: 1;
//     }
//   `;
// var styleSheet = document.createElement('style');
// styleSheet.type = 'text/css';
// styleSheet.innerText = sdcStyles;
// document.head.appendChild(styleSheet);
//}

// Vue.prototype.$agregates = [
//   // Sample for testing
//   {
//     id: 0,
//     url: 'https://www.univ-grenoble-alpes.fr/',
//     name: 'Université Grenoble Alpes',
//     snippet:
//       'Les cookies Google Analytics : Ce site utilise des cookies de Google Analytics, ces cookies nous aident à identifier le contenu qui vous intéresse le plus ainsi ...',
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 2,
//     url: 'http://www.museedegrenoble.fr/',
//     name: 'Musée de Grenoble',
//     snippet: "Créé en 1798, le musée de Grenoble n'a cessé de s'enrichir pour présenter aujourd'hui aux visiteurs plus de 900 œuvres. Un ensemble unique, tant par ses ...",
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 3,
//     url: 'https://www.bm-grenoble.fr/',
//     name: 'Bibliothèque municipale de Grenoble - Livres, Musique ...',
//     snippet: 'Bibliothèque municipale de Grenoble - livres, musique, cinéma, numérique pour tous. Informations pratiques et agenda des événements. Catalogue en ligne et ...',
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 6,
//     url: 'http://www.ac-grenoble.fr/',
//     name: 'Académie de Grenoble',
//     snippet:
//       'Gestion des cookies. Ce site utilise des cookies. Vous avez la possibilité de déterminer les cookies que vous autorisez ou refusez. Préférence pour tous les ...',
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 8,
//     url: 'https://www.chu-grenoble.fr/',
//     name: 'CHU Grenoble Alpes',
//     snippet: 'CHU de Grenoble - CHU des Alpes. Visites aux patients hospitalisés · Tous les événements rss. Rechercher un service. Sélectionner une catégorie, Urgences ...',
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 9,
//     url: 'http://www.isere.gouv.fr/',
//     name: "Accueil - Les services de l'État en Isère",
//     snippet: 'Essais de sirènes dans les communes de Pont-de-Chéruy et Grenoble le mercredi 8 juillet 2020. 06/07/2020. Communiqué du 6 juillet 2020 ...',
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 12,
//     url: 'https://www.grenoble-inp.fr/',
//     name: 'Grenoble INP',
//     snippet:
//       "6 écoles d'ingénieurs et des formations de docteurs orientés vers les grands défis de notre société : l'énergie, l'environnement, la société du numérique et la ...",
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 16,
//     url: 'http://www.sciencespo-grenoble.fr/',
//     name: 'Sciences Po Grenoble | Une grande école de sciences ...',
//     snippet: "Une grande école de sciences sociales au coeur d'une université de rang mondial. Toggle navigation. MENU. SCIENCES PO GRENOBLE · FORMATION ...",
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 17,
//     url: 'https://www.grenoble.cci.fr/',
//     name: 'CCI Grenoble - Entreprises et économie de la région ...',
//     snippet: "Le portail de la Chambre de commerce et d'industrie de Grenoble, Isère 38. Découvrez nos rubriques consacrées à la création de l'entreprise, au ...",
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 19,
//     url: 'https://www.ghm-grenoble.fr/',
//     name: 'Accueil GHM de Grenoble',
//     snippet:
//       "Le Groupe Hospitalier Mutualiste de Grenoble est un Établissement de Santé Privé d'Intérêt Collectif (ESPIC) à but non lucratif participant au service public ...",
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 20,
//     url: 'https://www.grenoble-patrimoine.fr/',
//     name: 'Grenoble Patrimoine: Accueil',
//     snippet: "Grenoble de 1925 à 1968. La ville laboratoire. L'explosion démographique exige désormais de penser un urbanisme planifié à plus grande échelle.",
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 25,
//     url: 'https://ml-grenoble.org/',
//     name: 'Mission Locale Grenoble',
//     snippet: 'La Mission Locale de Grenoble accueille, informe, oriente et accompagne tous les jeunes de 16 à 25 ans, notamment ceux sortis du système scolaire, en ...',
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 28,
//     url: 'https://musees.isere.fr/musee/musee-dauphinois',
//     name: 'Musée dauphinois',
//     snippet: null,
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 29,
//     url: 'http://grenoble.tribunal-administratif.fr/',
//     name: 'Tribunal administratif de Grenoble : Accueil',
//     snippet:
//       "Bienvenue sur le site du tribunal administratif de Grenoble. Le tribunal administratif est compétent pour juger la grande majorité des litiges résultant de l'activité ...",
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 30,
//     url: 'http://www.meteofrance.com/previsions-meteo-france/grenoble/38000',
//     name: 'METEO GRENOBLE par Météo-France - Prévisions Météo ...',
//     snippet: 'METEO FRANCE - Retrouvez les prévisions METEO GRENOBLE de Météo-France à 15 jours, les prévisions météos locales gratuites, complètes et détaillées à ...',
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 35,
//     url: 'http://www.onisep.fr/Pres-de-chez-vous/Auvergne-Rhone-Alpes/Grenoble',
//     name: 'ONISEP Grenoble - Grenoble - Onisep',
//     snippet:
//       "Éditeur public, l'Onisep produit et diffuse toute l'information sur les formations et les métiers. Il propose aussi des nouveaux services aux élèves, aux parents et ...",
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 46,
//     url: 'https://www.isere-tourisme.com/selection/destination-grenoble-agglo',
//     name: 'Destination Grenoble Agglo | Isère Tourisme',
//     snippet:
//       "Grenoble, c'est le coeur des Alpes, une ville sertie de montagnes. Ici, goûtez au plaisir de flâner sur les pas de Stendhal – le plus célèbre des Grenoblois - au ...",
//     status: 'trusted',
//     ring: 'default',
//   },
//   {
//     id: 49,
//     url: 'https://www.crous-grenoble.fr/',
//     name: 'Le Crous Grenoble Alpes - Au cœur de la vie étudiante !',
//     snippet: 'Le Crous Grenoble Alpes améliore les conditions de vie étudiantes : bourses, logement, restauration, culture, aides sociales et jobs étudiants !',
//     status: 'trusted',
//     ring: 'default',
//   },
// ];
