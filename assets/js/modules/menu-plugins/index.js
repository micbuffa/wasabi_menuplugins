//lien: https://jsbin.com/zelepix/edit?html,js,console,output

// 1) Gérer suppresion de l'audioNode dans le tableau et actualiser connexion
// 2) Bug visuel du bouton de suppresion de plugin à corriger
// 3) Virer tous plugins n'ayant aucun input (DrumMachine, Synthe)
// 3) Gérer déplacement pédale (gérer le déplacement aussi dans le tableau d'audioNode et actualiser les connexions)
// 4) Faire précédent dans le menu des choix des plugins
// 5) Faire du rack une wap

customElements.define(`menu-plugins`, class extends HTMLElement {

    // test
    constructor() {
        super();
        this.parent = this;
        this.root = this.attachShadow({ mode: `open` });
        this.params = {
            url: (this.getAttribute(`url`) || `urlTest`)
        };
        this.audioSrc = `./assets/audio/BasketCaseGreendayriffDI.mp3`;
        this.pathJSON = `https://mainline.i3s.unice.fr/WebAudioPluginBank/repository.json`;
        this.pluginsJSON = {};
        (async () => this.buildMenuPlugins(await this.loadJSONPlugins()))();
    }

    static get observedAttributes() { return ['url']; }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`attributeChangedCallback`);
        console.log(name, oldValue, newValue);
    }

    connectedCallback() {
        // css+html
        this.css = `
        *{
            border:0px;
            margin:0px;
            padding: 0px;
        
            border-collapse: collapse;
            box-sizing: border-box;
            font-family: helvetica;
        }
        *:focus {
            outline: 0;
        }

        /* ***** ***** */
        body{
            background: #eee;
        }

        #titleSection{
            color:rgb(255, 255, 255);
        }

        .hidden{
            display: none;
        }


        .optionMenu{
            background: #333;
            display: flex;
            flex-direction: column;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
            padding: 5px;
            margin: 2px;
            height:260px;
            position: relative;
            justify-content: flex-start;
        }
        .optionMenu div{
            display:flex;
            flex-direction:column;
            flex: 1;
        }
        .optionMenu span{
            color:#fff;

            padding:0px 3px;
        }
        .optionMenu span:nth-child(1){
            color:#fff;
            font-weight:bold;
            font-size:14px;
        }
        .optionMenu span:nth-child(2){
            color:#009688;
            font-size:10px;
        }
        .deleteButton:hover{
            background: #000;
            color: #eee;
        }
        .deleteButton{
            background: transparent;
            color: #eee;
            font-size: 14px;
            padding: 2px 4px;
            border-radius: 100%;
            align-self: flex-start;
            cursor: pointer;
            position: absolute;
            top: 4px;
            right: 4px;
        }

        .leftButton{
            font-size: 20px;
            left:30px;
            top:6px;
            background: rgb(220,220,220);
            color: black;
            border-radius: 30px;
            width: 30px;
            height: 30px;
        }

        .rightButton{
            font-size: 20px;
            left:130px;
            top:6px;
            background: rgb(220,220,220);
            color: black;
            border-radius: 30px;
            width: 30px;
            height: 30px;
        }

        #div_menu{
            background: #333;
            box-shadow:0px 3px 4px #111;

            width:100%;
            height:100vh;

            overflow:hidden;
            display: flex;
            flex-direction: column;
        }

        #div_menu ul{
            list-style:none;
            display:flex;
            flex-direction:row;
            overflow-x: scroll;
            overflow-y: hidden;
        }
        #ampSimsList{
            justify-content: center;
        }
        
        #pluginsList{
            height:500px;
            width:calc(100% - 500px);
            z-index:1;
            transition:1s;
        }
        #pluginsList li img{

            height:200px;
        }
        #div_menu ul li{
            margin:5px;
        }
        #div_menu ul li img{
            box-shadow:0px 3px 4px #111;
            
            object-fit:cover;
            border:3px dashed transparent;
            cursor:pointer;
            vertical-align:top;
        }

        #div_menu select{
            background: #222;
            color:#eee;

            font-size:20px;
        }

        #div_menu ul li div.optionMenu[dropActive=true]{
            box-shadow:0px 3px 10px #000;
            background:lightgreen !important;
        }

        #addAmp{
            font-size: 100px;
            width: 300px;
            height: 140px;
            border: 3px dashed white;
            border-radius: 10px;
            color: white;
            text-align: center;
            line-height: 120px;
            margin-left: 30px;
        }

        #Amp{
            font-size:40px;
            width:300px;
            height:140px;
            border: 3px solid white;
            border-radius: 10px;
            color:white;
            text-align: center;
            margin-left: 30px;
        }


        #Plugin, #Plugin2{
            font-size:40px;
            width:150px;
            height:200px;
            border: 3px solid white;
            border-radius: 10px;
            color:white;
            text-align: center;
            overflow: scroll;
        }

        #Plugin3{
            font-size:20px;
            width:150px;
            height:200px;
            border: 3px solid white;
            border-radius: 10px;
            color:white;
            text-align: center;
            margin-left: 30px;
        }
        .family{
            font-size:12px;
            width: 144px;
            height: 16px;
            border: 1px solid white;
        }

        .family:hover{
            color:black;
            background-color:white;
        }

        #nav_plugins{
            flex: 1;

            display:flex;
            flex-direction:row;
            flex-wrap:wrap;
            align-content: flex-start;
            overflow-y: scroll;
            overflow-x: hidden;
        }
        #nav_plugins img{
            height:100px;
            margin:3px;
        }

        #div_plugins{
            background: #000;
            border:1px solid #555;
            display:flex;
            flex-direction:column;
            width:calc(500px - 2px);
            height:500px;
            position:relative;
            transition:0.7s;
            position:absolute;
            top:0px;
            right:0px;
            z-index:2;
        }

        .hideMenu{
            transform: translate(498px);
        }
        #div_plugins #bt_hideMenu{background: #000;
            border-width: 1px 0px 1px 1px;
            border-color: #555;
            border-style: solid;
            color: #555;
            position:absolute;
            top:-1px;
            left:-49px;
            width:49px;
            height:49px;
            cursor:pointer;
        }
        #div_plugins select{
            -webkit-appearance:none; /* remove the strong OSX influence from Webkit */
            box-shadow: 2px 3px 4px #000;
            color:#bbb;
            padding:5px 20px;
            margin:10px 0;
            font-size:16px;
            align-self:flex-end;
            text-align:center;
            cursor:pointer;
        }

        #section_plugins{
            display:flex;
            flex-direction:row;
            position:relative;
        }
        #section_plugins #pluginsList,
        #section_plugins #nav_plugins{
            background-color: #000000;
            background-image: url("https://www.transparenttextures.com/patterns/grilled-noise.png");
            /* This is mostly intended for prototyping; please download the pattern and re-host for production environments. Thank you! */
            padding:10px;
        }
        audio{
            width:calc(100% - 40px);
            margin:20px;
            border-radius:0px;
        }
        .new_plugin {
            align-self: center;
            margin: 10px;
        }
        `;
        this.html = `
        <div id='div_menu'>
            <audio src="${this.audioSrc}" id="soundSample" controls loop></audio>

            <section id='section_plugins'>
                <ul id='pluginsList'></ul>
                <div id='div_plugins'>
                    <button id='bt_hideMenu'>></button>
                    <select id='select_plugins'>
                    <option selected disabled>Choose plugin category</option>
                    </select>
                    <nav id='nav_plugins'></nav>
                </div>
            </section>
            
            <ul id='ampSimsList'></ul>
        </div>
        `;
        this.root.innerHTML = `<style>${this.css}</style><div id='wrapper'>${this.html}</div>`;

        //Audio context
        this.ctx = new AudioContext();
        this.player = this.shadowRoot.querySelector("#soundSample");
        this.ctx.resume().then(() => {
            this.mediaSource = this.ctx.createMediaElementSource(this.player);
        })

        this.audioPluginConnexion = [];

        //Création des éléments au chargement du site
        this.categoryPlugins;
        this.ampList;

        this.choiceCategoryPlugin = this.shadowRoot.querySelector("#choiceCategoryPlugin")
        this.div_menu = this.shadowRoot.querySelector(`#div_menu`);
        this.pluginsList = this.shadowRoot.querySelector(`#pluginsList`);
        this.ampSimsList = this.shadowRoot.querySelector(`#ampSimsList`);
        this.select_plugins = this.shadowRoot.querySelector("#select_plugins");
        this.nav_plugins = this.shadowRoot.querySelector(`#nav_plugins`);
        this.div_plugins = this.shadowRoot.querySelector(`#div_plugins`);
        this.bt_hideMenu = this.shadowRoot.querySelector(`#bt_hideMenu`);
        this.section_plugins = this.shadowRoot.querySelector(`#section_plugins`);
        this.familyChoosen = [];
        this.ampChoosen = [];

        this.deleteButton;

        this.choiceFamily;
        this.choiceAmp;
        this.pluginListJson;
        this.instanciation = 0;

        this.select_plugins.onchange = (e) => this.selectCategory(e);
        this.bt_hideMenu.onclick = () => this.hideMenu();
    }

    hideMenu() {
        if (this.div_plugins.classList.contains(`hideMenu`)) {
            this.div_plugins.classList.remove(`hideMenu`);
            this.bt_hideMenu.innerHTML = `>`;
            this.pluginsList.style.width = `calc(100% - 500px)`;
        } else {
            this.div_plugins.classList.add(`hideMenu`);
            this.bt_hideMenu.innerHTML = `<`;
            this.pluginsList.style.width = `100%`;
        }
    }

    /*      CHARGEMENT DU REPO DE PLUGINS A L'ININTIALISATION DE LA PAGE    */
    //Chargement des scripts des plugins
    loadJSONPlugins() {
        return new Promise((resolve, reject) => {
            let _index = 0;
            let _pluginsCategory = [];
            let _pluginsJSON = [];
            let _plugins = []
            let _indexPlugs = 0;
            this.fetchJSON(this.pathJSON).then((_d) => {
                for (const p in _d.plugs) {
                    this.fetchJSON(`${_d.plugs[p]}/main.json`).then((_p) => {
                        _plugins.push(_p);
                        if (!_pluginsCategory.includes(_p.category)) {
                            _pluginsCategory.push(_p.category);

                            _pluginsJSON[_p.category] = [];
                            this.pluginListJson = _plugins;
                        }
                        _p.url = _d.plugs[p];
                        _pluginsJSON[_p.category].push(_p);
                        _indexPlugs++;
                        if ((_index == Object.keys(_d.plugs).length) && (_index == _indexPlugs)) resolve(_pluginsJSON);
                    })
                    _index++;
                }
            });
        });
    }

    fetchJSON(_url) {
        return new Promise((resolve, reject) => {
            fetch(_url)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                    return response.json();
                })
                .then(_json => {
                    resolve(_json);
                })
                .catch(error => {
                    throw new Error(`HTTP error ${error}`);
                })
        });
    }

    buildMenuPlugins(_pluginsJSON) {
        this.pluginsJSON = _pluginsJSON;
        let _elements = ``;
        Object.keys(_pluginsJSON).map(
            (elem, index) => {
                if (elem !== `synth` && elem !== `Mixing`) _elements += `<option>${elem}</option>`;
            }
        )
        this.select_plugins.insertAdjacentHTML(`beforeEnd`, _elements);
    }

    selectCategory(e) {
        let _categoryPluginJSON = this.pluginsJSON[e.target.value];
        let _elements = ``;
        Object.keys(_categoryPluginJSON).map(
            (elem, index) => {
                _elements += `<img id='img_${elem}' src='${_categoryPluginJSON[elem].url}/${_categoryPluginJSON[elem].thumbnail.replace(`./`, ``)}' title='${_categoryPluginJSON[elem].name}' alt='${_categoryPluginJSON[elem].name}' />`;
            }
        )
        this.nav_plugins.innerHTML = _elements;
        let _plugin;
        this.nav_plugins.querySelectorAll(`img`).forEach(img => img.onclick = () => {
            //loadPlugin
            _plugin = _categoryPluginJSON[parseInt(img.id.replace(`img_`, ``))];
            this.loadPluginFromWasabi((_plugin.vendor + _plugin.name), _plugin.url, _plugin.category, _plugin.name,img.src);
        });
    }

    /*      GESTION DU MENU DU CHOIX DE PLUGIN ET DE LA CREATION DU PLUGIN   */
    //Supprimer un plugin chargé
    deletePlugin(e) {
        e.currentTarget.parentNode.parentNode.remove();
    }

    //Requete et chargement du plugin auprès du repo
    loadPluginFromWasabi(className, baseURL, category, _pluginName,_imgSRC) {
        let scriptURL = baseURL + "/main.js";

        if (this.scriptExists(scriptURL)) {
            //script exists
            console.log("SCRIPT EXISTS WE JUST INSTANCIATE THE PLUGIN");
            this.buildPlugin(className, baseURL, category, _pluginName,_imgSRC);
            return;
        }

        console.log("SCRIPT DOES NOT EXIST, ADD A SCRIPT SRC=, THEN INSTANCIATE PLUGIN")

        // if we are here this means that the script is not present. Add it to the document
        let script = document.createElement("script");
        script.src = scriptURL;

        let parent = this;
        script.onload = function () {
            // Once the script has been loaded instanciate the plugin
            parent.buildPlugin(className, baseURL, category, _pluginName,_imgSRC);
        }

        // will be executed before the onload above...
        document.head.appendChild(script);
    }

    scriptExists(url) {
        return document.querySelectorAll(`script[src="${url}"]`).length > 0;
    }

    buildPlugin(className, baseURL, category, _pluginName,_imgSRC) {
        var plugin = new window[className](this.ctx, baseURL);
        let parent = this;

        plugin.load().then((node) => {
            // loads and initialize the audio processor part
            // Then use the factory to create the HTML custom elem that holds the GUI
            // The loadGUI method takes care of inserting the link rel=import part,
            // not doing it twice, and associate the node with its GUI.
            if (category == "AmpSim") node.type = "amp";
            else node.type = "plugin";

            this.audioConnexion(node);
            plugin.loadGui().then((elem) => {
                console.log("ADDING PLUGIN");
                // show the GUI of the plugn, the audio part is ready to be used
                parent.addDivWithPlugin(elem, category, _pluginName,_imgSRC);
            });
        });

    }

    audioConnexion(node) {
        let lastConnexion;
        let lastIndex = this.audioPluginConnexion.length - 1;
        if (node.type != "amp") {
            if (this.audioPluginConnexion.length > 0 && this.audioPluginConnexion[lastIndex].type != "amp") this.audioPluginConnexion.push(node);
            else this.audioPluginConnexion.splice(lastIndex - 2, 0, node);
        }
        //L'audioNode de l'ampli est forcément dernier s'il est invoqué
        else this.audioPluginConnexion.push(node);

        this.mediaSource.connect(this.audioPluginConnexion[0]);
        if (this.audioPluginConnexion.length > 1) {
            for (let i = 0; i < this.audioPluginConnexion.length - 1; i++) {
                console.log("plug1+2: ", this.audioPluginConnexion[i], this.audioPluginConnexion[i + 1]);
                this.audioPluginConnexion[i].connect(this.audioPluginConnexion[i + 1]);
                lastConnexion = this.audioPluginConnexion[i + 1];
            }
        } else if (this.audioPluginConnexion.length == 1) lastConnexion = this.audioPluginConnexion[0];
        console.log(this.audioPluginConnexion);
        console.log(lastConnexion);
        lastConnexion.connect(this.ctx.destination);
    }

    addDivWithPlugin(elem, category, _pluginName,_imgSRC) {
        elem.className = 'new_plugin';

        let mainDiv = document.createElement("div");
        mainDiv.id = elem.localName + "_" + this.instanciation;
        mainDiv.className = `divMain`;
        mainDiv.setAttribute(`data-src`, _imgSRC);

        let deleteButton = document.createElement("button");
        deleteButton.className = "deleteButton";
        deleteButton.id = "delete_" + elem.localName + "_" + this.instanciation;
        deleteButton.innerText = "X";

        let optionPlugin = document.createElement("div");
        optionPlugin.id = "optionMenu_" + elem.localName + this.instanciation;
        optionPlugin.className = "optionMenu";_imgSRC

        let spanPlugin = document.createElement("span");
        spanPlugin.innerText = _pluginName;
        let spanCategory = document.createElement("span");
        spanCategory.innerText = category;

        let divSpan = document.createElement("div");
        divSpan.append(spanPlugin);
        divSpan.append(spanCategory);
        divSpan.append(elem);
        optionPlugin.append(divSpan);
        optionPlugin.append(deleteButton);
        mainDiv.append(optionPlugin);

        if (category == `AmpSim`) {
            // Supprime tous les enfant d'un élément
            var element = this.ampSimsList;
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            // ensuite, on ajoute le nouveau ampsim
            this.ampSimsList.append(mainDiv);
        } else {
            let _order = this.pluginsList.querySelectorAll(`li`).length;
            mainDiv.setAttribute(`draggable`, true);
            let liPlugin = document.createElement("li");
            liPlugin.setAttribute(`data-order`, _order);
            liPlugin.style = `order:${_order}`;
            liPlugin.append(mainDiv);

            this.pluginsList.insertAdjacentElement(`beforeEnd`, liPlugin);

            liPlugin.ondrop = (e) => this.drop(e);
            liPlugin.ondragenter = (e) => this.enterDrop(e);
            liPlugin.ondragover = (e) => this.overDrag(e);
            liPlugin.ondragend = (e) => this.endDrag(e);
            liPlugin.ondragleave = (e) => this.leaveDrag(e);
            mainDiv.ondragstart = (e) => this.startDrag(e);

            // resize plugins
            let w = elem.offsetWidth;
            let h = elem.offsetHeight;
            let scale = 200 / h;

            elem.style.transform = "scale(" + scale + "," + scale + ")";
            elem.style.transformOrigin = "50% 0%";
            optionPlugin.style.width = `${(w + 40) * scale}px`;
        }

        this.deleteButton = this.root.querySelector("#delete_" + elem.localName + "_" + this.instanciation).addEventListener("click", (e) => this.deletePlugin(e));
        if (category != `AmpSim`) this.instanciation++;
    }

    // DRAG & DROP POUR PERMETTRE DE SWITCHER ENTRE LES PLUGINS
    startDrag(ev) {
        console.log('drag =>', ev.target.id);
        ev.dataTransfer.setData(`text/plain`, ev.target.id);

        var dragImg = new Image(); // Il est conseillé de précharger l'image, sinon elle risque de ne pas s'afficher pendant le déplacement
        dragImg.src = ev.target.getAttribute(`data-src`);
        ev.dataTransfer.setDragImage(dragImg, 40, 40);
    }

    overDrag(ev) {
        ev.preventDefault();
        if (ev.target.classList.contains(`optionMenu`)) ev.target.setAttribute(`dropActive`, true);
    }

    leaveDrag(ev) {
        ev.target.removeAttribute(`dropActive`);
    }

    endDrag(ev){
    }

    enterDrop(ev) {
        //if (ev.target.classList.contains(`optionMenu`)) ev.target.setAttribute(`dropActive`, true);
    }

    drop(ev) {
        let _order_from = 0;
        let _order_to = 0;
        // dépôt de l'élément
        ev.preventDefault();
        //ev.target.removeAttribute(`dropActive`);

        var src_from = this.shadowRoot.querySelector(`#${ev.dataTransfer.getData(`text/plain`)}`).parentNode;
        console.log(`src_parent`, src_from); // li > wasabi-pingpongdelay_1
        console.log('src_element', src_from.firstElementChild); // wasabi-pingpongdelay_1
        _order_from = (src_from.getAttribute(`data-order`));

        var src_destination = ev.currentTarget;
        console.log('src_currentTarget_parent', src_destination); // li > faust-zitarev2_0
        console.log('src_currentTarget', src_destination.firstElementChild); // faust-zitarev2_0
        _order_to = (src_destination.getAttribute(`data-order`));



        /*
        // Uncaught TypeError: Cannot redefine property: src
        // replacedNode = parentNode.replaceChild(newChild, oldChild);
        ev.currentTarget.replaceChild(src, tgt);

        var element = src_from;
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        src_from.appendChild(tgt);
        */

        // solution alternative CSS: switch order
        src_from.style = `order:${_order_to}`;
        src_from.setAttribute(`data-order`, _order_to);
        src_destination.style = `order:${_order_from}`;
        src_destination.setAttribute(`data-order`, _order_from);
    }
})