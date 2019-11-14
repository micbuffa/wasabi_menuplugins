customElements.define(`menu-plugins`, class extends HTMLElement {

    constructor() {
        super();
        this.root = this.attachShadow({ mode: `open` });
        this.params = {
            name: (this.getAttribute(`name`) || `plugin`)
        };
        this.instanciation = 0;
        this.audioSrc = `./assets/audio/BasketCaseGreendayriffDI.mp3`;
        this.pathJSON = `https://mainline.i3s.unice.fr/WebAudioPluginBank/repository.json`;
        this.pluginsJSON = {};
        this.dragImg = new Image();
        (async () => this.setOptionsMenuPlugin(await this.loadJSONPlugins()))();
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
        }
        *:focus {
            outline: 0;
        }

        /* ***** ***** */
        body{}

        .divContainer{
            background: #333;
            display: flex;
            flex-direction: column;
            border-radius: 4px;
            padding: 5px;
            margin: 2px;
            height:260px;
            position: relative;
            justify-content: flex-start;
        }
        .divContainer div{
            display:flex;
            flex-direction:column;
            flex: 1;
            align-items: center;
        }
        .divContainer span{
            color:#fff;

            padding:0px 3px;
        }
        .divContainer span:nth-child(1){
            color:#fff;
            font-weight:bold;
            font-size:14px;
        }
        .divContainer span:nth-child(2){
            color:#009688;
            font-size:10px;
            margin-bottom:10px;
        }
        .bt_deletePlugin:hover{
            background: #000;
            color: #eee;
        }
        .bt_deletePlugin{
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
            z-index:1;
        }
        
        #ampSimsList{
            justify-content: center;
        }
        #pluginsList{
            /* height:500px; */
            min-height:294px;
            width:calc(100% - 500px);
            z-index:1;
            transition:1s;
        }
        #pluginsList li{
            display:flex;
            flex-direction:row;
            justify-content:flex-start;
            align-items: center;
            position:relative;
        }
        #pluginsList li div.divDroppable[drop-active=true] {
            border: 2px dashed darkgreen;
            background: lightgreen;
        }
        #pluginsList li div.divDroppable{
            border: 2px dashed #444;
            border-radius: 4px;
            opacity:0;
            transition:0.1s;

            position: absolute;
            top: -20px;
            left: -20px;
            right: -20px;
            bottom: -20px;
            z-index:-1;
        }
        #pluginsList li.showDroppable div.divDroppable{
            opacity:0.3 !important;
            z-index:99 !important;
        }

        #pluginsList li img{
            height:200px;
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
        #div_menu ul li{
            margin:20px;
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

        .hideMenu{
            transform: translate(498px);
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
        this.player = this.shadowRoot.querySelector(`#soundSample`);
        this.ctx.resume().then(() => {
            this.mediaSource = this.ctx.createMediaElementSource(this.player);
        })

        this.audioPluginConnexion = [];

        this.div_menu = this.shadowRoot.querySelector(`#div_menu`);
        this.pluginsList = this.shadowRoot.querySelector(`#pluginsList`);
        this.ampSimsList = this.shadowRoot.querySelector(`#ampSimsList`);
        this.select_plugins = this.shadowRoot.querySelector(`#select_plugins`);
        this.nav_plugins = this.shadowRoot.querySelector(`#nav_plugins`);
        this.div_plugins = this.shadowRoot.querySelector(`#div_plugins`);
        this.bt_hideMenu = this.shadowRoot.querySelector(`#bt_hideMenu`);

        // listeners
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

    setOptionsMenuPlugin(_pluginsJSON) {
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
        this.clearElement(this.nav_plugins);
        let _categoryPluginJSON = this.pluginsJSON[e.target.value];
        let _img = ``;
        Object.keys(_categoryPluginJSON).map(
            (elem, index) => {
                _img = document.createElement(`img`);
                _img.id = `img_${elem}`;
                _img.src = `${_categoryPluginJSON[elem].url}/${_categoryPluginJSON[elem].thumbnail.replace(`./`, ``)}`;
                _img.title = _categoryPluginJSON[elem].name;
                _img.alt = _categoryPluginJSON[elem].name;
                _img.onclick = (e) => this.selectPlugin(e, _categoryPluginJSON[parseInt(e.target.id.replace(`img_`, ``))]);
                this.nav_plugins.insertAdjacentElement(`beforeend`, _img);
            }
        )
    }

    selectPlugin(e, _plugin) {
        this.loadPluginFromWasabi({
            name: _plugin.name,
            category: _plugin.category,
            baseURL: _plugin.url,
            className: (_plugin.vendor + _plugin.name),
            imgSRC: e.target.src
        });
    }

    scriptExists(url) {
        return document.querySelectorAll(`script[src="${url}"]`).length > 0;
    }

    /*      GESTION DU MENU DU CHOIX DE PLUGIN ET DE LA CREATION DU PLUGIN   */
    //Requete et chargement du plugin auprès du repo
    loadPluginFromWasabi(_pluginSettings) {
        let scriptURL = `${_pluginSettings.baseURL}/main.js`;
        if (this.scriptExists(scriptURL)) {
            //script exists
            console.log(`SCRIPT EXISTS WE JUST INSTANCIATE THE PLUGIN`);
            this.buildPlugin(_pluginSettings);
            return;
        }

        console.log(`SCRIPT DOES NOT EXIST, ADD A SCRIPT SRC=, THEN INSTANCIATE PLUGIN`)
        // if we are here this means that the script is not present. Add it to the document
        let script = document.createElement(`script`);
        script.src = scriptURL;
        script.onload = () => {
            // Once the script has been loaded instanciate the plugin
            this.buildPlugin(_pluginSettings);
        }
        // will be executed before the onload above...
        document.head.appendChild(script);
    }

    buildPlugin(_pluginSettings) {
        var plugin = new window[_pluginSettings.className](this.ctx, _pluginSettings.baseURL);
        plugin.load().then((node) => {
            // loads and initialize the audio processor part
            // Then use the factory to create the HTML custom elem that holds the GUI
            // The loadGUI method takes care of inserting the link rel=import part,
            // not doing it twice, and associate the node with its GUI.
            if (_pluginSettings.category == `AmpSim`) node.type = `amp`;
            else node.type = `plugin`;

            // à décommenter
            // this.audioConnexion(node);

            plugin.loadGui().then((elem) => {
                console.log(`ADDING PLUGIN`);
                // show the GUI of the plugn, the audio part is ready to be used
                this.addDivWithPlugin(elem, _pluginSettings);
            });
        });
    }

    audioConnexion(node) {
        let lastConnexion;
        let lastIndex = this.audioPluginConnexion.length - 1;
        if (node.type != `amp`) {
            if (this.audioPluginConnexion.length > 0 && this.audioPluginConnexion[lastIndex].type != `amp`) this.audioPluginConnexion.push(node);
            else this.audioPluginConnexion.splice(lastIndex - 2, 0, node);
        }
        //L'audioNode de l'ampli est forcément dernier s'il est invoqué
        else this.audioPluginConnexion.push(node);

        this.mediaSource.connect(this.audioPluginConnexion[0]);
        if (this.audioPluginConnexion.length > 1) {
            for (let i = 0; i < this.audioPluginConnexion.length - 1; i++) {
                console.log(`plug1+2:`, this.audioPluginConnexion[i], this.audioPluginConnexion[i + 1]);
                this.audioPluginConnexion[i].connect(this.audioPluginConnexion[i + 1]);
                lastConnexion = this.audioPluginConnexion[i + 1];
            }
        } else if (this.audioPluginConnexion.length == 1) lastConnexion = this.audioPluginConnexion[0];
        console.log(this.audioPluginConnexion);
        console.log(lastConnexion);
        lastConnexion.connect(this.ctx.destination);
    }

    addDivWithPlugin(elem, _pluginSettings) {
        this.instanciation++;

        // bt_deletePlugin
        let bt_deletePlugin = document.createElement(`button`);
        bt_deletePlugin.className = `bt_deletePlugin`;
        bt_deletePlugin.innerText = `X`;
        bt_deletePlugin.onclick = (e) => this.deletePlugin(e);

        // sp_categoryPlugin
        let sp_categoryPlugin = document.createElement(`span`);
        sp_categoryPlugin.innerText = _pluginSettings.category;

        // sp_namePlugin
        let sp_namePlugin = document.createElement(`span`);
        sp_namePlugin.innerText = _pluginSettings.name;

        // divContent: sp_namePlugin + sp_categoryPlugin + elem + bt_deletePlugin
        let divContent = document.createElement(`div`);
        divContent.append(sp_namePlugin);
        divContent.append(sp_categoryPlugin);
        divContent.append(elem);
        divContent.append(bt_deletePlugin);

        // divContainer: divContent
        let divContainer = document.createElement(`div`);
        divContainer.className = `divContainer`;
        divContainer.id = `div_${_pluginSettings.name}_${this.instanciation}`;
        divContainer.append(divContent);
        divContainer.setAttribute(`data-src`, _pluginSettings.imgSRC);

        // li > divContainer
        let liPlugin = document.createElement(`li`);
        let divDroppable = document.createElement(`div`);
        divDroppable.classList.add(`divDroppable`);
        liPlugin.append(divDroppable);
        liPlugin.append(divContainer);

        liPlugin.setAttribute(`data-order`, this.instanciation);
        liPlugin.style = `order:${this.instanciation}`;

        // add the plugin in ampSimsList or pluginsList
        if (_pluginSettings.category == `AmpSim`) {
            this.clearElement(this.ampSimsList);
            this.ampSimsList.insertAdjacentElement(`beforeend`, liPlugin);
        } else {
            this.pluginsList.insertAdjacentElement(`beforeend`, liPlugin);
            this._setDragAndDroplistener(liPlugin);
        }

        // resizePlugin
        this.resizePlugin(elem, divContainer);
    }

    resizePlugin(elem, divContainer) {
        let scale = 200 / (elem.offsetHeight);
        elem.style.transformOrigin = `50% 0%`;
        elem.style.transform = `scale(${scale},${scale})`;
        divContainer.style.width = `${((elem.offsetWidth) + 40) * scale}px`;
    }

    deletePlugin(e) {
        e.currentTarget.parentNode.parentNode.parentNode.remove();
    }

    clearElement(element) {
        while (element.firstChild) element.removeChild(element.firstChild);
    }

    getOrderArray() {
        let _tab = [];
        let _nbLI = this.pluginsList.querySelectorAll(`li`).length;
        for (let i = 0; i < _nbLI; i++) {
            this.pluginsList.querySelectorAll(`li`).forEach((_li, _index) => {
                if (_li.style.order == i) _tab.push(parseInt(_li.getAttribute(`data-order`)));
            });
        }
        return _tab;
    }

    showDroppableElements(_visible = true) {
        this.shadowRoot.querySelector(`#pluginsList`).querySelectorAll(`li`).forEach(_li => {
            if (_visible) _li.classList.add(`showDroppable`);
            else _li.classList.remove(`showDroppable`);
        })
    }
    
    // DRAG & DROP
    _setDragAndDroplistener(_li) {
        let _elemDroppable = _li.querySelector(`div.divDroppable`);
        _elemDroppable.ondragenter = (event) => this.dragEnter(event);
        _elemDroppable.ondragover = (event) => this.allowDrop(event);
        _elemDroppable.ondragleave = (event) => this.leaveDropZone(event);
        _elemDroppable.ondrop = (event) => this.drop(event);

        let _elem = _li.querySelector(`div.divContainer`);
        _elem.setAttribute(`draggable`, true);
        _elem.ondragstart = (event) => this.dragStart(event);
        _elem.ondragend = (event) => this.dragEnd(event);
    }

    // 1 - ondragstart => start dragged
    dragStart(event) {
        event.dataTransfer.setData(`text/plain`, event.target.id);
        this.dragImg.src = event.target.getAttribute(`data-src`);
        event.dataTransfer.setDragImage(this.dragImg, -10, -10);
        this.showDroppableElements();
    }

    // 2 - ondragenter
    dragEnter(event) {
        if (event.target.className == `divDroppable`) event.target.setAttribute(`drop-active`, true);
    }

    // 3 - ondragend
    dragEnd() {
        this.showDroppableElements(false);
    }

    // 4 - ondragover
    allowDrop(event) {
        event.preventDefault();
    }

    // 5 - ondragleave
    leaveDropZone(event) {
        if (event.target.className == `divDroppable`) event.target.removeAttribute(`drop-active`);
    }

    // 6 - ondrop
    drop(event) {
        event.preventDefault();
        if (event.target.className == `divDroppable`) {
            event.target.removeAttribute(`drop-active`);

            // swipe plugins
            let _orderA = parseInt(this.shadowRoot.querySelector(`#${event.dataTransfer.getData(`text/plain`)}`).parentNode.getAttribute(`data-order`));
            let _orderB = parseInt(event.target.parentNode.getAttribute(`data-order`));

            let _orderArray = this.getOrderArray();
            let index = _orderArray.indexOf(_orderA);
            let indexB = _orderArray.indexOf(_orderB);
            if (index > -1) _orderArray.splice(index, 1);
            _orderArray.splice(indexB, 0, _orderA);

            _orderArray.forEach((_v, _index) => this.shadowRoot.querySelector(`#pluginsList`).querySelector(`li[data-order="${_v}"]`).style.order = _index);

            // hide droppable elements
            this.showDroppableElements(false);
        }
    }
})