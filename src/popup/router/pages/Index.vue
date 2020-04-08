<template>
  <div class="mainmenu" style="width:500px;">
    <img class="logo" style="float:left;margin-top:20px;margin-right:10px;" src="/assets/icons/sdc-48.png" /><br />
    <div id="centered" style="margin: auto; ">
      <b>Sources de confiance</b> est un complément aux moteurs de recherche pour identifier instantanément les sites publics, institutionnels et universitaires.<br /><br />
      En savoir plus : <a class="mainlink" href="http://sources-de-confiance.fr">sources-de-confiance.fr</a>
    </div>

    <div class="footer">
      Une initiative de <a href="http://www.villes-internet.net/site">Villes Internet</a><br />
      avec le soutien de <a href="https://www.bfm.fr">la Banque Française Mutualiste</a>
      <br />
    </div>

    <div>
      <center style="margin-top:10px;">
        <label class="switch" style="align-right;">
          <input type="checkbox" id="extensionswitch" checked />
          <span class="slider round"></span>
        </label>
        <br />
        <span id="switchstatus"></span>
      </center>
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
  max-width: 600px;
  padding: 1em;
  font-family: Montserrat, Arial, sans-serif;
  font-size: 14px;
}

logo {
  height: 48px;
}

.mainmenu a {
  color: #666;
  font-weight: 600;
  text-decoration: none;
}

.mainlink {
  color: #249bee !important;
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
  border-top: 1px solid #ccc;
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

/* The switch - the box around the slider */
.switch {
  margin-top: 5px;
  position: relative;
  display: inline-block;
  width: 30px;
  height: 17px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.2s;
  transition: 0.2s;
}

.slider:before {
  position: absolute;
  content: '';
  height: 13px;
  width: 13px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  -webkit-transition: 0.2s;
  transition: 0.2s;
}

input:checked + .slider {
  background-color: #34a853;
}

input:focus + .slider {
  box-shadow: 0 0 1px #34a853;
}

input:checked + .slider:before {
  -webkit-transform: translateX(13px);
  -ms-transform: translateX(13px);
  transform: translateX(13px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 17px;
}

.slider.round:before {
  border-radius: 50%;
}

#switchstatus {
  color: #999;
}
</style>
