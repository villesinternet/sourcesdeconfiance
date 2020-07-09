<template>
  <div id="app">
    <button type="button" class="btn" @click="showModal">
      Open Modal!
    </button>

    <modal v-show="isModalVisible" @close="closeModal" />

    <ul>
      <li v-for="result in results">
        <a :href="result.url">{{ result.name }}</a
        ><br />
        <small>{{ result.snippet }}</small>
      </li>
    </ul>
  </div>
</template>

<script>
import modal from './components/modal.vue';

export default {
  name: 'SdC',
  components: {
    modal,
  },

  methods: {
    showModal() {
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
  },

  data() {
    return {
      isModalVisible: false,
      results: [
        // Sample for testing
        {
          id: 0,
          url: 'https://www.univ-grenoble-alpes.fr/',
          name: 'Université Grenoble Alpes',
          snippet:
            'Les cookies Google Analytics : Ce site utilise des cookies de Google Analytics, ces cookies nous aident à identifier le contenu qui vous intéresse le plus ainsi ...',
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 2,
          url: 'http://www.museedegrenoble.fr/',
          name: 'Musée de Grenoble',
          snippet: "Créé en 1798, le musée de Grenoble n'a cessé de s'enrichir pour présenter aujourd'hui aux visiteurs plus de 900 œuvres. Un ensemble unique, tant par ses ...",
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 3,
          url: 'https://www.bm-grenoble.fr/',
          name: 'Bibliothèque municipale de Grenoble - Livres, Musique ...',
          snippet: 'Bibliothèque municipale de Grenoble - livres, musique, cinéma, numérique pour tous. Informations pratiques et agenda des événements. Catalogue en ligne et ...',
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 6,
          url: 'http://www.ac-grenoble.fr/',
          name: 'Académie de Grenoble',
          snippet:
            'Gestion des cookies. Ce site utilise des cookies. Vous avez la possibilité de déterminer les cookies que vous autorisez ou refusez. Préférence pour tous les ...',
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 8,
          url: 'https://www.chu-grenoble.fr/',
          name: 'CHU Grenoble Alpes',
          snippet: 'CHU de Grenoble - CHU des Alpes. Visites aux patients hospitalisés · Tous les événements rss. Rechercher un service. Sélectionner une catégorie, Urgences ...',
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 9,
          url: 'http://www.isere.gouv.fr/',
          name: "Accueil - Les services de l'État en Isère",
          snippet: 'Essais de sirènes dans les communes de Pont-de-Chéruy et Grenoble le mercredi 8 juillet 2020. 06/07/2020. Communiqué du 6 juillet 2020 ...',
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 12,
          url: 'https://www.grenoble-inp.fr/',
          name: 'Grenoble INP',
          snippet:
            "6 écoles d'ingénieurs et des formations de docteurs orientés vers les grands défis de notre société : l'énergie, l'environnement, la société du numérique et la ...",
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 16,
          url: 'http://www.sciencespo-grenoble.fr/',
          name: 'Sciences Po Grenoble | Une grande école de sciences ...',
          snippet: "Une grande école de sciences sociales au coeur d'une université de rang mondial. Toggle navigation. MENU. SCIENCES PO GRENOBLE · FORMATION ...",
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 17,
          url: 'https://www.grenoble.cci.fr/',
          name: 'CCI Grenoble - Entreprises et économie de la région ...',
          snippet: "Le portail de la Chambre de commerce et d'industrie de Grenoble, Isère 38. Découvrez nos rubriques consacrées à la création de l'entreprise, au ...",
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 19,
          url: 'https://www.ghm-grenoble.fr/',
          name: 'Accueil GHM de Grenoble',
          snippet:
            "Le Groupe Hospitalier Mutualiste de Grenoble est un Établissement de Santé Privé d'Intérêt Collectif (ESPIC) à but non lucratif participant au service public ...",
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 20,
          url: 'https://www.grenoble-patrimoine.fr/',
          name: 'Grenoble Patrimoine: Accueil',
          snippet: "Grenoble de 1925 à 1968. La ville laboratoire. L'explosion démographique exige désormais de penser un urbanisme planifié à plus grande échelle.",
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 25,
          url: 'https://ml-grenoble.org/',
          name: 'Mission Locale Grenoble',
          snippet: 'La Mission Locale de Grenoble accueille, informe, oriente et accompagne tous les jeunes de 16 à 25 ans, notamment ceux sortis du système scolaire, en ...',
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 28,
          url: 'https://musees.isere.fr/musee/musee-dauphinois',
          name: 'Musée dauphinois',
          snippet: null,
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 29,
          url: 'http://grenoble.tribunal-administratif.fr/',
          name: 'Tribunal administratif de Grenoble : Accueil',
          snippet:
            "Bienvenue sur le site du tribunal administratif de Grenoble. Le tribunal administratif est compétent pour juger la grande majorité des litiges résultant de l'activité ...",
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 30,
          url: 'http://www.meteofrance.com/previsions-meteo-france/grenoble/38000',
          name: 'METEO GRENOBLE par Météo-France - Prévisions Météo ...',
          snippet: 'METEO FRANCE - Retrouvez les prévisions METEO GRENOBLE de Météo-France à 15 jours, les prévisions météos locales gratuites, complètes et détaillées à ...',
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 35,
          url: 'http://www.onisep.fr/Pres-de-chez-vous/Auvergne-Rhone-Alpes/Grenoble',
          name: 'ONISEP Grenoble - Grenoble - Onisep',
          snippet:
            "Éditeur public, l'Onisep produit et diffuse toute l'information sur les formations et les métiers. Il propose aussi des nouveaux services aux élèves, aux parents et ...",
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 46,
          url: 'https://www.isere-tourisme.com/selection/destination-grenoble-agglo',
          name: 'Destination Grenoble Agglo | Isère Tourisme',
          snippet:
            "Grenoble, c'est le coeur des Alpes, une ville sertie de montagnes. Ici, goûtez au plaisir de flâner sur les pas de Stendhal – le plus célèbre des Grenoblois - au ...",
          status: 'trusted',
          ring: 'default',
        },
        {
          id: 49,
          url: 'https://www.crous-grenoble.fr/',
          name: 'Le Crous Grenoble Alpes - Au cœur de la vie étudiante !',
          snippet: 'Le Crous Grenoble Alpes améliore les conditions de vie étudiantes : bourses, logement, restauration, culture, aides sociales et jobs étudiants !',
          status: 'trusted',
          ring: 'default',
        },
      ],
    };
  },
};
</script>

<style>
/*@tailwind base;
@tailwind components;
@tailwind utilities;
*/
</style>
