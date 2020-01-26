<template>
	<div style="width:100%">
		<img class="logo" style="width: 120px;" src="/assets/img/tp-logo.png"><br/><br/>
		<div id="centered" style="margin: 0 auto; ">Merci d'utiliser Territoire Plus, le moteur de recherche de la vie publique</div>

		<div class="footer">
			Un outil de <a href="http://www.villes-internet.net/site/"><img style="width:24px" src="/assets/icons/villes-internet-57x57.ico"> Villes Internet</a>
			rendu possible grâce au concours de 
			<a href="https://www.bfm.fr"><img style="width:24px" src="/assets/icons/bfm-icon.ico"></a> 
			et de 
			<a href="https://www.lillemetropole.fr/"><img style="width:24px" src="/assets/icons/favicon_MEL_3.png"></a>
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
	height: 48px
}

.tab-list {
    list-style: none;
    margin: 0 0 1em 0;
	padding: 0;
}    

.tab-item {
    padding: .6em;
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
    padding: .6em .8em;
    border: 0;
    box-shadow: 0 1px 2px gray;
}

</style>
