customElements.define(`menu-plugins`, class extends HTMLElement {

    // test
    constructor() {
        super();
        this.parent = this;
        this.root = this.attachShadow({ mode: `open` });
        this.params = {
            url: (this.getAttribute(`url`) || `urlTest`)
        };
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
            flex-direction: row;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
            padding: 5px;
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
        }


        .invokedPlugin{
            height: 200px;
            margin: 8px;
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

        }
        #div_menu ul{
            list-style:none;
            display:flex;
            flex-direction:row;
            overflow:scroll;
        }
        #ampSimsList{
            height:230px;
        }
        
        #pluginsList{
            height:500px;
            flex-wrap:wrap;
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

        #div_menu ul li img[dropActive=true]{
            box-shadow:0px 3px 10px #000;
            border:3px dashed lightgreen;
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
            border:1px solid #555;
            display:flex;
            flex-direction:column;
            width:40%;
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
        }
        #section_plugins #pluginsList,
        #section_plugins #nav_plugins{
            background-color: #000000;
            background-image: url("https://www.transparenttextures.com/patterns/grilled-noise.png");
            /* This is mostly intended for prototyping; please download the pattern and re-host for production environments. Thank you! */
            border:1px solid #555;
            padding:10px;
        }
        #section_plugins #pluginsList{
            flex:1;
        }
        audio{
            width:calc(100% - 40px);
            margin:20px;
            border-radius:0px;
        }
        `;
        this.html = `
        <div id='div_menu'>
            <audio src="./assets/audio/BasketCaseGreendayriffDI.mp3" id="soundSample" controls loop></audio>

            <section id='section_plugins'>
                <ul id='pluginsList'></ul>
                <div id='div_plugins'>
                    <select id='select_plugins'>
                    <option selected disabled>Choose plugin category</option>
                    </select>
                    <nav id='nav_plugins'></nav>
                </div>
            </section>
            
            
            <ul id='ampSimsList'><div id="addAmp">+</div></ul>
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
        this.addAmp = this.shadowRoot.querySelector("#addAmp");
        this.ampSimsList = this.shadowRoot.querySelector(`#ampSimsList`);
        this.select_plugins = this.shadowRoot.querySelector("#select_plugins");
        this.nav_plugins = this.shadowRoot.querySelector(`#nav_plugins`);

        this.familyChoosen = [];
        this.ampChoosen = [];

        this.deleteButton;

        this.choiceFamily;
        this.choiceAmp;
        this.pluginListJson;
        this.instanciation = 0;

        this.addAmp.addEventListener("click", (e) => this.chooseAmp(e));
        this.select_plugins.onchange = (e) => this.selectCategory(e);



        //Chargement des plugins depuis le repo et classement par famille
        let _amp = []
        let _pluginsCategory = [];
        let _index, _count;
        _index = _count = 0;
        let _li;
        this.fetchJSON(this.pathJSON).then((_d) => {
            for (const p in _d.plugs) {
                this.fetchJSON(`${_d.plugs[p]}/main.json`).then((_p) => {
                    _count++;
                    let option = document.createElement("option");
                    if (_p.category != "AmpSim" && !_pluginsCategory.includes(_p.category)) {
                        _pluginsCategory.push(_p.category);
                        option.text = _p.category;
                    }
                    if (_p.category == "AmpSim") {
                        //this.ampSimsList.insertAdjacentElement(`beforeEnd`, this.createItem(_count, _d, _p, p));
                        _amp.push(_p.name);
                    }
                    else {
                        _p.url = _d.plugs[p];
                        //this.pluginsList.insertAdjacentElement(`beforeEnd`, this.createItem(_count, _d, _p, p));
                    }
                });
                //if (_index == Object.keys(_d.plugs).length-1)
                _index++;
            }
            this.categoryPlugins = _pluginsCategory;
            this.ampList = _amp;
        })

    }
    //lien: https://jsbin.com/zelepix/edit?html,js,console,output

    // 1) Gérer suppresion de l'audioNode dans le tableau et actualiser connexion
    // 2) Bug visuel du bouton de suppresion de plugin à corriger
    // 3) Virer tous plugins n'ayant aucun input (DrumMachine, Synthe)
    // 3) Gérer déplacement pédale (gérer le déplacement aussi dans le tableau d'audioNode et actualiser les connexions)
    // 4) Faire précédent dans le menu des choix des plugins
    // 5) Faire du rack une wap


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
                if (elem !== `synth` && elem !== `AmpSim`) _elements += `<option>${elem}</option>`;
            }
        )
        this.select_plugins.insertAdjacentHTML(`beforeEnd`, _elements);
    }

    selectCategory(e) {
        let _categoryPluginJSON = this.pluginsJSON[e.target.value];
        let _elements = ``;
        Object.keys(_categoryPluginJSON).map(
            (elem, index) => {
                console.log(elem, _categoryPluginJSON[elem]);
                _elements += `<img id='img_${elem}' src='${_categoryPluginJSON[elem].url}/${_categoryPluginJSON[elem].thumbnail.replace(`./`, ``)}' title='${_categoryPluginJSON[elem].name}' alt='${_categoryPluginJSON[elem].name}' />`;
            }
        )
        this.nav_plugins.innerHTML = _elements;
        let className;
        let _plugin;
        this.nav_plugins.querySelectorAll(`img`).forEach(img => img.onclick = () => {
            //loadPlugin
            _plugin = _categoryPluginJSON[parseInt(img.id.replace(`img_`, ``))];
            this.loadPluginFromWasabi((_plugin.vendor + _plugin.name), _plugin.url, _plugin.category,_plugin.name);
        });
    }

    /*      GESTION DU MENU DU CHOIX DE PLUGIN ET DE LA CREATION DU PLUGIN   */

    //Après avoir choisi l'ampli dans la liste de selection, charge l'ampli
    chooseAmp(e) {
        e.currentTarget.remove();
        let amp = document.createElement("div");
        amp.id = "Amp";
        this.ampSimsList.append(amp);
        for (let i = 0; i < this.ampList.length; i++) {
            let ampListChoose = document.createElement("div");
            ampListChoose.className = "ampListChoose";
            ampListChoose.id = this.ampList[i];
            ampListChoose.innerText = this.ampList[i];
            amp.append(ampListChoose);

            this.choiceAmp = this.shadowRoot.querySelectorAll(".ampListChoose");
            this.choiceAmp[i].addEventListener("click", (e) => this.loadAmp(e));
        }
    }


    loadAmp(e) {
        for (let i = 0; i < this.pluginListJson.length; i++) {
            if (e.currentTarget.innerText == this.pluginListJson[i].name) {
                let className = this.pluginListJson[i].vendor + this.pluginListJson[i].name;
                this.loadPluginFromWasabi(className, this.pluginListJson[i].url, this.pluginListJson[i].category);
            }
        }
    }

    deleteAmp(e) {
        e.currentTarget.parentNode.parentNode.remove();
        let addAmp = document.createElement("div");
        addAmp.id = "addAmp";
        addAmp.innerText = "+";
        this.ampSimsList.append(addAmp);
        this.addAmp = this.shadowRoot.querySelector("#addAmp");
        this.addAmp.addEventListener("click", (e) => this.chooseAmp(e));
    }

    //Supprimer un plugin chargé
    deletePlugin(e) {
        e.currentTarget.parentNode.parentNode.remove();
    }

    //Requete et chargement du plugin auprès du repo
    loadPluginFromWasabi(className, baseURL, category,_pluginName) {
        let scriptURL = baseURL + "/main.js";

        if (this.scriptExists(scriptURL)) {
            //script exists
            console.log("SCRIPT EXISTS WE JUST INSTANCIATE THE PLUGIN");
            this.buildPlugin(className, baseURL, category,_pluginName);
            return;
        }

        console.log("SCRIPT DOES NOT EXIST, ADD A SCRIPT SRC=, THEN INSTANCIATE PLUGIN")

        // if we are here this means that the script is not present. Add it to the document
        let script = document.createElement("script");
        script.src = scriptURL;

        let parent = this;
        script.onload = function () {
            // Once the script has been loaded instanciate the plugin
            parent.buildPlugin(className, baseURL, category,_pluginName);
        }

        // will be executed before the onload above...
        document.head.appendChild(script);
    }

    scriptExists(url) {
        return document.querySelectorAll(`script[src="${url}"]`).length > 0;
    }

    buildPlugin(className, baseURL, category,_pluginName) {
        console.log("category",category);
        console.log("className",className);
        var plugin = new window[className](this.ctx, baseURL);
        console.log(plugin);
        let parent = this;

        plugin.load().then((node) => {
            // loads and initialize the audio processor part
            // Then use the factory to create the HTML custom elem that holds the GUI
            // The loadGUI method takes care of inserting the link rel=import part,
            // not doing it twice, and associate the node with its GUI.
            if (category == "AmpSim") {
                node.type = "amp";
            } else {
                node.type = "plugin";
            }
            this.audioConnexion(node);
            plugin.loadGui().then((elem) => {
                console.log("ADDING PLUGIN");
                // show the GUI of the plugn, the audio part is ready to be used
                if (category != "AmpSim") {
                    parent.addDivWithPlugin(elem,category,_pluginName);
                } else {
                    parent.addDivWithAmp(elem);
                }

            });
        });

    }

    audioConnexion(node) {
        let lastConnexion;
        let lastIndex = this.audioPluginConnexion.length - 1;
        if (node.type != "amp") {
            if (this.audioPluginConnexion.length > 0 && this.audioPluginConnexion[lastIndex].type != "amp") {
                this.audioPluginConnexion.push(node);
            } else {
                this.audioPluginConnexion.splice(lastIndex - 2, 0, node);
            }

        }
        else {
            //L'audioNode de l'ampli est forcément dernier s'il est invoqué
            this.audioPluginConnexion.push(node);
        }

        this.mediaSource.connect(this.audioPluginConnexion[0]);
        if (this.audioPluginConnexion.length > 1) {
            for (let i = 0; i < this.audioPluginConnexion.length - 1; i++) {
                console.log("plug1: ", this.audioPluginConnexion[i]);
                console.log("plug2: ", this.audioPluginConnexion[i + 1]);
                this.audioPluginConnexion[i].connect(this.audioPluginConnexion[i + 1]);
                lastConnexion = this.audioPluginConnexion[i + 1];
            }
        } else if (this.audioPluginConnexion.length == 1) {
            lastConnexion = this.audioPluginConnexion[0];
        }
        console.log(this.audioPluginConnexion);
        console.log(lastConnexion);
        lastConnexion.connect(this.ctx.destination);
    }

    addDivWithAmp(elem) {
        this.root.querySelector("#Amp").remove();
        let mainDiv = document.createElement("div");
        mainDiv.id = elem.localName + "_" + this.instanciation;
        mainDiv.className = "invokedAmp";

        let optionAmp = document.createElement("div");
        optionAmp.id = "optionMenuAmp_" + elem.localName + this.instanciation;
        optionAmp.className = "optionMenu";

        let deleteButton = document.createElement("button");
        deleteButton.className = "deleteButton";
        deleteButton.id = "delete_" + elem.localName + "_" + this.instanciation;
        deleteButton.innerText = "X";

        this.ampSimsList.append(mainDiv);
        optionAmp.append(deleteButton);
        mainDiv.append(optionAmp);
        mainDiv.append(elem);


        this.deleteButton = this.root.querySelector("#delete_" + elem.localName + "_" + this.instanciation).addEventListener("click", (e) => this.deleteAmp(e));
    }

    addDivWithPlugin(elem,category,_pluginName) {

        //this.root.querySelector("#Plugin2").remove();
        let mainDiv = document.createElement("div");
        mainDiv.id = elem.localName + "_" + this.instanciation;
        mainDiv.className = "invokedPlugin";

        let optionPlugin = document.createElement("div");
        optionPlugin.id = "optionMenu_" + elem.localName + this.instanciation;
        optionPlugin.className = "optionMenu";


        let divSpan = document.createElement("div");
        let spanPlugin = document.createElement("span");
        let spanCategory = document.createElement("span");

        spanPlugin.innerText = _pluginName;
        spanCategory.innerText = category;

        let deleteButton = document.createElement("button");
        deleteButton.className = "deleteButton";
        deleteButton.id = "delete_" + elem.localName + "_" + this.instanciation;
        deleteButton.innerText = "X";


        this.pluginsList.append(mainDiv);
        divSpan.append(spanPlugin);
        divSpan.append(spanCategory);
        elem.className='new_plugin';
        divSpan.append(elem);
        optionPlugin.append(divSpan);
        optionPlugin.append(deleteButton);
        mainDiv.append(optionPlugin);
        // mainDiv.append(elem);

        this.deleteButton = this.root.querySelector("#delete_" + elem.localName + "_" + this.instanciation).addEventListener("click", (e) => this.deletePlugin(e));

        this.instanciation++;
    }

    /*createItemLI(_name) {
        let _li = document.createElement(`li`);
        _li.id = `li_${_name}`;
        _li.innerText = _name;
        return _li;
    }*/

    /*      GESTION DE L'AFFICHAGE ET DE LA CREATION DES AMPS      */

    createItem(_count, _d, _p, p) {
        let _li, _img;

        _li = document.createElement(`li`);
        if (_p.category != "AmpSim") _li.className = `hidden`;
        _li.id = `li_${_count}`;
        _li.setAttribute(`data-category`, _p.category);

        _img = document.createElement(`img`);
        _img.id = `img_${_count}`;
        _img.title = _p.name;
        _img.setAttribute(`draggable`, true);
        _img.src = `${_d.plugs[p]}/${_p.thumbnail}`;
        _li.insertAdjacentElement(`beforeEnd`, _img);

        _li.ondrop = (e) => this.drop(e);
        _li.ondragover = (e) => this.allowDrop(e);
        _li.ondragleave = (e) => this.leaveDropZone(e);
        _img.ondragstart = (e) => this.drag(e);

        return _li;
    }

    // PERMET DE SWITCHER ENTRE LES PLUGINS
    allowDrop(ev) {
        ev.target.setAttribute(`dropActive`, true);
        ev.preventDefault();
    }

    leaveDropZone(ev) {
        ev.target.removeAttribute(`dropActive`);
    }

    drop(ev) {
        ev.preventDefault();
        ev.target.removeAttribute(`dropActive`);
        var src = this.shadowRoot.querySelector(`#${ev.dataTransfer.getData("src")}`);
        var srcParent = src.parentNode;
        var tgt = ev.currentTarget.firstElementChild;

        ev.currentTarget.replaceChild(src, tgt);
        srcParent.appendChild(tgt);
        console.log('drop =>', ev.currentTarget.id);
    }

    drag(ev) {
        console.log('drag =>', ev.target.id);
        ev.dataTransfer.setData("src", ev.target.id);
    }
})