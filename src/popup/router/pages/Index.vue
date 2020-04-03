<template>
  <div style="width:100%">
    <img class="logo" style="float:left;margin-top:40px;" src="/assets/icons/sdc-48.png" /><br /><br />
    <div id="centered" style="margin: auto; ">
      L’association Villes Internet et son partenaire la Banque Française Mutualiste mettent à la disposition des acteurs publics la base de 35 000 « Sources de Confiance » : sites
      publics nationaux et locaux, institutionnels et universitaires.
    </div>

    <div class="footer">
      <img style="width:24px" src="/assets/icons/villes-internet-57x57.ico" /> <a href="https://www.bfm.fr"><img style="width:24px" src="/assets/icons/bfm-icon.ico"/></a> Un outil
      de Villes Internet avec le concours de la Banque Française Mutualiste
    </div>

    <!-- <ul class="tab-list">
            <li class="tab-item">This is</li>
            <li class="tab-item">where the tabs</li>
            <li class="tab-item">will come</li>
        </ul> -->
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
};
</script>

<style lang="scss">
* {
  box-sizing: border-box;
}

body {
  min-width: 300px;
  font-family: sans-serif;
  padding: 1em;
}

logo {
  height: 48px;
}

.tab-list {
  list-style: none;
  margin: 0 0 1em 0;
  padding: 0;
}

.tab-item {
  padding: 0.6em;
  border-bottom: 1px dashed #eee;
}

.footer {
  margin-top: 1em;
  padding-top: 0.5em;
  border-top: 1px inset #000;
}

button {
  border-radius: 2px;
  background: dodgerblue;
  color: white;
  font-weight: bold;
  text-align: center;
  padding: 0.6em 0.8em;
  border: 0;
  box-shadow: 0 1px 2px gray;
}
</style>
