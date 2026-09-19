// ==UserScript==
// @name         Blue Marble
// @namespace    https://github.com/SwingTheVine/
// @version      0.87.21
// @description  Wplace.live 이용 경험을 향상시키거나 자동화하기 위한 유저스크립트입니다. 반드시 해당 사이트의 서비스 이용약관 및 규칙을 준수하여 사용하시기 바랍니다! 본 스크립트는 Wplace.live와 전혀 무관하며, 사용으로 인한 책임은 전적으로 사용자 본인에게 있습니다. 또한 본 스크립트는 Tampermonkey와도 관련이 없습니다. 본 유저스크립트의 제작자는 스크립트 사용으로 인해 발생하는 어떠한 손해, 문제, 데이터 손실 또는 제재에 대해서도 책임을 지지 않습니다. 본 스크립트는 MPL-2.0 라이선스 하에 "있는 그대로" 제공됩니다. "Blue Marble" 아이콘은 CC0 1.0 Universal (CC0 1.0) 퍼블릭 도메인 기증 라이선스를 따르며, 해당 이미지의 소유권은 NASA에 있습니다.
// @author       SwingTheVine
// @author       TWY
// @author       sungsoos
// @license      MPL-2.0
// @supportURL   https://discord.gg/tpeBPy46hf
// @homepageURL  https://bluemarble.lol/
// @icon         https://raw.githubusercontent.com/t-wy/Wplace-BlueMarble-Userscripts/4e6080b1a633a443595023dc9d54da746ada3650/dist/assets/Favicon.png
// @updateURL    https://raw.githubusercontent.com/t-wy/Wplace-BlueMarble-Userscripts/custom-improve/dist/BlueMarble.user.js
// @downloadURL  https://raw.githubusercontent.com/t-wy/Wplace-BlueMarble-Userscripts/custom-improve/dist/BlueMarble.user.js
// @match        https://wplace.live/*
// @run-at       document-start
// @grant        GM.addStyle
// @grant        GM.setValue
// @grant        GM.getValue
// @noframes
// ==/UserScript==

// Wplace  --> https://wplace.live
// License --> https://www.mozilla.org/en-US/MPL/2.0/

(() => {
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // src/polyfill.js
  if (!window.OffscreenCanvas) {
    window.OffscreenCanvas = function(width, height) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.convertToBlob = function({ type, quality } = {}) {
        return new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("toBlob() returned null"));
          }, type, quality);
        });
      };
      return canvas;
    };
  }
  if (!Array.prototype.extend) {
    Array.prototype.extend = function(elements) {
      elements.forEach((element) => this.push(element));
    };
  }

  // src/Overlay.js
  var _Overlay_instances, createElement_fn;
  var Overlay = class {
    /** Constructor for the Overlay class.
     * @param {string} name - The name of the userscript
     * @param {string} version - The version of the userscript
     * @since 0.0.2
     * @see {@link Overlay}
     */
    constructor(name2, version2) {
      __privateAdd(this, _Overlay_instances);
      this.name = name2;
      this.version = version2;
      this.apiManager = null;
      this.outputStatusId = "bm-output-status";
      this.overlay = null;
      this.currentParent = null;
      this.parentStack = [];
    }
    /** Populates the apiManager variable with the apiManager class.
     * @param {apiManager} apiManager - The apiManager class instance
     * @since 0.41.4
     */
    setApiManager(apiManager2) {
      this.apiManager = apiManager2;
    }
    /** Finishes building an element.
     * Call this after you are finished adding children.
     * If the element will have no children, call it anyways.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.43.2
     * @example
     * overlay
     *   .addDiv()
     *     .addHeader(1).buildElement() // Breaks out of the <h1>
     *     .addP().buildElement() // Breaks out of the <p>
     *   .buildElement() // Breaks out of the <div>
     *   .addHr() // Since there are no more elements, calling buildElement() is optional
     * .buildOverlay(document.body);
     */
    buildElement() {
      if (this.parentStack.length > 0) {
        this.currentParent = this.parentStack.pop();
      }
      return this;
    }
    /** Finishes building the overlay and displays it.
     * Call this when you are done chaining methods.
     * @param {HTMLElement} parent - The parent HTMLElement this overlay should be appended to as a child.
     * @since 0.43.2
     * @example
     * overlay
     *   .addDiv()
     *     .addP().buildElement()
     *   .buildElement()
     * .buildOverlay(document.body); // Adds DOM structure to document body
     * // <div><p></p></div>
     */
    buildOverlay(parent) {
      parent?.appendChild(this.overlay);
      this.overlay = null;
      this.currentParent = null;
      this.parentStack = [];
    }
    /** Adds a `div` to the overlay.
     * This `div` element will have properties shared between all `div` elements in the overlay.
     * You can override the shared properties by using a callback.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the `div` that are NOT shared between all overlay `div` elements. These should be camelCase.
     * @param {function(Overlay, HTMLDivElement):void} [callback=()=>{}] - Additional JS modification to the `div`.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.43.2
     * @example
     * // Assume all <div> elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addDiv({'id': 'foo'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <div id="foo" class="bar"></div>
     * </body>
     */
    addDiv(additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const div = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "div", properties, additionalProperties);
      callback(this, div);
      return this;
    }
    /** Adds a `p` to the overlay.
     * This `p` element will have properties shared between all `p` elements in the overlay.
     * You can override the shared properties by using a callback.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the `p` that are NOT shared between all overlay `p` elements. These should be camelCase.
     * @param {function(Overlay, HTMLParagraphElement):void} [callback=()=>{}] - Additional JS modification to the `p`.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.43.2
     * @example
     * // Assume all <p> elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addP({'id': 'foo', 'textContent': 'Foobar.'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <p id="foo" class="bar">Foobar.</p>
     * </body>
     */
    addP(additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const p = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "p", properties, additionalProperties);
      callback(this, p);
      return this;
    }
    /** Similar to addP, but adds a `span` instead.
     * @since 0.85.27
     */
    addSpan(additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const span = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "span", properties, additionalProperties);
      callback(this, span);
      return this;
    }
    /** Similar to addSpan, but adds a `b` instead.
     * @since 0.85.27
     */
    addB(additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const b = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "b", properties, additionalProperties);
      callback(this, b);
      return this;
    }
    /** Adds plain text to the overlay
     * No .buildElement() is required
     * @since 0.43.27
     */
    addText(textContent) {
      if (!this.overlay) return this;
      const textNode = document.createTextNode(textContent);
      this.currentParent?.appendChild(textNode);
      return this;
    }
    /** Adds a `small` to the overlay.
     * This `small` element will have properties shared between all `small` elements in the overlay.
     * You can override the shared properties by using a callback.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the `small` that are NOT shared between all overlay `small` elements. These should be camelCase.
     * @param {function(Overlay, HTMLParagraphElement):void} [callback=()=>{}] - Additional JS modification to the `small`.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.55.8
     * @example
     * // Assume all <small> elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addSmall({'id': 'foo', 'textContent': 'Foobar.'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <small id="foo" class="bar">Foobar.</small>
     * </body>
     */
    addSmall(additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const small = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "small", properties, additionalProperties);
      callback(this, small);
      return this;
    }
    /** Adds a `img` to the overlay.
     * This `img` element will have properties shared between all `img` elements in the overlay.
     * You can override the shared properties by using a callback.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the `img` that are NOT shared between all overlay `img` elements. These should be camelCase.
     * @param {function(Overlay, HTMLImageElement):void} [callback=()=>{}] - Additional JS modification to the `img`.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.43.2
     * @example
     * // Assume all <img> elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addimg({'id': 'foo', 'src': './img.png'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <img id="foo" src="./img.png" class="bar">
     * </body>
     */
    addImg(additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const img = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "img", properties, additionalProperties);
      callback(this, img);
      return this;
    }
    /** Adds a header to the overlay.
     * This header element will have properties shared between all header elements in the overlay.
     * You can override the shared properties by using a callback.
     * @param {number} level - The header level. Must be between 1 and 6 (inclusive)
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the header that are NOT shared between all overlay header elements. These should be camelCase.
     * @param {function(Overlay, HTMLHeadingElement):void} [callback=()=>{}] - Additional JS modification to the header.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.43.7
     * @example
     * // Assume all header elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addHeader(6, {'id': 'foo', 'textContent': 'Foobar.'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <h6 id="foo" class="bar">Foobar.</h6>
     * </body>
     */
    addHeader(level, additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const header = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "h" + level, properties, additionalProperties);
      callback(this, header);
      return this;
    }
    /** Adds a `hr` to the overlay.
     * This `hr` element will have properties shared between all `hr` elements in the overlay.
     * You can override the shared properties by using a callback.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the `hr` that are NOT shared between all overlay `hr` elements. These should be camelCase.
     * @param {function(Overlay, HTMLHRElement):void} [callback=()=>{}] - Additional JS modification to the `hr`.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.43.7
     * @example
     * // Assume all <hr> elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addhr({'id': 'foo'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <hr id="foo" class="bar">
     * </body>
     */
    addHr(additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const hr = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "hr", properties, additionalProperties);
      callback(this, hr);
      return this;
    }
    /** Adds a `br` to the overlay.
     * This `br` element will have properties shared between all `br` elements in the overlay.
     * You can override the shared properties by using a callback.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the `br` that are NOT shared between all overlay `br` elements. These should be camelCase.
     * @param {function(Overlay, HTMLBRElement):void} [callback=()=>{}] - Additional JS modification to the `br`.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.43.11
     * @example
     * // Assume all <br> elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addbr({'id': 'foo'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <br id="foo" class="bar">
     * </body>
     */
    addBr(additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const br = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "br", properties, additionalProperties);
      callback(this, br);
      return this;
    }
    /** Adds a checkbox to the overlay.
     * This checkbox element will have properties shared between all checkbox elements in the overlay.
     * You can override the shared properties by using a callback. Note: the checkbox element is inside a label element.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the checkbox that are NOT shared between all overlay checkbox elements. These should be camelCase.
     * @param {function(Overlay, HTMLLabelElement, HTMLInputElement):void} [callback=()=>{}] - Additional JS modification to the checkbox.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.43.10
     * @example
     * // Assume all checkbox elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addCheckbox({'id': 'foo', 'textContent': 'Foobar.'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <label>
     *     <input type="checkbox" id="foo" class="bar">
     *     "Foobar."
     *   </label>
     * </body>
     */
    addCheckbox(additionalProperties = {}, callback = () => {
    }) {
      const properties = { "type": "checkbox" };
      const label = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "label", { "textContent": additionalProperties["textContent"] ?? "" });
      delete additionalProperties["textContent"];
      const checkbox = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "input", properties, additionalProperties);
      label.insertBefore(checkbox, label.firstChild);
      this.buildElement();
      callback(this, label, checkbox);
      return this;
    }
    /** Adds a `label` to the overlay.
     * This `label` element will have properties shared between all `label` elements in the overlay.
     * You can override the shared properties by using a callback.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the `label` that are NOT shared between all overlay `label` elements. These should be camelCase.
     * @param {function(Overlay, HTMLLabelElement):void} [callback=()=>{}] - Additional JS modification to the `label`.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.87.5
     * @example
     * // Assume all <label> elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addLabel({'id': 'foo', 'textContent': 'Foobar.'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <label id="foo" class="bar">Foobar.</label>
     * </body>
     */
    addLabel(additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const label = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "label", properties, additionalProperties);
      callback(this, label);
      return this;
    }
    /** Adds a 'details' to the overlay.
     * This details element will have properties shared between all details elements in the overlay.
     * You can override the shared properties by using a callback. Note: the summary element is inside a details element.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the details that are NOT shared between all overlay details elements. These should be camelCase.
     * @param {function(Overlay, HTMLSummaryElement, HTMLDetailsElement):void} [callback=()=>{}] - Additional JS modification to the details.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.85.34
     * @example
     * // Assume all details elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addDetails({'id': 'foo', 'textContent': 'Foobar.'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <details id="foo" class="bar">
     *     <summary>Foobar.</summary>
     *   </details>
     * </body>
     */
    addDetails(additionalProperties = {}, callback = () => {
    }) {
      const properties = { "type": "details" };
      const textContent = additionalProperties["textContent"];
      delete additionalProperties["textContent"];
      const details = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "details", properties, additionalProperties);
      const summary = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "summary", { "textContent": textContent ?? "" });
      details.appendChild(summary);
      this.buildElement();
      callback(this, summary, details);
      return this;
    }
    /** Adds a `button` to the overlay.
     * This `button` element will have properties shared between all `button` elements in the overlay.
     * You can override the shared properties by using a callback.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the `button` that are NOT shared between all overlay `button` elements. These should be camelCase.
     * @param {function(Overlay, HTMLButtonElement):void} [callback=()=>{}] - Additional JS modification to the `button`.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.43.12
     * @example
     * // Assume all <button> elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addButton({'id': 'foo', 'textContent': 'Foobar.'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <button id="foo" class="bar">Foobar.</button>
     * </body>
     */
    addButton(additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const button = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "button", properties, additionalProperties);
      callback(this, button);
      return this;
    }
    /** Adds a help button to the overlay. It will have a "?" icon unless overridden in callback.
     * On click, the button will attempt to output the title to the output element (ID defined in Overlay constructor).
     * This `button` element will have properties shared between all `button` elements in the overlay.
     * You can override the shared properties by using a callback.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the `button` that are NOT shared between all overlay `button` elements. These should be camelCase.
     * @param {function(Overlay, HTMLButtonElement):void} [callback=()=>{}] - Additional JS modification to the `button`.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.43.12
     * @example
     * // Assume all help button elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addButtonHelp({'id': 'foo', 'title': 'Foobar.'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <button id="foo" class="bar" title="Help: Foobar.">?</button>
     * </body>
     * @example
     * // Assume all help button elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addButtonHelp({'id': 'foo', 'textContent': 'Foobar.'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <button id="foo" class="bar" title="Help: Foobar.">?</button>
     * </body>
     */
    addButtonHelp(additionalProperties = {}, callback = () => {
    }) {
      const tooltip = additionalProperties["title"] ?? additionalProperties["textContent"] ?? "Help: No info";
      delete additionalProperties["textContent"];
      additionalProperties["title"] = `Help: ${tooltip}`;
      const properties = {
        "textContent": "?",
        "className": "bm-help",
        "onclick": () => {
          this.updateInnerHTML(this.outputStatusId, tooltip);
        }
      };
      const help = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "button", properties, additionalProperties);
      callback(this, help);
      return this;
    }
    /** Adds a select to the overlay.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the checkbox that are NOT shared between all overlay checkbox elements. These should be camelCase.
     * @param {function(Overlay, HTMLSelectElement):void} [callback=()=>{}] - Additional JS modification to the checkbox.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.85.23
     */
    addSelect(additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const select = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "select", properties, additionalProperties);
      callback(this, select);
      return this;
    }
    /** Adds a `input` to the overlay.
     * This `input` element will have properties shared between all `input` elements in the overlay.
     * You can override the shared properties by using a callback.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the `input` that are NOT shared between all overlay `input` elements. These should be camelCase.
     * @param {function(Overlay, HTMLInputElement):void} [callback=()=>{}] - Additional JS modification to the `input`.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.43.13
     * @example
     * // Assume all <input> elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addInput({'id': 'foo', 'textContent': 'Foobar.'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <input id="foo" class="bar">Foobar.</input>
     * </body>
     */
    addInput(additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const input = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "input", properties, additionalProperties);
      callback(this, input);
      return this;
    }
    /** Adds a file input to the overlay with enhanced visibility controls.
     * This input element will have properties shared between all file input elements in the overlay.
     * Uses multiple hiding methods to prevent browser native text from appearing during minimize/maximize.
     * You can override the shared properties by using a callback.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the file input that are NOT shared between all overlay file input elements. These should be camelCase.
     * @param {function(Overlay, HTMLDivElement, HTMLInputElement, HTMLButtonElement):void} [callback=()=>{}] - Additional JS modification to the file input.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.43.17
     * @example
     * // Assume all file input elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addInputFile({'id': 'foo', 'textContent': 'Foobar.'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <div>
     *     <input type="file" id="foo" class="bar" style="display: none"></input>
     *     <button>Foobar.</button>
     *   </div>
     * </body>
     */
    addInputFile(additionalProperties = {}, callback = () => {
    }) {
      const properties = {
        "type": "file",
        "style": "display: none !important; visibility: hidden !important; position: absolute !important; left: -9999px !important; width: 0 !important; height: 0 !important; opacity: 0 !important;"
      };
      const text = additionalProperties["textContent"] ?? "";
      delete additionalProperties["textContent"];
      const container = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "span");
      const input = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "input", properties, additionalProperties);
      this.buildElement();
      const button = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "button", { "textContent": text });
      this.buildElement();
      this.buildElement();
      input.setAttribute("tabindex", "-1");
      input.setAttribute("aria-hidden", "true");
      button.addEventListener("click", () => {
        input.click();
      });
      input.addEventListener("change", () => {
        button.style.maxWidth = `${button.offsetWidth}px`;
        if (input.files.length > 0) {
          button.textContent = input.files[0].name;
        } else {
          button.textContent = text;
        }
      });
      callback(this, container, input, button);
      return this;
    }
    /** Adds a `textarea` to the overlay.
     * This `textarea` element will have properties shared between all `textarea` elements in the overlay.
     * You can override the shared properties by using a callback.
     * @param {Object.<string, any>} [additionalProperties={}] - The DOM properties of the `textarea` that are NOT shared between all overlay `textarea` elements. These should be camelCase.
     * @param {function(Overlay, HTMLTextAreaElement):void} [callback=()=>{}] - Additional JS modification to the `textarea`.
     * @returns {Overlay} Overlay class instance (this)
     * @since 0.43.13
     * @example
     * // Assume all <textarea> elements have a shared class (e.g. {'className': 'bar'})
     * overlay.addTextarea({'id': 'foo', 'textContent': 'Foobar.'}).buildOverlay(document.body);
     * // Output:
     * // (Assume <body> already exists in the webpage)
     * <body>
     *   <textarea id="foo" class="bar">Foobar.</textarea>
     * </body>
     */
    addTextarea(additionalProperties = {}, callback = () => {
    }) {
      const properties = {};
      const textarea = __privateMethod(this, _Overlay_instances, createElement_fn).call(this, "textarea", properties, additionalProperties);
      callback(this, textarea);
      return this;
    }
    /** Updates the inner HTML of the element.
     * The element is discovered by it's id.
     * If the element is an `input`, it will modify the value attribute instead.
     * @param {string} id - The ID of the element to change
     * @param {string} html - The HTML/text to update with
     * @param {boolean} [doSafe] - (Optional) Should `textContent` be used instead of `innerHTML` to avoid XSS? False by default
     * @since 0.24.2
     */
    updateInnerHTML(id, html, doSafe = false) {
      const element = document.getElementById(id.replace(/^#/, ""));
      if (!element) {
        return;
      }
      if (element instanceof HTMLInputElement) {
        element.value = html;
        return;
      }
      if (doSafe) {
        element.textContent = html;
      } else {
        element.innerHTML = html;
      }
    }
    /** Handles dragging of the overlay.
     * Uses requestAnimationFrame for smooth animations and GPU-accelerated transforms.
     * @param {string} moveMe - The ID of the element to be moved
     * @param {string} iMoveThings - The ID of the drag handle element
     * @since 0.8.2
    */
    handleDrag(moveMe, iMoveThings) {
      let isDragging = false;
      let offsetX, offsetY = 0;
      let animationFrame = null;
      let currentX = 0;
      let currentY = 0;
      let targetX = 0;
      let targetY = 0;
      moveMe = document.querySelector(moveMe?.[0] == "#" ? moveMe : "#" + moveMe);
      iMoveThings = document.querySelector(iMoveThings?.[0] == "#" ? iMoveThings : "#" + iMoveThings);
      if (!moveMe || !iMoveThings) {
        this.handleDisplayError(`\uB4DC\uB798\uADF8\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4! ${!moveMe ? "moveMe" : ""} ${!moveMe && !iMoveThings ? "\uC640 " : ""}${!iMoveThings ? "iMoveThings " : ""}\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4!`);
        return;
      }
      const updatePosition = () => {
        if (isDragging) {
          const deltaX = Math.abs(currentX - targetX);
          const deltaY = Math.abs(currentY - targetY);
          if (deltaX > 0.5 || deltaY > 0.5) {
            currentX = targetX;
            currentY = targetY;
            moveMe.style.transform = `translate(${currentX}px, ${currentY}px)`;
            moveMe.style.left = "0px";
            moveMe.style.top = "0px";
            moveMe.style.right = "";
          }
          animationFrame = requestAnimationFrame(updatePosition);
        }
      };
      let initialRect = null;
      const startDrag = (clientX, clientY) => {
        isDragging = true;
        initialRect = moveMe.getBoundingClientRect();
        offsetX = clientX - initialRect.left;
        offsetY = clientY - initialRect.top;
        const computedStyle = window.getComputedStyle(moveMe);
        const transform = computedStyle.transform;
        if (transform && transform !== "none") {
          const matrix = new DOMMatrix(transform);
          currentX = matrix.m41;
          currentY = matrix.m42;
        } else {
          currentX = initialRect.left;
          currentY = initialRect.top;
        }
        targetX = currentX;
        targetY = currentY;
        document.body.style.userSelect = "none";
        iMoveThings.classList.add("dragging");
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
        updatePosition();
      };
      const endDrag = () => {
        isDragging = false;
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        document.body.style.userSelect = "";
        iMoveThings.classList.remove("dragging");
      };
      iMoveThings.addEventListener("mousedown", function(event) {
        event.preventDefault();
        startDrag(event.clientX, event.clientY);
      });
      iMoveThings.addEventListener("touchstart", function(event) {
        const touch = event?.touches?.[0];
        if (!touch) {
          return;
        }
        startDrag(touch.clientX, touch.clientY);
        event.preventDefault();
      }, { passive: false });
      document.addEventListener("mousemove", function(event) {
        if (isDragging && initialRect) {
          targetX = event.clientX - offsetX;
          targetY = event.clientY - offsetY;
        }
      }, { passive: true });
      document.addEventListener("touchmove", function(event) {
        if (isDragging && initialRect) {
          const touch = event?.touches?.[0];
          if (!touch) {
            return;
          }
          targetX = touch.clientX - offsetX;
          targetY = touch.clientY - offsetY;
          event.preventDefault();
        }
      }, { passive: false });
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchend", endDrag);
      document.addEventListener("touchcancel", endDrag);
    }
    /** Handles status display.
     * This will output plain text into the output Status box.
     * Additionally, this will output an info message to the console.
     * @param {string} text - The status text to display.
     * @since 0.58.4
     */
    handleDisplayStatus(text) {
      const consoleInfo = console.info;
      consoleInfo(`${this.name}: ${text}`);
      this.updateInnerHTML(this.outputStatusId, "Status: " + text, true);
    }
    /** Handles error display.
     * This will output plain text into the output Status box.
     * Additionally, this will output an error to the console.
     * @param {string} text - The error text to display.
     * @since 0.41.6
     */
    handleDisplayError(text) {
      const consoleError2 = console.error;
      consoleError2(`${this.name}: ${text}`);
      this.updateInnerHTML(this.outputStatusId, "Error: " + text, true);
    }
  };
  _Overlay_instances = new WeakSet();
  /** Creates an element.
   * For **internal use** of the {@link Overlay} class.
   * @param {string} tag - The tag name as a string.
   * @param {Object.<string, any>} [properties={}] - The DOM properties of the element.
   * @returns {HTMLElement} HTML Element
   * @since 0.43.2
   */
  createElement_fn = function(tag, properties = {}, additionalProperties = {}) {
    const element = document.createElement(tag);
    if (!this.overlay) {
      this.overlay = element;
      this.currentParent = element;
    } else {
      this.currentParent?.appendChild(element);
      this.parentStack.push(this.currentParent);
      this.currentParent = element;
    }
    for (const [property, value] of Object.entries(properties)) {
      element[property] = value;
    }
    for (const [property, value] of Object.entries(additionalProperties)) {
      element[property] = value;
    }
    return element;
  };

  // src/utils.js
  function consoleLog(...args) {
    ((consoleLog2) => consoleLog2(...args))(console.log);
  }
  function consoleWarn(...args) {
    ((consoleWarn2) => consoleWarn2(...args))(console.warn);
  }
  function numberToEncoded(number, encoding) {
    if (number === 0) return encoding[0];
    let result = "";
    const base = encoding.length;
    while (number > 0) {
      result = encoding[number % base] + result;
      number = Math.floor(number / base);
    }
    return result;
  }
  function uint8ToBase64(uint8) {
    let binary = "";
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    return btoa(binary);
  }
  function base64ToUint8(base64) {
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return array;
  }
  function base64PNGSize(base64) {
    const sizeData = base64.slice(0, 32);
    if (sizeData.length !== 32) throw new Error("Invalid PNG size data");
    const sizeDataDecoded = base64ToUint8(sizeData);
    if (sizeDataDecoded.length !== 24) throw new Error("Invalid PNG size data");
    const imgWidth = sizeDataDecoded[16] << 24 | sizeDataDecoded[17] << 16 | sizeDataDecoded[18] << 8 | sizeDataDecoded[19];
    const imgHeight = sizeDataDecoded[20] << 24 | sizeDataDecoded[21] << 16 | sizeDataDecoded[22] << 8 | sizeDataDecoded[23];
    return [imgWidth, imgHeight];
  }
  function selectAllCoordinateInputs(document2) {
    coords = [];
    coords.push(document2.querySelector("#bm-input-tx"));
    coords.push(document2.querySelector("#bm-input-ty"));
    coords.push(document2.querySelector("#bm-input-px"));
    coords.push(document2.querySelector("#bm-input-py"));
    return coords;
  }
  var colorpalette = [
    { "id": 0, "premium": false, "name": "Transparent", "rgb": [0, 0, 0] },
    { "id": 1, "premium": false, "name": "Black", "rgb": [0, 0, 0] },
    { "id": 2, "premium": false, "name": "Dark Gray", "rgb": [60, 60, 60] },
    { "id": 3, "premium": false, "name": "Gray", "rgb": [120, 120, 120] },
    { "id": 4, "premium": false, "name": "Light Gray", "rgb": [210, 210, 210] },
    { "id": 5, "premium": false, "name": "White", "rgb": [255, 255, 255] },
    { "id": 6, "premium": false, "name": "Deep Red", "rgb": [96, 0, 24] },
    { "id": 7, "premium": false, "name": "Red", "rgb": [237, 28, 36] },
    { "id": 8, "premium": false, "name": "Orange", "rgb": [255, 127, 39] },
    { "id": 9, "premium": false, "name": "Gold", "rgb": [246, 170, 9] },
    { "id": 10, "premium": false, "name": "Yellow", "rgb": [249, 221, 59] },
    { "id": 11, "premium": false, "name": "Light Yellow", "rgb": [255, 250, 188] },
    { "id": 12, "premium": false, "name": "Dark Green", "rgb": [14, 185, 104] },
    { "id": 13, "premium": false, "name": "Green", "rgb": [19, 230, 123] },
    { "id": 14, "premium": false, "name": "Light Green", "rgb": [135, 255, 94] },
    { "id": 15, "premium": false, "name": "Dark Teal", "rgb": [12, 129, 110] },
    { "id": 16, "premium": false, "name": "Teal", "rgb": [16, 174, 166] },
    { "id": 17, "premium": false, "name": "Light Teal", "rgb": [19, 225, 190] },
    { "id": 18, "premium": false, "name": "Dark Blue", "rgb": [40, 80, 158] },
    { "id": 19, "premium": false, "name": "Blue", "rgb": [64, 147, 228] },
    { "id": 20, "premium": false, "name": "Cyan", "rgb": [96, 247, 242] },
    { "id": 21, "premium": false, "name": "Indigo", "rgb": [107, 80, 246] },
    { "id": 22, "premium": false, "name": "Light Indigo", "rgb": [153, 177, 251] },
    { "id": 23, "premium": false, "name": "Dark Purple", "rgb": [120, 12, 153] },
    { "id": 24, "premium": false, "name": "Purple", "rgb": [170, 56, 185] },
    { "id": 25, "premium": false, "name": "Light Purple", "rgb": [224, 159, 249] },
    { "id": 26, "premium": false, "name": "Dark Pink", "rgb": [203, 0, 122] },
    { "id": 27, "premium": false, "name": "Pink", "rgb": [236, 31, 128] },
    { "id": 28, "premium": false, "name": "Light Pink", "rgb": [243, 141, 169] },
    { "id": 29, "premium": false, "name": "Dark Brown", "rgb": [104, 70, 52] },
    { "id": 30, "premium": false, "name": "Brown", "rgb": [149, 104, 42] },
    { "id": 31, "premium": false, "name": "Beige", "rgb": [248, 178, 119] },
    { "id": 32, "premium": true, "name": "Medium Gray", "rgb": [170, 170, 170] },
    { "id": 33, "premium": true, "name": "Dark Red", "rgb": [165, 14, 30] },
    { "id": 34, "premium": true, "name": "Light Red", "rgb": [250, 128, 114] },
    { "id": 35, "premium": true, "name": "Dark Orange", "rgb": [228, 92, 26] },
    { "id": 36, "premium": true, "name": "Light Tan", "rgb": [214, 181, 148] },
    { "id": 37, "premium": true, "name": "Dark Goldenrod", "rgb": [156, 132, 49] },
    { "id": 38, "premium": true, "name": "Goldenrod", "rgb": [197, 173, 49] },
    { "id": 39, "premium": true, "name": "Light Goldenrod", "rgb": [232, 212, 95] },
    { "id": 40, "premium": true, "name": "Dark Olive", "rgb": [74, 107, 58] },
    { "id": 41, "premium": true, "name": "Olive", "rgb": [90, 148, 74] },
    { "id": 42, "premium": true, "name": "Light Olive", "rgb": [132, 197, 115] },
    { "id": 43, "premium": true, "name": "Dark Cyan", "rgb": [15, 121, 159] },
    { "id": 44, "premium": true, "name": "Light Cyan", "rgb": [187, 250, 242] },
    { "id": 45, "premium": true, "name": "Light Blue", "rgb": [125, 199, 255] },
    { "id": 46, "premium": true, "name": "Dark Indigo", "rgb": [77, 49, 184] },
    { "id": 47, "premium": true, "name": "Dark Slate Blue", "rgb": [74, 66, 132] },
    { "id": 48, "premium": true, "name": "Slate Blue", "rgb": [122, 113, 196] },
    { "id": 49, "premium": true, "name": "Light Slate Blue", "rgb": [181, 174, 241] },
    { "id": 50, "premium": true, "name": "Light Brown", "rgb": [219, 164, 99] },
    { "id": 51, "premium": true, "name": "Dark Beige", "rgb": [209, 128, 81] },
    { "id": 52, "premium": true, "name": "Light Beige", "rgb": [255, 197, 165] },
    { "id": 53, "premium": true, "name": "Dark Peach", "rgb": [155, 82, 73] },
    { "id": 54, "premium": true, "name": "Peach", "rgb": [209, 128, 120] },
    { "id": 55, "premium": true, "name": "Light Peach", "rgb": [250, 182, 164] },
    { "id": 56, "premium": true, "name": "Dark Tan", "rgb": [123, 99, 82] },
    { "id": 57, "premium": true, "name": "Tan", "rgb": [156, 132, 107] },
    { "id": 58, "premium": true, "name": "Dark Slate", "rgb": [51, 57, 65] },
    { "id": 59, "premium": true, "name": "Slate", "rgb": [109, 117, 141] },
    { "id": 60, "premium": true, "name": "Light Slate", "rgb": [179, 185, 209] },
    { "id": 61, "premium": true, "name": "Dark Stone", "rgb": [109, 100, 63] },
    { "id": 62, "premium": true, "name": "Stone", "rgb": [148, 140, 107] },
    { "id": 63, "premium": true, "name": "Light Stone", "rgb": [205, 197, 158] }
  ];
  var rgbToMeta = /* @__PURE__ */ new Map();
  var rgbToKey = /* @__PURE__ */ new Map();
  var transparent = colorpalette.find((color) => (color?.name || "").toLowerCase() === "transparent");
  for (const { id, premium, name: name2, rgb } of [
    ...colorpalette,
    // Ensure template #deface marker is treated as allowed (maps to Transparent color)
    // Map #deface to Transparent meta for UI naming and ID continuity
    { id: transparent.id, premium: transparent.premium, name: transparent.name, rgb: [222, 250, 206] }
  ]) {
    const [r, g, b] = rgb;
    const colorKey = `${r},${g},${b}`;
    rgbToMeta.set(colorKey, { id, premium, name: name2, rgb });
    rgbToKey.set(`${r},${g},${b}`, colorKey);
    rgbToKey.set(`${r},${g},${b ^ 1}`, colorKey);
    rgbToKey.set(`${r},${g ^ 1},${b}`, colorKey);
    rgbToKey.set(`${r},${g ^ 1},${b ^ 1}`, colorKey);
    rgbToKey.set(`${r ^ 1},${g},${b}`, colorKey);
    rgbToKey.set(`${r ^ 1},${g},${b ^ 1}`, colorKey);
    rgbToKey.set(`${r ^ 1},${g ^ 1},${b}`, colorKey);
    rgbToKey.set(`${r ^ 1},${g ^ 1},${b ^ 1}`, colorKey);
  }
  var keyOther = "other";
  rgbToKey.set("other", keyOther);
  rgbToMeta.set(keyOther, { id: "other", premium: false, name: "Other" });
  function cleanUpCanvas(canvas) {
    canvas.width = 0;
    canvas.height = 0;
    if (canvas.constructor === HTMLCanvasElement) canvas.remove();
    canvas = null;
  }
  function getOverlayCoordsRaw() {
    const tx = document.querySelector("#bm-input-tx")?.value || "";
    const ty = document.querySelector("#bm-input-ty")?.value || "";
    const px = document.querySelector("#bm-input-px")?.value || "";
    const py = document.querySelector("#bm-input-py")?.value || "";
    return [[tx, ty], [px, py]];
  }
  function getOverlayCoords() {
    const rawCoords = getOverlayCoordsRaw();
    const tx = Number(rawCoords[0][0]);
    const ty = Number(rawCoords[0][1]);
    const px = Number(rawCoords[1][0]);
    const py = Number(rawCoords[1][1]);
    return [[tx, ty], [px, py]];
  }
  function areOverlayCoordsFilledAndValid() {
    const rawCoords = getOverlayCoordsRaw();
    const parsedCoords = getOverlayCoords();
    if (rawCoords.some(
      (coords2) => coords2.some(
        (coord) => coord === ""
      )
    )) return false;
    if (parsedCoords.some(
      (coords2) => coords2.some(
        (coord) => isNaN(coord) || coord < 0
      )
    )) return false;
    if (parsedCoords[0][0] > 2048) return false;
    if (parsedCoords[0][1] > 2048) return false;
    if (parsedCoords[1][0] > 1e3) return false;
    if (parsedCoords[1][1] > 1e3) return false;
    return true;
  }
  var sortByOptions = {
    "total": ([rgb, paintedCount, totalCount]) => totalCount,
    "painted": ([rgb, paintedCount, totalCount]) => paintedCount,
    "remaining": ([rgb, paintedCount, totalCount]) => totalCount - paintedCount,
    "painted%": ([rgb, paintedCount, totalCount]) => paintedCount / (totalCount === 0 ? 1 : totalCount),
    "color#": ([rgb, paintedCount, totalCount]) => {
      if (rgb === "other") return 361;
      if (rgb === "#deface") return -1;
      const tMeta = rgbToMeta.get(rgb);
      if (tMeta && typeof tMeta.id === "number") return tMeta.id;
      return 361;
    },
    "hue": ([rgb, paintedCount, totalCount]) => {
      if (rgb === "other") return 361;
      if (rgb === "#deface") return -1;
      const [r, g, b] = rgb.split(",").map(Number);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      if (delta === 0) return 361 + r;
      if (max === r) {
        return ((g - b) / delta + 6) % 6 * 60;
      } else if (max === g) {
        return ((b - r) / delta + 2) * 60;
      } else {
        return ((r - g) / delta + 4) * 60;
      }
    },
    "luminance": ([rgb, paintedCount, totalCount]) => {
      if (rgb === "other") return 2;
      if (rgb === "#deface") return 0;
      const [r, g, b] = rgb.split(",").map(Number);
      return (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
    }
  };
  var sortByDisplayNames = {
    total: "\uCD1D\uD569",
    painted: "\uCE60\uD574\uC9D0",
    remaining: "\uB0A8\uC74C",
    "painted%": "\uCE60\uD574\uC9D0 \uD37C\uC13C\uD2B8",
    "color#": "\uC0C9 #",
    hue: "\uC0C9\uC0C1",
    luminance: "\uBA85\uB3C4"
  };
  function copyToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text);
    } else {
      var temp = document.createElement("textArea");
      temp.innerHTML = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }
  }
  function calculateTopLeftAndSize(coords1, coords2) {
    const xs = [
      coords1[0][0] % 2048 * 1e3 + coords1[1][0] % 1e3,
      coords2[0][0] % 2048 * 1e3 + coords2[1][0] % 1e3
    ];
    const ys = [
      coords1[0][1] % 2048 * 1e3 + coords1[1][1] % 1e3,
      coords2[0][1] % 2048 * 1e3 + coords2[1][1] % 1e3
    ];
    const top = Math.min(ys[0], ys[1]);
    const height = Math.abs(ys[0] - ys[1]) + 1;
    const rawWidth = Math.abs(xs[0] - xs[1]) + 1;
    const earthWrap = rawWidth * 2 > 2048 * 1e3;
    const left = earthWrap ? Math.max(xs[0], xs[1]) : Math.min(xs[0], xs[1]);
    const width = earthWrap ? 2048 * 1e3 - rawWidth + 2 : rawWidth;
    return [[left, top], [width, height]];
  }
  function testCanvasSize(width, height) {
    let canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    context.fillRect(width - 1, height - 1, 1, 1);
    const result = context.getImageData(width - 1, height - 1, 1, 1).data[3] !== 0;
    cleanUpCanvas(canvas);
    canvas = null;
    return result;
  }
  function downloadTile(tx, ty) {
    const remoteURL1 = "https://backend.wplace.live/files/s0/tiles/" + tx % 2048 + "/" + ty + ".png";
    const remoteURL2 = "https://backend.wplace.live/tile/" + tx % 2048 + "/" + ty + ".png";
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function() {
        resolve(img);
      };
      img.onerror = function(error) {
        if (img.src === remoteURL1) {
          img.src = remoteURL2;
          return;
        }
        ;
        reject(error);
      };
      img.src = remoteURL1;
    });
  }
  function getCurrentColor() {
    const currentColor = Number(localStorage.getItem("selected-color")) ?? 0;
    if (isNaN(currentColor) || !isFinite(currentColor) || currentColor < 0 || currentColor >= 64) return 0;
    return currentColor;
  }
  function* plotLine([x0, y0], [x1, y1]) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      yield [x0, y0];
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  }
  function lineBitmap([x0, y0], [x1, y1], [r, g, b]) {
    if (Math.abs(x1 - x0) * 2 > 2048e3) {
      if (x1 > x0) {
        x0 += 2048e3;
      } else {
        x1 += 2048e3;
      }
    }
    const minX = Math.min(x0, x1);
    const minY = Math.min(y0, y1);
    const maxX = Math.max(x0, x1);
    const maxY = Math.max(y0, y1);
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const data = new Uint8ClampedArray(width * height * 4);
    const image = new ImageData(data, width, height);
    for (const [x, y] of plotLine([x0, y0], [x1, y1])) {
      const bx = x - minX;
      const by = y - minY;
      const idx = (by * width + bx) * 4;
      data[idx + 0] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
    return {
      imageData: image,
      offsetX: minX,
      offsetY: minY
    };
  }
  function midPointDistance([x0, y0], [x1, y1]) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const r2 = dx * dx + dy * dy;
    let y = Math.ceil(Math.sqrt(r2));
    let d = (y + y - 1) * (y + y - 1) - 4 * r2;
    if (d >= 0) {
      --y;
      d -= 8 * y;
    }
    return {
      "d": d,
      "y": y
    };
  }
  function* plotCircle([x0, y0], [x1, y1]) {
    let { d, y } = midPointDistance([x0, y0], [x1, y1]);
    yield [x0, y0 + y];
    if (y === 0) return;
    yield [x0, y0 - y];
    yield [x0 + y, y0];
    yield [x0 - y, y0];
    let x = 1;
    while (x < y) {
      d += 8 * x - 4;
      if (d >= 0) {
        --y;
        d -= 8 * y;
      }
      yield [x0 + x, y0 + y];
      yield [x0 + x, y0 - y];
      yield [x0 - x, y0 + y];
      yield [x0 - x, y0 - y];
      if (x == y) break;
      yield [x0 + y, y0 + x];
      yield [x0 + y, y0 - x];
      yield [x0 - y, y0 + x];
      yield [x0 - y, y0 - x];
      ++x;
    }
  }
  function circleBitmap([x0, y0], [x1, y1], [r, g, b]) {
    if (Math.abs(x1 - x0) * 2 > 2048e3) {
      if (x1 > x0) {
        x0 += 2048e3;
      } else {
        x1 += 2048e3;
      }
    }
    let { d, y } = midPointDistance([x0, y0], [x1, y1]);
    const minX = (x0 + 2048e3 - y) % 2048e3;
    const minY = Math.max(0, y0 - y);
    const actualX = minX + y;
    const actualX1 = x1 + (actualX - x0);
    const maxX = actualX + y;
    const maxY = Math.min(y0 + y, 2048e3 - 1);
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const data = new Uint8ClampedArray(width * height * 4);
    const image = new ImageData(data, width, height);
    for (const [x, y2] of plotCircle([actualX, y0], [actualX1, y1])) {
      const bx = x - minX;
      const by = y2 - minY;
      if (bx < 0 || bx >= width) continue;
      if (by < 0 || by >= height) continue;
      const idx = (by * width + bx) * 4;
      data[idx + 0] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
    return {
      imageData: image,
      offsetX: minX,
      offsetY: minY
    };
  }
  function calculateTileKey(coordsTile) {
    return coordsTile[0].toString().padStart(4, "0") + "," + coordsTile[1].toString().padStart(4, "0");
  }
  function countPixels(inspectData, imageWidth, imageHeight, paletteMap, shreadSize = 1, shreadCenter = 0) {
    let required = 0;
    let deface = 0;
    for (let y = shreadCenter; y < imageHeight; y += shreadSize) {
      for (let x = shreadCenter; x < imageWidth; x += shreadSize) {
        const idx = (y * imageWidth + x) * 4;
        const r = inspectData[idx];
        const g = inspectData[idx + 1];
        const b = inspectData[idx + 2];
        const a = inspectData[idx + 3];
        if (a < 64) {
          continue;
        }
        if (((r ^ 222) & 254) === 0 && ((g ^ 250) & 254) === 0 && ((b ^ 206) & 254) === 0) {
          deface++;
        }
        const tempKey = `${r},${g},${b}`;
        const key = rgbToKey.get(tempKey) ?? "other";
        required++;
        paletteMap.set(key, (paletteMap.get(key) || 0) + 1);
      }
    }
    return {
      required,
      deface
    };
  }

  // src/Template.js
  var Template = class {
    /** The constructor for the {@link Template} class with enhanced pixel tracking.
     * @param {Object} [params={}] - Object containing all optional parameters
     * @param {string} [params.displayName='My template'] - The display name of the template
     * @param {number} [params.sortID=0] - The sort number of the template for rendering priority
     * @param {string} [params.authorID=''] - The user ID of the person who exported the template (prevents sort ID collisions)
     * @param {string} [params.url=''] - The URL to the source image
     * @param {File | ImageBitmap | ImageData} [params.file=null] - The template file (pre-processed File or processed bitmap)
     * @param {Array<number>} [params.coords=null] - The coordinates of the top left corner as (tileX, tileY, pixelX, pixelY)
     * @param {Object} [params.chunked=null] - The affected chunks of the template, and their template for each chunk
     * @param {number} [params.tileSize=1000] - The size of a tile in pixels (assumes square tiles)
     * @param {number} [params.pixelCount=0] - Total number of pixels in the template (calculated automatically during processing)
     * @since 0.65.2
     */
    constructor({
      displayName = "\uB0B4 \uD15C\uD50C\uB9BF",
      sortID = 0,
      authorID = "",
      url = "",
      file = null,
      coords: coords2 = null,
      chunked = null,
      chunkedBuffer = null,
      tileSize = 1e3
    } = {}) {
      this.displayName = displayName;
      this.sortID = sortID;
      this.authorID = authorID;
      this.url = url;
      this.file = file;
      this.coords = coords2;
      this.chunked = chunked;
      this.chunkedBuffer = chunkedBuffer;
      this.tileSize = tileSize;
      this.enabled = true;
      this.pixelCount = 0;
      this.requiredPixelCount = 0;
      this.defacePixelCount = 0;
      this.colorPalette = {};
      this.tilePrefixes = /* @__PURE__ */ new Set();
      this.storageKey = null;
      this.storageTimeString = Date.now().toString();
      this.shreadSize = null;
    }
    customMask(x, y, shreadSize) {
      const center = shreadSize - 1 >> 1;
      return (x % shreadSize == center || y % shreadSize == center) && (x % shreadSize >= center - 1 && x % shreadSize <= center + 1 && y % shreadSize >= center - 1 && y % shreadSize <= center + 1);
    }
    customMaskPoints(shreadSize) {
      const result = [];
      for (let offsetY = 0; offsetY < shreadSize; offsetY++) {
        for (let offsetX = 0; offsetX < shreadSize; offsetX++) {
          if (this.customMask(offsetX, offsetY, shreadSize)) {
            result.push([offsetX, offsetY]);
          }
        }
      }
      return result;
    }
    /** Creates chunks of the template for each tile.
     * 
     * @returns {Object} Collection of template bitmaps & buffers organized by tile coordinates
     * @since 0.65.4
     */
    async createTemplateTiles(anchor) {
      console.log("Template coordinates:", this.coords);
      if (this.shreadSize === null) {
        this.shreadSize = 1;
      }
      const shreadSize = this.shreadSize;
      const bitmap = this.file instanceof ImageBitmap ? this.file : await createImageBitmap(this.file, { "colorSpaceConversion": "none" });
      const imageWidth = bitmap.width;
      const imageHeight = bitmap.height;
      const [tx, ty, px, py] = this.coords;
      let mapX = tx * this.tileSize + px;
      let mapY = ty * this.tileSize + py;
      mapX -= Math.floor((imageWidth - 1) * {
        "l": 0,
        "m": 0.5,
        "r": 1
      }[anchor[0]]);
      mapY -= Math.floor((imageHeight - 1) * {
        "t": 0,
        "m": 0.5,
        "b": 1
      }[anchor[1]]);
      if (mapX < 0) {
        mapX += 2048 * this.tileSize;
      }
      this.coords = [
        Math.floor(mapX / this.tileSize),
        Math.floor(mapY / this.tileSize),
        mapX % this.tileSize,
        mapY % this.tileSize
      ];
      console.log("Top left template coordinates:", this.coords);
      const totalPixels = imageWidth * imageHeight;
      console.log(`Template pixel analysis - Dimensions: ${imageWidth}\xD7${imageHeight} = ${totalPixels.toLocaleString()} pixels`);
      this.pixelCount = totalPixels;
      try {
        let inspectCanvas = new OffscreenCanvas(imageWidth, imageHeight);
        const inspectCtx = inspectCanvas.getContext("2d", { willReadFrequently: true });
        inspectCtx.imageSmoothingEnabled = false;
        inspectCtx.clearRect(0, 0, imageWidth, imageHeight);
        inspectCtx.drawImage(bitmap, 0, 0);
        const inspectData = inspectCtx.getImageData(0, 0, imageWidth, imageHeight).data;
        cleanUpCanvas(inspectCanvas);
        inspectCanvas = null;
        const paletteMap = /* @__PURE__ */ new Map();
        const { required, deface } = countPixels(inspectData, imageWidth, imageHeight, paletteMap);
        this.requiredPixelCount = required;
        this.defacePixelCount = deface;
        const paletteObj = {};
        for (const [key, count] of paletteMap.entries()) {
          paletteObj[key] = { count, enabled: true };
        }
        this.colorPalette = paletteObj;
      } catch (err) {
        this.requiredPixelCount = Math.max(0, this.pixelCount);
        this.defacePixelCount = 0;
        console.warn("Failed to compute required/deface counts. Falling back to total pixels.", err);
      }
      const templateTiles = {};
      const templateTilesBuffers = {};
      let canvas = new OffscreenCanvas(this.tileSize, this.tileSize);
      const context = canvas.getContext("2d", { willReadFrequently: true });
      for (let pixelY = this.coords[3]; pixelY < imageHeight + this.coords[3]; ) {
        const drawSizeY = Math.min(
          this.tileSize - pixelY % this.tileSize,
          // remaining y in this tile
          imageHeight + this.coords[3] - pixelY
          // bottom y
        );
        console.log(`Math.min(${this.tileSize} - (${pixelY} % ${this.tileSize}), ${imageHeight} - (${pixelY - this.coords[3]}))`);
        for (let pixelX = this.coords[2]; pixelX < imageWidth + this.coords[2]; ) {
          console.log(`Pixel X: ${pixelX}
Pixel Y: ${pixelY}`);
          const drawSizeX = Math.min(
            this.tileSize - pixelX % this.tileSize,
            // remaining x in this tile
            imageWidth + this.coords[2] - pixelX
            // right x
          );
          console.log(`Math.min(${this.tileSize} - (${pixelX} % ${this.tileSize}), ${imageWidth} - (${pixelX - this.coords[2]}))`);
          console.log(`Draw Size X: ${drawSizeX}
Draw Size Y: ${drawSizeY}`);
          const canvasWidth = drawSizeX * shreadSize;
          const canvasHeight = drawSizeY * shreadSize;
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          console.log(`Draw X: ${drawSizeX}
Draw Y: ${drawSizeY}
Canvas Width: ${canvasWidth}
Canvas Height: ${canvasHeight}`);
          context.imageSmoothingEnabled = false;
          console.log(`Getting X ${pixelX}-${pixelX + drawSizeX}
Getting Y ${pixelY}-${pixelY + drawSizeY}`);
          context.clearRect(0, 0, canvasWidth, canvasHeight);
          context.drawImage(
            bitmap,
            // Bitmap image to draw
            pixelX - this.coords[2],
            // Coordinate X to draw from
            pixelY - this.coords[3],
            // Coordinate Y to draw from
            drawSizeX,
            // X width to draw from
            drawSizeY,
            // Y height to draw from
            0,
            // Coordinate X to draw at
            0,
            // Coordinate Y to draw at
            drawSizeX * shreadSize,
            // X width to draw at
            drawSizeY * shreadSize
            // Y height to draw at
          );
          const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
          for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
              const pixelIndex = (y * canvasWidth + x) * 4;
              if (((imageData.data[pixelIndex + 0] ^ 222) & 254) === 0 && ((imageData.data[pixelIndex + 1] ^ 250) & 254) === 0 && ((imageData.data[pixelIndex + 2] ^ 206) & 254) === 0) {
                if ((x + y) % 2 === 0) {
                  imageData.data[pixelIndex] = 0;
                  imageData.data[pixelIndex + 1] = 0;
                  imageData.data[pixelIndex + 2] = 0;
                } else {
                  imageData.data[pixelIndex] = 255;
                  imageData.data[pixelIndex + 1] = 255;
                  imageData.data[pixelIndex + 2] = 255;
                }
                imageData.data[pixelIndex + 3] = 32;
              } else if (!this.customMask(x, y, shreadSize)) {
                imageData.data[pixelIndex + 3] = 0;
              }
            }
          }
          console.log(`Shreaded pixels for ${pixelX}, ${pixelY}`, imageData);
          context.putImageData(imageData, 0, 0);
          const templateTileName = `${((this.coords[0] + Math.floor(pixelX / this.tileSize)) % 2048).toString().padStart(4, "0")},${(this.coords[1] + Math.floor(pixelY / this.tileSize)).toString().padStart(4, "0")},${(pixelX % this.tileSize).toString().padStart(3, "0")},${(pixelY % this.tileSize).toString().padStart(3, "0")}`;
          templateTiles[templateTileName] = await createImageBitmap(canvas);
          this.tilePrefixes.add(templateTileName.split(",").slice(0, 2).join(","));
          const canvasBlob = await canvas.convertToBlob();
          const canvasBuffer = await canvasBlob.arrayBuffer();
          const canvasBufferBytes = Array.from(new Uint8Array(canvasBuffer));
          templateTilesBuffers[templateTileName] = uint8ToBase64(canvasBufferBytes);
          console.log(templateTiles);
          pixelX += drawSizeX;
        }
        pixelY += drawSizeY;
      }
      bitmap.close();
      cleanUpCanvas(canvas);
      canvas = null;
      console.log("Template Tiles: ", templateTiles);
      console.log("Template Tiles Buffers: ", templateTilesBuffers);
      return { templateTiles, templateTilesBuffers };
    }
    /** Get the bitmap for a tile key. Supporting memory-saving mode
     * @param {string} tileKey - The tile key
     * @param {boolean} memorySaving - Whether to store the bitmap in memory
     * @since 0.85.33
     */
    async getChunked(tileKey2, memorySaving = false) {
      if (this.chunked[tileKey2] === void 0) {
        return void 0;
      }
      if (this.chunked[tileKey2] !== null) {
        const result = this.chunked[tileKey2];
        if (memorySaving) {
          this.chunked[tileKey2] = null;
        }
        return result;
      }
      const templateBlob = new Blob([this.chunkedBuffer[tileKey2]], { type: "image/png" });
      const templateBitmap = await createImageBitmap(templateBlob);
      if (memorySaving === false) {
        this.chunked[tileKey2] = templateBitmap;
      }
      ;
      return templateBitmap;
    }
  };

  // src/utilsMaptiler.js
  function isMapTilerLoaded() {
    if (isMapFound) return true;
    const myLocationButton = document.querySelector(".right-3>button");
    if (myLocationButton !== null && myLocationButton["__click"] !== void 0) {
      isMapFound = typeof myLocationButton["__click"] === "object" && // not a function yet
      myLocationButton["__click"][3] !== void 0 && myLocationButton["__click"][3]["v"] !== void 0 && myLocationButton["__click"][3]["v"]["addSource"] !== void 0 || document.head.__bmmap !== void 0;
    } else {
      const injector = () => {
        const script2 = document.currentScript;
        if (document.head.__bmmap) {
          script2.setAttribute("bm-result", "true");
          return;
        }
        try {
          const mapAddSource = document.querySelector(".right-3>button")["__click"][3]["v"]["addSource"];
          if (mapAddSource !== void 0) {
            script2.setAttribute("bm-result", "true");
          } else {
            script2.setAttribute("bm-result", "false");
          }
        } catch (e) {
          if (e instanceof TypeError) {
            script2.setAttribute("bm-result", "false");
          }
        }
      };
      const script = document.createElement("script");
      script.textContent = `(${injector})();`;
      document.documentElement?.appendChild(script);
      const result = script.getAttribute("bm-result") === "true";
      script.remove();
      isMapFound = result;
    }
    if (isMapFound) {
      mapFoundHandlers.forEach((handler) => handler());
    }
    return isMapFound;
  }
  function controlMapTiler(func, ...args) {
    if (!isMapTilerLoaded()) {
      doAfterMapFound(() => controlMapTiler(func, ...args));
      return;
    }
    ;
    const myLocationButton = document.querySelector(".right-3>button");
    if (document.head.__bmmap) {
      const map = document.head.__bmmap;
      return func(map, ...args);
    } else if (myLocationButton !== null && myLocationButton["__click"]) {
      const map = myLocationButton["__click"][3]["v"];
      return func(map, ...args);
    } else {
      const getMap = () => {
        return document.head.__bmmap || document.querySelector(".right-3>button")["__click"][3]["v"];
      };
      const injector = (result2) => {
        const script2 = document.currentScript;
        script2.setAttribute("bm-result", JSON.stringify(result2 ?? null));
      };
      const passArgs = args.map((arg) => JSON.stringify(arg)).join(",");
      const script = document.createElement("script");
      script.textContent = `(${injector})((${func})((${getMap})(), ${passArgs}));`;
      document.documentElement?.appendChild(script);
      const result = JSON.parse(script.getAttribute("bm-result"));
      script.remove();
      return result;
    }
  }
  function getCenterGeoCoords() {
    return controlMapTiler((map) => {
      const center = map["transform"]["center"];
      return [center["lat"], center["lng"]];
    });
  }
  function getPixelPerWplacePixel() {
    return controlMapTiler((map) => {
      return map["transform"]["tileSize"] * map["transform"]["scale"] / 2048e3;
    });
  }
  var bmCanvas = {};
  function addTemplateCanvas(sortID, tileName, templateSize, blob, usage) {
    const tileCoords = tileName.split(",").map(Number);
    const [tileWidth, tileHeight] = templateSize;
    const geoCoords1 = coordsTileCoordsToGeoCoords(
      [tileCoords[0], tileCoords[1]],
      [tileCoords[2], tileCoords[3]],
      false
    );
    const geoCoords2 = coordsTileCoordsToGeoCoords(
      [tileCoords[0], tileCoords[1]],
      [tileCoords[2] + tileWidth, tileCoords[3] + tileHeight],
      false
    );
    if (!bmCanvas[usage]) {
      bmCanvas[usage] = {};
    }
    ;
    let prefix = "BM";
    const sourceID = `${prefix}-${usage}-${tileName}-${sortID}`;
    bmCanvas[usage][sourceID] = [geoCoords1, geoCoords2];
    const blobUrl = URL.createObjectURL(blob);
    return controlMapTiler(async (map, sourceID2, tileName2, templateSize2, blobUrl2, geoCoords12, geoCoords22, usage2, bmCanvas2) => {
      document.head.__bmCanvas = bmCanvas2;
      const overlayImg = document.createElement("img");
      overlayImg.src = blobUrl2;
      await new Promise((resolve) => overlayImg.addEventListener("load", () => resolve(overlayImg)));
      const currentCanvas = document.getElementById(sourceID2);
      if (currentCanvas) {
        currentCanvas.width = 0;
        currentCanvas.height = 0;
        currentCanvas.remove();
      }
      ;
      const canvas = document.createElement("canvas");
      canvas.id = sourceID2;
      canvas.style.display = "none";
      document.body.appendChild(canvas);
      canvas.width = overlayImg.naturalWidth, canvas.height = overlayImg.naturalHeight;
      const overlayContext = canvas.getContext("2d");
      overlayContext.drawImage(overlayImg, 0, 0);
      URL.revokeObjectURL(blobUrl2);
      if (map["getLayer"](sourceID2)) {
        map["removeLayer"](sourceID2);
      }
      ;
      if (map["getSource"](sourceID2)) {
        map["removeSource"](sourceID2);
      }
      ;
      map["addSource"](sourceID2, {
        "type": "canvas",
        "canvas": sourceID2,
        "coordinates": [
          [geoCoords12[1], geoCoords12[0]],
          [geoCoords22[1], geoCoords12[0]],
          [geoCoords22[1], geoCoords22[0]],
          [geoCoords12[1], geoCoords22[0]]
        ]
      });
      map["addLayer"]({
        "id": sourceID2,
        "source": sourceID2,
        "type": "raster",
        "paint": {
          "raster-resampling": "nearest",
          "raster-opacity": 1
        }
      });
      const layers = map["getLayersOrder"]();
      const hoverLayerName = "pixel-hover";
      const prefix2 = "bm";
      const nextLayer = layers.find((layer) => usage2 === "overlay" && layer.startsWith(prefix2 + "-error-") || layer === hoverLayerName + "-ghost");
      console.log("moveLayer", sourceID2, nextLayer);
      map["moveLayer"](sourceID2, nextLayer);
      if (!map["getLayer"](hoverLayerName + "-ghost")) {
        map["addLayer"]({
          "id": hoverLayerName + "-ghost",
          "type": "raster",
          "source": hoverLayerName,
          "paint": {
            "raster-resampling": "nearest",
            "raster-opacity": 0.4
          }
        });
      } else {
        const layers2 = map["getLayersOrder"]();
        if (layers2 && layers2.length && layers2[layers2.length - 1] !== hoverLayerName + "-ghost") {
          console.log("moveLayer-1", hoverLayerName + "-ghost");
          map["moveLayer"](hoverLayerName + "-ghost");
        }
      }
    }, sourceID, tileName, templateSize, blobUrl, geoCoords1, geoCoords2, usage, bmCanvas);
  }
  function removeLayer(usage = null, sortID = null) {
    const matchSuffix = sortID ? "-" + sortID : "";
    const toRemove = [];
    const removeUsages = usage ? [usage] : ["overlay", "error"];
    removeUsages.forEach((usage2) => {
      Object.keys(bmCanvas[usage2] ?? {}).forEach((sourceID) => {
        if (sourceID.endsWith(matchSuffix)) {
          delete bmCanvas[usage2][sourceID];
          toRemove.push(sourceID);
        }
      });
    });
    return controlMapTiler((map, toRemove2, bmCanvas2) => {
      document.head.__bmCanvas = bmCanvas2;
      toRemove2.forEach((sourceID) => {
        if (map["getLayer"](sourceID)) {
          map["removeLayer"](sourceID);
        }
        ;
        if (map["getSource"](sourceID)) {
          map["removeSource"](sourceID);
        }
        ;
        const canvas = document.getElementById(sourceID);
        if (canvas) {
          canvas.width = 0;
          canvas.height = 0;
          canvas.remove();
        }
        ;
      });
    }, toRemove, bmCanvas);
  }
  function forceRefreshTiles() {
    try {
      return controlMapTiler((map) => {
        return map["refreshTiles"]("pixel-art-layer");
      });
    } catch (ignored) {
    }
    ;
  }
  var themeList = {
    "liberty": ["Liberty (Default)", ""],
    "bright": ["Bright", ""],
    "positron": ["Positron", ""],
    "dark": ["Dark", "dark"],
    "fiord": ["Fiord (Dark)", "dark"],
    "halloween": ["Fiord (Halloween)", "halloween"]
  };
  function setTheme(themeName) {
    if (!themeList[themeName]) return;
    const dataTheme = themeList[themeName][1];
    document.documentElement.dataset["theme"] = dataTheme;
    return controlMapTiler((map, themeName2, bmCanvas2) => {
      document.head.__bmCanvas = bmCanvas2;
      const artLayerName = "pixel-art-layer";
      const hoverLayerName = "pixel-hover";
      let hoverLayerSource = map["getSource"](hoverLayerName);
      const restoreLayers = async () => {
        if (!map["getSource"](artLayerName)) {
          map["addSource"](artLayerName, {
            "type": "raster",
            "tiles": ["https://backend.wplace.live/files/s0/tiles/{x}/{y}.png"],
            "minzoom": 11,
            "maxzoom": 11,
            "tileSize": window.innerWidth > 640 ? 550 : 400
          });
        }
        ;
        if (!map["getLayer"](artLayerName)) {
          map["addLayer"]({
            "id": artLayerName,
            "type": "raster",
            "source": artLayerName,
            "paint": {
              "raster-resampling": "nearest",
              "raster-opacity": 1
            }
          });
        }
        ;
        if (!map["getSource"](hoverLayerName)) {
          if (hoverLayerSource) {
            map["addSource"](hoverLayerName, {
              "type": "canvas",
              "canvas": hoverLayerSource.canvas,
              "coordinates": hoverLayerSource.coordinates
            });
          } else {
            const hoverCanvas = document.createElement("canvas");
            const hoverImg = document.createElement("img");
            hoverImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAAAAACoWZBhAAAAAXNSR0IArs4c6QAAACpJREFUeNpj+AsEZ86ASIa/DAwMZ84ACRDzDBigMs/AARITq1oUwxBWAADaREUdDMswKwAAAABJRU5ErkJggg==";
            await new Promise((resolve) => hoverImg.addEventListener("load", () => resolve(hoverImg)));
            hoverCanvas.width = hoverImg.naturalWidth, hoverCanvas.height = hoverImg.naturalHeight;
            const hoverContext = hoverCanvas.getContext("2d");
            hoverContext.drawImage(hoverImg, 0, 0);
            const epsilon = 1e-5;
            const bounds = [
              [0, 0],
              [epsilon, 0],
              [epsilon, -epsilon],
              [0, -epsilon]
            ];
            hoverLayerSource = {
              "type": "canvas",
              "canvas": hoverCanvas,
              "coordinates": bounds
            };
            map["addSource"](hoverLayerName, hoverLayerSource);
          }
          ;
        }
        ;
        if (!map["getLayer"](hoverLayerName)) {
          map["addLayer"]({
            "id": hoverLayerName,
            "type": "raster",
            "source": hoverLayerName,
            "paint": {
              "raster-resampling": "nearest",
              "raster-opacity": 0.4
            }
          });
        } else {
          let prefix = "BM";
          const layers = map["getLayersOrder"]();
          const nextLayer = layers.find((layer) => layer.startsWith(prefix + "-overlay-") || layer.startsWith(prefix + "-error-") || layer === hoverLayerName + "-ghost");
          const thisIndex = layers.indexOf(hoverLayerName);
          const nextIndex = nextLayer === void 0 ? layers.length : layers.indexOf(nextLayer);
          if (thisIndex + 1 !== nextIndex) {
            console.log("moveLayer", hoverLayerName, nextLayer);
            map["moveLayer"](hoverLayerName, nextLayer);
          }
        }
        ;
        if (!map["getLayer"](hoverLayerName + "-ghost")) {
          map["addLayer"]({
            "id": hoverLayerName + "-ghost",
            "type": "raster",
            "source": hoverLayerName,
            "paint": {
              "raster-resampling": "nearest",
              "raster-opacity": 0.4
            }
          });
        } else {
          const layers = map["getLayersOrder"]();
          if (layers && layers.length && layers[layers.length - 1] !== hoverLayerName + "-ghost") {
            console.log("moveLayer", hoverLayerName + "-ghost");
            map["moveLayer"](hoverLayerName + "-ghost");
          }
        }
        const bmCanvas3 = document.head.__bmCanvas;
        if (bmCanvas3) {
          ["overlay", "error"].forEach((usage) => {
            if (bmCanvas3[usage]) {
              let prefix = "BM";
              const layers = map["getLayersOrder"]();
              const nextLayer = layers.find((layer) => usage === "overlay" && layer.startsWith(prefix + "-error-") || layer === hoverLayerName + "-ghost");
              console.log("nextLayer", nextLayer);
              Object.entries(bmCanvas3[usage]).forEach(([sourceID, [geoCoords1, geoCoords2]]) => {
                if (!map["getSource"](sourceID)) {
                  map["addSource"](sourceID, {
                    "type": "canvas",
                    "canvas": sourceID,
                    "coordinates": [
                      [geoCoords1[1], geoCoords1[0]],
                      [geoCoords2[1], geoCoords1[0]],
                      [geoCoords2[1], geoCoords2[0]],
                      [geoCoords1[1], geoCoords2[0]]
                    ]
                  });
                }
                ;
                console.log("layers", layers.slice(-5));
                if (!map["getLayer"](sourceID)) {
                  map["addLayer"]({
                    "id": sourceID,
                    "type": "raster",
                    "source": sourceID,
                    "paint": {
                      "raster-resampling": "nearest",
                      "raster-opacity": 1
                    }
                  });
                  console.log("moveLayer", sourceID, nextLayer);
                  map["moveLayer"](sourceID, nextLayer);
                } else {
                  const thisIndex = layers.indexOf(sourceID);
                  const nextIndex = nextLayer === void 0 ? layers.length : layers.indexOf(nextLayer);
                  if (thisIndex > nextIndex) {
                    console.log("moveLayer", sourceID, nextLayer);
                    map["moveLayer"](sourceID, nextLayer);
                  }
                }
                ;
              });
            }
            ;
          });
        }
      };
      const restoreLayersName = "restoreLayers";
      const existingRestoreLayers = (map["_listeners"]["styledata"] ?? []).find((listener) => listener.name === restoreLayersName);
      if (!existingRestoreLayers) {
        restoreLayers.name = restoreLayersName;
        map["on"]("styledata", restoreLayers);
      }
      ;
      const allianceOrRankingButton = document.querySelector(".flex>.btn.btn-square.relative.shadow-md");
      if (!allianceOrRankingButton) {
        const closeButton = document.querySelector(".gap-1+.btn-circle");
        if (closeButton) {
          closeButton.click();
        }
      }
      map["setStyle"]("https://maps.wplace.live/styles/" + themeName2, {});
      return null;
    }, themeName === "halloween" ? "fiord" : themeName, bmCanvas);
  }
  var overrideRandom = {
    "data": null
  };
  async function teleportToGeoCoords(lat, lng, noZoom = false) {
    let smooth = false;
    if (isMapTilerLoaded()) {
      const funcName = smooth ? "flyTo" : "jumpTo";
      controlMapTiler((map, lat2, lng2, funcName2, noZoom2) => {
        const payload = { "center": [lng2, lat2] };
        if (!noZoom2) {
          payload["zoom"] = 16;
        }
        ;
        map[funcName2](payload);
      }, lat, lng, funcName, noZoom ?? false);
      const allianceOrRankingButton = document.querySelector(".flex>.btn.btn-square.relative.shadow-md");
      if (allianceOrRankingButton) {
        const canvas = document.querySelector("canvas.maplibregl-canvas");
        const ev = new MouseEvent("click", {
          "bubbles": true,
          "cancelable": true,
          "clientX": canvas.offsetWidth / 2,
          "clientY": canvas.offsetHeight / 2,
          "button": 0
        });
        canvas.dispatchEvent(ev);
      }
    } else {
      const randomTeleportBtn = document.querySelector(".mb-2>.btn-ghost");
      if (randomTeleportBtn !== void 0) {
        overrideRandom["data"] = coordsGeoCoordsToTileCoords(lat, lng, false);
        randomTeleportBtn.click();
      } else {
        const url = `https://wplace.live/?lat=${lat}&lng=${lng}&zoom=16`;
        window.location.href = url;
      }
    }
  }
  async function teleportToTileCoords(coordsTile, coordsPixel, noZoom = false) {
    const geoCoords = coordsTileCoordsToGeoCoords(coordsTile, coordsPixel);
    await teleportToGeoCoords(geoCoords[0], geoCoords[1], noZoom);
  }
  function coordsTileCoordsToGeoCoords(coordsTile, coordsPixel, center = true) {
    const offset = center ? 0.5 : 0;
    const relX = (coordsTile[0] * 1e3 + coordsPixel[0] + offset) / (2048 * 1e3);
    const relY = 1 - (coordsTile[1] * 1e3 + coordsPixel[1] + offset) / (2048 * 1e3);
    return [
      360 * Math.atan(Math.exp((relY * 2 - 1) * Math.PI)) / Math.PI - 90,
      relX * 360 - 180
    ];
  }
  function coordsGeoCoordsToTileCoords(latitude, longitude, truncate = true) {
    const relX = (longitude + 180) / 360;
    const relY = (Math.log(Math.tan((90 + latitude) * Math.PI / 360)) / Math.PI + 1) / 2;
    const tileX = relX * 2048 * 1e3;
    const tileY = (1 - relY) * 2048 * 1e3;
    const coordsPixel = truncate ? [
      Math.floor(tileX % 1e3),
      Math.floor(tileY % 1e3)
    ] : [
      tileX % 1e3,
      tileY % 1e3
    ];
    return [
      [
        Math.floor(tileX / 1e3),
        Math.floor(tileY / 1e3)
      ],
      coordsPixel
    ];
  }
  function setZoom(zoom) {
    return controlMapTiler((map, zoom2) => {
      return map["setZoom"](zoom2);
    }, zoom);
  }
  var isMapFound = false;
  var mapFoundHandlers = [];
  function doAfterMapFound(func) {
    if (isMapFound) return func();
    mapFoundHandlers.push(func);
  }
  function panMap(offset) {
    controlMapTiler((map, offset2) => {
      map["panBy"](offset2, {
        "duration": 0
      });
    }, offset);
  }
  function getCurrentTileSize() {
    var tileSize = controlMapTiler((map) => {
      var source = map.getSource("pixel-art-layer");
      if (!source) return;
      return source.tileSize;
    });
    if (tileSize === null) {
      return window.innerWidth > 640 ? 550 : 400;
    }
    return tileSize;
  }

  // src/templateManager.js
  var _TemplateManager_instances, loadTemplate_fn, recoverShreadSize_fn, parseBlueMarble_fn, parseOSU_fn;
  var TemplateManager = class {
    /** The constructor for the {@link TemplateManager} class.
     * @since 0.55.8
     */
    constructor(name2, version2, overlay) {
      __privateAdd(this, _TemplateManager_instances);
      this.name = name2;
      this.version = version2;
      this.overlay = overlay;
      this.templatesVersion = "1.0.0";
      this.userID = null;
      this.encodingBase = "!#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";
      this.tileSize = 1e3;
      this.drawMult = testCanvasSize(5e3, 5e3) ? 5 : 4;
      this.drawMultCenter = this.drawMult - 1 >> 1;
      this.canvasTemplate = null;
      this.canvasTemplateZoomed = null;
      this.canvasTemplateID = "bm-canvas";
      this.canvasMainID = "div#map canvas.maplibregl-canvas";
      this.template = null;
      this.templatesArray = [];
      this.templatesJSON = null;
      this.tileProgress = /* @__PURE__ */ new Map();
      this.extraColorsBitmap = 0;
      this.completedColorsBitmapLo = 0;
      this.completedColorsBitmapHi = 0;
      this.userSettings = {};
      this.hideLockedColors = false;
      this.largestSeenSortID = 0;
    }
    /** Retrieves the pixel art canvas.
     * If the canvas has been updated/replaced, it retrieves the new one.
     * @param {string} selector - The CSS selector to use to find the canvas.
     * @returns {HTMLCanvasElement|null} The canvas as an HTML Canvas Element, or null if the canvas does not exist
     * @since 0.58.3
     * @deprecated Not in use since 0.63.25
     */
    getCanvas() {
      if (document.body.contains(this.canvasTemplate)) {
        return this.canvasTemplate;
      }
      document.getElementById(this.canvasTemplateID)?.remove();
      const canvasMain = document.querySelector(this.canvasMainID);
      const canvasTemplateNew = document.createElement("canvas");
      canvasTemplateNew.id = this.canvasTemplateID;
      canvasTemplateNew.className = "maplibregl-canvas";
      canvasTemplateNew.style.position = "absolute";
      canvasTemplateNew.style.top = "0";
      canvasTemplateNew.style.left = "0";
      canvasTemplateNew.style.height = `${canvasMain?.clientHeight * (window.devicePixelRatio || 1)}px`;
      canvasTemplateNew.style.width = `${canvasMain?.clientWidth * (window.devicePixelRatio || 1)}px`;
      canvasTemplateNew.height = canvasMain?.clientHeight * (window.devicePixelRatio || 1);
      canvasTemplateNew.width = canvasMain?.clientWidth * (window.devicePixelRatio || 1);
      canvasTemplateNew.style.zIndex = "8999";
      canvasTemplateNew.style.pointerEvents = "none";
      canvasMain?.parentElement?.appendChild(canvasTemplateNew);
      this.canvasTemplate = canvasTemplateNew;
      window.addEventListener("move", this.onMove);
      window.addEventListener("zoom", this.onZoom);
      window.addEventListener("resize", this.onResize);
      return this.canvasTemplate;
    }
    /** Creates the JSON object to store templates in
     * @returns {{ whoami: string, scriptVersion: string, schemaVersion: string, templates: Object }} The JSON object
     * @since 0.65.4
     */
    async createJSON() {
      return {
        "whoami": this.name.replace(" ", ""),
        // Name of userscript without spaces
        "scriptVersion": this.version,
        // Version of userscript
        "schemaVersion": this.templatesVersion,
        // Version of JSON schema
        "templates": {}
        // The templates
      };
    }
    /** Creates the template from the inputed file blob
     * @param {File | ImageBitmap | ImageData} file - The file blob to create a template from
     * @param {string} name - The display name of the template
     * @param {Array<number, number, number, number>} coords - The coordinates of the top left corner of the template
     * @param {string} anchor - The anchor of the template
     * @since 0.65.77
     */
    async createTemplate(file, name2, coords2, anchor) {
      if (!this.templatesJSON) {
        this.templatesJSON = await this.createJSON();
        console.log(`Creating JSON...`);
      }
      this.overlay.handleDisplayStatus(`${coords2.join(", ")}\uC5D0 \uD15C\uD50C\uB9BF \uC0DD\uC131 \uC911...`);
      const authorID = numberToEncoded(this.userID || 0, this.encodingBase);
      const template = new Template({
        displayName: name2,
        sortID: this.largestSeenSortID + 1,
        // Uncomment this to enable multiple templates (1/2)
        authorID,
        file,
        coords: coords2,
        tileSize: this.tileSize
      });
      this.largestSeenSortID++;
      const { templateTiles, templateTilesBuffers } = await template.createTemplateTiles(anchor || this.getAnchor());
      const toggleStatus = this.getPaletteToggledStatus();
      for (const key of Object.keys(template.colorPalette)) {
        if (toggleStatus[key] !== void 0) {
          template.colorPalette[key].enabled = toggleStatus[key];
        }
      }
      if (this.isMemorySavingModeOn()) {
        template.chunked = {};
        Object.entries(templateTiles).forEach(([key, value]) => {
          template.chunked[key] = null;
          value.close();
        });
      } else {
        template.chunked = templateTiles;
      }
      template.chunkedBuffer = Object.fromEntries(Object.entries(
        templateTilesBuffers
      ).map(([key, value]) => [key, base64ToUint8(value)]));
      const storageKey = `${template.sortID} ${template.authorID}`;
      template.storageKey = storageKey;
      this.templatesJSON.templates[storageKey] = {
        "name": template.displayName,
        // Display name of template
        "coords": template.coords.join(", "),
        // The coords of the template
        "enabled": true,
        "tiles": templateTilesBuffers,
        // Stores the chunked tile buffers
        "palette": template.colorPalette,
        // Persist palette and enabled flags
        "shreadSize": template.shreadSize
        // Record shread size of the created template
      };
      this.templatesArray.push(template);
      this.clearTileProgress(template);
      const pixelCountFormatted = new Intl.NumberFormat().format(template.pixelCount);
      this.overlay.handleDisplayStatus(`${coords2.join(", ")}\uC5D0 \uD15C\uD50C\uB9BF\uC774 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uCD1D \uD53D\uC140 \uC218: ${pixelCountFormatted}`);
      this.requestListRebuild();
      this.createOverlayOnMap(template.sortID);
      console.log(Object.keys(this.templatesJSON.templates).length);
      console.log(this.templatesJSON);
      console.log(this.templatesArray);
      await this.storeTemplates();
    }
    requestListRebuild() {
      try {
        window.postMessage({ source: "blue-marble", bmEvent: "bm-rebuild-color-list" }, "*");
      } catch (_) {
      }
      try {
        window.postMessage({ source: "blue-marble", bmEvent: "bm-rebuild-template-list" }, "*");
      } catch (_) {
      }
    }
    requestEventRebuild() {
      if (!this.isEventEnabled()) return;
      try {
        const templateUI = document.querySelector("#bm-contain-eventlist");
        if (templateUI) {
          templateUI.style.display = "";
        }
        window.postMessage({ source: "blue-marble", bmEvent: "bm-rebuild-event-list" }, "*");
      } catch (_) {
      }
    }
    /** Stores the JSON object of the loaded templates into TamperMonkey (GreaseMonkey) storage.
     * @since 0.72.7
     */
    async storeTemplates() {
      await GM.setValue("bmTemplates", JSON.stringify(this.templatesJSON));
    }
    /** Deletes a template from the JSON object.
     * Also delete's the corrosponding {@link Template} class instance
     */
    async deleteTemplate(storageKey) {
      const targetTemplate = this.templatesArray.find((template) => template.storageKey === storageKey);
      if (targetTemplate === void 0) return;
      const removeIndex = this.templatesArray.indexOf(targetTemplate);
      this.templatesArray.splice(removeIndex, 1);
      const templates = this.templatesJSON?.templates;
      if (templates && templates?.[storageKey]) {
        delete templates[storageKey];
      }
      this.clearTileProgress(targetTemplate);
      removeLayer(null, targetTemplate.sortID);
      this.overlay.handleDisplayStatus(`${targetTemplate.displayName} \uD15C\uD50C\uB9BF\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4!`);
      await this.storeTemplates();
      this.requestListRebuild();
    }
    /** Disables the template from view
     */
    async disableTemplate() {
      if (!this.templatesJSON) {
        this.templatesJSON = await this.createJSON();
        console.log(`Creating JSON...`);
      }
    }
    /** Draws all templates on the specified tile.
     * This method handles the rendering of template overlays on individual tiles.
     * @param {File} tileBlob - The pixels that are placed on a tile
     * @param {Array<number>} tileCoords - The tile coordinates [x, y]
     * @since 0.65.77
     */
    async countTemplateStatus(tileBlob, tileCoords) {
      const timeStart = performance.now();
      const tileCoordsPadded = calculateTileKey(tileCoords);
      console.log(`Start checking touching templates...`, performance.now() - timeStart + " ms");
      const involvedTemplates = this.getInvolvedTemplates(tileCoords);
      if (involvedTemplates.length === 0) return;
      const currentMemorySavingMode = this.isMemorySavingModeOn();
      const templatesTilesToHandle = involvedTemplates.map((template) => {
        const matchingTiles = Object.keys(template.chunked).filter(
          (tile) => tile.startsWith(tileCoordsPadded)
        );
        if (matchingTiles.length === 0) return null;
        const tileKey2 = matchingTiles[0];
        const coords2 = tileKey2.split(",");
        return {
          template,
          tileKey: tileKey2,
          tileCoords: [+coords2[0], +coords2[1]],
          pixelCoords: [+coords2[2], +coords2[3]]
        };
      }).filter(Boolean);
      console.log(templatesTilesToHandle, performance.now() - timeStart + " ms");
      const templateCount = templatesTilesToHandle?.length || 0;
      console.log(`templateCount = ${templateCount}`);
      const enabledTemplateCount = this.templatesArray.filter((t) => t.enabled).length;
      const errorMapOnlyEnabledColors = this.isErrorMapShown() && this.isErrorMapOnlyEnabledColorsShown();
      const displayedColors = errorMapOnlyEnabledColors ? new Set(this.getDisplayedColorsSorted()) : null;
      let paintedCount = 0;
      let wrongCount = 0;
      let requiredCount = 0;
      let paletteStats = {};
      let templateStats = {};
      const tileBitmap = await createImageBitmap(tileBlob);
      const isErrorMapShown = this.isErrorMapShown();
      const tileSize = this.tileSize;
      let canvas = new OffscreenCanvas(tileSize, tileSize);
      const context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;
      context.beginPath();
      context.rect(0, 0, tileSize, tileSize);
      context.clip();
      context.clearRect(0, 0, tileSize, tileSize);
      context.drawImage(tileBitmap, 0, 0, tileSize, tileSize);
      tileBitmap.close();
      const tilePixels = context.getImageData(0, 0, tileSize, tileSize).data;
      for (const templateTile of templatesTilesToHandle) {
        const template = templateTile.template;
        const drawMultTemplate = template.shreadSize;
        const drawMultCenterTemplate = drawMultTemplate - 1 >> 1;
        const templateKey = template.storageKey;
        const templateTileBitmap = await template.getChunked(templateTile.tileKey, currentMemorySavingMode);
        console.log(`Template:`);
        console.log(templateTile);
        console.log(performance.now() - timeStart + " ms");
        const templateWidth = templateTileBitmap.width;
        const templateHeight = templateTileBitmap.height;
        let templateCanvas = new OffscreenCanvas(templateWidth, templateHeight);
        const templateContext = templateCanvas.getContext("2d", { willReadFrequently: true });
        templateContext.imageSmoothingEnabled = false;
        templateContext.clearRect(0, 0, templateWidth, templateHeight);
        templateContext.drawImage(templateTileBitmap, 0, 0);
        const templateData = templateContext.getImageData(0, 0, templateWidth, templateHeight).data;
        const errorWidth = templateWidth / drawMultTemplate;
        const errorHeight = templateHeight / drawMultTemplate;
        let errorCanvas = null;
        let errorContext = null;
        let errorImage = null;
        let errorData = null;
        const templateTileEnabled = templateTile.template.enabled ?? true;
        if (isErrorMapShown && templateTileEnabled) {
          errorCanvas = new OffscreenCanvas(errorWidth, errorHeight);
          errorContext = errorCanvas.getContext("2d", { willReadFrequently: true });
          errorContext.clearRect(0, 0, errorWidth, errorHeight);
          errorImage = errorContext.getImageData(0, 0, errorWidth, errorHeight);
          errorData = errorImage.data;
        }
        const offsetXResult = templateTile.pixelCoords[0];
        const offsetYResult = templateTile.pixelCoords[1];
        try {
          for (let yt = drawMultCenterTemplate, gyr = offsetYResult, ye = 0; yt < templateHeight; yt += drawMultTemplate, gyr++, ye++) {
            for (let xt = drawMultCenterTemplate, gxr = offsetXResult, xe = 0; xt < templateWidth; xt += drawMultTemplate, gxr++, xe++) {
              if (gxr < 0 || gyr < 0 || gxr >= tileSize || gyr >= tileSize) {
                continue;
              }
              const templatePixelCenter = (yt * templateWidth + xt) * 4;
              const templatePixelCenterRed = templateData[templatePixelCenter];
              const templatePixelCenterGreen = templateData[templatePixelCenter + 1];
              const templatePixelCenterBlue = templateData[templatePixelCenter + 2];
              const templatePixelCenterAlpha = templateData[templatePixelCenter + 3];
              const realPixelCenter = (gyr * tileSize + gxr) * 4;
              const realPixelRed = tilePixels[realPixelCenter];
              const realPixelCenterGreen = tilePixels[realPixelCenter + 1];
              const realPixelCenterBlue = tilePixels[realPixelCenter + 2];
              const realPixelCenterAlpha = tilePixels[realPixelCenter + 3];
              let isPainted = false;
              const errorIndex = (ye * errorWidth + xe) * 4;
              if (templatePixelCenterAlpha < 64) {
                try {
                  const key = rgbToKey.get(`${realPixelRed},${realPixelCenterGreen},${realPixelCenterBlue}`) ?? "other";
                  if (realPixelCenterAlpha >= 64 && key !== "other") {
                    wrongCount++;
                  }
                } catch (ignored) {
                }
                continue;
              } else {
                requiredCount++;
              }
              const colorKey = rgbToKey.get(`${templatePixelCenterRed},${templatePixelCenterGreen},${templatePixelCenterBlue}`) ?? "other";
              const shouldThisColorInvolvedInErrorMap = !errorMapOnlyEnabledColors || displayedColors.has(colorKey);
              if (realPixelCenterAlpha < 64) {
                if (templatePixelCenterAlpha !== 0) {
                  if (isErrorMapShown && templateTileEnabled && shouldThisColorInvolvedInErrorMap) {
                    errorData[errorIndex] = 128;
                    errorData[errorIndex + 1] = 128;
                    errorData[errorIndex + 2] = 128;
                    errorData[errorIndex + 3] = 200;
                  }
                }
              } else if (((realPixelRed ^ templatePixelCenterRed) & 254) === 0 && ((realPixelCenterGreen ^ templatePixelCenterGreen) & 254) === 0 && ((realPixelCenterBlue ^ templatePixelCenterBlue) & 254) === 0) {
                paintedCount++;
                isPainted = true;
                if (paletteStats[colorKey] === void 0) {
                  paletteStats[colorKey] = {
                    painted: 1,
                    paintedAndEnabled: +templateTileEnabled,
                    missing: 0,
                    // examples: [ ],
                    examplesEnabled: []
                  };
                } else {
                  paletteStats[colorKey].painted++;
                  if (templateTileEnabled) {
                    paletteStats[colorKey].paintedAndEnabled++;
                  }
                }
                if (templateStats[templateKey] === void 0) {
                  templateStats[templateKey] = {
                    painted: 1
                  };
                } else {
                  templateStats[templateKey].painted++;
                }
                if (isErrorMapShown && templateTileEnabled && shouldThisColorInvolvedInErrorMap) {
                  errorData[errorIndex] = 0;
                  errorData[errorIndex + 1] = 128;
                  errorData[errorIndex + 2] = 0;
                  errorData[errorIndex + 3] = 160;
                }
              } else {
                wrongCount++;
                if (isErrorMapShown && templateTileEnabled && shouldThisColorInvolvedInErrorMap) {
                  errorData[errorIndex] = 255;
                  errorData[errorIndex + 1] = 0;
                  errorData[errorIndex + 2] = 0;
                  errorData[errorIndex + 3] = 224;
                }
              }
              if (!isPainted) {
                const key = rgbToKey.get(`${templatePixelCenterRed},${templatePixelCenterGreen},${templatePixelCenterBlue}`) ?? "other";
                const example = [
                  // use this tile as example
                  tileCoords,
                  [gxr, gyr]
                ];
                if (paletteStats[key] === void 0) {
                  paletteStats[key] = {
                    painted: 0,
                    paintedAndEnabled: 0,
                    missing: 1,
                    // examples: [ example ],
                    examplesEnabled: []
                  };
                  if (templateTileEnabled) {
                    paletteStats[key].examplesEnabled.push(example);
                  }
                } else {
                  const exampleMax = this.userSettings?.smartPlace ?? false ? 1 << 20 : 1e4;
                  paletteStats[key].missing++;
                  if (templateTileEnabled) {
                    if (paletteStats[key].examplesEnabled.length < exampleMax) {
                      paletteStats[key].examplesEnabled.push(example);
                    } else if (Math.random() * paletteStats[key].examplesEnabled.length < exampleMax) {
                      const replaceIndex = Math.floor(Math.random() * exampleMax);
                      paletteStats[key].examplesEnabled[replaceIndex] = example;
                    }
                  }
                }
              }
            }
          }
          if (isErrorMapShown && templateTileEnabled) {
            errorContext.putImageData(errorImage, 0, 0);
            const errorBlob = await errorCanvas.convertToBlob({ type: "image/png" });
            addTemplateCanvas(template.sortID, templateTile.tileKey, [errorWidth, errorHeight], errorBlob, "error");
            cleanUpCanvas(errorCanvas);
            errorCanvas = null;
          }
        } catch (exception) {
          console.warn("Failed to compute per-tile painted/wrong stats:", exception);
        }
        cleanUpCanvas(templateCanvas);
        templateCanvas = null;
        if (currentMemorySavingMode) {
          templateTileBitmap.close();
        }
      }
      console.log("Saving per-tile stats...", performance.now() - timeStart + " ms");
      if (templateCount === 0) {
        if (this.tileProgress.has(tileCoordsPadded)) {
          this.tileProgress.delete(tileCoordsPadded);
        }
      } else {
        this.tileProgress.set(tileCoordsPadded, {
          painted: paintedCount,
          required: requiredCount,
          wrong: wrongCount,
          palette: paletteStats,
          template: templateStats,
          outdated: false
          // set to true if the tile is expected to have updated
        });
      }
      let aggPainted = 0;
      const templateEnabledState = Object.fromEntries((this?.templatesArray ?? []).map((t) => [t.storageKey, t.enabled]));
      for (const stats of this.tileProgress.values()) {
        Object.entries(stats.template).forEach(([storageKey, content]) => {
          if (!templateEnabledState[storageKey]) return;
          aggPainted += content.painted || 0;
        });
      }
      const totalRequired = this.templatesArray.reduce((sum, t) => sum + (t.enabled ? t.requiredPixelCount || t.pixelCount || 0 : 0), 0);
      const paintedStr = new Intl.NumberFormat().format(aggPainted);
      const requiredStr = new Intl.NumberFormat().format(totalRequired);
      const wrongStr = new Intl.NumberFormat().format(totalRequired - aggPainted);
      this.overlay.handleDisplayStatus(
        `${enabledTemplateCount}\uAC1C\uC758 \uD15C\uD50C\uB9BF\uC744 \uD45C\uC2DC \uC911\uC785\uB2C8\uB2E4.
\uCE60\uD574\uC9D0: ${paintedStr} / ${requiredStr} \u2022 \uC798\uBABB\uB428: ${wrongStr}`
      );
      console.log("Cleaning up...", performance.now() - timeStart + " ms");
      cleanUpCanvas(canvas);
      window.buildColorFilterList();
      window.buildTemplateFilterList();
      console.log("Finish...", performance.now() - timeStart + " ms");
      return tileBlob;
    }
    /** Add the template overlay layer to the map
     * @param {number?} sortID
     * @since 0.86.1
     */
    async createOverlayOnMap(sortID = null) {
      const timeStart = performance.now();
      if (this.areTemplatesHidden()) {
        return;
      }
      console.log(`Start creating overlay for template ${sortID}...`, performance.now() - timeStart + " ms");
      const currentMemorySavingMode = this.isMemorySavingModeOn();
      const templates = (this.templatesArray ?? []).filter((t) => t.enabled && (sortID === null || t.sortID == sortID));
      for (const template of templates) {
        console.log(`Template:`);
        console.log(template);
        if (!template.enabled) return;
        const displayedColors = this.getDisplayedColorsSorted();
        const displayedColorSet = new Set(displayedColors);
        const hasColorDisabled = displayedColors.length !== Object.keys(this.getPaletteToggledStatus()).length;
        const allColorsDisabled = displayedColors.length === 0;
        if (allColorsDisabled) {
          removeLayer("overlay", template.sortID);
          continue;
        }
        ;
        const templateMode = this.getTemplateMode();
        for (const tileKey2 of Object.keys(template.chunked)) {
          console.log(`Handling tile chunk ${tileKey2}...`, performance.now() - timeStart + " ms");
          const drawMultTemplate = template.shreadSize;
          const drawMultCenterTemplate = template.shreadSize - 1 >> 1;
          const drawMultResult = templateMode === 1 ? 3 : templateMode === 3 ? 3 : this.drawMult;
          const maskPointsOdd = templateMode === 1 ? [[1, 1]] : templateMode === 3 ? [[0, 1], [1, 1], [2, 1]] : template.customMaskPoints(drawMultResult);
          const maskPointsEven = templateMode === 3 ? [[1, 0], [1, 1], [1, 2]] : maskPointsOdd;
          const maskPointsPicker = [maskPointsOdd, maskPointsEven];
          const templateTileBitmap = await template.getChunked(tileKey2, currentMemorySavingMode);
          const originalWidth = templateTileBitmap.width / template.shreadSize;
          const originalHeight = templateTileBitmap.height / template.shreadSize;
          const resultWidth = originalWidth * drawMultResult;
          const resultHeight = originalHeight * drawMultResult;
          let resultCanvas = new OffscreenCanvas(resultWidth, resultHeight);
          const resultContext = resultCanvas.getContext("2d");
          resultContext.imageSmoothingEnabled = false;
          resultContext.beginPath();
          resultContext.rect(0, 0, resultWidth, resultHeight);
          resultContext.clip();
          resultContext.clearRect(0, 0, resultWidth, resultHeight);
          try {
            if (!hasColorDisabled && drawMultTemplate === drawMultResult) {
              resultContext.drawImage(templateTileBitmap, 0, 0);
            } else if (!allColorsDisabled) {
              console.log("Applying color filter...", performance.now() - timeStart + " ms");
              const templateWidth = templateTileBitmap.width;
              const templateHeight = templateTileBitmap.height;
              let templateCanvas = new OffscreenCanvas(templateWidth, templateHeight);
              const templateContext = templateCanvas.getContext("2d", { willReadFrequently: true });
              templateContext.imageSmoothingEnabled = false;
              templateContext.clearRect(0, 0, templateWidth, templateHeight);
              templateContext.drawImage(templateTileBitmap, 0, 0);
              const templateData = templateContext.getImageData(0, 0, templateWidth, templateHeight).data;
              const image = resultContext.getImageData(0, 0, resultWidth, resultHeight);
              const imageData = image.data;
              for (let yt = drawMultCenterTemplate, yr = 0, parityY = false; yt < templateHeight; yt += drawMultTemplate, yr += drawMultResult, parityY = !parityY) {
                for (let xt = drawMultCenterTemplate, xr = 0, parityX = parityY; xt < templateWidth; xt += drawMultTemplate, xr += drawMultResult, parityX = !parityX) {
                  for (const [offsetX, offsetY] of maskPointsPicker[+parityX]) {
                    const templatePixelCenter = (yt * templateWidth + xt) * 4;
                    const templatePixelCenterRed = templateData[templatePixelCenter];
                    const templatePixelCenterGreen = templateData[templatePixelCenter + 1];
                    const templatePixelCenterBlue = templateData[templatePixelCenter + 2];
                    const templatePixelCenterAlpha = templateData[templatePixelCenter + 3];
                    if (templatePixelCenterAlpha < 1) {
                      continue;
                    }
                    let key = rgbToKey.get(`${templatePixelCenterRed},${templatePixelCenterGreen},${templatePixelCenterBlue}`) ?? "other";
                    if (displayedColorSet.has(key)) {
                      const realPixelCenter = ((yr + offsetY) * resultWidth + (xr + offsetX)) * 4;
                      imageData[realPixelCenter] = templatePixelCenterRed;
                      imageData[realPixelCenter + 1] = templatePixelCenterGreen;
                      imageData[realPixelCenter + 2] = templatePixelCenterBlue;
                      imageData[realPixelCenter + 3] = templatePixelCenterAlpha;
                    }
                    ;
                  }
                }
              }
              resultContext.putImageData(image, 0, 0);
            }
          } catch (exception) {
            console.warn("Failed to apply color filter:", exception);
            resultContext.drawImage(templateTileBitmap, 0, 0);
          }
          console.log("Exporting canvas...", performance.now() - timeStart + " ms");
          const resultBlob = await resultCanvas.convertToBlob({ type: "image/png" });
          doAfterMapFound(() => addTemplateCanvas(template.sortID, tileKey2, [originalWidth, originalHeight], resultBlob, "overlay"));
          console.log("Cleaning up...", performance.now() - timeStart + " ms");
          cleanUpCanvas(resultCanvas);
          resultCanvas = null;
          if (currentMemorySavingMode) {
            templateTileBitmap.close();
          }
        }
        ;
      }
      console.log("Finish...", performance.now() - timeStart + " ms");
    }
    /** Imports the JSON object, and appends it to any JSON object already loaded
     * @param {string} json - The JSON string to parse
     */
    importJSON(json) {
      console.log(`Importing JSON...`);
      console.log(json);
      if (json?.whoami == "BlueMarble") {
        this.templatesJSON = json;
        __privateMethod(this, _TemplateManager_instances, parseBlueMarble_fn).call(this, json);
      }
    }
    /** Sets the `templatesShouldBeDrawn` boolean to a value.
     * @param {boolean} value - The value to set the boolean to
     * @since 0.73.7
     */
    // setTemplatesShouldBeDrawn(value) {
    //   this.templatesShouldBeDrawn = value;
    // }
    /** Gets the palette toggled status from the first appearance of the color as a temporary measure
     * @since 0.85.11
     */
    getPaletteToggledStatus() {
      const status = {};
      for (const template of this.templatesArray) {
        for (const [rgb, meta] of Object.entries(template.colorPalette)) {
          if (status[rgb]) {
            continue;
          }
          ;
          status[rgb] = meta.enabled;
        }
      }
      return status;
    }
    /** Gets the list of displayed colors, sorted by rgb
     * does not hide completed colors as that may become incomplete over time
     * @returns {string[]}
     * @since 0.85.30
     */
    getDisplayedColorsSorted() {
      const currentOnly = this.isOnlyCurrentColorShown();
      const hideLocked = this.extraColorsBitmap !== -1 && this.areLockedColorsHidden();
      const toggledStatus = this.getPaletteToggledStatus();
      const hideCompleted = this.areCompletedColorsHidden();
      const colors = [];
      if (currentOnly) {
        const currentColor = getCurrentColor();
        Object.entries(toggledStatus).forEach(([rgb, enabled]) => {
          const colorId = rgbToMeta.get(rgb).id;
          if (colorId !== currentColor) return;
          if (hideLocked && !this.isColorUnlocked(colorId)) return;
          if (hideCompleted && this.isColorCompleted(colorId)) return;
          colors.push(rgb);
        });
      } else {
        Object.entries(toggledStatus).forEach(([rgb, enabled]) => {
          const colorId = rgbToMeta.get(rgb).id;
          if (!enabled) return;
          if (hideLocked && !this.isColorUnlocked(colorId)) return;
          if (hideCompleted && this.isColorCompleted(colorId)) return;
          colors.push(rgb);
        });
      }
      return colors.sort();
    }
    /** Gets the list of ids of completed colors
     * does not hide completed colors as that may become incomplete over time
     * @returns {Set<number>}
     * @since 0.86.4
     */
    getCompletedColors() {
      this.getOverallPerColorProgress();
      const result = /* @__PURE__ */ new Set();
      for (let colorId = 0, mask = 1; colorId < 64; colorId++, mask <<= 1) {
        if (this.completedColorsBitmap & mask) result.add(colorId);
      }
      ;
      return result;
    }
    /** Gets the list of involved templates, sorted by sortID
     * @param {number[]} tileCoords
     * @returns {Template[]}
     * @since 0.85.30
     */
    getInvolvedTemplates(tileCoords) {
      const tileCoordsPadded = calculateTileKey(tileCoords);
      return this.templatesArray.filter((template) => {
        if (!template?.chunked) return false;
        if (template.tilePrefixes && template.tilePrefixes.size > 0) {
          return template.tilePrefixes.has(tileCoordsPadded);
        }
        return Object.keys(template.chunked).some((k) => k.startsWith(tileCoordsPadded));
      }).sort((a, b) => a.sortID - b.sortID);
    }
    /** Gets the key that indicates if the toggled status is unchanged, so we can skip redrawing the overlay
     * @param {number[]} tileCoords
     * @since 0.85.30
     */
    getTileCacheKey(tileCoords) {
      const displayedColors = this.getDisplayedColorsSorted();
      const involvedTemplates = this.getInvolvedTemplates(tileCoords);
      return this.getTileCacheKeyFromCalculated(displayedColors, involvedTemplates);
    }
    /** Gets the key that indicates if the toggled status is unchanged, so we can skip redrawing the overlay
     * @param {string[]} displayedColors
     * @param {Template[]} involvedTemplates
     * @returns {string}
     * @since 0.85.30
     */
    getTileCacheKeyFromCalculated(displayedColors, involvedTemplates) {
      return displayedColors.join(";") + "||" + involvedTemplates.map((t) => t.storageKey + "," + t.storageTimeString + "," + +(t.enabled ?? true)).join(";");
    }
    /** Gets the overall color progress in all template tiles
     * @since 0.86.4
     */
    getOverallPerColorProgress() {
      const paletteSum = {};
      (this.templatesArray ?? []).forEach((t) => {
        if (!t.enabled) return;
        if (!t?.colorPalette) return;
        for (const [rgb, meta] of Object.entries(t.colorPalette)) {
          paletteSum[rgb] = (paletteSum[rgb] ?? 0) + meta.count;
        }
      });
      const combinedProgress = {};
      for (const stats of this.tileProgress.values()) {
        Object.entries(stats.palette).forEach(([colorKey, content]) => {
          if (combinedProgress[colorKey] === void 0) {
            combinedProgress[colorKey] = Object.fromEntries(Object.entries(content));
            combinedProgress[colorKey].examplesEnabled = content.examplesEnabled.slice();
          } else {
            combinedProgress[colorKey].painted += content.painted;
            combinedProgress[colorKey].paintedAndEnabled += content.paintedAndEnabled;
            combinedProgress[colorKey].missing += content.missing;
            combinedProgress[colorKey].examplesEnabled.extend(content.examplesEnabled);
          }
        });
      }
      ;
      var completedColorsBitmapLo = 0;
      var completedColorsBitmapHi = 0;
      Object.entries(paletteSum).forEach(([rgb, count]) => {
        if ((combinedProgress[rgb]?.paintedAndEnabled ?? 0) >= count) {
          const colorId = rgbToMeta.get(rgb)?.id ?? 0;
          if (colorId < 32) {
            completedColorsBitmapLo |= 1 << colorId;
          } else {
            completedColorsBitmapHi |= 1 << colorId - 32;
          }
        }
      });
      if (completedColorsBitmapLo !== this.completedColorsBitmapLo || completedColorsBitmapHi !== this.completedColorsBitmapHi) {
        this.completedColorsBitmapLo = completedColorsBitmapLo;
        this.completedColorsBitmapHi = completedColorsBitmapHi;
        if (this.areCompletedColorsHidden()) {
          this.createOverlayOnMap();
          if (this.isErrorMapShown() && this.isErrorMapOnlyEnabledColorsShown()) {
            forceRefreshTiles();
          }
        }
      }
      return { paletteSum, combinedProgress };
    }
    /** Stores the JSON object of the user settings into TamperMonkey (GreaseMonkey) storage.
     * @since 0.85.17
     */
    async storeUserSettings() {
      await GM.setValue("bmUserSettings", JSON.stringify(this.userSettings));
    }
    /** Sets the `userSettings` object to a value.
     * @param {object} value - The value to set the object to
     * @since 0.85.17
     */
    setUserSettings(value) {
      this.userSettings = value;
    }
    /** A utility to check if hidden colors are set to be hidden.
     * @since 0.85.17
     */
    areLockedColorsHidden() {
      return this.userSettings?.hideLockedColors ?? false;
    }
    /** Sets the `hideLockedColors` boolean in the `userSettings` to a value.
     * @param {boolean} value - The value to set the boolean to
     * @since 0.85.17
     */
    async setHideLockedColors(value) {
      this.userSettings.hideLockedColors = value;
      await this.storeUserSettings();
    }
    /** A utility to get the current sort criteria.
     * @since 0.85.23
     */
    getSortBy() {
      const temp = this.userSettings?.sortBy ?? "total-desc";
      if (this.isValidSortBy(temp)) return temp;
      return "total-desc";
    }
    /** A utility to check if the sort criteria is valid.
     * @param {string} value - The sort criteria
     * @returns {boolean}
     * @since 0.85.23
     */
    isValidSortBy(value) {
      const parts = value.toLowerCase().split("-");
      if (parts.length !== 2) return false;
      if (sortByOptions[parts[0]] === void 0) return false;
      if (!["desc", "asc"].includes(parts[1])) return false;
      return true;
    }
    /** Sets the sort criteria to a value.
     * @param {string} value - The sort criteria
     * @returns {boolean}
     * @since 0.85.23
     */
    async setSortBy(value) {
      if (!this.isValidSortBy(value)) return false;
      this.userSettings.sortBy = value.toLowerCase();
      await this.storeUserSettings();
      return true;
    }
    /** A utility to check if hidden colors are set to be hidden.
     * @returns {boolean}
     * @since 0.85.26
     */
    isProgressBarEnabled() {
      return this.userSettings?.progressBarEnabled ?? true;
    }
    /** Sets the sort criteria to a value.
     * @param {boolean} value - The sort criteria
     * @since 0.85.23
     */
    async setProgressBarEnabled(value) {
      this.userSettings.progressBarEnabled = value;
      await this.storeUserSettings();
    }
    /** A utility to check if completed colors are set to be hidden.
     * @returns {boolean}
     * @since 0.85.27
     */
    areCompletedColorsHidden() {
      return this.userSettings?.hideCompletedColors ?? false;
    }
    /** Sets the `hideCompletedColors` boolean in the `userSettings` to a value.
     * @param {boolean} value - The value to set the boolean to
     * @since 0.85.27
     */
    async setHideCompletedColors(value) {
      this.userSettings.hideCompletedColors = value;
      await this.storeUserSettings();
    }
    /** A utility to check if memory-saving mode is on.
     * @returns {boolean}
     * @since 0.85.27
     */
    isMemorySavingModeOn() {
      return this.userSettings?.memorySavingMode ?? false;
    }
    /** Sets the `memorySavingMode` boolean in the `userSettings` to a value.
     * @param {boolean} value - The value to set the boolean to
     * @since 0.85.33
     */
    async setMemorySavingMode(value) {
      this.userSettings.memorySavingMode = value;
      await this.storeUserSettings();
      if (value) {
        this.templatesArray.forEach((template) => {
          if (!template?.chunked) return;
          const chunked = template.chunked;
          const temp = {};
          Object.entries(chunked).forEach(([key, value2]) => {
            temp[key] = null;
            if (value2 === null) return;
            value2.close();
          });
          template.chunked = temp;
        });
      }
    }
    /** A utility to get the current anchor.
     * @since 0.85.34
     * @returns {string}
     */
    getAnchor() {
      const temp = this.userSettings?.anchor ?? "lt";
      if (this.isValidAnchor(temp)) return temp.toLowerCase();
      return "lt";
    }
    /** A utility to check if the anchor is valid.
     * @param {string} value - The anchor
     * @returns {boolean}
     * @since 0.85.34
     */
    isValidAnchor(value) {
      if (value.length !== 2) return false;
      value = value.toLowerCase();
      return "lmr".includes(value[0]) && "tmb".includes(value[1]);
    }
    /** Sets the anchor to a value.
     * @param {string} value - The anchor
     * @since 0.85.34
     */
    async setAnchor(value) {
      if (!this.isValidAnchor(value)) return false;
      this.userSettings.anchor = value.toLowerCase();
      await this.storeUserSettings();
      return true;
    }
    /** A utility to check if events are enabled.
     * @returns {boolean}
     * @since 0.85.35
     */
    isEventEnabled() {
      return this.userSettings?.eventEnabled ?? false;
    }
    /** Sets the event enabled to a value.
     * @param {boolean} value - The value
     * @since 0.85.35
     */
    async setEventEnabled(value) {
      this.userSettings.eventEnabled = value;
      await this.storeUserSettings();
    }
    /** A utility to check if event claimed are shown.
     * @returns {boolean}
     * @since 0.85.35
     */
    isEventClaimedShown() {
      return this.userSettings?.eventClaimedShown ?? true;
    }
    /** Sets the event claimed shown to a value.
     * @param {boolean} value - The value
     * @since 0.85.35
     */
    async setEventClaimedShown(value) {
      this.userSettings.eventClaimedShown = value;
      await this.storeUserSettings();
    }
    /** A utility to check if event unavailable are shown.
     * @returns {boolean}
     * @since 0.85.35
     */
    isEventUnavailableShown() {
      return this.userSettings?.eventUnavailableShown ?? true;
    }
    /** Sets the event unavailable shown to a value.
     * @param {boolean} value - The value
     * @since 0.85.35
     */
    async setEventUnavailableShown(value) {
      this.userSettings.eventUnavailableShown = value;
      await this.storeUserSettings();
    }
    /** A utility to return the current event provider.
     * @returns {string}
     * @since 0.85.35
     */
    getEventProvider() {
      return this.userSettings?.eventProvider ?? "";
    }
    /** Sets the event provider to a value.
     * @param {string} value - The value
     * @since 0.85.35
     */
    async setEventProvider(value) {
      this.userSettings.eventProvider = value;
      await this.storeUserSettings();
    }
    /** A utility to check if only the currently selected color is shown.
     * @returns {boolean}
     * @since 0.85.37
     */
    isOnlyCurrentColorShown() {
      return this.userSettings?.onlyCurrentColorShown ?? false;
    }
    /** Sets the onlyCurrentColorShown to a value.
     * @param {boolean} value - The value
     * @since 0.85.37
     */
    async setOnlyCurrentColorShown(value) {
      this.userSettings.onlyCurrentColorShown = value;
      await this.storeUserSettings();
    }
    /** A utility to check if the theme is overridden.
     * @returns {boolean}
     * @since 0.85.40
     */
    isThemeOverridden() {
      return this.userSettings?.themeOverridden ?? false;
    }
    /** Sets the themeOverridden to a value.
     * @param {boolean} value - The value
     * @since 0.85.40
     */
    async setThemeOverridden(value) {
      this.userSettings.themeOverridden = value;
      await this.storeUserSettings();
    }
    /** A utility to return the current theme.
     * @returns {string}
     * @since 0.85.40
     */
    getCurrentTheme() {
      const temp = (this.userSettings?.currentTheme ?? Object.keys(themeList)[0]).toLowerCase();
      if (themeList[temp]) return temp;
      return Object.keys(themeList)[0];
    }
    /** Sets the current theme to a value.
     * @param {string} value - The value
     * @returns {boolean}
     * @since 0.85.40
     */
    async setCurrentTheme(value) {
      value = value.toLowerCase();
      if (!themeList[value]) return false;
      this.userSettings.currentTheme = value;
      await this.storeUserSettings();
      return true;
    }
    /** A utility to check if the status textbox is hidden.
     * @returns {boolean}
     * @since 0.85.41
     */
    isStatusHidden() {
      return this.userSettings?.hideStatus ?? false;
    }
    /** Sets the hideStatus to a value.
     * @param {boolean} value - The value
     * @since 0.85.41
     */
    async setStatusHidden(value) {
      this.userSettings.hideStatus = value;
      await this.storeUserSettings();
    }
    /** A utility to check if the status textbox is hidden.
     * @returns {boolean}
     * @since 0.87.15
     */
    areTemplatesHidden() {
      return this.userSettings?.hideTemplates ?? false;
    }
    /** Sets the hideStatus to a value.
     * @param {boolean} value - The value
     * @since 0.87.15
     */
    async setTemplatesHidden(value) {
      this.userSettings.hideTemplates = value;
      await this.storeUserSettings();
    }
    /** A utility to check if it uses the 3x3 template display
     * @returns {number} - Changed from boolean to number in ver. 0.87.5
     * @since 0.85.46
     */
    getTemplateMode() {
      return +(this.userSettings?.legacyDisplay ?? 0);
    }
    /** Sets the legacyDisplay to a value.
     * @param {number} value - The value, changed from boolean to number in ver. 0.87.5
     * @since 0.85.46
     */
    async setTemplateMode(value) {
      this.userSettings.legacyDisplay = value;
      await this.storeUserSettings();
    }
    /** A utility to determine whether the error map should be shown
     * @returns {boolean}
     * @since 0.85.46
     */
    isErrorMapShown() {
      return this.userSettings?.showErrorMap ?? false;
    }
    /** Sets the showErrorMap to a value.
     * @param {boolean} value - The value
     * @since 0.85.46
     */
    async setErrorMapShown(value) {
      this.userSettings.showErrorMap = value;
      await this.storeUserSettings();
    }
    /** A utility to deterine whether the error map only covers the enabled colors
     * @returns {boolean}
     * @since 0.86.14
     */
    isErrorMapOnlyEnabledColorsShown() {
      return this.userSettings?.showOnlyEnabledColorsErrorMap ?? false;
    }
    /** Sets the showOnlyEnabledColorsErrorMap to a value.
     * @param {boolean} value - The value
     * @since 0.86.14
     */
    async setErrorMapOnlyEnabledColorsShown(value) {
      this.userSettings.showOnlyEnabledColorsErrorMap = value;
      await this.storeUserSettings();
    }
    /** A utility to check if zoom buttons are shown
     * @returns {boolean}
     * @since 0.86.10
     */
    areIntegerZoomButtonsShown() {
      return this.userSettings?.showIntegerZoom ?? false;
    }
    /** Sets the showIntegerZoom to a value.
     * @param {boolean} value - The value
     * @since 0.86.10
     */
    async setIntegerZoomButtonsShown(value) {
      this.userSettings.showIntegerZoom = value;
      await this.storeUserSettings();
    }
    /** A utility to enable / disable arrow key keybinds
     * @returns {boolean}
     * @since 0.86.12
     */
    areKeybindsEnabled() {
      return this.userSettings?.enableKeybinds ?? false;
    }
    /** Sets the enableKeybinds to a value.
     * @param {boolean} value - The value
     * @since 0.86.12
     */
    async setKeybindsEnabled(value) {
      this.userSettings.enableKeybinds = value;
      await this.storeUserSettings();
    }
    /** Whether the "+ Line" and "+ Circle" buttons are displayed
     * @returns {boolean}
     * @since 0.86.13
     */
    isLineTemplateButtonShown() {
      return this.userSettings?.lineTemplateButton ?? false;
    }
    /** Sets the lineTemplateButton to a value.
     * @param {boolean} value - The value
     * @since 0.86.13
     */
    async setLineTemplateButtonEnabled(value) {
      this.userSettings.lineTemplateButton = value;
      await this.storeUserSettings();
    }
    /** Sets the `extraColorsBitmap` to an updated mask, refresh the color filter if changed.
     * @param {number} value - The value to set the mask to
     * @since 0.85.17
     */
    updateExtraColorsBitmap(value) {
      if (this.extraColorsBitmap === value) return;
      this.extraColorsBitmap = value;
      window.buildColorFilterList();
      this.createOverlayOnMap();
    }
    /** A utility to check if a color is unlocked.
     * @param {number} color - The id of the color
     * @returns {boolean}
     * @since 0.85.17
     */
    isColorUnlocked(color) {
      if (this.extraColorsBitmap === -1) return true;
      if (color < 32) return true;
      const mask = 1 << color - 32;
      return (this.extraColorsBitmap & mask) !== 0;
    }
    /** A utility to check if a color is unlocked.
     * @param {number} color - The id of the color
     * @returns {boolean}
     * @since 0.86.4
     */
    isColorCompleted(color) {
      if (color < 32) {
        const mask = 1 << color;
        return (this.completedColorsBitmapLo & mask) !== 0;
      } else {
        const mask = 1 << color - 32;
        return (this.completedColorsBitmapHi & mask) !== 0;
      }
    }
    /** A utility clear all the tiles related to a template
     * @param {Template} template
     * @since 0.85.19
     */
    clearTileProgress(template) {
      template.tilePrefixes.forEach((prefix) => {
        this.tileProgress.delete(prefix);
      });
      this.completedColorsBitmapLo = 0;
      this.completedColorsBitmapHi = 0;
    }
  };
  _TemplateManager_instances = new WeakSet();
  /** Generates a {@link Template} class instance from the JSON object template
   */
  loadTemplate_fn = function() {
  };
  /** Try to recover the shread size from a template without specified shread size
   * @param {string} templateKey - The key of the template
   * @param {object} templateValue
   * @since 0.87.5
   */
  recoverShreadSize_fn = function(templateKey, templateValue, defaultShreadSize) {
    if (templateValue.shreadSize) return templateValue.shreadSize;
    let tileCoords = null;
    let tileLookup = {};
    const allTileCoords = Object.keys(templateValue.tiles).map((tile) => {
      const parts = tile.split(",").map(Number);
      tileLookup[parts] = tile;
      return parts;
    });
    if (templateValue.coords !== void 0) {
      tileCoords = templateValue.coords.split(",").map(Number);
    } else {
      const tileTopLeft = allTileCoords.find(
        // find the tile that pxX and pxY is not 0
        ([tileX, tileY, pixelX, pixelY]) => pixelX !== 0 && pixelY !== 0
      );
      if (tileTopLeft !== void 0) {
        tileCoords = tileTopLeft;
      } else {
        tileCoords = allTileCoords.reduce(
          (tile1, tile2) => {
            const [tileX1, tileY1, pixelX1, pixelY1] = tile1;
            const [tileX2, tileY2, pixelX2, pixelY2] = tile2;
            const x1 = tileX1 * this.tileSize + pixelX1;
            const x2 = tileX2 * this.tileSize + pixelX2;
            if (x1 === x2) {
              const y1 = tileY1 * this.tileSize + pixelY1;
              const y2 = tileY2 * this.tileSize + pixelY2;
              return y1 < y2 ? tile1 : tile2;
            }
            ;
            return x1 < x2 ? tile1 : tile2;
          }
        );
      }
    }
    if (tileCoords !== null) {
      const tileKey2 = tileLookup[tileCoords];
      if (tileKey2 !== void 0) {
        const targetTile = templateValue.tiles[tileKey2];
        try {
          const PNGSize = base64PNGSize(targetTile);
          const [tileWidth, tileHeight] = PNGSize;
          if (targetTile !== void 0) {
            const isXReliable = allTileCoords.some(
              ([tileX, tileY, pixelX, pixelY]) => tileX !== tileCoords[0]
            );
            const isYReliable = allTileCoords.some(
              ([tileX, tileY, pixelX, pixelY]) => tileY !== tileCoords[1]
            );
            let resultX = null;
            if (isXReliable) {
              const remainX = this.tileSize - tileCoords[2];
              if (tileWidth % remainX === 0) {
                resultX = tileWidth / remainX;
              }
            }
            ;
            let resultY = null;
            if (isYReliable) {
              const remainY = this.tileSize - tileCoords[3];
              if (tileHeight % remainY === 0) {
                resultY = tileHeight / remainY;
              }
            }
            if (resultX !== null && resultY !== null) {
              if (resultX === resultY) {
                templateValue.shreadSize = resultX;
                console.log(`Reliably recovered shread size of ${templateKey} to be ${tempShreadSize}`);
                return resultX;
              } else {
                console.log(`Shread size conflict in ${templateKey}: X = ${resultX}, Y = ${resultY}`);
                return Math.min(resultX, resultY);
              }
            } else if (resultX !== null) {
              templateValue.shreadSize = resultX;
              console.log(`Reliably recovered shread size of ${templateKey} to be ${resultX}`);
              return resultX;
            } else if (resultY !== null) {
              templateValue.shreadSize = resultY;
              console.log(`Reliably recovered shread size of ${templateKey} to be ${resultY}`);
              return resultY;
            }
          }
        } catch (exception) {
          console.log(`Cannot parse the template tile size of ${templateKey}`);
        }
      }
    }
    try {
      const isPossible = Object.fromEntries([1, 2, 3, 4, 5].map((shreadSize) => [shreadSize, true]));
      for ([tileKey, tileValue] of Object.entries(templateValue.tiles)) {
        const tilePNGSize = base64PNGSize(tileValue);
        const [tileX, tileY, pixelX, pixelY] = tileKey.split(",").map(Number);
        Object.keys(isPossible).forEach((shreadSize) => {
          if (!isPossible[shreadSize]) return;
          if (tilePNGSize[0] % shreadSize !== 0 || tilePNGSize[1] % shreadSize !== 0 || pixelX + tilePNGSize[0] / shreadSize > this.tileSize || pixelY + tilePNGSize[1] / shreadSize > this.tileSize) {
            isPossible[shreadSize] = false;
            return;
          }
        });
      }
      const candidates = Object.keys(isPossible).filter((shreadSize) => isPossible[shreadSize]);
      if (candidates.length === 1) {
        templateValue.shreadSize = +candidates[0];
        console.log(`Reliably recovered shread size of ${templateKey} to be ${candidates[0]}`);
        return +candidates[0];
      } else if (candidates.length > 1) {
        console.log(`Possible shread sizes of ${templateKey} are: ${candidates.join(", ")}`);
        if (candidates.includes(defaultShreadSize.toString())) {
          return defaultShreadSize;
        }
        ;
        return +candidates[candidates.length - 1];
      }
    } catch (exception) {
      console.log(`Cannot parse the template tile size of ${templateKey}`);
    }
    return defaultShreadSize;
  };
  parseBlueMarble_fn = async function(json) {
    console.log(`Parsing BlueMarble...`);
    const templates = json.templates;
    console.log(`BlueMarble length: ${Object.keys(templates).length}`);
    const currentMemorySavingMode = this.isMemorySavingModeOn();
    const defaultShreadSize = testCanvasSize(5e3, 5e3) ? 5 : 4;
    if (Object.keys(templates).length > 0) {
      for (const template in templates) {
        const templateKey = template;
        const templateValue = templates[template];
        console.log(templateKey);
        const templateCoords = templateValue.coords.split(",").map(Number);
        const templateShreadSize = __privateMethod(this, _TemplateManager_instances, recoverShreadSize_fn).call(this, templateKey, templateValue, defaultShreadSize);
        const templateShreadCenter = templateShreadSize - 1 >> 1;
        if (templates.hasOwnProperty(template)) {
          const templateKeyArray = templateKey.split(" ");
          const sortID = Number(templateKeyArray?.[0]);
          const authorID = templateKeyArray?.[1] || "0";
          const displayName = templateValue.name || `\uD15C\uD50C\uB9BF ${sortID || ""}`;
          const tilesbase64 = templateValue.tiles;
          const templateTiles = {};
          const templateTilesBuffer = {};
          let requiredPixelCount = 0;
          const paletteMap = /* @__PURE__ */ new Map();
          for (const tile in tilesbase64) {
            console.log(tile);
            if (tilesbase64.hasOwnProperty(tile)) {
              const encodedTemplateBase64 = tilesbase64[tile];
              const templateUint8Array = base64ToUint8(encodedTemplateBase64);
              const templateBlob = new Blob([templateUint8Array], { type: "image/png" });
              const templateBitmap = await createImageBitmap(templateBlob);
              if (currentMemorySavingMode) {
                templateTiles[tile] = null;
              } else {
                templateTiles[tile] = templateBitmap;
              }
              templateTilesBuffer[tile] = templateUint8Array;
              try {
                const w = templateBitmap.width;
                const h = templateBitmap.height;
                let c = new OffscreenCanvas(w, h);
                const cx = c.getContext("2d", { willReadFrequently: true });
                cx.imageSmoothingEnabled = false;
                cx.clearRect(0, 0, w, h);
                cx.drawImage(templateBitmap, 0, 0);
                const data = cx.getImageData(0, 0, w, h).data;
                cleanUpCanvas(c);
                c = null;
                const { required } = countPixels(data, w, h, paletteMap, templateShreadSize, templateShreadCenter);
                requiredPixelCount += required;
              } catch (e) {
                console.warn("Failed to count required pixels for imported tile", e);
              }
              if (currentMemorySavingMode) {
                templateBitmap.close();
              }
            }
          }
          const template2 = new Template({
            displayName,
            sortID: sortID || this.largestSeenSortID + 1 || 0,
            authorID: authorID || "",
            coords: templateCoords
          });
          if (template2.sortID > this.largestSeenSortID) {
            this.largestSeenSortID = template2.sortID;
          }
          template2.shreadSize = templateShreadSize;
          template2.chunked = templateTiles;
          template2.chunkedBuffer = templateTilesBuffer;
          template2.requiredPixelCount = requiredPixelCount;
          template2.enabled = templateValue.enabled ?? true;
          const paletteObj = {};
          for (const [key, count] of paletteMap.entries()) {
            paletteObj[key] = { count, enabled: true };
          }
          template2.colorPalette = paletteObj;
          try {
            Object.keys(templateTiles).forEach((k) => {
              template2.tilePrefixes?.add(k.split(",").slice(0, 2).join(","));
            });
          } catch (_) {
          }
          try {
            const persisted = templates?.[templateKey]?.palette;
            if (persisted) {
              for (const [rgb, meta] of Object.entries(persisted)) {
                if (!template2.colorPalette[rgb]) {
                  template2.colorPalette[rgb] = { count: meta?.count || 0, enabled: !!meta?.enabled };
                } else {
                  template2.colorPalette[rgb].enabled = !!meta?.enabled;
                }
              }
            }
          } catch (_) {
          }
          template2.storageKey = templateKey;
          this.templatesArray.push(template2);
          console.log(this.templatesArray);
          console.log(`^^^ This ^^^`);
        }
      }
      try {
        window.postMessage({ source: "blue-marble", bmEvent: "bm-rebuild-color-list" }, "*");
      } catch (_) {
      }
      try {
        window.postMessage({ source: "blue-marble", bmEvent: "bm-rebuild-template-list" }, "*");
      } catch (_) {
      }
      this.createOverlayOnMap();
    }
  };
  /** Parses the OSU! Place JSON object
   */
  parseOSU_fn = function() {
  };

  // src/apiManager.js
  var _ApiManager_instances, setUpTimeout_fn, updateCharges_fn, askServerForMe_fn, applyUserData_fn;
  var ApiManager = class {
    /** Constructor for ApiManager class
     * @param {TemplateManager} templateManager 
     * @since 0.11.34
     */
    constructor(templateManager2) {
      __privateAdd(this, _ApiManager_instances);
      this.templateManager = templateManager2;
      this.disableAll = false;
      this.coordsTilePixel = [];
      this.templateCoordsTilePixel = [];
      this.lastMe = null;
      this.lastMeUpdated = null;
      this.chargeInterval = null;
      this.tileCache = {};
      this.eventClaimed = null;
      this.lastFetchedTime = null;
      this.eventData = null;
      this.eventDataURL = null;
    }
    getCurrentCharges() {
      if (this.lastMe === null) {
        __privateMethod(this, _ApiManager_instances, askServerForMe_fn).call(this);
        return 0;
      }
      const charges = this.lastMe["charges"];
      const currentTime = Date.now();
      const timeDiff = currentTime - this.lastMeUpdated;
      const chargesDelta = timeDiff / charges["cooldownMs"];
      const currentCharges = charges["count"] + chargesDelta;
      const trueMax = charges["count"] > charges["max"] ? charges["count"] : charges["max"];
      if (currentCharges > trueMax) {
        return trueMax;
      }
      return currentCharges;
    }
    getFullRemainingTimeMs() {
      const currentCharges = this.getCurrentCharges();
      const charges = this.lastMe?.["charges"] ?? { "max": 0, "cooldownMs": 3e4 };
      if (currentCharges >= charges["max"]) {
        return 0;
      }
      return (charges["max"] - currentCharges) * charges["cooldownMs"];
    }
    getFullRemainingTimeFormatted() {
      return this.getTimeFormatted(this.getFullRemainingTimeMs());
    }
    getSuspendTimeMs() {
      const timeoutUntil = new Date(this.lastMe?.["timeoutUntil"] ?? 0).getTime();
      return Math.max(0, timeoutUntil - Date.now());
    }
    isSuspended() {
      return this.getSuspendTimeMs() > 0;
    }
    getSuspendTimeFormatted() {
      return this.getTimeFormatted(this.getSuspendTimeMs());
    }
    getTimeFormatted(remainingTimeMs) {
      if (remainingTimeMs <= 0) {
        return "00:00";
      }
      const remainingTimeSeconds = Math.floor(remainingTimeMs / 1e3);
      const hours = Math.floor(remainingTimeSeconds / 3600);
      const minutes = Math.floor(remainingTimeSeconds % 3600 / 60).toString().padStart(2, "0");
      const seconds = (remainingTimeSeconds % 60).toString().padStart(2, "0");
      if (hours > 0) return `${hours}:${minutes}:${seconds}`;
      return `${minutes}:${seconds}`;
    }
    /** Get the close button inside the pixel info view for anchoring
     * 
     * @since 0.87.4
    */
    getCloseButton() {
      return document.querySelector(
        ".flex.gap-2.px-3>button.btn-circle,.flex.gap-1\\.5.px-3>button.btn-circle,.flex.gap-1>button.btn-circle.btn-xs"
      );
    }
    /** Get the container with pixel info
     * 
     * @since 0.87.8
    */
    getPixelInfoContainer() {
      return document.querySelector(
        ".absolute.bottom-0>.rounded-t-box>div"
      );
    }
    /** Get the container containing the three button, namely Paint, Favorite, and Share, for anchoring
     * 
     * @since 0.87.4
    */
    getPaintButtonContainer() {
      const pixelInfoContainer = this.getPixelInfoContainer();
      if (!pixelInfoContainer) return;
      const paintButton = pixelInfoContainer.querySelector(".btn-primary:not(.btn-soft)");
      if (!paintButton) return;
      return paintButton.parentElement;
    }
    /** Get the container containing the three button, namely Paint, Favorite, and Share, for anchoring
     * 
     * @since 0.87.7
    */
    getShareButtonContainer() {
      const pixelInfoContainer = this.getPixelInfoContainer();
      if (!pixelInfoContainer) return;
      const favShareButton = pixelInfoContainer.querySelector(".btn-primary.btn-soft");
      if (!favShareButton) return;
      return favShareButton.parentElement;
    }
    /** Update the texts and related functions shown on the pixel info overlay
     * 
     * @since 0.85.28
    */
    updateDisplayCoords() {
      const coordsTile = [this.coordsTilePixel[0], this.coordsTilePixel[1]];
      const coordsPixel = [this.coordsTilePixel[2], this.coordsTilePixel[3]];
      let displayCoords1 = document.getElementById("bm-display-coords1");
      let displayCoords2 = document.getElementById("bm-display-coords2");
      let displayCoords1Copy = document.getElementById("bm-display-coords1-copy");
      let displayCoords2Copy = document.getElementById("bm-display-coords2-copy");
      const geoCoords = coordsTileCoordsToGeoCoords(coordsTile, coordsPixel);
      const text1 = `(Tl X: ${coordsTile[0]}, Tl Y: ${coordsTile[1]}, Px X: ${coordsPixel[0]}, Px Y: ${coordsPixel[1]})`;
      const text2 = `(${geoCoords[0].toFixed(5)}, ${geoCoords[1].toFixed(5)})`;
      if (!displayCoords1) {
        let coordRow = this.getPaintButtonContainer()?.previousElementSibling;
        if (!coordRow) return;
        displayCoords1 = document.createElement("span");
        displayCoords1.id = "bm-display-coords1";
        displayCoords1.style = "margin-left: calc(var(--spacing)*3); font-size: small;";
        coordRow.insertAdjacentElement("afterend", displayCoords1);
        const buttonCopy = function() {
          const content = this.dataset.text;
          copyToClipboard(content);
          alert("\uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB428: " + content);
        };
        displayCoords1Copy = document.createElement("a");
        displayCoords1Copy.href = "#";
        displayCoords1Copy.id = "bm-display-coords1-copy";
        displayCoords1Copy.textContent = "\uBCF5\uC0AC";
        displayCoords1Copy.style = "font-size: small; text-decoration: underline;";
        displayCoords1Copy.className = "text-nowrap";
        displayCoords1Copy.addEventListener("click", buttonCopy);
        displayCoords1.insertAdjacentElement("afterend", displayCoords1Copy);
        displayCoords1.insertAdjacentText("afterend", " ");
        const br = document.createElement("br");
        displayCoords1Copy.insertAdjacentElement("afterend", br);
        displayCoords2 = document.createElement("span");
        displayCoords2.id = "bm-display-coords2";
        displayCoords2.style = "margin-left: calc(var(--spacing)*3); font-size: small;";
        br.insertAdjacentElement("afterend", displayCoords2);
        displayCoords2Copy = document.createElement("a");
        displayCoords2Copy.href = "#";
        displayCoords2Copy.id = "bm-display-coords2-copy";
        displayCoords2Copy.textContent = "\uBCF5\uC0AC";
        displayCoords2Copy.style = "font-size: small; text-decoration: underline;";
        displayCoords2Copy.className = "text-nowrap";
        displayCoords2Copy.addEventListener("click", buttonCopy);
        displayCoords2.insertAdjacentElement("afterend", displayCoords2Copy);
        displayCoords2.insertAdjacentText("afterend", " ");
      }
      if (displayCoords1) {
        displayCoords1.textContent = text1;
        displayCoords2.textContent = text2;
        displayCoords1Copy.dataset.text = text1;
        displayCoords2Copy.dataset.text = text2;
      }
      this.updateAddLineTemplateButton();
      this.updateAddCircleTemplateButton();
    }
    /** Update the texts and related functions shown on the pixel info overlay
     * 
     * @since 0.86.13
    */
    updateAddLineTemplateButton() {
      if (this.templateManager.isLineTemplateButtonShown()) {
        let btnLineTemplate = document.getElementById("bm-create-line-template");
        const that = this;
        if (!btnLineTemplate) {
          const buttonContainer = this.getShareButtonContainer();
          if (!buttonContainer) return;
          btnLineTemplate = document.createElement("span");
          btnLineTemplate.id = "bm-create-line-template";
          btnLineTemplate.textContent = "\uFF0F \uC120 \uD15C\uD50C\uB9BF";
          btnLineTemplate.className = buttonContainer.querySelector("button").className;
          btnLineTemplate.classList.add("btn-soft");
          btnLineTemplate.style.marginLeft = "12px";
          btnLineTemplate.style.marginBottom = "8px";
          const pixelInfoContainer = this.getPixelInfoContainer();
          if (!pixelInfoContainer) return;
          pixelInfoContainer.appendChild(btnLineTemplate);
          btnLineTemplate.addEventListener("click", function() {
            if (!areOverlayCoordsFilledAndValid()) {
              alert(`\uC77C\uBD80 \uC88C\uD45C \uC785\uB825\uB780\uC774 \uBE44\uC5B4 \uC788\uAC70\uB098 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4!`);
              return;
            }
            ;
            if (that.coordsTilePixel.length !== 4) {
              alert(`\uC88C\uD45C\uAC00 \uC798\uBABB\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uCE94\uBC84\uC2A4\uB97C \uD074\uB9AD\uD574 \uBCF4\uC168\uB098\uC694?`);
              return;
            }
            ;
            const overlayCoords = getOverlayCoords();
            const coordsTile = [that.coordsTilePixel[0], that.coordsTilePixel[1]];
            const coordsPixel = [that.coordsTilePixel[2], that.coordsTilePixel[3]];
            const [[left, top], [width, height]] = calculateTopLeftAndSize(
              [coordsTile, coordsPixel],
              overlayCoords
            );
            const defaultDrawMult = that.templateManager.drawMult;
            if (!testCanvasSize(width * defaultDrawMult, height * defaultDrawMult)) {
              alert(`\uC120\uC774 \uBE0C\uB77C\uC6B0\uC800\uAC00 \uCC98\uB9AC\uD560 \uC218 \uC788\uB294 \uD06C\uAE30\uBCF4\uB2E4 \uD07D\uB2C8\uB2E4.`);
              return;
            }
            const x0 = coordsTile[0] % 2048 * 1e3 + coordsPixel[0] % 1e3;
            const y0 = coordsTile[1] % 2048 * 1e3 + coordsPixel[1] % 1e3;
            const isTopLeft = (x0 == left ^ y0 == top) == 0;
            const currentColor = getCurrentColor();
            const currentColorInfo = colorpalette[currentColor];
            const {
              imageData,
              offsetX,
              offsetY
            } = isTopLeft ? lineBitmap(
              [left, top],
              [left + width - 1, top + height - 1],
              currentColorInfo.rgb
            ) : lineBitmap(
              [left, top + height - 1],
              [left + width - 1, top],
              currentColorInfo.rgb
            );
            const tx1 = Math.floor(left / 1e3);
            const ty1 = Math.floor(top / 1e3);
            const px1 = left % 1e3;
            const py1 = top % 1e3;
            that.templateManager.createTemplate(
              imageData,
              `${currentColorInfo?.name ?? "\uC54C \uC218 \uC5C6\uB294 \uC0C9\uC0C1"} \uC120`,
              [tx1, ty1, px1, py1],
              "lt"
            );
          });
        }
      }
    }
    /** Update the texts and related functions shown on the pixel info overlay
     * 
     * @since 0.86.16
    */
    updateAddCircleTemplateButton() {
      if (this.templateManager.isLineTemplateButtonShown()) {
        let btnCircleTemplate = document.getElementById("bm-create-circle-template");
        const that = this;
        if (!btnCircleTemplate) {
          const buttonContainer = this.getShareButtonContainer();
          if (!buttonContainer) return;
          btnCircleTemplate = document.createElement("span");
          btnCircleTemplate.id = "bm-create-circle-template";
          btnCircleTemplate.textContent = "\u25CB \uC6D0 \uD15C\uD50C\uB9BF";
          btnCircleTemplate.className = buttonContainer.querySelector("button").className;
          btnCircleTemplate.classList.add("btn-soft");
          btnCircleTemplate.style.marginLeft = "12px";
          btnCircleTemplate.style.marginBottom = "8px";
          const pixelInfoContainer = this.getPixelInfoContainer();
          if (!pixelInfoContainer) return;
          pixelInfoContainer.appendChild(btnCircleTemplate);
          btnCircleTemplate.addEventListener("click", function() {
            if (!areOverlayCoordsFilledAndValid()) {
              alert(`\uC77C\uBD80 \uC88C\uD45C \uC785\uB825\uB780\uC774 \uBE44\uC5B4 \uC788\uAC70\uB098 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4!`);
              return;
            }
            ;
            if (that.coordsTilePixel.length !== 4) {
              alert(`\uC88C\uD45C\uAC00 \uC798\uBABB\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uCE94\uBC84\uC2A4\uB97C \uD074\uB9AD\uD574 \uBCF4\uC168\uB098\uC694?`);
              return;
            }
            ;
            const overlayCoords = getOverlayCoords();
            const coordsTile = [that.coordsTilePixel[0], that.coordsTilePixel[1]];
            const coordsPixel = [that.coordsTilePixel[2], that.coordsTilePixel[3]];
            const [[left, top], [width, height]] = calculateTopLeftAndSize(
              [coordsTile, coordsPixel],
              overlayCoords
            );
            const { d, y } = midPointDistance([0, 0], [width - 1, height - 1]);
            const diameter = y * 2 + 1;
            const defaultDrawMult = that.templateManager.drawMult;
            if (!testCanvasSize(diameter * defaultDrawMult, diameter * defaultDrawMult)) {
              alert(`\uC6D0\uC774 \uBE0C\uB77C\uC6B0\uC800\uAC00 \uCC98\uB9AC\uD560 \uC218 \uC788\uB294 \uD06C\uAE30\uBCF4\uB2E4 \uD07D\uB2C8\uB2E4.`);
              return;
            }
            const x0 = overlayCoords[0][0] % 2048 * 1e3 + overlayCoords[1][0] % 1e3;
            const y0 = overlayCoords[0][1] % 2048 * 1e3 + overlayCoords[1][1] % 1e3;
            const x1 = coordsTile[0] % 2048 * 1e3 + coordsPixel[0] % 1e3;
            const y1 = coordsTile[1] % 2048 * 1e3 + coordsPixel[1] % 1e3;
            const currentColor = getCurrentColor();
            const currentColorInfo = colorpalette[currentColor];
            const {
              imageData,
              offsetX,
              offsetY
            } = circleBitmap(
              [x0, y0],
              [x1, y1],
              currentColorInfo.rgb
            );
            const tx1 = Math.floor(offsetX / 1e3);
            const ty1 = Math.floor(offsetY / 1e3);
            const px1 = offsetX % 1e3;
            const py1 = offsetY % 1e3;
            that.templateManager.createTemplate(
              imageData,
              `${currentColorInfo?.name ?? "\uC54C \uC218 \uC5C6\uB294 \uC0C9\uC0C1"} \uC6D0`,
              [tx1, ty1, px1, py1],
              "lt"
            );
          });
        }
      }
    }
    /** Update the download button in share dialog
     * @param {boolean} onlyCreate - Only create the download section if it did not exist
     * @since 0.85.28
    */
    updateDownloadButton(onlyCreate = false) {
      if (this.coordsTilePixel.length !== 4) return;
      const coordsTile = [this.coordsTilePixel[0], this.coordsTilePixel[1]];
      const coordsPixel = [this.coordsTilePixel[2], this.coordsTilePixel[3]];
      const models = document.querySelectorAll("dialog.modal > div");
      for (const element of models) {
        if (element.querySelector("input[readonly]") === null) continue;
        let downloadBtn = document.querySelector("#bm-download-coords");
        let downloadBtnDim = document.querySelector("#bm-download-coords-dim");
        let progress = document.querySelector("#bm-download-progress");
        let progressText = document.querySelector("#bm-download-progress-text");
        if (downloadBtn) {
          if (onlyCreate) return;
        } else {
          const betterElement = element.querySelector(":scope > header + div > div");
          const container = document.createElement("div");
          if (betterElement) {
            betterElement.appendChild(container);
          } else {
            element.appendChild(container);
          }
          element.style.maxHeight = "91.6667vh";
          const h3 = document.createElement("h3");
          h3.innerText = "\uD15C\uD50C\uB9BF\uC73C\uB85C \uB2E4\uC6B4\uB85C\uB4DC";
          h3.className = "mb-1 mt-5 flex items-center gap-1 text-xl font-semibold";
          container.appendChild(h3);
          const instruction = document.createElement("div");
          instruction.className = `bg-base-200 border-base-content/10 rounded-xl border-2 p-3`;
          instruction.style.fontSize = "small";
          instruction.innerText = [
            "\uB2E4\uAC01\uD615 \uBC94\uC704\uB97C \uC9C0\uC815\uD558\uC5EC \uD15C\uD50C\uB9BF\uC73C\uB85C \uB2E4\uC6B4\uB85C\uB4DC:",
            '1. \uCCAB \uBC88\uC9F8 \uCC38\uC870 \uC9C0\uC810\uC744 \uC120\uD0DD\uD569\uB2C8\uB2E4 (\uC608: \uC67C\uCABD \uC704 \uBAA8\uC11C\uB9AC) \uADF8\uB9AC\uACE0 "\uD540" \uC544\uC774\uCF58\uC744 \uC0AC\uC6A9\uD558\uC5EC \uC88C\uD45C\uB97C \uAE30\uB85D\uD569\uB2C8\uB2E4.',
            '2. \uB450 \uBC88\uC9F8 \uCC38\uC870 \uC9C0\uC810\uC744 \uC120\uD0DD\uD569\uB2C8\uB2E4, \uC989 \uBC18\uB300 \uBAA8\uC11C\uB9AC (\uC608: \uC624\uB978\uCABD \uC544\uB798 \uBAA8\uC11C\uB9AC), \uADF8\uB9AC\uACE0 "\uACF5\uC720" \uBC84\uD2BC\uC744 \uD074\uB9AD\uD569\uB2C8\uB2E4.'
          ].join("\n");
          container.appendChild(instruction);
          downloadBtnDim = document.createElement("span");
          downloadBtnDim.id = "bm-download-coords-dim";
          downloadBtnDim.style.fontSize = "small";
          container.appendChild(downloadBtnDim);
          container.appendChild(document.createElement("br"));
          const btnContainer = document.createElement("div");
          btnContainer.className = "mt-3 flex items-end justify-end gap-2";
          progress = document.createElement("progress");
          progress.id = "bm-download-progress";
          progress.max = "100";
          progress.value = "0";
          progress.hidden = true;
          btnContainer.appendChild(progress);
          progressText = document.createElement("span");
          progressText.id = "bm-download-progress-text";
          progressText.hidden = true;
          progressText.textContent = "0 / 0";
          btnContainer.appendChild(progressText);
          downloadBtn = document.createElement("button");
          downloadBtn.id = "bm-download-coords";
          downloadBtn.className = "btn btn-primary";
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          svg.setAttribute("viewBox", "0 -960 960 960");
          svg.setAttribute("fill", "currentColor");
          svg.setAttribute("class", "size-5");
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", "M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z");
          svg.appendChild(path);
          downloadBtn.appendChild(svg);
          downloadBtn.appendChild(document.createTextNode(" \uB2E4\uC6B4\uB85C\uB4DC"));
          const that = this;
          downloadBtn.addEventListener("click", async function() {
            this.disabled = true;
            const coordsTile2 = [that.coordsTilePixel[0], that.coordsTilePixel[1]];
            const coordsPixel2 = [that.coordsTilePixel[2], that.coordsTilePixel[3]];
            if (!areOverlayCoordsFilledAndValid()) {
              alert(`\uC77C\uBD80 \uC88C\uD45C \uC785\uB825\uB780\uC774 \uBE44\uC5B4 \uC788\uAC70\uB098 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4!`);
              return;
            }
            const overlayCoords = getOverlayCoords();
            const [[left, top], [width, height]] = calculateTopLeftAndSize(
              [coordsTile2, coordsPixel2],
              overlayCoords
            );
            const tx1 = Math.floor(left / 1e3);
            const ty1 = Math.floor(top / 1e3);
            const px1 = left % 1e3;
            const py1 = top % 1e3;
            const tx2 = Math.floor((left + width - 1) / 1e3);
            const ty2 = Math.floor((top + height - 1) / 1e3);
            const tw = tx2 - tx1 + 1;
            const th = ty2 - ty1 + 1;
            progress.max = tw * th;
            progress.value = 0;
            progress.hidden = false;
            progressText.textContent = `0 / ${progress.max}`;
            progressText.hidden = false;
            try {
              const resultCanvas = new OffscreenCanvas(width, height);
              const context = resultCanvas.getContext("2d");
              context.clearRect(0, 0, width, height);
              for (let ty = ty1; ty <= ty2; ty++) {
                for (let tx = tx1; tx <= tx2; tx++) {
                  const image = await downloadTile(tx % 2048, ty);
                  context.drawImage(
                    image,
                    tx * 1e3 - left,
                    ty * 1e3 - top
                  );
                  progress.value++;
                  progressText.textContent = `${progress.value} / ${progress.max}`;
                }
              }
              ;
              const blob = await resultCanvas.convertToBlob({ type: "image/png" });
              var a = document.createElement("a");
              a.href = URL.createObjectURL(blob, { type: "image/png" });
              a.setAttribute("download", `template_${tx1}_${ty1}_${px1}_${py1}_${(/* @__PURE__ */ new Date()).toISOString()}.png`);
              a.click();
              URL.revokeObjectURL(a.href);
            } catch (e) {
              alert(`\uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328!`);
              throw e;
            } finally {
              progress.hidden = true;
              progressText.hidden = true;
              this.disabled = false;
            }
          });
          btnContainer.appendChild(downloadBtn);
          container.appendChild(btnContainer);
        }
        const buttonLines = [];
        if (areOverlayCoordsFilledAndValid()) {
          const overlayCoords = getOverlayCoords();
          const [[left, top], [width, height]] = calculateTopLeftAndSize(
            [coordsTile, coordsPixel],
            overlayCoords
          );
          const tx1 = Math.floor(left / 1e3);
          const ty1 = Math.floor(top / 1e3);
          const px1 = left % 1e3;
          const py1 = top % 1e3;
          const right = (left + width - 1) % (2048 * 1e3);
          const bottom = top + height - 1;
          const tx2 = Math.floor(right / 1e3);
          const ty2 = Math.floor(bottom / 1e3);
          const px2 = right % 1e3;
          const py2 = bottom % 1e3;
          buttonLines.push(`\uC67C\uCABD \uC704: (Tl X: ${tx1}, Tl Y: ${ty1}, Px X: ${px1}, Px Y: ${py1})`);
          buttonLines.push(`\uC624\uB978\uCABD \uC544\uB798: (Tl X: ${tx2}, Tl Y: ${ty2}, Px X: ${px2}, Px Y: ${py2})`);
          buttonLines.push(`\uC774\uBBF8\uC9C0 \uD06C\uAE30: ${width}\xD7${height}`);
          if (testCanvasSize(width, height)) {
            downloadBtn.disabled = false;
          } else {
            downloadBtn.disabled = true;
            buttonLines.push(`\uC774\uBBF8\uC9C0 \uD06C\uAE30\uAC00 \uBE0C\uB77C\uC6B0\uC800\uAC00 \uCC98\uB9AC\uD560 \uC218 \uC788\uB294 \uD06C\uAE30\uBCF4\uB2E4 \uD07D\uB2C8\uB2E4.`);
          }
        } else {
          buttonLines.push(`\uC77C\uBD80 \uC88C\uD45C \uC785\uB825\uB780\uC774 \uBE44\uC5B4 \uC788\uAC70\uB098 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`);
          downloadBtn.disabled = true;
        }
        downloadBtnDim.innerText = buttonLines.join("\n");
      }
    }
    /** Determines if the spontaneously received response is something we want.
     * Otherwise, we can ignore it.
     * Note: Due to aggressive compression, make your calls like `data['jsonData']['name']` instead of `data.jsonData.name`
     * 
     * @param {Overlay} overlay - The Overlay class instance
     * @since 0.11.1
    */
    spontaneousResponseListener(overlay) {
      __privateMethod(this, _ApiManager_instances, setUpTimeout_fn).call(this);
      window.addEventListener("message", async (event) => {
        const data = event.data;
        const dataJSON = data["jsonData"];
        if (!(data && data["source"] === "blue-marble")) {
          return;
        }
        if (!data["endpoint"]) {
          return;
        }
        const endpointText = data["endpoint"]?.split("?")[0].split("/").filter((s) => s && isNaN(Number(s))).filter((s) => s && !s.includes(".")).pop();
        console.log(`%cBlue Marble%c: Received message about "%s"`, "color: cornflowerblue;", "", endpointText);
        switch (endpointText) {
          case "me":
            if (dataJSON["status"] && dataJSON["status"]?.toString()[0] != "2") {
              if (!(dataJSON["fallback"] ?? false)) {
                overlay.handleDisplayError(`\uB85C\uADF8\uC778\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4!
\uC0AC\uC6A9\uC790 \uB370\uC774\uD130\uB97C \uAC00\uC838\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`);
              }
              return;
            }
            __privateMethod(this, _ApiManager_instances, applyUserData_fn).call(this, dataJSON, Date.now());
            break;
          case "pixel":
            const coordsTile = data["endpoint"].split("?")[0].split("/").filter((s) => s && !isNaN(Number(s))).map((s) => Number(s));
            if ((data["jsonData"] ?? {})["painted"] !== void 0) {
              if (!coordsTile.length) {
                return;
              }
              const tileKey3 = calculateTileKey(coordsTile);
              if (this.tileCache[tileKey3]) {
                delete this.tileCache[tileKey3];
              }
              ;
              if (this.templateManager.tileProgress.has(tileKey3)) {
                this.templateManager.tileProgress.get(tileKey3).outdated = true;
              }
              ;
              break;
            }
            const payloadExtractor = new URLSearchParams(data["endpoint"].split("?")[1]);
            const coordsPixel = [
              +payloadExtractor.get("x"),
              +payloadExtractor.get("y")
            ];
            if (this.coordsTilePixel.length && (!coordsTile.length || !coordsPixel.length)) {
              overlay.handleDisplayError(`\uC88C\uD45C\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4!
\uCE94\uBC84\uC2A4\uB97C \uBA3C\uC800 \uD074\uB9AD\uD574 \uBCF4\uC168\uB098\uC694?`);
              return;
            }
            if (coordsTile[0] < 0 && coordsPixel[0] < 0) {
              coordsTile[0] += 2048;
              coordsPixel[0] += 1e3;
            } else if (coordsTile[0] >= 2048) {
              coordsTile[0] -= 2048;
            }
            this.coordsTilePixel = [...coordsTile, ...coordsPixel];
            this.updateDisplayCoords();
            this.updateDownloadButton();
            break;
          case "tile":
          // https://backend.wplace.live/tile/{tx}/{ty}.png
          case "tiles":
            let tileCoordsTile = data["endpoint"].split("/");
            tileCoordsTile = [parseInt(tileCoordsTile[tileCoordsTile.length - 2]), parseInt(tileCoordsTile[tileCoordsTile.length - 1].replace(".png", ""))];
            const blobData = data["blobData"];
            const tileKey2 = calculateTileKey(tileCoordsTile);
            const lastModified = data["lastModified"];
            const fullKey = this.templateManager.getTileCacheKey(tileCoordsTile);
            const errorMap = +this.templateManager.isErrorMapShown();
            const fullKeyChanged = !this.tileCache[tileKey2] || this.tileCache[tileKey2]["fullKey"] !== fullKey;
            const lastModifiedChanged = !this.tileCache[tileKey2] || this.tileCache[tileKey2]["lastModified"] !== lastModified;
            const errorMapChanged = !this.tileCache[tileKey2] || this.tileCache[tileKey2]["errorMap"] !== errorMap;
            console.log(this.tileCache[tileKey2]);
            console.log(fullKey, lastModified, errorMap);
            console.log(fullKeyChanged, lastModifiedChanged, errorMapChanged);
            if (!fullKeyChanged && !lastModifiedChanged && !errorMapChanged) {
              console.log(`Unchanged tile: "${tileKey2}"`);
            } else {
              const involvedTemplates = this.templateManager.getInvolvedTemplates(tileCoordsTile);
              if (involvedTemplates.length > 0 && (fullKeyChanged || lastModifiedChanged || errorMapChanged && errorMap)) {
                await this.templateManager.countTemplateStatus(blobData, tileCoordsTile);
              }
              this.tileCache[tileKey2] = { lastModified, fullKey, errorMap };
            }
            break;
          case "random":
            const blobUUID_ = data["blobID"];
            const overrideCoords = overrideRandom["data"];
            const jsonData = overrideCoords === null ? dataJSON : {
              "pixel": {
                "x": overrideCoords[1][0],
                "y": overrideCoords[1][1]
              },
              "tile": {
                "x": overrideCoords[0][0],
                "y": overrideCoords[0][1]
              }
            };
            overrideRandom["data"] = null;
            window.postMessage({
              source: "blue-marble",
              blobID: blobUUID_,
              blobData: JSON.stringify(jsonData),
              blink: data["blink"]
            });
            break;
          case "claimed":
            this.eventClaimed = dataJSON["claimed"] ?? [];
            this.templateManager.requestEventRebuild();
            break;
          case "locations":
            this.eventClaimed = dataJSON.filter((entry) => entry?.["claimed"] ?? false).map((entry, index) => entry.id ?? index);
            this.eventData = dataJSON;
            this.eventDataURL = data["endpoint"];
            this.templateManager.requestEventRebuild();
            break;
          case "robots":
            this.disableAll = dataJSON["userscript"]?.toString().toLowerCase() == "false";
            break;
        }
      });
    }
  };
  _ApiManager_instances = new WeakSet();
  setUpTimeout_fn = function() {
    __privateMethod(this, _ApiManager_instances, updateCharges_fn).call(this);
    this.chargeInterval = setInterval(() => {
      __privateMethod(this, _ApiManager_instances, updateCharges_fn).call(this);
    }, 1e3);
  };
  updateCharges_fn = function() {
    if (this.lastMe === null) {
      __privateMethod(this, _ApiManager_instances, askServerForMe_fn).call(this);
      return;
    }
    const charges = this.lastMe["charges"];
    const currentCharges = Math.floor(this.getCurrentCharges());
    const maxCharges = charges["max"];
    const currentChargesStr = new Intl.NumberFormat().format(currentCharges);
    const maxChargesStr = new Intl.NumberFormat().format(maxCharges);
    const container = document.getElementById("bm-user-charges");
    const countdownElement = container?.querySelector('[data-role="countdown"]');
    const countElement = container?.querySelector('[data-role="charge-count"]');
    if (container && countdownElement && countElement) {
      countdownElement.textContent = this.getFullRemainingTimeFormatted();
      countElement.textContent = `(${currentChargesStr} / ${maxChargesStr})`;
    }
    ;
    const suspendContainer = document.getElementById("bm-user-suspend");
    const suspendCountdownElement = suspendContainer?.querySelector('[data-role="suspend-countdown"]');
    const suspendReasonContainer = document.getElementById("bm-user-suspend-reason");
    const suspendReasonElement = document.getElementById("bm-suspend-reason");
    if (suspendContainer && suspendCountdownElement && suspendReasonContainer && suspendReasonElement) {
      const isSuspended = this.isSuspended();
      suspendContainer.style.display = isSuspended ? "" : "none";
      suspendReasonContainer.style.display = isSuspended ? "" : "none";
      if (isSuspended) {
        suspendCountdownElement.textContent = this.getSuspendTimeFormatted();
        suspendReasonElement.textContent = (this.lastMe["suspensionReason"] ?? "Unknown").split("-").map((word) => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(" ");
      }
    }
    ;
  };
  askServerForMe_fn = function() {
    const allianceOrRankingButton = document.querySelector(".flex>.btn.btn-square.relative.shadow-md");
    const logoutButton = document.querySelector(".relative>.dropdown>.dropdown-content>section>button.btn");
    if (allianceOrRankingButton !== void 0 && logoutButton !== void 0) {
      const currentTime = Date.now();
      if (this.lastFetchedTime === null || currentTime - this.lastFetchedTime > 1e4) {
        fetch("https://backend.wplace.live/me", {
          "credentials": "include"
        }).then((response) => {
          return response.json();
        }).then((dataJSON) => {
          if (dataJSON["status"] && dataJSON["status"]?.toString()[0] != "2") {
            return;
          }
          consoleLog("Fetched user data", dataJSON);
          __privateMethod(this, _ApiManager_instances, applyUserData_fn).call(this, dataJSON, Date.now());
        });
        this.lastFetchedTime = currentTime;
      }
    }
  };
  applyUserData_fn = function(dataJSON, fetchTime) {
    if (dataJSON === null) return;
    const nextLevelPixels = Math.ceil(Math.pow(Math.floor(dataJSON["level"]) * Math.pow(30, 0.65), 1 / 0.65) - dataJSON["pixelsPainted"]);
    console.log(dataJSON["id"]);
    if (!!dataJSON["id"] || dataJSON["id"] === 0) {
      console.log(numberToEncoded(
        dataJSON["id"],
        "!#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~"
      ));
    }
    this.templateManager.userID = dataJSON["id"];
    this.lastMe = dataJSON;
    this.lastMeUpdated = fetchTime;
    this.templateManager.updateExtraColorsBitmap(dataJSON["extraColorsBitmap"] ?? 0);
    const unlockedColorsElement = document.getElementById("bm-checkbox-colors-unlocked")?.parentElement;
    if (unlockedColorsElement) {
      unlockedColorsElement.style.display = this.templateManager.extraColorsBitmap === -1 ? "none" : "";
    }
    const userNameElement = document.getElementById("bm-user-name");
    if (userNameElement) {
      userNameElement.textContent = dataJSON["name"];
    }
    const userDropletsElement = document.getElementById("bm-user-droplets");
    if (userDropletsElement) {
      userDropletsElement.textContent = new Intl.NumberFormat().format(dataJSON["droplets"]);
    }
    const nextPixelElement = document.getElementById("bm-user-nextpixel");
    if (nextPixelElement) {
      nextPixelElement.textContent = new Intl.NumberFormat().format(nextLevelPixels);
    }
    const nextLevelElement = document.getElementById("bm-user-nextlevel");
    if (nextLevelElement) {
      nextLevelElement.textContent = Math.floor(dataJSON["level"]) + 1;
    }
  };

  // src/main.js
  var name = GM_info.script.name.toString();
  var version = GM_info.script.version.toString();
  var consoleStyle = "color: cornflowerblue;";
  function inject(callback) {
    const script = document.createElement("script");
    script.setAttribute("bm-name", name);
    script.setAttribute("bm-cStyle", consoleStyle);
    script.textContent = `(${callback})();`;
    document.documentElement?.appendChild(script);
    script.remove();
  }
  inject(() => {
    const script = document.currentScript;
    const name2 = script?.getAttribute("bm-name") || "Blue Marble";
    const consoleStyle2 = script?.getAttribute("bm-cStyle") || "";
    const fetchedBlobQueue = /* @__PURE__ */ new Map();
    window.addEventListener("message", (event) => {
      const { source, endpoint, blobID, blobData, blink } = event.data;
      const elapsed = Date.now() - blink;
      console.groupCollapsed(`%c${name2}%c: ${fetchedBlobQueue.size} Recieved IMAGE message about blob "${blobID}"`, consoleStyle2, "");
      console.log(`Blob fetch took %c${String(Math.floor(elapsed / 6e4)).padStart(2, "0")}:${String(Math.floor(elapsed / 1e3) % 60).padStart(2, "0")}.${String(elapsed % 1e3).padStart(3, "0")}%c MM:SS.mmm`, consoleStyle2, "");
      console.log(fetchedBlobQueue);
      console.groupEnd();
      if (source == "blue-marble" && !!blobID && !!blobData && !endpoint) {
        const callback = fetchedBlobQueue.get(blobID);
        if (typeof callback === "function") {
          callback(blobData);
        } else {
          consoleWarn(`%c${name2}%c: Attempted to retrieve a blob (%s) from queue, but the blobID was not a function! Skipping...`, consoleStyle2, "", blobID);
        }
        fetchedBlobQueue.delete(blobID);
      }
    });
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const blink = Date.now();
      const response = await originalFetch.apply(this, args);
      const cloned = response.clone();
      const endpointName = (args[0] instanceof Request ? args[0]?.url : args[0]) || "ignore";
      const contentType = cloned.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        console.log(`%c${name2}%c: Sending JSON message about endpoint "${endpointName}"`, consoleStyle2, "");
        if (endpointName.endsWith("/tile/random")) {
          return new Promise((resolve) => {
            const blobUUID = crypto.randomUUID();
            fetchedBlobQueue.set(blobUUID, (blobProcessed) => {
              resolve(new Response(blobProcessed, {
                headers: cloned.headers,
                status: cloned.status,
                statusText: cloned.statusText
              }));
              console.log(`%c${name2}%c: ${fetchedBlobQueue.size} Processed blob "${blobUUID}"`, consoleStyle2, "");
            });
            cloned.json().then((jsonData) => {
              window.postMessage({
                source: "blue-marble",
                endpoint: endpointName,
                blobID: blobUUID,
                jsonData,
                blink
              }, "*");
            }).catch((err) => {
              console.error(`%c${name2}%c: Failed to parse JSON: `, consoleStyle2, "", err);
            });
          });
        }
        if (endpointName.includes("/s0/pixel/") && endpointName.includes("?x=") && endpointName.includes("&y=") && cloned.status === 400) {
          return new Promise((resolve, reject) => {
            const cloned2 = response.clone();
            cloned2.text().then((text) => {
              const errorPrefix = '{"error":"Invalid x","status":400}';
              if (text.startsWith(errorPrefix)) {
                const fixedPayload = text.slice(errorPrefix.length);
                console.error("Fixed", fixedPayload);
                try {
                  const actualPayload = JSON.parse(fixedPayload);
                  console.error("actualPayload", actualPayload);
                  window.postMessage({
                    source: "blue-marble",
                    endpoint: endpointName,
                    jsonData: actualPayload,
                    blink
                  }, "*");
                  resolve(new Response(fixedPayload, {
                    headers: cloned.headers,
                    status: 200,
                    statusText: "OK"
                  }));
                } catch (err) {
                  console.error(`%c${name2}%c: Failed to parse JSON: `, consoleStyle2, "", err);
                  resolve(response);
                }
              } else {
                resolve(response);
              }
            }).catch((err) => {
              console.error(`%c${name2}%c: Failed to get Content: `, consoleStyle2, "", err);
              resolve(response);
            });
          });
        } else {
          cloned.json().then((jsonData) => {
            window.postMessage({
              source: "blue-marble",
              endpoint: endpointName,
              jsonData,
              blink
            }, "*");
          }).catch((err) => {
            console.error(`%c${name2}%c: Failed to parse JSON: `, consoleStyle2, "", err);
          });
        }
      } else if (contentType.includes("image/") && (!endpointName.includes("openfreemap") && !endpointName.includes("maps"))) {
        const blob = await cloned.blob();
        console.log(`%c${name2}%c: ${fetchedBlobQueue.size} Sending IMAGE message about endpoint "${endpointName}"`, consoleStyle2, "");
        window.postMessage({
          source: "blue-marble",
          endpoint: endpointName,
          lastModified: cloned.headers.get("Last-Modified"),
          blobData: blob,
          blink
        });
      }
      return response;
    };
    const hookedMapFuncs = {
      "values": Map.prototype.values
    };
    const hookedMapValues = function(...args) {
      const iter = Reflect.apply(hookedMapFuncs["values"], this, args);
      return {
        [Symbol.iterator]() {
          return this;
        },
        next() {
          const r = iter.next();
          if (!r["done"]) {
            const x = r["value"];
            if (x?.["maps"] instanceof Set) {
              for (const y of x["maps"]) {
                if (y?.["flyTo"]) {
                  document.head["__bmmap"] = y;
                  restoreMapPrototype();
                  break;
                }
              }
            } else if (x?.["_map"]?.["flyTo"]) {
              document.head["__bmmap"] = x?.["_map"];
              restoreMapPrototype();
            }
          }
          return r;
        }
      };
    };
    const restoreMapPrototype = function() {
      for (const key in hookedMapFuncs) {
        Map.prototype[key] = hookedMapFuncs[key];
      }
    };
    Map.prototype.values = hookedMapValues;
  });
  GM.addStyle("#bm-overlay{position:fixed;background-color:#153063cc;color:#fff;padding:10px;border-radius:8px;z-index:9000;transition:all .3s ease,transform 0s;max-width:300px;width:auto;touch-action:pan-x pan-y;will-change:transform;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform-style:preserve-3d;-webkit-transform-style:preserve-3d}#bm-contain-userinfo,#bm-overlay hr,#bm-contain-automation,#bm-contain-buttons-action{transition:opacity .2s ease,height .2s ease}div#bm-overlay{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Monaco,DejaVu Sans,sans-serif;letter-spacing:.05em}#bm-bar-drag{margin-bottom:.5em;background:url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"5\" height=\"5\"><circle cx=\"3\" cy=\"3\" r=\"1.5\" fill=\"CornflowerBlue\" /></svg>') repeat;cursor:grab;width:100%;height:1em}#bm-bar-drag.dragging{cursor:grabbing}#bm-overlay:has(#bm-bar-drag.dragging){pointer-events:none;user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}#bm-bar-drag.dragging{pointer-events:auto}#bm-contain-header{margin-bottom:.5em}#bm-contain-header[style*=\"text-align: center\"]{display:flex;flex-direction:column;align-items:center;justify-content:center}#bm-overlay[style*=\"padding: 5px\"]{width:auto!important;max-width:300px;min-width:200px}#bm-overlay img{display:inline-block;height:2.5em;margin-right:1ch;vertical-align:middle;transition:opacity .2s ease}#bm-contain-header[style*=\"text-align: center\"] img{display:block;margin:0 auto}#bm-bar-drag{transition:margin-bottom .2s ease}#bm-overlay h1{display:inline-block;font-size:x-large;font-weight:700;vertical-align:middle}#bm-contain-automation input[type=checkbox]{vertical-align:middle;flex:0 0 auto}#bm-contain-automation label>input[type=checkbox]{margin-right:.5ch}#bm-contain-automation label{margin-right:.5ch}.bm-help{border:white 1px solid;height:1.5em;width:1.5em;margin-top:2px;text-align:center;line-height:1em;padding:0!important}#bm-button-coords{vertical-align:middle}#bm-button-coords svg{width:50%;margin:0 auto;fill:#111}div:has(>#bm-button-teleport){display:flex;gap:.5ch}#bm-button-favorite svg,#bm-button-template svg{height:1em;margin:2px auto 0;text-align:center;line-height:1em;vertical-align:bottom}#bm-contain-coords input[type=number]{appearance:auto;-moz-appearance:textfield;width:5.5ch;margin-left:1ch;background-color:#0003;padding:0 .5ch;font-size:small}#bm-contain-coords input[type=number]::-webkit-outer-spin-button,#bm-contain-coords input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}#bm-contain-buttons-template{white-space:nowrap;text-align:center}#bm-button-colors-container{display:flex;flex-direction:row;flex-wrap:wrap;align-content:center;justify-content:center;align-items:center;gap:1ch}div:has(>#bm-input-file-template)>button{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#bm-input-file-template,input[type=file][id*=template]{display:none!important;visibility:hidden!important;position:absolute!important;left:-9999px!important;top:-9999px!important;width:0!important;height:0!important;opacity:0!important;z-index:-9999!important;pointer-events:none!important}#bm-output-status{font-size:small;background-color:#0003;padding:0 .5ch;height:3.75em;width:100%}#bm-contain-buttons-action{display:flex;justify-content:space-between}#bm-overlay small{font-size:x-small;color:#d3d3d3}#bm-contain-userinfo,#bm-contain-automation,#bm-contain-coords,#bm-button-colors-container,#bm-output-status{margin-top:.5em}#bm-user-charges,#bm-user-suspend{display:flex;align-items:baseline;gap:.5ch;white-space:nowrap;min-height:1.4em}#bm-user-charges .bm-charge-countdown,#bm-user-suspend .bm-suspend-countdown{color:orange;font-weight:700;font-variant-numeric:tabular-nums;font-feature-settings:\"tnum\"}#bm-user-charges .bm-charge-count,#bm-user-suspend-reason .bm-suspend-reason{color:#d3d3d3;font-size:.8em}#bm-user-suspend,#bm-user-suspend-reason{color:salmon}#bm-overlay button{background-color:#144eb9;border-radius:1em;padding:0 .75ch;font-size:small}#bm-overlay span:has(>input[type=file]+button){font-size:small}#bm-overlay select{border-width:1px;border-radius:1em;padding:0 .75ch;font-size:small}#bm-overlay select option{background-color:#153063cc}#bm-overlay button:hover,#bm-overlay button:focus-visible{background-color:#1061e5}#bm-overlay button:active #bm-overlay button:disabled{background-color:#2e97ff}#bm-overlay button:disabled{text-decoration:line-through}#bm-overlay details>summary{font-size:small}#bm-checkbox-container label{font-size:small}#bm-templatefilter-list span{word-break:break-word}span.bm-templatename:hover,a.bm-templatename:focus{text-decoration:underline}\n");
  var overlayMain = new Overlay(name, version);
  var templateManager = new TemplateManager(name, version, overlayMain);
  var apiManager = new ApiManager(templateManager);
  overlayMain.setApiManager(apiManager);
  GM.getValue("bmTemplates", "{}").then(async (storageTemplatesValue) => {
    const userSettingsValue = await GM.getValue("bmUserSettings", "{}");
    let userSettings;
    try {
      userSettings = JSON.parse(userSettingsValue);
    } catch {
      userSettings = {};
    }
    console.log(userSettings);
    console.log(Object.keys(userSettings).length);
    if (Object.keys(userSettings).length == 0) {
      const uuid = crypto.randomUUID();
      console.log(uuid);
      templateManager.setUserSettings({
        "uuid": uuid,
        "hideLockedColors": false,
        "progressBarEnabled": true,
        "hideCompletedColors": false,
        "sortBy": "total-desc",
        "anchor": "lt",
        // Top left
        "smartPlace": false,
        // Hidden in settings
        "memorySavingMode": false,
        "eventEnabled": false,
        "eventProvider": "",
        "eventClaimedShown": true,
        "eventUnavailableShown": true,
        "onlyCurrentColorShown": false,
        "themeOverridden": false,
        "currentTheme": "",
        "hideStatus": false,
        "hideTemplates": false,
        "isLegacyDisplay": false,
        // now used as the template display mode
        "showErrorMap": false,
        "showOnlyEnabledColorsErrorMap": false,
        // Hidden in settings
        "showIntegerZoom": false,
        "enableKeybinds": false,
        "lineTemplateButton": false
        // Hidden in settings
      });
      templateManager.storeUserSettings();
    } else {
      templateManager.setUserSettings(userSettings);
    }
    let storageTemplates;
    try {
      storageTemplates = JSON.parse(storageTemplatesValue);
    } catch {
      storageTemplates = {};
    }
    console.log(storageTemplates);
    templateManager.importJSON(storageTemplates);
    await buildOverlayMain();
    overlayMain.handleDrag("#bm-overlay", "#bm-bar-drag");
    const keysPressed = /* @__PURE__ */ new Set();
    let animationFrameId = null;
    const PAN_SPEED = 25;
    function panLoop() {
      if (!templateManager.areKeybindsEnabled()) {
        keysPressed.clear();
      }
      if (keysPressed.size === 0) {
        animationFrameId = null;
        return;
      }
      let dx = 0;
      let dy = 0;
      if (keysPressed.has("w") || keysPressed.has("arrowup")) dy -= 1;
      if (keysPressed.has("s") || keysPressed.has("arrowdown")) dy += 1;
      if (keysPressed.has("a") || keysPressed.has("arrowleft")) dx -= 1;
      if (keysPressed.has("d") || keysPressed.has("arrowright")) dx += 1;
      if (dx !== 0 || dy !== 0) {
        if (dx !== 0 && dy !== 0) {
          const length = Math.sqrt(dx * dx + dy * dy);
          dx /= length;
          dy /= length;
        }
        panMap([dx * PAN_SPEED, dy * PAN_SPEED]);
      }
      animationFrameId = requestAnimationFrame(panLoop);
    }
    document.addEventListener("keydown", (event) => {
      if (!templateManager.areKeybindsEnabled()) {
        return;
      }
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
        return;
      }
      const key = event.key.toLowerCase();
      const validKeys = ["w", "a", "s", "d"];
      if (!validKeys.includes(key) || keysPressed.has(key)) {
        return;
      }
      keysPressed.add(key);
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(panLoop);
      }
    });
    document.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      keysPressed.delete(key);
    });
    apiManager.spontaneousResponseListener(overlayMain);
    observeBlack();
    consoleLog(`%c${name}%c (${version}) userscript has loaded!`, "color: cornflowerblue;", "");
  });
  function createZoomButtons() {
    const zoom1 = document.getElementById("BM-zoom-1x");
    if (zoom1) return;
    const ref = Array.from(document.querySelectorAll(".gap-1>.btn[title]")).slice(-1)[0];
    if (!ref) return;
    const container = ref.parentNode;
    if (!container) return;
    const isShown = templateManager.areIntegerZoomButtonsShown();
    function createZoomButton(zoomLevel) {
      const zoomBtn = document.createElement("button");
      const label = zoomLevel === 0 ? "Min" : zoomLevel + "x";
      zoomBtn.id = `BM-zoom-${label}`;
      zoomBtn.textContent = label;
      zoomBtn.className = ref.className;
      zoomBtn.classList.add("bm-zoom-btn");
      if (!isShown) {
        zoomBtn.style.display = "none";
      }
      ;
      zoomBtn.onclick = function() {
        var actualZoomLevel = zoomLevel;
        if (zoomLevel === 0) {
          var currentTileSize = getCurrentTileSize();
          var epsilon = 1e-7;
          setZoom(Math.log2(8 * currentTileSize * currentTileSize) / 2 + epsilon);
          return;
        }
        setZoom(Math.log2(4e3 * actualZoomLevel / window["devicePixelRatio"]));
      };
      container.appendChild(zoomBtn);
    }
    ;
    [0, 1, 2, 3, 4, 5, 10, 25].forEach((zoom) => createZoomButton(zoom));
  }
  function observeBlack() {
    const observer = new MutationObserver((mutations, observer2) => {
      createZoomButtons();
      apiManager.updateDownloadButton(true);
      const black = document.querySelector("#color-1");
      if (!black) {
        return;
      }
      let move = document.querySelector("#bm-button-move");
      if (!move) {
        move = document.createElement("button");
        move.id = "bm-button-move";
        move.textContent = "\uC6C0\uC9C1\uC774\uAE30 \u2191";
        move.className = "btn btn-soft";
        move.onclick = function() {
          const roundedBox = this.parentNode.parentNode.parentNode.parentNode;
          const shouldMoveUp = this.textContent == "\uC6C0\uC9C1\uC774\uAE30 \u2191";
          roundedBox.parentNode.className = roundedBox.parentNode.className.replace(shouldMoveUp ? "bottom" : "top", shouldMoveUp ? "top" : "bottom");
          roundedBox.style.borderTopLeftRadius = shouldMoveUp ? "0px" : "var(--radius-box)";
          roundedBox.style.borderTopRightRadius = shouldMoveUp ? "0px" : "var(--radius-box)";
          roundedBox.style.borderBottomLeftRadius = shouldMoveUp ? "var(--radius-box)" : "0px";
          roundedBox.style.borderBottomRightRadius = shouldMoveUp ? "var(--radius-box)" : "0px";
          this.textContent = shouldMoveUp ? "\uC6C0\uC9C1\uC774\uAE30 \u2193" : "\uC6C0\uC9C1\uC774\uAE30 \u2191";
        };
        const fourthParent = black.parentNode.parentNode.parentNode.parentNode;
        const fifthParent = fourthParent.parentNode;
        const paintPixel = fourthParent.querySelector("h2");
        const container = paintPixel ? paintPixel.parentNode : fifthParent.querySelector("h2 + div");
        if (container) {
          container.appendChild(move);
        }
      }
      if (templateManager.userSettings?.smartPlace ?? false) {
        let paint = document.querySelector("#bm-button-paint");
        if (!paint) {
          const paint_onclick = function(out_of_screen = true) {
            const currentCharges = Math.floor(apiManager.getCurrentCharges());
            if (currentCharges === 0) return;
            let examples = [];
            const toggleStatus = new Set(templateManager.getDisplayedColorsSorted());
            for (const stats of templateManager.tileProgress.values()) {
              Object.entries(stats.palette).forEach(([colorKey, content]) => {
                if (!toggleStatus.has(colorKey)) return;
                const colorId = rgbToMeta.get(colorKey).id;
                if (!templateManager.isColorUnlocked(colorId)) return;
                examples.extend(content.examplesEnabled.map((example) => [colorId, example]));
              });
            }
            ;
            let exampleCoord;
            if (examples.length === 0) return;
            try {
              const geoCoords = getCenterGeoCoords();
              const tileCoords = coordsGeoCoordsToTileCoords(geoCoords[0], geoCoords[1]);
              exampleCoord = [
                tileCoords[0][0] * templateManager.tileSize + tileCoords[1][0],
                tileCoords[0][1] * templateManager.tileSize + tileCoords[1][1]
              ];
            } catch {
              const example = examples[Math.floor(Math.random() * examples.length)][1];
              exampleCoord = [
                example[0][0] * templateManager.tileSize + example[1][0],
                example[0][1] * templateManager.tileSize + example[1][1]
              ];
            }
            ;
            const canvas = document.querySelector("canvas.maplibregl-canvas");
            if (!canvas) return;
            if (!out_of_screen) {
              const wplaceBad2 = !isMapTilerLoaded();
              const pxPerW = wplaceBad2 ? 512 * 2 ** (13 + 0) / 2048e3 : getPixelPerWplacePixel();
              examples = examples.filter(([color1, coord1]) => {
                const _coord1 = [
                  coord1[0][0] * templateManager.tileSize + coord1[1][0],
                  coord1[0][1] * templateManager.tileSize + coord1[1][1]
                ];
                return Math.abs(_coord1[0] - exampleCoord[0]) * pxPerW * 2 < canvas.offsetWidth && Math.abs(_coord1[1] - exampleCoord[1]) * pxPerW * 2 < canvas.offsetHeight;
              });
              if (examples.length === 0) return;
            }
            if (examples.length <= currentCharges) {
            } else if (examples.length < 5e3) {
              examples = examples.sort(([color1, coord1], [color2, coord2]) => {
                const _coord1 = [
                  coord1[0][0] * templateManager.tileSize + coord1[1][0],
                  coord1[0][1] * templateManager.tileSize + coord1[1][1]
                ];
                const _coord2 = [
                  coord2[0][0] * templateManager.tileSize + coord2[1][0],
                  coord2[0][1] * templateManager.tileSize + coord2[1][1]
                ];
                const dist1 = Math.sqrt(Math.pow(_coord1[0] - exampleCoord[0], 2) + Math.pow(_coord1[1] - exampleCoord[1], 2)) * (1 + Math.random() * 0.2);
                const dist2 = Math.sqrt(Math.pow(_coord2[0] - exampleCoord[0], 2) + Math.pow(_coord2[1] - exampleCoord[1], 2)) * (1 + Math.random() * 0.2);
                return dist1 - dist2;
              }).slice(0, currentCharges);
            } else {
              const buckets = {};
              const resultExamples = [];
              examples.forEach(([color1, coord1]) => {
                const _coord1 = [
                  coord1[0][0] * templateManager.tileSize + coord1[1][0],
                  coord1[0][1] * templateManager.tileSize + coord1[1][1]
                ];
                const dist1 = Math.floor(Math.sqrt(Math.pow(_coord1[0] - exampleCoord[0], 2) + Math.pow(_coord1[1] - exampleCoord[1], 2)) * (1 + Math.random() * 0.2));
                if (buckets[dist1] === void 0) {
                  buckets[dist1] = [
                    [color1, coord1]
                  ];
                } else {
                  buckets[dist1].push(
                    [color1, coord1]
                  );
                }
              });
              const sortedDist = Object.keys(buckets).sort((a, b) => a - b);
              for (const dist of sortedDist) {
                resultExamples.extend(buckets[dist]);
                if (resultExamples.length >= currentCharges) break;
              }
              examples = resultExamples.slice(0, currentCharges);
            }
            let refCoord;
            if (out_of_screen) {
              refCoord = examples[0][1];
              teleportToTileCoords(refCoord[0], refCoord[1]);
            } else {
              const geoCoords = getCenterGeoCoords();
              refCoord = coordsGeoCoordsToTileCoords(geoCoords[0], geoCoords[1]);
              teleportToTileCoords(refCoord[0], refCoord[1], true);
            }
            const wplaceBad = !isMapTilerLoaded();
            setTimeout(() => {
              const pxPerW = wplaceBad ? 512 * 2 ** (13 + 0) / 2048e3 : getPixelPerWplacePixel();
              let currentColorId = null;
              const refW = [
                refCoord[0][0] * templateManager.tileSize + refCoord[1][0],
                refCoord[0][1] * templateManager.tileSize + refCoord[1][1]
              ];
              const cliC = [canvas.offsetWidth / 2, canvas.offsetHeight / 2];
              for (let i = 0; i < examples.length; i++) {
                const [colorId, example] = examples[i];
                if (currentColorId !== colorId) {
                  currentColorId = colorId;
                  document.getElementById("color-" + colorId).click();
                }
                ;
                const exW = [
                  example[0][0] * templateManager.tileSize + example[1][0],
                  example[0][1] * templateManager.tileSize + example[1][1]
                ];
                const ev = new MouseEvent("click", {
                  "bubbles": true,
                  "cancelable": true,
                  "clientX": cliC[0] + (exW[0] - refW[0]) * pxPerW,
                  "clientY": cliC[1] + (exW[1] - refW[1]) * pxPerW,
                  "button": 0
                });
                canvas.dispatchEvent(ev);
              }
            }, wplaceBad ? 1e4 : 0);
          };
          paint = document.createElement("button");
          paint.id = "bm-button-paint";
          paint.textContent = "\uCE60\uD558\uAE30";
          paint.className = "btn btn-soft";
          paint.onclick = () => paint_onclick(true);
          const paint2 = document.createElement("button");
          paint2.id = "bm-button-paint";
          paint2.textContent = "\uD654\uBA74 \uCC44\uC6B0\uAE30";
          paint2.className = "btn btn-soft";
          paint2.onclick = () => paint_onclick(false);
          const fourthParent = black.parentNode.parentNode.parentNode.parentNode;
          const fifthParent = fourthParent.parentNode;
          const paintPixel = fourthParent.querySelector("h2");
          const container = paintPixel ? paintPixel.parentNode : fifthParent.querySelector("h2 + div");
          if (container) {
            container.appendChild(paint);
            container.appendChild(paint2);
          }
        }
      }
      ;
      Array.from(black.parentNode.parentNode.getElementsByTagName("button")).forEach((button) => {
        if (button.parentElement.classList.contains("bm-hooked")) {
          return;
        }
        button.addEventListener("click", function() {
          if (templateManager.isOnlyCurrentColorShown()) {
            setTimeout(() => {
              templateManager.createOverlayOnMap();
              if (templateManager.isErrorMapShown() && templateManager.isErrorMapOnlyEnabledColorsShown()) {
                forceRefreshTiles();
              }
              ;
              buildColorFilterList();
            }, 0);
          }
          ;
        });
        button.parentElement.classList.add("bm-hooked");
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  var persistCoords = () => {
    try {
      const [[tx, ty], [px, py]] = getOverlayCoords();
      const data = { tx, ty, px, py };
      GM.setValue("bmCoords", JSON.stringify(data));
    } catch (_) {
    }
  };
  var teleportCoords = () => {
    try {
      const [[tx, ty], [px, py]] = getOverlayCoords();
      teleportToTileCoords([tx, ty], [px, py]);
    } catch (_) {
    }
  };
  async function buildOverlayMain() {
    let isMinimized = false;
    let savedCoords = {};
    const savedCoordsValue = await GM.getValue("bmCoords", "{}");
    try {
      savedCoords = JSON.parse(savedCoordsValue) || {};
    } catch {
      savedCoords = {};
    }
    overlayMain.addDiv({ "id": "bm-overlay", "style": "top: 10px; right: 75px;" }).addDiv({ "id": "bm-contain-header" }).addDiv({ "id": "bm-bar-drag" }).buildElement().addImg(
      { "alt": "\uBE14\uB8E8 \uB9C8\uBE14 \uC544\uC774\uCF58 - \uB20C\uB7EC\uC11C \uCD5C\uC18C\uD654/\uCD5C\uB300\uD654", "src": "https://raw.githubusercontent.com/SwingTheVine/Wplace-BlueMarble/main/dist/assets/Favicon.png", "style": "cursor: pointer;" },
      (instance, img) => {
        img.addEventListener("click", () => {
          isMinimized = !isMinimized;
          const overlay = document.querySelector("#bm-overlay");
          const header = document.querySelector("#bm-contain-header");
          const dragBar = document.querySelector("#bm-bar-drag");
          const coordsContainer = document.querySelector("#bm-contain-coords");
          const coordsButton = document.querySelector("#bm-button-coords");
          const createButton = document.querySelector("#bm-button-create");
          const enableButton = document.querySelector("#bm-button-enable");
          const disableButton = document.querySelector("#bm-button-disable");
          const eventContainer = document.querySelector("#bm-contain-eventitem");
          const coordInputs = document.querySelectorAll("#bm-contain-coords input");
          const statusTextbox = document.getElementById(instance.outputStatusId);
          if (!isMinimized) {
            overlay.style.width = "auto";
            overlay.style.maxWidth = "300px";
            overlay.style.minWidth = "200px";
            overlay.style.padding = "10px";
          }
          const elementsToToggle = [
            "#bm-overlay h1",
            // Main title "Blue Marble"
            "#bm-contain-userinfo",
            // User information section (username, droplets, level)
            "#bm-overlay hr",
            // Visual separator lines
            "#bm-contain-automation > *:not(#bm-contain-coords)",
            // Automation section excluding coordinates
            "#bm-contain-buttons-action"
            // Action buttons container
          ];
          elementsToToggle.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element) => {
              element.style.display = isMinimized ? "none" : "";
            });
          });
          if (isMinimized) {
            if (coordsContainer) {
              coordsContainer.style.display = "none";
            }
            if (coordsButton) {
              coordsButton.style.display = "none";
            }
            if (createButton) {
              createButton.style.display = "none";
            }
            if (enableButton) {
              enableButton.style.display = "none";
            }
            if (disableButton) {
              disableButton.style.display = "none";
            }
            if (templateManager.isEventEnabled()) {
              eventContainer.style.display = "none";
            }
            if (!templateManager.isStatusHidden()) {
              statusTextbox.style.display = "none";
            }
            coordInputs.forEach((input) => {
              input.style.display = "none";
            });
            overlay.style.width = "60px";
            overlay.style.height = "76px";
            overlay.style.maxWidth = "60px";
            overlay.style.minWidth = "60px";
            overlay.style.padding = "8px";
            img.style.marginLeft = "3px";
            header.style.textAlign = "center";
            header.style.margin = "0";
            header.style.marginBottom = "0";
            if (dragBar) {
              dragBar.style.display = "";
              dragBar.style.marginBottom = "0.25em";
            }
          } else {
            if (coordsContainer) {
              coordsContainer.style.display = "";
              coordsContainer.style.flexDirection = "";
              coordsContainer.style.justifyContent = "";
              coordsContainer.style.alignItems = "";
              coordsContainer.style.gap = "";
              coordsContainer.style.textAlign = "";
              coordsContainer.style.margin = "";
            }
            if (coordsButton) {
              coordsButton.style.display = "";
            }
            if (createButton) {
              createButton.style.display = "";
              createButton.style.marginTop = "";
            }
            if (enableButton) {
              enableButton.style.display = "";
              enableButton.style.marginTop = "";
            }
            if (disableButton) {
              disableButton.style.display = "";
              disableButton.style.marginTop = "";
            }
            if (templateManager.isEventEnabled()) {
              eventContainer.style.display = "";
            } else {
              eventContainer.style.display = "none";
            }
            if (!templateManager.isStatusHidden()) {
              statusTextbox.style.display = "";
            } else {
              statusTextbox.style.display = "none";
            }
            coordInputs.forEach((input) => {
              input.style.display = "";
            });
            img.style.marginLeft = "";
            overlay.style.padding = "10px";
            header.style.textAlign = "";
            header.style.margin = "";
            header.style.marginBottom = "";
            if (dragBar) {
              dragBar.style.marginBottom = "0.5em";
            }
            overlay.style.width = "";
            overlay.style.height = "";
          }
          img.alt = isMinimized ? "\uBE14\uB8E8 \uB9C8\uBE14 \uC544\uC774\uCF58 - \uCD5C\uC18C\uD654\uB428 (\uD074\uB9AD\uD558\uC5EC \uCD5C\uB300\uD654)" : "\uBE14\uB8E8 \uB9C8\uBE14 \uC544\uC774\uCF58 - \uCD5C\uB300\uD654\uB428 (\uD074\uB9AD\uD558\uC5EC \uCD5C\uC18C\uD654)";
        });
      }
    ).buildElement().addHeader(1, { "textContent": name }).addSmall({ "textContent": ` v${version}` }).buildElement().buildElement().buildElement().addHr().buildElement().addDiv({ "id": "bm-contain-userinfo" }).addP({ "textContent": "\uC774\uB984: " }).addB({ "id": "bm-user-name" }).buildElement().buildElement().addP({ "id": "bm-user-charges" }, (_, element) => {
      element.setAttribute("aria-live", "polite");
    }).addText("\uC644\uCDA9\uAE4C\uC9C0  ").addSpan({ "className": "bm-charge-countdown", "textContent": "--:--" }, (_, element) => {
      element.dataset.role = "countdown";
    }).buildElement().addText(" ").addSpan({ "className": "bm-charge-count", "textContent": "(0 / 0)" }, (_, element) => {
      element.dataset.role = "charge-count";
    }).buildElement().buildElement().addP({ "id": "bm-user-suspend", "style": "display: none;" }, (_, element) => {
      element.setAttribute("aria-live", "polite");
    }).addText("\uC815\uC9C0\uAC00 \uB05D\uB098\uB294 \uC2DC\uAC04: ").addSpan({ "className": "bm-suspend-countdown", "textContent": "--:--" }, (_, element) => {
      element.dataset.role = "suspend-countdown";
    }).buildElement().buildElement().addP({ "id": "bm-user-suspend-reason", "textContent": "\uC774\uC720: ", "style": "display: none;" }).addB({ "id": "bm-suspend-reason", "textContent": "Unknown" }).buildElement().buildElement().addP({ "textContent": "\uBB3C\uBC29\uC6B8: " }).addB({ "id": "bm-user-droplets" }).buildElement().buildElement().addP().addB({ "id": "bm-user-nextlevel", "textContent": "--" }).buildElement().addText(" \uB808\uBCA8\uAE4C\uC9C0 ").addB({ "id": "bm-user-nextpixel", "textContent": "--" }).buildElement().addText(" \uD53D\uC140 \uB0A8\uC74C").buildElement().buildElement().addHr().buildElement().addDiv({ "id": "bm-contain-automation" }).addDiv({ "id": "bm-contain-coords" }).addButton(
      { "id": "bm-button-coords", "className": "bm-help", "style": "margin-top: 0;", "innerHTML": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 6"><circle cx="2" cy="2" r="2"></circle><path d="M2 6 L3.7 3 L0.3 3 Z"></path><circle cx="2" cy="2" r="0.7" fill="white"></circle></svg></svg>' },
      (instance, button) => {
        button.onclick = () => {
          const coords2 = instance.apiManager?.coordsTilePixel;
          const emptyIfUndefined = (value) => value ?? "";
          if (coords2?.[0] === void 0) {
            instance.handleDisplayError("\uC88C\uD45C\uAC00 \uC798\uBABB\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uCE94\uBC84\uC2A4\uB97C \uD074\uB9AD\uD574 \uBCF4\uC168\uB098\uC694?");
            return;
          }
          instance.updateInnerHTML("bm-input-tx", emptyIfUndefined(coords2?.[0]));
          instance.updateInnerHTML("bm-input-ty", emptyIfUndefined(coords2?.[1]));
          instance.updateInnerHTML("bm-input-px", emptyIfUndefined(coords2?.[2]));
          instance.updateInnerHTML("bm-input-py", emptyIfUndefined(coords2?.[3]));
          apiManager.updateDownloadButton();
          persistCoords();
        };
      }
    ).buildElement().addInput({ "type": "number", "id": "bm-input-tx", "placeholder": "\uD0C0\uC77C X", "min": 0, "max": 2047, "step": 1, "required": true, "value": savedCoords.tx ?? "" }, (instance, input) => {
      input.addEventListener("paste", (event) => {
        const clipboardText = (event.clipboardData || window.clipboardData).getData("text");
        const matchResult = [
          /^\s*([012]?\d{1,3}),\s*([012]?\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\s*$/,
          // comma-separated
          /^\s*([012]?\d{1,3})\s+([012]?\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s*$/,
          // space-separated
          /^\s*\(?Tl X: ([012]?\d{1,3}), Tl Y: ([012]?\d{1,3}), Px X: (\d{1,3}), Px Y: (\d{1,3})\)?\s*$/
          // display format
        ].map((r) => r.exec(clipboardText)).filter((r) => r).pop();
        if (matchResult === void 0) {
          return;
        }
        let splitText = matchResult.slice(1).map(Number);
        let coords2 = selectAllCoordinateInputs(document);
        for (let i = 0; i < coords2.length; i++) {
          coords2[i].value = splitText[i];
        }
        apiManager.updateDownloadButton();
        persistCoords();
        event.preventDefault();
      });
      const handler = () => (apiManager.updateDownloadButton(), persistCoords());
      input.addEventListener("input", handler);
      input.addEventListener("change", handler);
    }).buildElement().addInput({ "type": "number", "id": "bm-input-ty", "placeholder": "\uD0C0\uC77C Y", "min": 0, "max": 2047, "step": 1, "required": true, "value": savedCoords.ty ?? "" }, (instance, input) => {
      const handler = () => (apiManager.updateDownloadButton(), persistCoords());
      input.addEventListener("input", handler);
      input.addEventListener("change", handler);
    }).buildElement().addInput({ "type": "number", "id": "bm-input-px", "placeholder": "\uD53D\uC140 X", "min": 0, "max": 2047, "step": 1, "required": true, "value": savedCoords.px ?? "" }, (instance, input) => {
      const handler = () => (apiManager.updateDownloadButton(), persistCoords());
      input.addEventListener("input", handler);
      input.addEventListener("change", handler);
    }).buildElement().addInput({ "type": "number", "id": "bm-input-py", "placeholder": "\uD53D\uC140 Y", "min": 0, "max": 2047, "step": 1, "required": true, "value": savedCoords.py ?? "" }, (instance, input) => {
      const handler = () => (apiManager.updateDownloadButton(), persistCoords());
      input.addEventListener("input", handler);
      input.addEventListener("change", handler);
    }).buildElement().addButton(
      { "id": "bm-button-teleport", "className": "bm-help", "style": "margin-top: 0;", "innerHTML": "\u2708\uFE0F", "title": "\uC774\uB3D9" },
      (instance, button) => {
        button.onclick = () => {
          teleportCoords();
        };
      }
    ).buildElement().buildElement().addDetails({ "id": "bm-checkbox-container", "textContent": "\uC0AC\uC6A9\uC790 \uC124\uC815", "style": "max-width: 100%; white-space: nowrap; border: 1px solid rgba(255,255,255,0.1); padding: 4px; border-radius: 4px; margin-top: 4px;" }).addDiv({ "id": "bm-user_setting-list", "style": "max-height: 125px; overflow-x: hidden; overflow-y: auto; touch-action: pan-x pan-y; display: flex; flex-direction: column; gap: 4px; margin-top: 3px;" }).addCheckbox({ "id": "bm-only-current-color-enabled", "textContent": "\uD604\uC7AC \uC0C9\uC0C1\uB9CC \uD45C\uC2DC", "checked": templateManager.isOnlyCurrentColorShown() }, (instance, label, checkbox) => {
      checkbox.addEventListener("change", () => {
        templateManager.setOnlyCurrentColorShown(checkbox.checked);
        if (checkbox.checked) {
          instance.handleDisplayStatus("\uC624\uC9C1 \uC120\uD0DD\uB41C \uC0C9\uC0C1\uB9CC \uD45C\uC2DC\uB429\uB2C8\uB2E4.");
          buildColorFilterList();
        } else {
          instance.handleDisplayStatus("\uC0C9\uC0C1 \uD544\uD130\uAC00 \uBCF5\uC6D0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
          buildColorFilterList();
        }
        ;
        templateManager.createOverlayOnMap();
        if (templateManager.isErrorMapShown() && templateManager.isErrorMapOnlyEnabledColorsShown()) {
          forceRefreshTiles();
        }
        ;
        buildColorFilterList();
      });
    }).buildElement().addCheckbox({ "id": "bm-checkbox-colors-unlocked", "textContent": "\uC7A0\uAE34 \uC0C9\uC0C1 \uC228\uAE30\uAE30", "checked": templateManager.areLockedColorsHidden() }, (instance, label, checkbox) => {
      checkbox.addEventListener("change", () => {
        templateManager.setHideLockedColors(checkbox.checked);
        buildColorFilterList();
        templateManager.createOverlayOnMap();
        if (checkbox.checked) {
          instance.handleDisplayStatus("\uBAA8\uB4E0 \uC7A0\uAE34 \uC0C9\uC0C1\uC744 \uC228\uACBC\uC2B5\uB2C8\uB2E4.");
        } else {
          instance.handleDisplayStatus("\uBAA8\uB4E0 \uC0C9\uC0C1\uC744 \uD45C\uC2DC\uD569\uB2C8\uB2E4.");
        }
      });
    }).buildElement().addCheckbox({ "id": "bm-checkbox-colors-completed", "textContent": "\uC644\uB8CC\uB41C \uC0C9\uC0C1 \uC228\uAE30\uAE30", "checked": templateManager.areCompletedColorsHidden() }, (instance, label, checkbox) => {
      checkbox.addEventListener("change", () => {
        templateManager.setHideCompletedColors(checkbox.checked);
        buildColorFilterList();
        templateManager.createOverlayOnMap();
        if (checkbox.checked) {
          instance.handleDisplayStatus("\uBAA8\uB4E0 \uC644\uB8CC\uB41C \uC0C9\uC0C1\uC744 \uC228\uACBC\uC2B5\uB2C8\uB2E4.");
        } else {
          instance.handleDisplayStatus("\uBAA8\uB4E0 \uC0C9\uC0C1\uC744 \uD45C\uC2DC\uD569\uB2C8\uB2E4.");
        }
        if (templateManager.isErrorMapShown() && templateManager.isErrorMapOnlyEnabledColorsShown()) {
          forceRefreshTiles();
        }
      });
    }).buildElement().addCheckbox({ "id": "bm-status-hidden", "textContent": "\uD15C\uD50C\uB9BF \uC624\uBC84\uB808\uC774 \uBE44\uD65C\uC131\uD654", "checked": templateManager.areTemplatesHidden() }, (instance, label, checkbox) => {
      checkbox.addEventListener("change", () => {
        templateManager.setTemplatesHidden(checkbox.checked);
        if (checkbox.checked) {
          instance.handleDisplayStatus("\uD15C\uD50C\uB9BF \uC624\uBC84\uB808\uC774\uAC00 \uBE44\uD65C\uC131\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
          removeLayer("overlay");
        } else {
          instance.handleDisplayStatus("\uD15C\uD50C\uB9BF \uC624\uBC84\uB808\uC774\uAC00 \uD65C\uC131\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
          templateManager.createOverlayOnMap();
        }
      });
    }).buildElement().addCheckbox({ "id": "bm-show-error-map", "textContent": "\uC624\uCC28 \uB9F5 \uD45C\uC2DC", "checked": templateManager.isErrorMapShown() }, (instance, label, checkbox) => {
      checkbox.addEventListener("change", () => {
        templateManager.setErrorMapShown(checkbox.checked);
        document.getElementById("bm-show-only-enabled-colors-on-error-map").parentElement.style.display = checkbox.checked ? "" : "none";
        if (checkbox.checked) {
          instance.handleDisplayStatus("\uC624\uCC28 \uB9F5\uC774 \uD45C\uC2DC\uB429\uB2C8\uB2E4.");
          apiManager.tileCache = {};
          forceRefreshTiles();
        } else {
          instance.handleDisplayStatus("\uC624\uCC28 \uB9F5\uC774 \uC228\uACA8\uC9D1\uB2C8\uB2E4.");
          removeLayer("error");
        }
        ;
      });
    }).buildElement().addCheckbox({ "id": "bm-show-only-enabled-colors-on-error-map", "textContent": "\uC624\uCC28 \uB9F5\uC5D0\uC11C \uD65C\uC131\uD654\uB41C \uC0C9\uC0C1\uB9CC \uD45C\uC2DC", "checked": templateManager.isErrorMapOnlyEnabledColorsShown() }, (instance, label, checkbox) => {
      label.style.paddingLeft = "1em";
      if (templateManager.isErrorMapShown()) {
        label.style.display = "";
      } else {
        label.style.display = "none";
      }
      checkbox.addEventListener("change", () => {
        templateManager.setErrorMapOnlyEnabledColorsShown(checkbox.checked);
        if (checkbox.checked) {
          instance.handleDisplayStatus("\uC624\uCC28 \uB9F5\uC774 \uD65C\uC131\uD654\uB41C \uC0C9\uC0C1\uB9CC \uD45C\uC2DC\uD569\uB2C8\uB2E4.");
        } else {
          instance.handleDisplayStatus("\uC624\uCC28 \uB9F5\uC774 \uD15C\uD50C\uB9BF\uC5D0 \uCC38\uC5EC\uD558\uB294 \uBAA8\uB4E0 \uD53D\uC140\uC744 \uD45C\uC2DC\uD569\uB2C8\uB2E4.");
        }
        ;
        apiManager.tileCache = {};
        forceRefreshTiles();
      });
    }).buildElement().addCheckbox({ "id": "bm-theme-override-enabled", "textContent": "\uD14C\uB9C8 \uB36E\uC5B4\uC4F0\uAE30: ", "checked": templateManager.isThemeOverridden() }, (instance, label, checkbox) => {
      checkbox.addEventListener("change", async () => {
        await templateManager.setThemeOverridden(checkbox.checked);
        const select = document.getElementById("bm-theme-setting");
        select.disabled = !checkbox.checked;
        forceUpdateTheme();
      });
    }).addSelect({ "id": "bm-theme-setting" }, (instance, select) => {
      const currentTheme = templateManager.getCurrentTheme();
      Object.entries(themeList).forEach(([themeValue, [displayText, isDark]]) => {
        const option = document.createElement("option");
        option.value = themeValue;
        option.textContent = displayText;
        if (themeValue === currentTheme) {
          option.selected = true;
        }
        select.appendChild(option);
      });
      select.addEventListener("change", async () => {
        await templateManager.setCurrentTheme(select.value);
        instance.handleDisplayStatus(`\uD14C\uB9C8\uB97C "${themeList[select.value][0]}"\uB85C \uBCC0\uACBD\uD558\uC600\uC2B5\uB2C8\uB2E4.`);
        forceUpdateTheme();
      });
    }).buildElement().buildElement().addCheckbox({ "id": "bm-event-enabled", "textContent": "\uC774\uBCA4\uD2B8 \uD65C\uC131\uD654", "checked": templateManager.isEventEnabled() }, (instance, label, checkbox) => {
      checkbox.addEventListener("change", () => {
        templateManager.setEventEnabled(checkbox.checked);
        if (checkbox.checked) {
          instance.handleDisplayStatus("\uC774\uBCA4\uD2B8 \uBAA8\uB4DC\uAC00 \uD65C\uC131\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
          document.getElementById("bm-contain-eventitem").style.display = "";
          document.getElementById("bm-event-hide-claimed").parentElement.style.display = "";
          document.getElementById("bm-event-hide-unavailable").parentElement.style.display = "";
          apiManager.refreshEventData();
          buildEventList();
        } else {
          instance.handleDisplayStatus("\uC774\uBCA4\uD2B8 \uBAA8\uB4DC\uAC00 \uBE44\uD65C\uC131\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
          document.getElementById("bm-contain-eventitem").style.display = "none";
          document.getElementById("bm-event-hide-claimed").parentElement.style.display = "none";
          document.getElementById("bm-event-hide-unavailable").parentElement.style.display = "none";
        }
      });
    }).buildElement().addCheckbox({ "id": "bm-event-hide-claimed", "textContent": "\uD68D\uB4DD\uD55C \uC774\uBCA4\uD2B8 \uC544\uC774\uD15C \uC228\uAE30\uAE30", "checked": !templateManager.isEventClaimedShown() }, (instance, label, checkbox) => {
      label.style.paddingLeft = "1em";
      if (templateManager.isEventEnabled()) {
        label.style.display = "";
      } else {
        label.style.display = "none";
      }
      checkbox.addEventListener("change", () => {
        templateManager.setEventClaimedShown(!checkbox.checked);
        if (checkbox.checked) {
          instance.handleDisplayStatus("\uD68D\uB4DD\uD55C \uC774\uBCA4\uD2B8 \uC544\uC774\uD15C\uC774 \uC228\uACBC\uC2B5\uB2C8\uB2E4.");
        } else {
          instance.handleDisplayStatus("\uD68D\uB4DD\uD55C \uC774\uBCA4\uD2B8 \uC544\uC774\uD15C\uC774 \uBCF5\uC6D0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
        }
        buildEventList();
      });
    }).buildElement().addCheckbox({ "id": "bm-event-hide-unavailable", "textContent": "\uC0AC\uC6A9\uD560 \uC218 \uC5C6\uB294 \uC774\uBCA4\uD2B8 \uC544\uC774\uD15C \uC228\uAE30\uAE30", "checked": !templateManager.isEventUnavailableShown() }, (instance, label, checkbox) => {
      label.style.paddingLeft = "1em";
      if (templateManager.isEventEnabled()) {
        label.style.display = "";
      } else {
        label.style.display = "none";
      }
      checkbox.addEventListener("change", () => {
        templateManager.setEventUnavailableShown(!checkbox.checked);
        if (checkbox.checked) {
          instance.handleDisplayStatus("\uC0AC\uC6A9\uD560 \uC218 \uC5C6\uB294 \uC774\uBCA4\uD2B8 \uC544\uC774\uD15C\uC774 \uC228\uACA8\uC84C\uC2B5\uB2C8\uB2E4.");
        } else {
          instance.handleDisplayStatus("\uC0AC\uC6A9\uD560 \uC218 \uC5C6\uB294 \uC774\uBCA4\uD2B8 \uC544\uC774\uD15C\uC774 \uBCF5\uC6D0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
        }
        buildEventList();
      });
    }).buildElement().addLabel({ "id": "bm-template-mode", "textContent": "\uD15C\uD50C\uB9BF \uBAA8\uB4DC: " }).addSelect({ "id": "bm-template-setting" }, (instance, select) => {
      const currentMode = templateManager.getTemplateMode();
      const templateModeList = {
        0: "\uC2ED\uC790 (\uAE30\uBCF8)",
        1: "\uC810 (\uC6D0\uBCF8)",
        3: "3x3 \uC0AC\uAC01\uD615"
        // maybe can support something like per-color pattern mode
      };
      Object.entries(templateModeList).forEach(([setValueStr, displayText]) => {
        const option = document.createElement("option");
        option.value = +setValueStr;
        option.textContent = displayText;
        if (+setValueStr === currentMode) {
          option.selected = true;
        }
        select.appendChild(option);
      });
      select.addEventListener("change", async () => {
        await templateManager.setTemplateMode(+select.value);
        instance.handleDisplayStatus(`\uD15C\uD50C\uB9BF \uBAA8\uB4DC\uAC00 "${templateModeList[select.value]}"(\uC73C)\uB85C \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.`);
        templateManager.createOverlayOnMap();
      });
    }).buildElement().buildElement().addCheckbox({ "id": "bm-show-zoom-buttons", "textContent": "\uD655\uB300 \uBC30\uC728 \uBC84\uD2BC \uD45C\uC2DC", "checked": templateManager.areIntegerZoomButtonsShown() }, (instance, label, checkbox) => {
      checkbox.addEventListener("change", () => {
        templateManager.setIntegerZoomButtonsShown(checkbox.checked);
        const concernedElements = Array.from(document.getElementsByClassName("bm-zoom-btn"));
        if (checkbox.checked) {
          instance.handleDisplayStatus("\uD655\uB300 \uBC30\uC728 \uBC84\uD2BC\uC774 \uD45C\uC2DC\uB429\uB2C8\uB2E4.");
          concernedElements.forEach((button) => button.style.display = "");
        } else {
          instance.handleDisplayStatus("\uD655\uB300 \uBC30\uC728 \uBC84\uD2BC\uC774 \uC228\uACA8\uC9D1\uB2C8\uB2E4.");
          concernedElements.forEach((button) => button.style.display = "none");
        }
        ;
      });
    }).buildElement().addCheckbox({ "id": "bm-enable-keybinds", "textContent": "WASD \uD0A4\uBC14\uC778\uB4DC \uC0AC\uC6A9", "checked": templateManager.areKeybindsEnabled() }, (instance, label, checkbox) => {
      checkbox.addEventListener("change", () => {
        templateManager.setKeybindsEnabled(checkbox.checked);
        if (checkbox.checked) {
          instance.handleDisplayStatus("WASD \uD0A4\uBC14\uC778\uB4DC\uAC00 \uCF1C\uC84C\uC2B5\uB2C8\uB2E4.");
        } else {
          instance.handleDisplayStatus("WASD \uD0A4\uBC14\uC778\uB4DC\uAC00 \uBE44\uD65C\uC131\uD654 \uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
        }
        ;
      });
    }).buildElement().addCheckbox({ "id": "bm-enable-line-template", "textContent": "\uBAA8\uC591 \uD15C\uD50C\uB9BF (\uC2E4\uD5D8\uC801)", "checked": templateManager.isLineTemplateButtonShown() }, (instance, label, checkbox) => {
      checkbox.addEventListener("change", () => {
        templateManager.setLineTemplateButtonEnabled(checkbox.checked);
        if (checkbox.checked) {
          apiManager.updateAddLineTemplateButton();
          apiManager.updateAddCircleTemplateButton();
          instance.handleDisplayStatus("\uB77C\uC778 \uBC0F \uC6D0 \uD15C\uD50C\uB9BF \uBC84\uD2BC\uC774 \uC774\uC81C \uD53D\uC140 \uC815\uBCF4\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.");
        } else {
          const btnLineTemplate = document.getElementById("bm-create-line-template");
          if (btnLineTemplate) {
            btnLineTemplate.remove();
          }
          const btnCircleTemplate = document.getElementById("bm-create-circle-template");
          if (btnCircleTemplate) {
            btnCircleTemplate.remove();
          }
          instance.handleDisplayStatus("\uB77C\uC778 \uBC0F \uC6D0 \uD15C\uD50C\uB9BF \uBC84\uD2BC\uC774 \uD53D\uC140 \uC815\uBCF4\uC5D0\uC11C \uC228\uACA8\uC9D1\uB2C8\uB2E4.");
        }
        ;
      });
    }).buildElement().addCheckbox({ "id": "bm-progress-bar-enabled", "textContent": "\uC9C4\uD589\uB960 \uD45C\uC2DC", "checked": templateManager.isProgressBarEnabled() }, (instance, label, checkbox) => {
      checkbox.addEventListener("change", () => {
        templateManager.setProgressBarEnabled(checkbox.checked);
        buildColorFilterList();
        if (checkbox.checked) {
          instance.handleDisplayStatus("\uC9C4\uD589\uB960\uC774 \uCF1C\uC84C\uC2B5\uB2C8\uB2E4.");
        } else {
          instance.handleDisplayStatus("\uC9C4\uD589\uB960\uC774 \uAEBC\uC84C\uC2B5\uB2C8\uB2E4.");
        }
      });
    }).buildElement().addCheckbox({ "id": "bm-status-hidden", "textContent": "\uC0C1\uD0DC \uD45C\uC2DC \uC228\uAE30\uAE30", "checked": templateManager.isStatusHidden() }, (instance, label, checkbox) => {
      checkbox.addEventListener("change", () => {
        templateManager.setStatusHidden(checkbox.checked);
        if (checkbox.checked) {
          instance.handleDisplayStatus("\uC0C1\uD0DC \uD45C\uC2DC\uAC00 \uC228\uACA8\uC84C\uC2B5\uB2C8\uB2E4.");
          document.getElementById(overlayMain.outputStatusId).style.display = "none";
        } else {
          instance.handleDisplayStatus("\uC0C1\uD0DC \uD45C\uC2DC\uAC00 \uBCF5\uC6D0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
          document.getElementById(overlayMain.outputStatusId).style.display = "";
        }
      });
    }).buildElement().addCheckbox({ "id": "bm-memory-saving-enabled", "textContent": "\uBA54\uBAA8\uB9AC \uC808\uC57D \uBAA8\uB4DC (\uC2E4\uD5D8\uC801)", "checked": templateManager.isMemorySavingModeOn() }, (instance, label, checkbox) => {
      checkbox.addEventListener("change", () => {
        templateManager.setMemorySavingMode(checkbox.checked);
        buildColorFilterList();
        if (checkbox.checked) {
          instance.handleDisplayStatus("\uBA54\uBAA8\uB9AC \uC808\uC57D \uBAA8\uB4DC\uAC00 \uCF1C\uC84C\uC2B5\uB2C8\uB2E4. \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C \uACE0\uCE68\uD558\uBA74 \uD6A8\uACFC\uAC00 \uC644\uC804\uD788 \uD65C\uC131\uD654\uB429\uB2C8\uB2E4.");
        } else {
          instance.handleDisplayStatus("\uBA54\uBAA8\uB9AC \uC808\uC57D \uBAA8\uB4DC\uAC00 \uAEBC\uC84C\uC2B5\uB2C8\uB2E4. \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C \uACE0\uCE68\uD558\uBA74 \uD6A8\uACFC\uAC00 \uC644\uC804\uD788 \uD65C\uC131\uD654\uB429\uB2C8\uB2E4.");
        }
      });
    }).buildElement().buildElement().buildElement().addDetails({ "id": "bm-contain-colorfilter", "textContent": "Colors", "style": "border: 1px solid rgba(255,255,255,0.1); padding: 4px; border-radius: 4px; margin-top: 4px;" }, (instance, summary, details) => {
      details.open = true;
    }).addP({ "textContent": "\uC0C9\uC0C1 \uC815\uB82C \uAE30\uC900 ", "style": "font-size: small; margin-top: 3px; margin-left: 5px;" }).addSelect({ "id": "bm-color-sort" }, (instance, select) => {
      const order = [
        "\uC624\uB984\uCC28\uC21C",
        "\uB0B4\uB9BC\uCC28\uC21C"
      ];
      const currentSortBy = templateManager.getSortBy();
      Object.keys(sortByOptions).forEach((o) => {
        order.forEach((o2) => {
          const option = document.createElement("option");
          option.value = `${o.toLowerCase()}-${o2.toLowerCase()}`;
          const displayName = sortByDisplayNames[o] || o;
          option.textContent = `${displayName} (${o2}.)`;
          if (option.value === currentSortBy) {
            option.selected = true;
          }
          select.appendChild(option);
        });
      });
      select.addEventListener("change", () => {
        templateManager.setSortBy(select.value);
        buildColorFilterList();
        const parts = select.value.split("-");
        const displayName = sortByDisplayNames[parts[0]] || parts[0];
        instance.handleDisplayStatus(`\uC0C9\uC0C1 \uC815\uB82C \uAE30\uC900\uC744 "${displayName}" ${parts[1]}\uC73C\uB85C \uBC14\uAFE8\uC2B5\uB2C8\uB2E4.`);
      });
    }).buildElement().buildElement().addDiv({ "id": "bm-button-colors-container", "style": "display: flex; gap: 6px; margin-top: 3px; margin-bottom: 3px;" }).addButton({ "id": "bm-button-colors-enable-all", "textContent": "\uBAA8\uB450 \uD65C\uC131\uD654" }, (instance, button) => {
      button.onclick = () => {
        templateManager.templatesArray.forEach((t) => {
          if (!t?.colorPalette) {
            return;
          }
          Object.values(t.colorPalette).forEach((v) => v.enabled = true);
        });
        syncToggleList();
        templateManager.createOverlayOnMap();
        buildColorFilterList();
        instance.handleDisplayStatus("\uBAA8\uB4E0 \uC0C9\uC0C1\uC774 \uD65C\uC131\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
        if (templateManager.isErrorMapShown() && templateManager.isErrorMapOnlyEnabledColorsShown()) {
          forceRefreshTiles();
        }
        ;
      };
    }).buildElement().addButton({ "id": "bm-button-colors-disable-all", "textContent": "\uBAA8\uB450 \uBE44\uD65C\uC131\uD654" }, (instance, button) => {
      button.onclick = () => {
        templateManager.templatesArray.forEach((t) => {
          if (!t?.colorPalette) {
            return;
          }
          Object.values(t.colorPalette).forEach((v) => v.enabled = false);
        });
        syncToggleList();
        removeLayer("overlay");
        buildColorFilterList();
        instance.handleDisplayStatus("\uBAA8\uB4E0 \uC0C9\uC0C1\uC774 \uBE44\uD65C\uC131\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
        if (templateManager.isErrorMapShown() && templateManager.isErrorMapOnlyEnabledColorsShown()) {
          forceRefreshTiles();
        }
        ;
      };
    }).buildElement().buildElement().addDiv({ "id": "bm-colorfilter-list", "style": "max-height: 125px; overflow: auto; touch-action: pan-x pan-y; display: flex; flex-direction: column; gap: 4px;" }).buildElement().buildElement().addDetails({ "id": "bm-contain-templatefilter", "textContent": "\uD15C\uD50C\uB9BF", "style": "border: 1px solid rgba(255,255,255,0.1); padding: 4px; border-radius: 4px; margin-top: 4px;" }, (instance, summary, details) => {
      details.open = true;
    }).addDiv({ "id": "bm-contain-buttons-template", "style": "margin-bottom: 3px;" }).addInputFile({ "id": "bm-input-file-template", "textContent": "\uC774\uBBF8\uC9C0 \uC120\uD0DD", "accept": "image/png, image/jpeg, image/webp, image/bmp, image/gif" }).addButton({ "id": "bm-button-create", "textContent": "\uD15C\uD50C\uB9BF \uC0DD\uC131", "style": "margin: 0 1ch;" }, (instance, button) => {
      button.onclick = async () => {
        const input = document.querySelector("#bm-input-file-template");
        const coordTlX = document.querySelector("#bm-input-tx");
        if (!coordTlX.checkValidity()) {
          coordTlX.reportValidity();
          instance.handleDisplayError("\uC88C\uD45C\uAC00 \uC798\uBABB\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uCE94\uBC84\uC2A4\uB97C \uD074\uB9AD\uD574 \uBCF4\uC168\uB098\uC694?");
          return;
        }
        const coordTlY = document.querySelector("#bm-input-ty");
        if (!coordTlY.checkValidity()) {
          coordTlY.reportValidity();
          instance.handleDisplayError("\uC88C\uD45C\uAC00 \uC798\uBABB\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uCE94\uBC84\uC2A4\uB97C \uD074\uB9AD\uD574 \uBCF4\uC168\uB098\uC694?");
          return;
        }
        const coordPxX = document.querySelector("#bm-input-px");
        if (!coordPxX.checkValidity()) {
          coordPxX.reportValidity();
          instance.handleDisplayError("\uC88C\uD45C\uAC00 \uC798\uBABB\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uCE94\uBC84\uC2A4\uB97C \uD074\uB9AD\uD574 \uBCF4\uC168\uB098\uC694?");
          return;
        }
        const coordPxY = document.querySelector("#bm-input-py");
        if (!coordPxY.checkValidity()) {
          coordPxY.reportValidity();
          instance.handleDisplayError("\uC88C\uD45C\uAC00 \uC798\uBABB\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uCE94\uBC84\uC2A4\uB97C \uD074\uB9AD\uD574 \uBCF4\uC168\uB098\uC694?");
          return;
        }
        if (!input?.files[0]) {
          instance.handleDisplayError(`\uD30C\uC77C\uC774 \uC120\uD0DD\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4!`);
          return;
        }
        await templateManager.createTemplate(
          input.files[0],
          input.files[0]?.name.replace(/\.[^/.]+$/, ""),
          [
            Number(coordTlX.value),
            Number(coordTlY.value),
            Number(coordPxX.value),
            Number(coordPxY.value)
          ],
          templateManager.getAnchor()
        );
        instance.handleDisplayStatus(`\uCE94\uBC84\uC2A4\uC5D0 \uD15C\uD50C\uB9BF\uC774 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4!`);
      };
    }).buildElement().addSelect({ "id": "bm-template-anchor" }, (instance, select) => {
      const anchors = {
        "lt": "\u27D4",
        "mt": "\u2A2A",
        "rt": "\u14AC",
        "lm": "\uA70F",
        "mm": "\u22A1",
        "rm": "\uA70A",
        "lb": "\u013F",
        "mb": "\u2238",
        "rb": "\u27D3"
      };
      const anchorTextX = {
        "l": "\uC67C\uCABD",
        "m": "\uC911\uC559",
        "r": "\uC624\uB978\uCABD"
      };
      const anchorTextY = {
        "t": "\uC704",
        "m": "\uC911\uC559",
        "b": "\uC544\uB798"
      };
      const currentAnchor = templateManager.getAnchor();
      Object.entries(anchors).forEach(([anchor, displayText]) => {
        const option = document.createElement("option");
        option.value = anchor;
        option.textContent = displayText;
        if (anchor === currentAnchor) {
          option.selected = true;
        }
        select.appendChild(option);
      });
      select.addEventListener("change", () => {
        templateManager.setAnchor(select.value);
        instance.handleDisplayStatus(`\uAE30\uBCF8 \uD15C\uD50C\uB9BF \uC815\uB82C\uC774 "${anchorTextY[select.value[1]]} ${anchorTextX[select.value[0]]}"\uB85C \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.`);
      });
    }).buildElement().buildElement().addDiv({ "id": "bm-templatefilter-list", "style": "max-height: 125px; overflow: auto; touch-action: pan-x pan-y; display: flex; flex-direction: column; gap: 4px;" }).buildElement().buildElement().addDetails({ "id": "bm-contain-eventitem", "textContent": "\uC774\uBCA4\uD2B8", "style": "border: 1px solid rgba(255,255,255,0.1); padding: 4px; border-radius: 4px; display: none; margin-top: 4px;" }, (instance, summary, details) => {
      if (templateManager.isEventEnabled()) {
        details.style.display = "";
      }
      details.open = true;
    }).addButton({ "id": "bm-button-set-eventprovider", "textContent": "\uB370\uC774\uD130 \uC81C\uACF5\uC790 \uC124\uC815", "style": "margin: 0 1ch;" }, (instance, button) => {
      button.onclick = () => {
        const currentProvider = templateManager.getEventProvider();
        const providerURL = prompt("\uC774\uBCA4\uD2B8 \uB370\uC774\uD130 \uC81C\uACF5\uC790\uC758 JSON URL\uC744 \uC785\uB825\uD558\uC138\uC694:", currentProvider === "" ? "https://wplace.samuelscheit.com/tiles/pumpkin.json" : currentProvider);
        if (!providerURL) {
          return;
        }
        const isUrl = ((content) => {
          try {
            return Boolean(new URL(content));
          } catch (e) {
            return false;
          }
        })(providerURL);
        if (!isUrl) {
          alert("URL\uC774 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4!");
          return;
        }
        templateManager.setEventProvider(providerURL);
        buildEventList();
      };
    }).buildElement().addButton({ "id": "bm-button-refresh-event", "textContent": "\uB370\uC774\uD130 \uC0C8\uB85C \uACE0\uCE68", "style": "margin: 0 1ch;" }, (instance, button) => {
      button.onclick = () => buildEventList();
    }).buildElement().addDiv({ "id": "bm-eventitem-list", "style": "max-height: 125px; overflow: auto; touch-action: pan-x pan-y; display: flex; flex-direction: column; gap: 4px;" }).buildElement().buildElement().addTextarea({ "id": overlayMain.outputStatusId, "placeholder": `\uC0C1\uD0DC: \uC790\uB294\uC911...
\uBC84\uC804: ${version}`, "readOnly": true }, (instance, textarea) => {
      if (templateManager.isStatusHidden()) {
        textarea.style.display = "none";
      }
    }).buildElement().addDiv({ "id": "bm-contain-buttons-action" }).addDiv().addButton(
      { "id": "bm-button-convert", "className": "bm-help", "innerHTML": "\u{1F3A8}", "title": "\uD15C\uD50C\uB9BF \uC0C9\uC0C1 \uBCC0\uD658\uAE30" },
      (instance, button) => {
        button.addEventListener("click", () => {
          window.open("https://pepoafonso.github.io/color_converter_wplace/", "_blank", "noopener noreferrer");
        });
      }
    ).buildElement().addButton(
      { "id": "bm-button-website", "className": "bm-help", "innerHTML": "\u{1F310}", "title": "\uACF5\uC2DD \uBE14\uB8E8 \uB9C8\uBE14 \uC6F9\uC0AC\uC774\uD2B8" },
      (instance, button) => {
        button.addEventListener("click", () => {
          window.open("https://bluemarble.lol/", "_blank", "noopener noreferrer");
        });
      }
    ).buildElement().buildElement().addDiv({ "id": "bm-footer" }).addSmall({ "textContent": `SwingTheVine \uC81C\uC791 | TWY \uD3EC\uD06C | sungsoos \uBC88\uC5ED`, "style": "margin-top: auto;" }).buildElement().buildElement().buildElement().buildElement().buildOverlay(document.body);
    window.syncToggleList = function syncToggleList2() {
      try {
        (templateManager.templatesArray ?? []).forEach((t) => {
          const key = t.storageKey;
          if (key && templateManager.templatesJSON?.templates?.[key]) {
            const templateJSON = templateManager.templatesJSON.templates[key];
            templateJSON.enabled = t.enabled;
            templateJSON.palette = t.colorPalette;
          }
        });
        templateManager.storeTemplates();
      } catch (_) {
      }
      ;
    };
    window.buildColorFilterList = function buildColorFilterList2() {
      const listContainer = document.getElementById("bm-colorfilter-list");
      const colorFilterHeader = document.querySelector("#bm-contain-colorfilter > summary");
      const toggleStatus = templateManager.getPaletteToggledStatus();
      const hideCompleted = templateManager.areCompletedColorsHidden();
      const hideLocked = templateManager.areLockedColorsHidden();
      listContainer.innerHTML = "";
      const { paletteSum, combinedProgress } = templateManager.getOverallPerColorProgress();
      const templateEnabledState = Object.fromEntries(
        (templateManager?.templatesArray ?? []).map(
          (t) => [t.storageKey, t.enabled]
        )
      );
      const enabledTilesCount = templateManager.templatesArray.filter(
        (template) => template.enabled
      ).reduce(
        (curr, template) => curr + Object.keys(template?.chunked ?? {}).length,
        0
      );
      const loadedTilesCount = [...templateManager.tileProgress.values()].reduce(
        (curr, progress) => curr + (progress.outdated ?? false ? 0 : Object.keys(progress.template).filter(
          (storageKey) => templateEnabledState[storageKey]
        ).length),
        0
      );
      colorFilterHeader.textContent = `\uC0C9\uC0C1 (${loadedTilesCount} / ${enabledTilesCount} \uD0C0\uC77C \uBD88\uB7EC\uC634)`;
      if (!listContainer || !Object.keys(paletteSum).length) {
        if (listContainer) {
          listContainer.innerHTML = "<small>\uD45C\uC2DC\uD560 \uD15C\uD50C\uB9BF \uC0C9\uC0C1 \uC5C6\uC74C.</small>";
        }
        return;
      }
      const sortBy = templateManager.getSortBy();
      const sortByParts = sortBy.split("-");
      const keyFunction = sortByOptions[sortByParts[0]];
      const compareFunction = sortByParts[1] === "asc" ? (a, b) => keyFunction(a) - keyFunction(b) : (a, b) => keyFunction(b) - keyFunction(a);
      const paletteSumSorted = Object.entries(paletteSum).map(([rgb, count]) => [rgb, combinedProgress[rgb]?.paintedAndEnabled ?? 0, count]).sort(compareFunction);
      let hasColors = false;
      for (const [rgb, paintedCount, totalCount] of paletteSumSorted) {
        if (hideLocked && rgb === "other") continue;
        if (hideCompleted && paintedCount === totalCount) continue;
        let row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.gap = "6px";
        let swatch = document.createElement("div");
        swatch.style.width = "14px";
        swatch.style.height = "14px";
        swatch.style.border = "1px solid rgba(255,255,255,0.5)";
        let colorName = "";
        let colorKey = "";
        const tMeta = rgbToMeta.get(rgb);
        if (rgb === "other") {
          swatch.style.background = "#888";
          colorName = "\uAE30\uD0C0";
          colorKey = "other";
        } else if (rgb === "#deface") {
          swatch.style.background = "#deface";
          colorName = "\uD22C\uBA85";
          colorKey = "transparent";
        } else {
          const [r, g, b] = rgb.split(",").map(Number);
          swatch.style.background = `rgb(${r},${g},${b})`;
          try {
            if (tMeta && typeof tMeta.id === "number") {
              if (hideLocked && !templateManager.isColorUnlocked(tMeta.id)) continue;
              const displayName = tMeta?.name || `rgb(${r},${g},${b})`;
              if (tMeta.premium) {
                swatch.style.borderColor = "gold";
                swatch.style.boxShadow = "0 0 2px yellow";
              }
              colorName = `#${tMeta.id} ${displayName}`;
              colorKey = `${r},${g},${b}`;
            }
          } catch (ignored) {
          }
        }
        let label = document.createElement("span");
        label.style.fontSize = "12px";
        if (sortByParts[0] === "remaining" || hideCompleted && sortByParts[0] !== "painted") {
          const remainingLabelText = (totalCount - paintedCount).toLocaleString();
          label.textContent = `${colorName} \u2022 ${remainingLabelText} \uB0A8\uC74C`;
        } else {
          const labelText = totalCount.toLocaleString();
          const paintedLabelText = paintedCount.toLocaleString();
          label.textContent = `${colorName} \u2022 ${paintedLabelText} / ${labelText}`;
        }
        if (templateManager.isProgressBarEnabled()) {
          const percentageProgress = paintedCount / (totalCount === 0 ? 1 : totalCount) * 100;
          row.style.background = `linear-gradient(to right, rgb(0, 128, 0, 0.8) 0%, rgb(0, 128, 0, 0.8) ${percentageProgress}%, transparent ${percentageProgress}%, transparent 100%)`;
        }
        const paletteEntry = combinedProgress[colorKey];
        let currentIndex = 0;
        swatch.addEventListener("click", () => {
          if ((paletteEntry?.examplesEnabled?.length ?? 0) > 0) {
            const examples = paletteEntry.examplesEnabled;
            const exampleIndex = currentIndex % examples.length;
            teleportToTileCoords(examples[exampleIndex][0], examples[exampleIndex][1]);
            ++currentIndex;
          }
        });
        if ((paletteEntry?.examplesEnabled?.length ?? 0) > 0) {
          swatch.style["cursor"] = "pointer";
        }
        ;
        const toggle = document.createElement("input");
        toggle.type = "checkbox";
        if (templateManager.isOnlyCurrentColorShown()) {
          toggle.checked = tMeta?.id === getCurrentColor();
          toggle.disabled = true;
        } else {
          toggle.checked = toggleStatus[rgb] ?? true;
        }
        toggle.addEventListener("change", () => {
          (templateManager.templatesArray ?? []).forEach((template) => {
            if (!template?.colorPalette) return;
            if (template.colorPalette[rgb] !== void 0) {
              template.colorPalette[rgb].enabled = toggle.checked;
            }
          });
          overlayMain.handleDisplayStatus(`${toggle.checked ? "Enabled" : "Disabled"} ${rgb}`);
          syncToggleList();
          templateManager.createOverlayOnMap();
          if (templateManager.isErrorMapShown() && templateManager.isErrorMapOnlyEnabledColorsShown()) {
            forceRefreshTiles();
          }
          ;
        });
        row.appendChild(toggle);
        row.appendChild(swatch);
        row.appendChild(label);
        listContainer.appendChild(row);
        hasColors = true;
      }
      if (!hasColors && listContainer) {
        if (hideLocked) {
          if (hideCompleted) {
            listContainer.innerHTML = "<small>\uBAA8\uB4E0 \uC18C\uC720\uD55C \uC0C9\uC0C1\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.</small>";
          } else {
            listContainer.innerHTML = "<small>\uB0A8\uC740 \uC0C9\uC0C1\uC740 \uBAA8\uB450 \uC7A0\uACA8 \uC788\uC2B5\uB2C8\uB2E4.</small>";
          }
        } else {
          listContainer.innerHTML = "<small>\uBAA8\uB4E0 \uC0C9\uC0C1\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.</small>";
        }
      }
    };
    window.buildTemplateFilterList = function buildTemplateFilterList2() {
      const listContainer = document.getElementById("bm-templatefilter-list");
      const templateFilterHeader = document.querySelector("#bm-contain-templatefilter > summary");
      consoleLog(templateManager);
      if (templateManager.templatesArray?.length === 0) {
        if (listContainer) {
          listContainer.innerHTML = "<small>\uD45C\uC2DC\uD560 \uD15C\uD50C\uB9BF \uC5C6\uC74C.</small>";
        }
        return;
      }
      listContainer.innerHTML = "";
      const enabledTemplatesCount = templateManager.templatesArray.filter(
        (template) => template.enabled
      ).length;
      templateFilterHeader.textContent = `Templates (${enabledTemplatesCount} / ${templateManager.templatesArray.length} Enabled)`;
      const entries = templateManager.templatesArray;
      const combinedTemplate = {};
      for (const stats of templateManager.tileProgress.values()) {
        Object.entries(stats.template).forEach(([storageKey, content]) => {
          if (combinedTemplate[storageKey] === void 0) {
            combinedTemplate[storageKey] = Object.fromEntries(Object.entries(content));
          } else {
            combinedTemplate[storageKey].painted += content.painted;
          }
        });
      }
      ;
      for (const template of entries) {
        let row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.gap = "6px";
        let removeButton = document.createElement("a");
        removeButton.title = "\uD15C\uD50C\uB9BF \uC81C\uAC70";
        removeButton.textContent = "\u{1F5D1}\uFE0F";
        removeButton.style.fontSize = "12px";
        removeButton.onclick = () => {
          if (confirm(`Remove template ${template?.displayName}?`)) {
            templateManager.deleteTemplate(template?.storageKey);
          }
        };
        let teleportButton = document.createElement("a");
        teleportButton.title = "\uD15C\uD50C\uB9BF\uC73C\uB85C \uC774\uB3D9";
        teleportButton.textContent = "\u2708\uFE0F";
        teleportButton.style.fontSize = "12px";
        teleportButton.onclick = () => {
          teleportToTileCoords(template.coords.slice(0, 2), template.coords.slice(2, 4));
        };
        let label = document.createElement("span");
        label.style.fontSize = "12px";
        const labelText = `${template.requiredPixelCount.toLocaleString()}`;
        const templateName = template["displayName"];
        const filledCount = combinedTemplate[template.storageKey]?.painted ?? 0;
        const filledLabelText = `${filledCount.toLocaleString()}`;
        const renameElement = document.createElement("span");
        renameElement.textContent = templateName;
        renameElement.addEventListener("click", () => {
          const currentName = template["displayName"];
          const newName = prompt("\uD15C\uD50C\uB9BF \uC774\uB984 \uBCC0\uACBD", currentName);
          if (newName) {
            const trimmedName = newName.trim();
            if (trimmedName === currentName) {
              return;
            }
            template["displayName"] = newName.trim();
            try {
              const templateJSON = templateManager.templatesJSON?.templates?.[template.storageKey];
              if (templateJSON) {
                templateJSON.name = newName.trim();
                templateManager.storeTemplates();
              }
            } catch (_) {
            }
            ;
            buildTemplateFilterList2();
          }
        });
        renameElement.className = "bm-templatename";
        label.appendChild(renameElement);
        label.appendChild(document.createTextNode(` \u2022 ${filledLabelText} / ${labelText}`));
        const toggle = document.createElement("input");
        toggle.type = "checkbox";
        toggle.checked = template.enabled;
        toggle.addEventListener("change", () => {
          template.enabled = toggle.checked;
          overlayMain.handleDisplayStatus(`${toggle.checked ? "\uD65C\uC131\uD654\uB428" : "\uBE44\uD65C\uC131\uD654\uB428"} ${templateName}`);
          if (toggle.checked) {
            template.tilePrefixes.forEach((tileKey2) => {
              if (apiManager.tileCache[tileKey2]) {
                delete apiManager.tileCache[tileKey2];
              }
            });
            templateManager.clearTileProgress(template);
            templateManager.createOverlayOnMap(template.sortID);
          } else {
            templateManager.clearTileProgress(template);
            removeLayer(null, template.sortID);
          }
          syncToggleList();
          buildColorFilterList();
          forceRefreshTiles();
        });
        row.appendChild(toggle);
        row.appendChild(removeButton);
        row.appendChild(teleportButton);
        row.appendChild(label);
        listContainer.appendChild(row);
      }
    };
    window.buildEventList = function buildEventList2() {
      const listContainer = document.querySelector("#bm-eventitem-list");
      const showClaimed = templateManager.isEventClaimedShown();
      const showUnavailable = templateManager.isEventUnavailableShown();
      const provider = apiManager.eventDataURL ?? templateManager.getEventProvider();
      if (apiManager.eventClaimed === null) {
        listContainer.innerHTML = "<small>\uC774\uBCA4\uD2B8 \uC18C\uC720 \uC544\uC774\uD15C \uBAA9\uB85D\uC774 \uB85C\uB4DC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC0C1\uB2E8 \uC67C\uCABD \uBAA8\uC11C\uB9AC\uC758 \uC9C4\uD589 \uC911\uC778 \uC774\uBCA4\uD2B8 \uBC84\uD2BC\uC744 \uD074\uB9AD\uD588\uB294\uC9C0 \uD655\uC778\uD558\uC138\uC694.</small>";
        return;
      }
      ;
      if (apiManager.eventData === null && (provider === null || provider == "")) {
        listContainer.innerHTML = "<small>\uC774\uBCA4\uD2B8 \uB370\uC774\uD130 \uC81C\uACF5\uC790\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.</small>";
        return;
      }
      ;
      const eventClaimedList = new Set(apiManager.eventClaimed);
      consoleLog("eventClaimedList", eventClaimedList);
      (apiManager.eventData === null ? fetch(provider, {
        "credentials": "include"
      }).then((response) => response.json()) : new Promise((resolve) => {
        const consumed = apiManager.eventData;
        apiManager.eventData = null;
        resolve(consumed);
      })).then((data) => {
        consoleLog("event Location data", data);
        if (typeof data !== "object") {
          listContainer.innerHTML = "<small>\uC774\uBCA4\uD2B8 \uB370\uC774\uD130 \uC81C\uACF5\uC790\uAC00 \uC54C\uB824\uC9C4 \uD615\uC2DD\uC744 \uC81C\uACF5\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.</small>";
          return;
        }
        listContainer.textContent = "";
        let hasEntries = false;
        const dataSource = Array.isArray(data) ? data.map((entry, index) => [entry.id ?? index, entry]) : Object.entries(data);
        dataSource.forEach(([itemId, info]) => {
          itemId = Number(itemId);
          const isClaimed = eventClaimedList.has(itemId);
          if (isClaimed && !showClaimed) return;
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.style.gap = "6px";
          let coords2 = null;
          let coordStatus = "";
          if (typeof info === "object") {
            if (info["lat"] !== void 0 && info["lng"] !== void 0) {
              coords2 = [info["lat"], info["lng"]];
            } else if (info["latitude"] !== void 0 && info["longitude"] !== void 0) {
              coords2 = [info["latitude"], info["longitude"]];
            } else if (info["tileX"] !== void 0 && info["offsetX"] !== void 0 && info["tileY"] !== void 0 && info["offsetY"] !== void 0) {
              coords2 = coordsTileCoordsToGeoCoords(
                [info["tileX"], info["tileY"]],
                [info["offsetX"], info["offsetY"]]
              );
            }
            if (info["foundAt"] !== void 0) {
              const currentTimestamp = Date.now();
              const currentHour = currentTimestamp - currentTimestamp % 36e5;
              const foundTimestamp = new Date(info["foundAt"]).getTime();
              const foundHour = foundTimestamp - foundTimestamp % 36e5;
              if (currentHour !== foundHour) {
                coordStatus = "\uB9CC\uB8CC\uB428 \u2022 ";
                if (!showUnavailable) return;
              }
            }
          }
          if (coords2 !== null) {
            let teleportButton = document.createElement("a");
            teleportButton.title = "\uC774\uBCA4\uD2B8 \uC544\uC774\uD15C\uC73C\uB85C \uC774\uB3D9";
            teleportButton.textContent = "\u2708\uFE0F";
            teleportButton.style.fontSize = "12px";
            teleportButton.onclick = () => {
              teleportToGeoCoords(coords2[0], coords2[1]);
              const mapMarkers = Array.from(
                document.querySelectorAll(".cursor-pointer.z-10")
                // z-10: not the pin (z-20)
              ).filter((x) => {
                if (x.style.opacity != 1) return false;
                const rect = x.getBoundingClientRect();
                const windowWidth = window.innerWidth || document.documentElement.clientWidth;
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                return rect.top >= 0 && rect.bottom <= windowWidth && rect.left >= 0 && rect.right <= windowHeight;
              });
              if (mapMarkers.length === 1) {
                mapMarkers[0].click();
              }
              ;
            };
            row.appendChild(teleportButton);
          } else {
            coordStatus = "\uC54C \uC218 \uC5C6\uB294 \uC88C\uD45C \uD615\uC2DD \u2022 ";
          }
          let label = document.createElement("span");
          label.style.fontSize = "12px";
          label.textContent = `#${itemId} \u2022 ${coordStatus}${eventClaimedList.has(itemId) ? "Claimed" : "Unclaimed"}`;
          row.appendChild(label);
          listContainer.appendChild(row);
          hasEntries = true;
        });
        if (!hasEntries && listContainer) {
          listContainer.innerHTML = `<small>${showClaimed ? "" : "\uBE44\uD68D\uB4DD "}\uC544\uC774\uD15C\uC5D0 ${showUnavailable ? "" : "\uCD5C\uADFC "}\uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</small>`;
        }
      }).catch((err) => {
        listContainer.innerHTML = "<small>\uC774\uBCA4\uD2B8 \uC544\uC774\uD15C \uC815\uBCF4\uB97C \uAC00\uC838\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB370\uC774\uD130 \uC81C\uACF5\uC790\uC758 URL\uC774 \uC720\uD6A8\uD55C JSON \uB9AC\uC18C\uC2A4\uC778\uC9C0 \uADF8\uB9AC\uACE0 \uC801\uC808\uD55C CORS \uC124\uC815\uC774 \uB418\uC5C8\uB294\uC9C0 \uD655\uC778\uD558\uC138\uC694.</small>";
      });
    };
    window.forceUpdateTheme = function forceUpdateTheme2() {
      if (templateManager.isThemeOverridden()) {
        setTheme(templateManager.getCurrentTheme());
      } else {
        setTheme(Object.keys(themeList)[0]);
      }
    };
    window.forceClickCenter = function forceClickCenter2() {
      if (!isMapTilerLoaded()) {
        if (!forceClickCenter2.clickCount) forceClickCenter2.clickCount = 0;
        if (forceClickCenter2.clickCount < 10) {
          const allianceOrRankingButton = document.querySelector(".flex>.btn.btn-square.relative.shadow-md");
          if (allianceOrRankingButton) {
            const canvas = document.querySelector("canvas.maplibregl-canvas");
            if (canvas) {
              const ev = new MouseEvent("click", {
                "bubbles": true,
                "cancelable": true,
                "clientX": canvas.offsetWidth / 2,
                "clientY": canvas.offsetHeight / 2,
                "button": 0
              });
              canvas.dispatchEvent(ev);
              ++forceClickCenter2.clickCount;
            }
            ;
          }
          setTimeout(forceClickCenter2, 100 + 100 * forceClickCenter2.clickCount);
        }
        ;
      }
      ;
    };
    window.addEventListener("message", (event) => {
      if (event?.data?.bmEvent === "bm-rebuild-color-list") {
        try {
          buildColorFilterList();
        } catch (_) {
        }
      } else if (event?.data?.bmEvent === "bm-rebuild-template-list") {
        try {
          buildTemplateFilterList();
        } catch (_) {
        }
      } else if (event?.data?.bmEvent === "bm-rebuild-event-list") {
        try {
          buildEventList();
        } catch (_) {
        }
      }
    });
    setTimeout(() => {
      try {
        if (templateManager.templatesArray?.length > 0) {
          buildColorFilterList();
        }
        if (templateManager.templatesArray?.length > 0) {
          buildTemplateFilterList();
        }
      } catch (_) {
      }
      try {
        if (templateManager.isEventEnabled()) {
          buildEventList();
        }
      } catch (_) {
      }
      try {
        if (templateManager.isThemeOverridden()) {
          doAfterMapFound(forceUpdateTheme);
        }
      } catch (_) {
      }
      try {
        forceClickCenter();
      } catch (_) {
      }
    }, 0);
  }
})();
