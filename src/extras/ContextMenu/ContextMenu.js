import {Map} from "../../viewer/scene/utils/Map.js";

const idMap = new Map();

/**
 * Represents the state of a menu.
 *
 * Menus contain groups, which contain items, and each item can be either a menu option or a sub-group.
 *
 * @private
 */
class Menu {
    constructor(id) {
        this.id = id;
        this.groups = [];
        this.menuElement = null;
        this.shown = false;
    }
}

/**
 * Represents the state of a group of items in a menu.
 * @private
 */
class Group {
    constructor() {
        this.items = [];
    }
}

/**
 * Represents he state of an item within a group.
 * @private
 */
class Item {
    constructor(id, getTitle, doAction) {
        this.id = id;
        this.getTitle = getTitle;
        this.doAction = doAction;
        this.itemElement = null;
        this.subMenu = null;
        this.enabled = true;
    }
}

/**
 * @desc A customizable HTML context menu.
 *
 * [<img src="http://xeokit.io/img/docs/ContextMenu/ContextMenu.gif">](https://xeokit.github.io/xeokit-sdk/examples/#ContextMenu_Canvas_TreeViewPlugin_Custom)
 *
 * * [[Run this example](https://xeokit.github.io/xeokit-sdk/examples/#ContextMenu_Canvas_TreeViewPlugin_Custom)]
 *
 * ## Overview
 *
 * * A pure JavaScript, multi-level context menu
 * * Configure custom items
 * * Dynamically labeled items
 * * Dynamically enable/disable items
 * * Style with custom CSS
 *
 * ## Usage
 *
 * In the example below we'll create a ContextMenu that pops up whenever we right-click on an {@link Entity} within
 * our {@link Scene}.
 *
 * First, we'll create the ````ContextMenu````, configuring it with a list of menu items.
 *
 * Each item has:
 *
 * * a title to display it in the menu,
 * * a ````doAction()```` callback to fire when the item's title is clicked, and
 * * an optional ````getEnabled()```` callback that indicates if the item should enabled in the menu or not.
 *
 * The ````getEnabled()```` callbacks are invoked whenever the menu is shown. When an item's ````getEnabled()```` callback
 * returns ````true````, then the item is enabled and clickable. When it returns ````false````, then the item is disabled
 * and cannot be clicked. An item without a ````getEnabled()```` callback is always enabled and clickable.
 *
 *
 * Note how the ````doAction()```` and ````getEnabled()```` callbacks accept a ````context````
 * object. That must be set on the ````ContextMenu```` before we're able to we show it. The context object can be anything. In this example,
 * we'll use the context object to provide the callbacks with the Entity that we right-clicked.
 *
 * We'll also initially enable the ````ContextMenu````.
 *
 * [[Run this example](https://xeokit.github.io/xeokit-sdk/examples/#ContextMenu_Canvas_Custom)]
 *
 * ````javascript
 * const canvasContextMenu = new ContextMenu({
 *
 *    enabled: true,
 *
 *    items: [
 *       [
 *          {
 *             title: "Hide Object",
 *             getEnabled: (context) => {
 *                 return context.entity.visible; // Can't hide entity if already hidden
 *             },
 *             doAction: function (context) {
 *                 context.entity.visible = false;
 *             }
 *          }
 *       ],
 *       [
 *          {
 *             title: "Select Object",
 *             getEnabled: (context) => {
 *                 return (!context.entity.selected); // Can't select an entity that's already selected
 *             },
 *             doAction: function (context) {
 *                 context.entity.selected = true;
 *             }
 *          }
 *       ],
 *       [
 *          {
 *             title: "X-Ray Object",
 *             getEnabled: (context) => {
 *                 return (!context.entity.xrayed); // Can't X-ray an entity that's already X-rayed
 *             },
 *             doAction: (context) => {
 *                 context.entity.xrayed = true;
 *             }
 *          }
 *       ]
 *    ]
 * });
 * ````
 *
 * Next, we'll make the ````ContextMenu```` appear whenever we right-click on an Entity. Whenever we right-click
 * on the canvas, we'll attempt to pick the Entity at those mouse coordinates. If we succeed, we'll feed the
 * Entity into ````ContextMenu```` via the context object, then show the ````ContextMenu````.
 *
 * From there, each ````ContextMenu```` item's ````getEnabled()```` callback will be invoked (if provided), to determine if the item should
 * be enabled. If we click an item, its ````doAction()```` callback will be invoked with our context object.
 *
 * Remember that we must set the context on our ````ContextMenu```` before we show it, otherwise it will log an error to the console,
 * and ignore our attempt to show it.
 *
 * ````javascript*
 * viewer.scene.canvas.canvas.oncontextmenu = (e) => { // Right-clicked on the canvas
 *
 *     if (!objectContextMenu.enabled) {
 *         return;
 *     }
 *
 *     var hit = viewer.scene.pick({ // Try to pick an Entity at the coordinates
 *         canvasPos: [e.pageX, e.pageY]
 *     });
 *
 *     if (hit) { // Picked an Entity
 *
 *         objectContextMenu.context = { // Feed entity to ContextMenu
 *             entity: hit.entity
 *         };
 *
 *         objectContextMenu.show(e.pageX, e.pageY); // Show the ContextMenu
 *     }
 *
 *     e.preventDefault();
 * });
 * ````
 *
 * Note how we only show the ````ContextMenu```` if it's enabled. We can use that mechanism to switch between multiple
 * ````ContextMenu```` instances depending on what we clicked.
 *
 * ## Dynamic Item Titles
 *
 * To make an item dynamically regenerate its title text whenever we show the ````ContextMenu````, provide its title with a
 * ````getTitle()```` callback. The callback will fire each time you show ````ContextMenu````, which will dynamically
 * set the item title text.
 *
 * In the example below, we'll create a simple ````ContextMenu```` that allows us to toggle the selection of an object
 * via its first item, which changes text depending on whether we are selecting or deselecting the object.
 *
 * [[Run an example](https://xeokit.github.io/xeokit-sdk/examples/#ContextMenu_dynamicItemTitles)]
 *
 * ````javascript
 * const canvasContextMenu = new ContextMenu({
 *
 *    enabled: true,
 *
 *    items: [
 *       [
 *          {
 *              getTitle: (context) => {
 *                  return (!context.entity.selected) ? "Select" : "Undo Select";
 *              },
 *              doAction: function (context) {
 *                  context.entity.selected = !context.entity.selected;
 *              }
 *          },
 *          {
 *              title: "Clear Selection",
 *              getEnabled: function (context) {
 *                  return (context.viewer.scene.numSelectedObjects > 0);
 *              },
 *              doAction: function (context) {
 *                  context.viewer.scene.setObjectsSelected(context.viewer.scene.selectedObjectIds, false);
 *              }
 *          }
 *       ]
 *    ]
 * });
 * ````
 *
 * ## Sub-menus
 *
 * Each menu item can optionally have a sub-menu, which will appear when we hover over the item.
 *
 * In the example below, we'll create a much simpler ````ContextMenu```` that has only one item, called "Effects", which
 * will open a cascading sub-menu whenever we hover over that item.
 *
 * Note that our "Effects" item has no ````doAction```` callback, because an item with a sub-menu performs no
 * action of its own.
 *
 * [[Run this example](https://xeokit.github.io/xeokit-sdk/examples/#ContextMenu_multiLevel)]
 *
 * ````javascript
 * const canvasContextMenu = new ContextMenu({
 *     items: [ // Top level items
 *         [
 *             {
 *                 getTitle: (context) => {
 *                     return "Effects";
 *                 },
 *
 *                 items: [ // Sub-menu
 *                     [
 *                         {
 *                             getTitle: (context) => {
 *                                 return (!context.entity.visible) ? "Show" : "Hide";
 *                             },
 *                             doAction: function (context) {
 *                                 context.entity.visible = !context.entity.visible;
 *                             }
 *                         },
 *                         {
 *                             getTitle: (context) => {
 *                                 return (!context.entity.selected) ? "Select" : "Undo Select";
 *                             },
 *                             doAction: function (context) {
 *                                 context.entity.selected = !context.entity.selected;
 *                             }
 *                         },
 *                         {
 *                             getTitle: (context) => {
 *                                 return (!context.entity.highlighted) ? "Highlight" : "Undo Highlight";
 *                             },
 *                             doAction: function (context) {
 *                                 context.entity.highlighted = !context.entity.highlighted;
 *                             }
 *                         }
 *                     ]
 *                 ]
 *             }
 *          ]
 *      ]
 * });
 * ````
 */
class ContextMenu {

    /**
     * Creates a context menu.
     *
     * @param {Object} [cfg] Context menu configuration.
     * @param {Object[]} [cfg.items] The context menu items. These can also be dynamically set on {@link ContextMenu#items}. See the class documentation for an example.
     * @param {Object} [cfg.context] The context, which is passed into the item callbacks. This can also be dynamically set on {@link ContextMenu#context}. This must be set before calling {@link ContextMenu#show}.
     * @param {Boolean} [cfg.enabled=true] Whether this context menu is initially enabled. {@link ContextMenu#show} does nothing while this is ````false````.
     */
    constructor(cfg = {}) {

        this._id = idMap.addItem();
        this._context = null;
        this._enabled = false;  // True when the ContextMenu is enabled

        this._itemsCfg = [];    // Items as given as configs

        this._rootMenu = null;  // The root Menu in the tree
        this._menuList = [];    // List of all Menus
        this._menuMap = {};     // All Menus mapped to their IDs
        this._itemList = [];    // List of all Items
        this._itemMap = {};     // All Items mapped to their IDs

        this._shownSubMenu = null; // The sub-menu that is currently shown; only one sub-menu may be shown at a time

        this._shown = false;    // True when the ContextMenu is visible

        document.addEventListener("mousedown", (event) => {
            if (!event.target.classList.contains("xeokit-context-menu-item")) {
                this.hide();
            }
        });

        if (cfg.items) {
            this.items = cfg.items;
        }

        this.context = cfg.context;
        this.enabled = cfg.enabled !== false;

        this.hide();
    }

    /**
     * Sets the context menu items.
     *
     * These can be dynamically updated.
     *
     * See class documentation for an example.
     *
     * @type {Object[]}
     */
    set items(itemsCfg) {

        this._clear();

        this._itemsCfg = itemsCfg || [];

        this._parseItems(itemsCfg);

        this._createUI();
    }

    /**
     * Gets the context menu items.
     *
     * @type {Object[]}
     */
    get items() {
        return this._itemsCfg;
    }

    /**
     * Sets whether this context menu is enabled.
     *
     * While this is ````false````, the context menu is hidden and {@link ContextMenu#show} does nothing.
     *
     * @type {Boolean}
     */
    set enabled(enabled) {

        enabled = (!!enabled);

        if (enabled === this._enabled) {
            return;
        }

        this._enabled = enabled;

        if (!this._enabled) {
            this.hide();
        }
    }

    /**
     * Gets whether this context menu is enabled.
     *
     * While this is ````false````, the context menu is hidden and {@link ContextMenu#show} does nothing.
     *
     * @type {Boolean}
     */
    get enabled() {
        return this._enabled;
    }

    /**
     * Sets the menu's current context.
     *
     * The context can be any object that you need to be provides to the callbacks configured on {@link ContextMenu#items}.
     *
     * The context must be set before calling {@link ContextMenu#show}.
     *
     * @type {Object}
     */
    set context(context) {
        this._context = context;
    }

    /**
     * Gets the menu's current context.
     *
     * @type {Object}
     */
    get context() {
        return this._context;
    }

    /**
     * Shows this context menu at the given page coordinates.
     *
     * Does nothing when {@link ContextMenu#enabled} is ````false````.
     *
     * Logs error to console and does nothing if {@link ContextMenu#context} has not been set.
     *
     * @param {Number} pageX Page X-coordinate.
     * @param {Number} pageY Page Y-coordinate.
     */
    show(pageX, pageY) {

        if (!this._context) {
            console.error("ContextMenu cannot be shown without a context - set context first");
            return;
        }

        if (!this._enabled) {
            return;
        }

        if (this._shown) {
            return;
        }

        this._hideAllMenus();

        this._updateItemsTitles();
        this._updateItemsEnabledStatus();

        this._showMenu(this._rootMenu.id, pageX, pageY);

        this._shown = true;
    }

    /**
     * Gets whether this context menu is currently shown or not.
     *
     * @returns {Boolean} Whether this context menu is shown.
     */
    get shown() {
        return this._shown;
    }

    /**
     * Hides this context menu.
     */
    hide() {

        if (!this._enabled) {
            return;
        }

        if (!this._shown) {
            return;
        }

        this._hideAllMenus();

        this._shown = false;
    }

    /**
     * Destroys this context menu.
     */
    destroy() {

        this._context = null;

        this._clear();

        if (this._id !== null) {
            idMap.removeItem(this._id);
            this._id = null;
        }
    }

    _clear() { // Destroys DOM elements, clears menu data

        for (let i = 0, len = this._menuList.length; i < len; i++) {

            const menu = this._menuList[i];
            const menuElement = menu.menuElement;

            menuElement.parentElement.removeChild(menuElement);
        }

        this._itemsCfg = [];
        this._rootMenu = null;
        this._menuList = [];
        this._menuMap = {};
        this._itemList = [];
        this._itemMap = {};
    }

    _parseItems(itemsCfg) { // Parses "items" config into menu data

        let nextId = 0;

        const visitItems = (itemsCfg) => {

            const menuId = ("menu" + nextId++);
            const menu = new Menu(menuId);

            for (let i = 0, len = itemsCfg.length; i < len; i++) {

                const itemsGroupCfg = itemsCfg[i];

                const group = new Group();

                menu.groups.push(group);

                for (let j = 0, lenj = itemsGroupCfg.length; j < lenj; j++) {

                    const itemCfg = itemsGroupCfg[j];
                    const subItemsCfg = itemCfg.items;
                    const hasSubItems = (subItemsCfg && (subItemsCfg.length > 0));
                    const itemId = ("item" + nextId++);

                    const getTitle = itemCfg.getTitle || (() => {
                        return (itemCfg.title || "");
                    });

                    const doAction = itemCfg.doAction || itemCfg.callback || (() => {
                    });

                    const item = new Item(itemId, getTitle, doAction);

                    item.parentMenu = menu;

                    group.items.push(item);

                    if (hasSubItems) {
                        const subMenu = visitItems(subItemsCfg);
                        item.subMenu = subMenu;
                        subMenu.parentItem = item;
                    }

                    this._itemList.push(item);
                    this._itemMap[item.id] = item;
                }
            }

            this._menuList.push(menu);
            this._menuMap[menu.id] = menu;

            return menu;
        };

        this._rootMenu = visitItems(itemsCfg);
    }

    _createUI() { // Builds DOM elements for the entire menu tree

        const visitMenu = (menu) => {

            this._createMenuUI(menu);

            const groups = menu.groups;

            for (let i = 0, len = groups.length; i < len; i++) {

                const group = groups[i];
                const groupItems = group.items;

                for (let j = 0, lenj = groupItems.length; j < lenj; j++) {

                    const item = groupItems[j];
                    const subMenu = item.subMenu;

                    if (subMenu) {
                        visitMenu(subMenu);
                    }
                }
            }
        };

        visitMenu(this._rootMenu);
    }

    _createMenuUI(menu) { // Builds DOM elements for a menu

        const groups = menu.groups;
        const html = [];

        html.push('<div class="xeokit-context-menu ' + menu.id + '" style="z-index:300000; position: absolute;">');
        html.push('<ul>');

        if (groups) {

            for (let i = 0, len = groups.length; i < len; i++) {

                const group = groups[i];
                const groupIdx = i;
                const groupLen = len;
                const groupItems = group.items;

                if (groupItems) {

                    for (let j = 0, lenj = groupItems.length; j < lenj; j++) {

                        const item = groupItems[j];
                        const itemSubMenu = item.subMenu;
                        const actionTitle = item.title || "";

                        if (itemSubMenu) {

                            html.push(
                                '<li id="' + item.id + '" class="xeokit-context-menu-item" style="' +
                                ((groupIdx === groupLen - 1) || ((j < lenj - 1)) ? 'border-bottom: 0' : 'border-bottom: 1px solid black') +
                                '">' +
                                actionTitle +
                                ' [MORE]' +
                                '</li>');

                        } else {

                            html.push(
                                '<li id="' + item.id + '" class="xeokit-context-menu-item" style="' +
                                ((groupIdx === groupLen - 1) || ((j < lenj - 1)) ? 'border-bottom: 0' : 'border-bottom: 1px solid black') +
                                '">' +
                                actionTitle +
                                '</li>');
                        }
                    }
                }
            }
        }

        html.push('</ul>');
        html.push('</div>');

        const htmlString = html.join("");

        document.body.insertAdjacentHTML('beforeend', htmlString);

        const menuElement = document.querySelector("." + menu.id);

        menu.menuElement = menuElement;

        menuElement.style["border-radius"] = 4 + "px";
        menuElement.style.display = 'none';
        menuElement.style["z-index"] = 300000;
        menuElement.style.background = "white";
        menuElement.style.border = "1px solid black";
        menuElement.style["box-shadow"] = "0 4px 5px 0 gray";
        menuElement.oncontextmenu = (e) => {
            e.preventDefault();
        };

        // Bind event handlers

        const self = this;

        this._shownSubMenu = null;

        if (groups) {

            for (let i = 0, len = groups.length; i < len; i++) {

                const group = groups[i];
                const groupItems = group.items;

                if (groupItems) {

                    for (let j = 0, lenj = groupItems.length; j < lenj; j++) {

                        const item = groupItems[j];
                        const itemSubMenu = item.subMenu;

                        item.itemElement = document.getElementById(item.id);

                        if (!item.itemElement) {
                            console.error("ContextMenu item element not found: " + item.id);
                            continue;
                        }

                        if (itemSubMenu) {

                            // Item with sub-menu
                            // Hovering item shows the sub-menu, hiding other sub-menus first

                            item.itemElement.addEventListener("mouseenter", (function () {

                                const _item = item;

                                return function (event) {

                                    event.preventDefault();

                                    if (_item.enabled === false) {
                                        return;
                                    }

                                    if (!_item.subMenu) {
                                        return;
                                    }

                                    const subMenu = _item.subMenu;

                                    if (self._shownSubMenu && self._shownSubMenu.id === subMenu.id) {
                                        return;
                                    }

                                    const itemElement = _item.itemElement;
                                    const rect = itemElement.getBoundingClientRect();

                                    if (self._shownSubMenu) { // Only one sub-menu shown at a time
                                        self._hideMenu(self._shownSubMenu.id);
                                        self._shownSubMenu = null;
                                    }

                                    // TODO: Position sub-menu on the left if no room on right

                                    self._showMenu(subMenu.id, rect.right - 5, rect.top);

                                    self._shownSubMenu = subMenu;
                                };

                            })());

                        } else {

                            // Item without sub-menu
                            // clicking item fires the item's action callback

                            item.itemElement.addEventListener("click", (function () {
                                const _item = item;
                                return function (event) {
                                    event.preventDefault();
                                    if (!self._context) {
                                        return;
                                    }
                                    if (_item.enabled === false) {
                                        return;
                                    }
                                    if (_item.doAction) {
                                        _item.doAction(self._context);
                                    }
                                    self.hide();
                                };
                            })());
                        }
                    }
                }
            }
        }
    }

    _updateItemsTitles() { // Dynamically updates the title of each Item to the result of Item#getTitle()

        if (!this._context) {
            return;
        }

        for (let i = 0, len = this._itemList.length; i < len; i++) {

            const item = this._itemList[i];
            const itemElement = item.itemElement;

            if (!itemElement) {
                continue;
            }

            const title = item.getTitle(this._context);

            if (item.subMenu) {
                itemElement.innerText = title + " >>";

            } else {
                itemElement.innerText = title;
            }
        }
    }

    _updateItemsEnabledStatus() { // Enables or disables each Item, depending on the result of Item#getEnabled()

        if (!this._context) {
            return;
        }

        for (let i = 0, len = this._itemList.length; i < len; i++) {

            const item = this._itemList[i];
            const itemElement = item.itemElement;

            if (!itemElement) {
                continue;
            }

            const getEnabled = item.getEnabled;

            if (!getEnabled) {
                continue;
            }

            const enabled = getEnabled(this._context);

            item.enabled = enabled;

            if (!enabled) {
                itemElement.classList.add("disabled");

            } else {
                itemElement.classList.remove("disabled");
            }
        }
    }

    _showMenu(menuId, pageX, pageY) { // Shows the given menu, at the specified page coordinates

        const menu = this._menuMap[menuId];

        if (!menu) {
            console.error("Menu not found: " + menuId);
            return;
        }

        if (menu.shown) {
            return;
        }

        const menuElement = menu.menuElement;

        if (menuElement) {
            this._showMenuElement(menuElement, pageX, pageY);
            menu.shown = true;
        }
    }

    _hideMenu(menuId) { // Hides the given menu

        const menu = this._menuMap[menuId];

        if (!menu) {
            console.error("Menu not found: " + menuId);
            return;
        }

        if (!menu.shown) {
            return;
        }

        const menuElement = menu.menuElement;

        if (menuElement) {
            this._hideMenuElement(menuElement);
            menu.shown = false;
        }
    }

    _hideAllMenus() {
        for (let i = 0, len = this._menuList.length; i < len; i++) {
            const menu = this._menuList[i];
            this._hideMenu(menu.id);
        }
        this._shownSubMenu = null;
    }

    _showMenuElement(menuElement, pageX, pageY) { // Shows the given menu element, at the specified page coordinates

        menuElement.style.display = 'block';

        const menuHeight = menuElement.offsetHeight;
        const menuWidth = menuElement.offsetWidth;

        if ((pageY + menuHeight) > window.innerHeight) {
            pageY = window.innerHeight - menuHeight;
        }

        if ((pageX + menuWidth) > window.innerWidth) {
            pageX = window.innerWidth - menuWidth;
        }

        menuElement.style.left = pageX + 'px';
        menuElement.style.top = pageY + 'px';
    }

    _hideMenuElement(menuElement) {
        menuElement.style.display = 'none';
    }
}

export {ContextMenu};