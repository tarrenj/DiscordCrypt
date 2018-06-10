//META{"name":"discordCrypt"}*//

/*******************************************************************************
 * MIT License
 *
 * Copyright (c) 2018 Leonardo Gates
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 ******************************************************************************/

"use strict";

/**
 * @public
 * @desc Main plugin prototype.
 */
class discordCrypt {
    /* ============================================================== */

    /**
     * @public
     * @desc Returns the name of the plugin.
     * @returns {string}
     */
    getName() {
        return 'DiscordCrypt';
    }

    /**
     * @public
     * @desc Returns the description of the plugin.
     * @returns {string}
     */
    getDescription() {
        return 'Provides secure messaging for Discord using various cryptography standards.';
    }

    /**
     * @public
     * @desc Returns the plugin's original author.
     * @returns {string}
     */
    getAuthor() {
        return 'Leonardo Gates';
    }

    /**
     * @public
     * @desc Returns the current version of the plugin.
     * @returns {string}
     */
    getVersion() {
        return '1.0.10';
    }

    /* ============================================================== */

    /**
     * @public
     * @desc Initializes an instance of DiscordCrypt.
     * @example
     * let instance = new discordCrypt();
     */
    constructor() {

        /* ============================================ */

        /**
         * Discord class names that changes ever so often because they're douches.
         * These will usually be the culprit if the plugin breaks.
         */

        /**
         * @desc Used to scan each message for an embedded descriptor.
         * @type {string}
         */
        this.messageMarkupClass = '.markup';
        /**
         * @desc Used to find the search toolbar to inject all option buttons.
         * @type {string}
         */
        this.searchUiClass = '.search .search-bar';
        /**
         * @desc Used to hook messages being sent.
         * @type {string}
         */
        this.channelTextAreaClass = '.content textarea';
        /**
         * @desc Used to detect if the autocomplete dialog is opened.
         * @type {string}
         */
        this.autoCompleteClass = '.autocomplete-1vrmpx';

        /* ============================================ */

        /**
         * @desc Defines what an encrypted message starts with. Must be 4x UTF-16 bytes.
         * @type {string}
         */
        this.encodedMessageHeader = "㑳㑵㑷㑼";

        /**
         * @desc Defines what a public key message starts with. Must be 4x UTF-16 bytes.
         * @type {string}
         */
        this.encodedKeyHeader = "㑼㑷㑵㑳";

        /**
         * @desc Defines what the header of an encrypted message says.
         * @type {string}
         */
        this.messageHeader = '-----ENCRYPTED MESSAGE-----';

        /**
         * @desc Master database password. This is a Buffer() containing a 256-bit key.
         * @type {Buffer}
         */
        this.masterPassword = Buffer.alloc( 32 );

        /**
         * @desc Message scanning interval handler's index. Used to stop any running handler.
         * @type {int}
         */
        this.scanInterval = undefined;

        /**
         * @desc The index of the handler used to reload the toolbar.
         * @type {int}
         */
        this.toolbarReloadInterval = undefined;

        /**
         * @desc The index of the handler used for automatic update checking.
         * @type {int}
         */
        this.updateHandlerInterval = undefined;

        /**
         * @desc The configuration file currently in use. Only valid after decryption of the configuration database.
         * @type {Object|null}
         */
        this.configFile = null;

        /**
         * @desc The main message dispatcher used by Discord. Resolved upon startup.
         * @type {Object|null}
         */
        this.messageDispatcher = null;

        /**
         * @typedef function EventHandler
         * @typedef string EventName
         * @typedef {{EventName: EventHandler}} EventDefinition
         */

        /**
         * @desc Indexes of each dual-symmetric encryption mode.
         * @type {int[]}
         */
        this.encryptModes = [
            /* Blowfish(Blowfish, AES, Camellia, IDEA, TripleDES) */
            0, 1, 2, 3, 4,
            /* AES(Blowfish, AES, Camellia, IDEA, TripleDES) */
            5, 6, 7, 8, 9,
            /* Camellia(Blowfish, AES, Camellia, IDEA, TripleDES) */
            10, 11, 12, 13, 14,
            /* IDEA(Blowfish, AES, Camellia, IDEA, TripleDES) */
            15, 16, 17, 18, 19,
            /* TripleDES(Blowfish, AES, Camellia, IDEA, TripleDES) */
            20, 21, 22, 23, 24
        ];

        /**
         * @desc Symmetric block modes of operation.
         * @type {string[]}
         */
        this.encryptBlockModes = [
            'CBC', /* Cipher Block-Chaining */
            'CFB', /* Cipher Feedback Mode */
            'OFB', /* Output Feedback Mode */
        ];

        /**
         * @desc Shorthand padding modes for block ciphers referred to in the code.
         * @type {string[]}
         */
        this.paddingModes = [
            'PKC7', /* PKCS #7 */
            'ANS2', /* ANSI X.923 */
            'ISO1', /* ISO-10126 */
            'ISO9', /* ISO-97972 */
        ];

        /**
         * @desc Defines the CSS for the application overlays.
         * @type {string}
         */
        this.appCss = `
            a#inbrowserbtn.btn{ display: none }
            .dc-overlay {
                position: fixed;
                font-family: monospace;
                display: none;
                width: 100%;
                height: 100%;
                left: 0;
                bottom: 0;
                right: 0;
                top: 0;
                z-index: 1000;
                cursor: default;
                transform: translateZ(0px);
                background: rgba(0, 0, 0, 0.85) !important;
            }
            .dc-password-field {
                width: 95%;
                margin: 10px;
                color: #ffffff;
                height: 10px;
                padding: 5px;
                background-color: #000000;
                border: 2px solid #3a71c1;
            }
            .dc-overlay-centerfield {
                position: absolute;
                top: 35%;
                left: 50%;
                font-size: 20px;
                color: #ffffff;
                padding: 16px;
                border-radius: 20px;
                background: rgba(0, 0, 0, 0.7);
                transform: translate(-50%, 50%);
            }
            .dc-overlay-main {
                margin: 20px;
                overflow: hidden;
                position: absolute;
                left: 5%; right: 5%;
                top: 5%; bottom: 5%;
                width: 90%; height: 90%;
                border: 3px solid #3f3f3f;
            }
            .dc-textarea {
                font-family: monospace;
                font-size: 12px;
                color: #ffffff;
                background: #000;
                overflow: auto;
                padding: 5px;
                resize: none;
                height: 100%;
                width: 100%;
                margin: 2px;           
            }
            .dc-update-field {
                font-size: 14px;
                margin: 10px;
            }
            ul.dc-list {
                margin: 10px;
                padding: 5px;
                list-style-type: circle;
            }
            ul.dc-list > li { padding: 5px; }
            ul.dc-list-red { color: #ff0000; }
            .dc-overlay-main textarea {
                background: transparent !important;
                cursor: default;
                font-size: 12px;
                padding: 5px;
                margin-top: 10px;
                border-radius: 2px;
                resize: none;
                color: #8e8e8e;
                width: 70%;
                overflow-y: hidden;
                user-select: none;
            }
            .dc-overlay-main select {
                background-color: transparent;
                border-radius: 3px;
                font-size: 12px;
                color: #fff;
            }
            .dc-overlay-main select:hover {
                background-color: #000 !important;
                color: #fff;
            }
            .dc-input-field {
                font-family: monospace !important;
                background: #000 !important;
                color: #fff !important;
                border-radius: 3px;
                font-size: 12px;
                width: 40%;
                margin-bottom: 10px;
                margin-top: -5px;
                margin-left: 10%;
            }
            .dc-input-label {
                font-family: monospace !important;
                color: #708090;
                min-width: 20%;
            }
            .dc-ruler-align {
                display: flex;
                margin: 10px;
            }
            .dc-code-block {
                font-family: monospace !important;
                font-size: 0.875rem;
                line-height: 1rem;
                
                overflow-x: visible;
                text-indent: 0;
                
                background: rgba(0,0,0,0.42)!important;
                color: hsla(0,0%,100%,0.7)!important;
                padding: 6px!important;
                
                position: relative;            
            }
            .dc-overlay-main .tab {
                overflow: hidden;
                background-color: rgba(0, 0, 0, .9) !important;
                border: 1px dotted #ffffff;
                padding: 2px;
            }
            .dc-overlay-main .tab button {
                color: #008000;
                background-color: inherit;
                cursor: pointer;
                padding: 14px 14px;
                font-size: 14px;
                transition: 0.5s;
                font-family: monospace;
                border-radius: 3px;
                margin: 3px;
            }
            .dc-overlay-main .tab button:hover {
                background-color: #515c6b;
            }
            .dc-overlay-main .tab button.active {
                background-color: #1f1f2b;
            }
            .dc-overlay-main .tab-content {
                display: none;
                height: 95%;
                color: #9298a2;
                overflow: auto;
                padding: 10px 25px 5px;
                animation: fadeEffect 1s;
                background: rgba(0, 0, 0, 0.7) !important;
            }
            .dc-main-overlay .tab-content .dc-hint {
                margin: 14px;
                padding-left: 5px;
                font-size: 12px;
                color: #f08080;
            }
            .dc-svg { 
                color: #fff; opacity: .6;
                margin: 0 4px;
                cursor: pointer;
                width: 24px;
                height: 24px;
            }
            .dc-svg:hover {
                color: #fff; opacity: .8;
            }
            .dc-button{
                margin-right: 5px;
                margin-left: 5px;
                background-color: #7289da;
                color: #fff;
                align-items: center;
                border-radius: 3px;
                box-sizing: border-box;
                display: flex;
                font-size: 14px;
                width: auto;
                height: 32px;
                min-height: 32px;
                min-width: 60px;
                font-weight: 500;
                justify-content: center;
                line-height: 16px;
                padding: 2px 16px;
                position: relative;
                user-select: none;  
            }
            .dc-button:hover{ background-color: #677bc4 !important; }
            .dc-button:active{ background-color: #5b6eae !important; }
            .dc-button-inverse{
                color: #f04747;
                background: transparent !important;
                border: 1px solid rgba(240,71,71,.3);
                transition: color .17s ease,background-color .17s ease,border-color .17s ease;
            }
            .dc-button-inverse:hover{
                border-color: rgba(240,71,71,.6);
                background: transparent !important;
            }
            .dc-button-inverse:active{ background-color: rgba(240,71,71,.1); }
            .stat-levels {
                box-shadow: inset 0 0 25px rgba(0,0,0,.5);
                margin: 5px auto 0 auto;
                height: 20px;
                padding: 15px;
                border: 1px solid #494a4e;
                border-radius: 10px;
                background: linear-gradient(#444549 0%, #343539 100%);
            }
            .stat-bar {
                background-color: #2a2b2f;
                box-shadow: inset 0 5px 15px rgba(0,0,0,.6);
                height: 8px;
                overflow: hidden;
                padding: 3px;
                border-radius: 3px;
                margin-bottom: 10px;
                margin-top: 10px;
                margin-left: 0;
            }
            .stat-bar-rating {
                border-radius: 4px;
                float: left;
                height: 100%;
                font-size: 12px;
                color: #ffffff;
                text-align: center;
                text-indent: -9999px;
                background-color: #3a71c1;
                box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);
            }
            .stat-bar-rating { @include stat-bar(#cf3a02, #ff4500, top, bottom); }
            `;

        /**
         * @desc Contains the raw HTML used to inject into the search descriptor providing menu icons.
         * @type {string}
         */
        this.toolbarHtml =
            `
            <button type="button" id="dc-clipboard-upload-btn" style="background-color: transparent;"
                title="Upload Encrypted Clipboard">
                <svg x="0px" y="0px" width="30" height="30" viewBox="0 0 18 18" class="dc-svg"> 
                        <path fill="lightgrey"
                            d="M13 4h-3v-4h-10v14h6v2h10v-9l-3-3zM3 1h4v1h-4v-1zM15 
                            15h-8v-10h5v3h3v7zM13 7v-2l2 2h-2z"/>
                </svg>
            </button>
            <button type="button" id="dc-file-btn" style="background-color: transparent;" title="Upload Encrypted File">
                <svg class="dc-svg" width="24" height="24" viewBox="0 0 1792 1792" fill="lightgrey">
                    <path d="M768 384v-128h-128v128h128zm128 128v-128h-128v128h128zm-128 
                        128v-128h-128v128h128zm128 128v-128h-128v128h128zm700-388q28 28 48 
                        76t20 88v1152q0 40-28 68t-68 28h-1344q-40 0-68-28t-28-68v-1600q0-40 28-68t68-28h896q40 
                        0 88 20t76 48zm-444-244v376h376q-10-29-22-41l-313-313q-12-12-41-22zm384 1528v-1024h-416q-40 
                        0-68-28t-28-68v-416h-128v128h-128v-128h-512v1536h1280zm-627-721l107 349q8 27 8 52 0 83-72.5 
                        137.5t-183.5 54.5-183.5-54.5-72.5-137.5q0-25 8-52 21-63 120-396v-128h128v128h79q22 0 39 
                        13t23 34zm-141 465q53 0 90.5-19t37.5-45-37.5-45-90.5-19-90.5 19-37.5 45 37.5 45 90.5 19z">
                    </path>
                </svg>           
            </button>
            <button type="button" id="dc-settings-btn" style="background-color: transparent;" title="DiscordCrypt Settings">
                <svg class="dc-svg" enable-background="new 0 0 32 32" version="1.1" viewBox="0 0 32 32" 
                width="20px" height="20px" xml:space="preserve">
                    <g>
                        <path fill="lightgrey" d="M28,10H18v2h10V10z M14,10H4v10h10V10z M32,0H0v28h15.518c1.614,2.411,4.361,3.999,7.482,4c4.971-0.002,8.998-4.029,9-9   
                        c0-0.362-0.027-0.718-0.069-1.069L32,22V0z M10,2h12v2H10V2z M6,2h2v2H6V2z M2,2h2v2H2V2z M23,29.883   
                        c-3.801-0.009-6.876-3.084-6.885-6.883c0.009-3.801,3.084-6.876,6.885-6.885c3.799,0.009,6.874,3.084,6.883,6.885   
                        C29.874,26.799,26.799,29.874,23,29.883z M29.999,17.348c-0.57-0.706-1.243-1.324-1.999-1.83V14h-4.99c-0.003,0-0.007,0-0.01,0   
                        s-0.007,0-0.01,0H18v1.516c-2.412,1.614-4,4.361-4,7.483c0,1.054,0.19,2.061,0.523,3H2V6h27.999V17.348z M30,4h-4V2h4V4z"/>
                        <path fill="lightgrey" d="M28,24v-2.001h-1.663c-0.063-0.212-0.145-0.413-0.245-0.606l1.187-1.187l-1.416-1.415l-1.165,1.166   
                        c-0.22-0.123-0.452-0.221-0.697-0.294V18h-2v1.662c-0.229,0.068-0.446,0.158-0.652,0.27l-1.141-1.14l-1.415,1.415l1.14,1.14   
                        c-0.112,0.207-0.202,0.424-0.271,0.653H18v2h1.662c0.073,0.246,0.172,0.479,0.295,0.698l-1.165,1.163l1.413,1.416l1.188-1.187   
                        c0.192,0.101,0.394,0.182,0.605,0.245V28H24v-1.665c0.229-0.068,0.445-0.158,0.651-0.27l1.212,1.212l1.414-1.416l-1.212-1.21   
                        c0.111-0.206,0.201-0.423,0.27-0.651H28z M22.999,24.499c-0.829-0.002-1.498-0.671-1.501-1.5c0.003-0.829,0.672-1.498,1.501-1.501   
                        c0.829,0.003,1.498,0.672,1.5,1.501C24.497,23.828,23.828,24.497,22.999,24.499z"/>
                    </g>
                </svg>
            </button>
            <button type="button" id="dc-lock-btn" style="background-color: transparent;"/>
            <button type="button" id="dc-passwd-btn" style="background-color: transparent;" title="Password Settings">
                <svg class="dc-svg" version="1.1" viewBox="0 0 32 32" width="20px" height="20px">
                    <g fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">
                        <g fill="lightgrey">
                            <path d="M13.008518,22 L11.508518,23.5 L11.508518,23.5 L14.008518,26 L11.008518,29 L8.50851798,26.5 L6.63305475,28.3754632 C5.79169774,29.2168202 
                            4.42905085,29.2205817 3.5909158,28.3824466 L3.62607133,28.4176022 C2.78924,27.5807709 2.79106286,26.2174551 3.63305475,25.3754632 L15.7904495,13.2180685
                             C15.2908061,12.2545997 15.008518,11.1602658 15.008518,10 C15.008518,6.13400656 18.1425245,3 22.008518,3 C25.8745114,3 
                             29.008518,6.13400656 29.008518,10 C29.008518,13.8659934 25.8745114,17 22.008518,17 C20.8482521,17 19.7539183,16.7177118 18.7904495,16.2180685 
                             L18.7904495,16.2180685 L16.008518,19 L18.008518,21 L15.008518,24 L13.008518,22 L13.008518,22 L13.008518,22 Z M22.008518,14 C24.2176571,14 
                             26.008518,12.2091391 26.008518,10 C26.008518,7.79086089 24.2176571,6 22.008518,6 C19.7993789,6 18.008518,7.79086089 18.008518,10 C18.008518,12.2091391 
                             19.7993789,14 22.008518,14 L22.008518,14 Z" id="key"/>
                        </g>
                    </g>
                </svg>
            </button>
            <button type="button" id="dc-exchange-btn" style="background-color: transparent;" title="Key Exchange Menu">
                <svg class="dc-svg" version="1.1" viewBox="0 0 78 78" width="20px" height="20px">
                    <path d="M72,4.5H6c-3.299,0-6,2.699-6,6V55.5c0,3.301,2.701,6,6,6h66c3.301,0,6-2.699,6-6V10.5  C78,7.2,75.301,4.5,72,4.5z M72,50.5H6V10.5h66V50.5z 
                    M52.5,67.5h-27c-1.66,0-3,1.341-3,3v3h33v-3C55.5,68.84,54.16,67.5,52.5,67.5z   M26.991,36.5H36v-12h-9.009v-6.729L15.264,30.5l11.728,12.728V36.5z 
                    M50.836,43.228L62.563,30.5L50.836,17.771V24.5h-9.009v12  h9.009V43.228z" style="fill:#d3d3d3;"/>
                </svg>
            </button>
            <button type="button" id="dc-quick-exchange-btn" style="background-color: transparent;" title="Generate & Send New Public Key">
                <svg class="dc-svg iconActive-AKd_jq icon-1R19_H iconMargin-2YXk4F" x="0px" y="0px" viewBox="0 0 58 58">
                    <path style="fill:#d3d3d3;" d="M27.767,26.73c-2.428-2.291-3.766-5.392-3.766-8.729c0-6.617,5.383-12,12-12s12,5.383,12,12  
                    c0,3.288-1.372,6.469-3.765,8.728l-1.373-1.455c2.023-1.909,3.138-4.492,3.138-7.272c0-5.514-4.486-10-10-10s-10,4.486-10,10  
                    c0,2.781,1.114,5.365,3.139,7.274L27.767,26.73z"/>
                    <path style="fill:#d3d3d3;" d="M56.428,38.815c-0.937-0.695-2.188-0.896-3.435-0.55l-15.29,4.227  
                    C37.891,42.028,38,41.522,38,40.991c0-2.2-1.794-3.991-3.999-3.991h-9.377c-0.667-1-2.363-4-4.623-4H16v-0.999  
                    C16,30.347,14.654,29,13,29H9c-1.654,0-3,1.347-3,3v17C6,50.655,7.346,52,9,52h4c1.654,0,3-1.345,3-2.999v-0.753l12.14,8.201  
                    c1.524,1.031,3.297,1.55,5.075,1.55c1.641,0,3.286-0.441,4.742-1.33l18.172-11.101C57.283,44.864,58,43.587,58,42.233v-0.312  
                    C58,40.688,57.427,39.556,56.428,38.815z M14,49C14,49.553,13.552,50,13,50h-1v-4h-2v4H9c-0.552,0-1-0.447-1-0.999v-17  
                    C8,31.449,8.448,31,9,31h4c0.552,0,1,0.449,1,1V49z M56,42.233c0,0.66-0.35,1.284-0.913,1.628L36.915,54.962  
                    c-2.367,1.443-5.37,1.376-7.655-0.17L16,45.833V35h4c1.06,0,2.469,2.034,3.088,3.409L23.354,39h10.646  
                    C35.104,39,36,39.892,36,40.988C36,42.098,35.104,43,34,43H29h-5v2h5h5h2l17.525-4.807c0.637-0.18,1.278-0.094,1.71,0.228  
                    C55.722,40.781,56,41.328,56,41.922V42.233z"/>
                    <path style="fill:#d3d3d3;" d="M33,25.394v6.607C33,33.655,34.347,35,36,35H38h1h4v-2h-4v-2h2v-2h-2v-3.577  
                    c3.02-1.186,5-4.079,5-7.422c0-2.398-1.063-4.649-2.915-6.177c-1.85-1.524-4.283-2.134-6.683-1.668  
                    c-3.155,0.614-5.671,3.153-6.261,6.318C27.39,20.523,29.933,24.041,33,25.394z M30.108,16.84c0.44-2.364,2.319-4.262,4.677-4.721  
                    c1.802-0.356,3.639,0.104,5.028,1.249S42,16.202,42,18c0,2.702-1.719,5.011-4.276,5.745L37,23.954V33h-0.999  
                    C35.449,33,35,32.553,35,32v-8.02l-0.689-0.225C31.822,22.943,29.509,20.067,30.108,16.84z"/>
                    <path d="M36,22c2.206,0,4-1.794,4-4s-1.794-4-4-4s-4,1.794-4,4S33.795,22,36,22z   M36,16c1.103,0,2,0.897,2,2s-0.897,2-2,2s-2-0.897-2-2S34.898,16,36,16z"/>
                    <circle style="fill:#d3d3d3;" cx="36" cy="18" r="3"/>
                </svg>
            </button>
            `;

        /**
         * @desc Contains the raw HTML injected into the overlay to prompt for the master password for database
         *      unlocking.
         * @type {string}
         */
        this.masterPasswordHtml =
            `
            <div id="dc-master-overlay" class="dc-overlay">
                <div id="dc-overlay-centerfield" class="dc-overlay-centerfield" style="top: 30%">
                    <h2 style="color:#ff0000;" id="dc-header-master-msg"></h2>
                    <br/><br/>
                    
                    <span id="dc-prompt-master-msg"></span><br/>
                    <input type="password" class="dc-password-field" id="dc-db-password"/>
                    <br/>
                    
                    <div class="stat stat-bar">
                        <span id = "dc-master-status" class="stat-bar-rating" style="width: 0;"/>
                    </div>

                    <div class="dc-ruler-align">
                        <button class="dc-button" style="width:100%;" id="dc-unlock-database-btn"/>
                    </div>
                    
                    <div class="dc-ruler-align">
                        <button class="dc-button dc-button-inverse" style="width:100%;" id="dc-cancel-btn">Cancel</button>
                    </div>
                </div>
            </div>
            `;

        /**
         * @desc Defines the raw HTML used describing each option menu.
         * @type {string}
         */
        this.settingsMenuHtml =
            `
            <div id="dc-overlay" class="dc-overlay">
                <div id="dc-overlay-upload" class="dc-overlay-centerfield" style="display:none; top: 5%;">
                    <div class="dc-ruler-align">
                        <input type="text" class="dc-input-field" id="dc-file-path" 
                            style="width: 100%;padding: 2px;margin-left: 4px;" readonly/>
                        <button class="dc-button dc-button-inverse" type="button" id="dc-select-file-path-btn" 
                            style="top: -8px;"> . . .</button>
                    </div>
                    
                    <textarea class="dc-textarea" rows="20" cols="128" id="dc-file-message-textarea" 
                        placeholder="Enter any addition text to send with your message ..." maxlength="1100"/>
                        
                    <div class="dc-ruler-align" style="font-size:14px; padding-bottom:10px;">
                        <input id="dc-file-deletion-checkbox" class="ui-switch-checkbox" type="checkbox">
                            <span style="margin-top: 5px;">Send Deletion Link</span>
                    </div>
                    <div class="dc-ruler-align" style="font-size:14px; padding-bottom:10px;">
                        <input id="dc-file-name-random-checkbox" class="ui-switch-checkbox" type="checkbox" checked>
                        <span style="margin-top: 5px;">Randomize File Name</span>
                    </div>
                    
                    <div class="stat stat-bar">
                        <span id = "dc-file-upload-status" class="stat-bar-rating" style="width: 0;"/>
                    </div>

                    <div class="dc-ruler-align">
                        <button class="dc-button" style="width:100%;" id="dc-file-upload-btn">Upload</button>
                    </div>
                    
                    <div class="dc-ruler-align">
                        <button class="dc-button dc-button-inverse" style="width:100%;" id="dc-file-cancel-btn">
                        Close</button>
                    </div>
                </div>
                <div id="dc-overlay-password" class="dc-overlay-centerfield" style="display:none;">
                    <span>Primary Password:</span>
                    <input type="password" class="dc-password-field" id="dc-password-primary" placeholder="..."/><br/>
                    
                    <span>Secondary Password:</span>
                    <input type="password" class="dc-password-field" id="dc-password-secondary" placeholder="..."/><br/>
                    
                    <div class="dc-ruler-align">
                        <button class="dc-button" id="dc-save-pwd">Update Passwords</button>
                        <button class="dc-button dc-button-inverse" id="dc-reset-pwd">Reset Passwords</button>
                        <button class="dc-button dc-button-inverse" id="dc-cancel-btn">Cancel</button>
                    </div>
                    
                    <button class="dc-button dc-button-inverse" style="width: 100%;" id="dc-cpy-pwds-btn">
                    Copy Current Passwords</button>
                </div>
                <div id="dc-update-overlay" class="dc-overlay-centerfield" 
                style="top: 5%;border: 1px solid;display: none">
                    <span>DiscordCrypt: Update Available</span>
                    <div class="dc-ruler-align">
                        <strong class="dc-hint dc-update-field" id="dc-new-version"/>
                    </div>
                    <div class="dc-ruler-align">
                        <strong class="dc-hint dc-update-field" id="dc-old-version"/>
                    </div>
                    <div class="dc-ruler-align">
                        <strong class="dc-hint dc-update-field">Changelog:</strong></div>
                    <div class="dc-ruler-align">
                        <textarea class="dc-textarea" rows="20" cols="128" id="dc-changelog" readonly/>
                    </div>
                    <br>
                    <div class="dc-ruler-align">
                        <button class="dc-button" id="dc-restart-now-btn" style="width: 50%;">Restart Now</button>
                        <button class="dc-button dc-button-inverse" id="dc-restart-later-btn" style="width: 50%;">
                        Restart Later</button>
                    </div>
                </div>
                <div id="dc-overlay-settings" class="dc-overlay-main" style="display: none;">
                    <div class="tab" id="dc-settings-tab">
                        <button class='dc-tab-link' id="dc-exit-settings-btn" style="float:right;">[ X ]</button>
                    </div>
                    <div class="tab-content" id="dc-settings" style="display: block;">
                        <p style="text-align: center;">
                            <b>DiscordCrypt Settings</b>
                        </p>
                        <br/><br/>
                        
                        <div class="dc-ruler-align">
                            <div class="dc-input-label">Primary Cipher:</div>
                            <select class="dc-input-field" id="dc-primary-cipher">
                                <option value="bf" selected>Blowfish ( 512-Bit )</option>
                                <option value="aes">AES ( 256-Bit )</option>
                                <option value="camel">Camellia ( 256-Bit )</option>
                                <option value="tdes">TripleDES ( 192-Bit )</option>
                                <option value="idea">IDEA ( 128-Bit )</option>
                            </select>
                        </div>
                        
                        <div class="dc-ruler-align">
                            <div class="dc-input-label">Secondary Cipher:</div>
                            <select class="dc-input-field" id="dc-secondary-cipher">
                                <option value="bf">Blowfish ( 512-Bit )</option>
                                <option value="aes">AES ( 256-Bit )</option>
                                <option value="camel">Camellia ( 256-Bit )</option>
                                <option value="idea">IDEA ( 256-Bit )</option>
                                <option value="tdes">TripleDES ( 192-Bit )</option>
                            </select>
                        </div>
                        
                        <div class="dc-ruler-align">
                            <div class="dc-input-label">Padding Mode:</div>
                            <select class="dc-input-field" id="dc-settings-padding-mode">
                                <option value="pkc7">PKCS #7</option>
                                <option value="ans2">ANSI X9.23</option>
                                <option value="iso1">ISO 10126</option>
                                <option value="iso9">ISO 97971</option>
                            </select>
                        </div>
                        
                        <div class="dc-ruler-align">
                            <div class="dc-input-label">Cipher Operation Mode:</div>
                            <select class="dc-input-field" id="dc-settings-cipher-mode">
                                <option value="cbc">Cipher Block Chaining</option>
                                <option value="cfb">Cipher Feedback Mode</option>
                                <option value="ofb">Output Feedback Mode</option>
                            </select>
                        </div>
                        
                        <div class="dc-ruler-align">
                            <div class="dc-input-label">Default Encryption Password:</div>
                            <input type="text" class="dc-input-field" id="dc-settings-default-pwd"/>                        
                        </div>
                        
                        <div class="dc-ruler-align">
                            <div class="dc-input-label">Encryption Scanning Frequency:</div>
                            <input type="text" class="dc-input-field" id="dc-settings-scan-delay"/>
                        </div>
                        
                        <div class="dc-ruler-align">
                            <div class="dc-input-label">Message Trigger:</div>
                            <input type="text" class="dc-input-field" id="dc-settings-encrypt-trigger"/>
                        </div>
                        
                        <div style="font-size: 9px;">
                            <div style="display: flex;">
                                <div style="width: 30%;"></div>
                                <p class="dc-hint">
                                The suffix at the end of a typed message to indicate whether to encrypt the text.</p>
                            </div>
                            <div style="display: flex;">
                                <div style="width: 30%;"></div>
                                <p class="dc-hint">Example: <u>This message will be encrypted.|ENC</u></p>
                            </div>
                        </div>
                        
                        <div class="dc-ruler-align">
                            <div class="dc-input-label">New Master Database Password:</div>
                            <input type="text" class="dc-input-field" id="dc-master-password"/>
                        </div>
                        
                        <div class="dc-ruler-align">
                            <button id="dc-settings-save-btn" class="dc-button">Save & Apply</button>
                            <button id="dc-settings-reset-btn" class="dc-button dc-button-inverse">
                            Reset Settings</button>
                        </div>
                    </div>
                </div>
                <div id="dc-overlay-exchange" class="dc-overlay-main" style="display: none;">
                    <div class="tab" id="dc-exchange-tab">
                        <button class='dc-tab-link' id="dc-tab-info-btn">Info</button>
                        <button class='dc-tab-link' id="dc-tab-keygen-btn">Key Generation</button>
                        <button class='dc-tab-link' id="dc-tab-handshake-btn">Secret Computation</button>
                        <button class='dc-tab-link' id="dc-exit-exchange-btn" style="float:right;">[ X ]</button>
                    </div>
                    <div class="tab-content" id="dc-about-tab" style="display: block;">
                        <p style="text-align: center;">
                            <b>Key Exchanger</b>
                        </p>
                        <br/>
                        
                        <strong>What is this used for?</strong>
                        <ul class="dc-list">
                            <li>Simplifying the process or generating strong passwords for each user of DiscordCrypt 
                            requires a secure channel to exchange these keys.</li>
                            <li>Using this generator, you may create new keys using standard algorithms such as 
                            DH or ECDH for manual handshaking.</li>
                            <li>Follow the steps below and you can generate a password between channels or users 
                            while being able to publicly post the messages.</li>
                            <li>This generator uses secure hash algorithms ( SHA-256 and SHA-512 ) in tandem with 
                            the Scrypt KDF function to derive two keys.</li>
                        </ul>
                        <br/>
                        
                        <strong>How do I use this?</strong>
                        <ul class="dc-list">
                            <li>Generate a key pair using the specified algorithm and key size on the 
                            "Key Generation" tab.</li>
                            <li>Give your partner your public key by clicking the "Send Public Key" button.</li>
                            <li>Ask your partner to give you their public key using the same step above.</li>
                            <li>Copy your partner's public key and paste it in the "Secret Computation" tab and 
                            select "Compute Secret Keys".</li>
                            <li>Wait for <span style="text-decoration: underline;color: #ff0000;">BOTH</span> the primary and secondary 
                            keys to be generated.</li>
                            <li>A status bar is provided to easily tell you when both passwords 
                            have been generated.</li>
                            <li>Click the "Apply Generated Passwords" button to apply both passwords to 
                            the current user or channel.</li>
                        </ul>
                        
                        <strong>Algorithms Supported:</strong>
                        <ul class="dc-list">
                            <li>
                                <a title="Diffie–Hellman key exchange" 
                                href="https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange"
                                 target="_blank" rel="noopener">Diffie-Hellman ( DH )</a>
                            </li>
                            <li>
                                <a title="Elliptic curve Diffie–Hellman" 
                                href="https://en.wikipedia.org/wiki/Elliptic_curve_Diffie%E2%80%93Hellman"
                                 target="_blank" rel="noopener">Elliptic Curve Diffie-Hellman ( ECDH )</a>
                            </li>
                        </ul>
                        
                        <span style="text-decoration: underline; color: #ff0000;">
                            <strong>DO NOT:</strong>
                        </span>
                        <ul class="dc-list dc-list-red">
                            <li>
                                <strong>Post your private key. If you do, generate a new one IMMEDIATELY.</strong>
                            </li>
                            <li>
                                <strong>Alter your public key or have your partner alter theirs in any way.</strong>
                            </li>
                            <li>
                                <strong>Insert a random public key.</strong>
                            </li>
                        </ul>
                    </div>
                    <div class="tab-content" id="dc-keygen-tab" style="display: block;">
                        <p style="text-align: center;">
                            <b style="font-size: large;">Secure Key Generation</b>
                        </p>
                        <br/>
                        
                        <strong>Exchange Algorithm:</strong>
                        <select id="dc-keygen-method">
                            <option value="dh" selected>Diffie-Hellman</option>
                            <option value="ecdh">Elliptic-Curve Diffie-Hellman</option>
                        </select>
                        <br/><br/>
                
                        <strong>Key Length ( Bits ):</strong>
                        <select id="dc-keygen-algorithm">
                            <option value="768">768</option>
                            <option value="1024">1024</option>
                            <option value="1536">1536</option>
                            <option value="2048">2048</option>
                            <option value="3072">3072</option>
                            <option value="4096">4096</option>
                            <option value="6144">6144</option>
                            <option value="8192" selected>8192</option>
                        </select>
                        <br/><br/>
                
                        <div class="dc-ruler-align">
                            <button id="dc-keygen-gen-btn" class="dc-button">Generate</button>
                            <button id="dc-keygen-clear-btn" class="dc-button dc-button-inverse">Clear</button>
                        </div>
                        <br/><br/><br/>
                
                        <strong>Private Key: ( <span style="text-decoration: underline; color: #ff0000;">KEEP SECRET</span> )</strong><br/>
                        <textarea id="dc-priv-key-ta" rows="8" cols="128" maxsize="8192"
                         unselectable="on" disabled readonly/>
                        <br/><br/>
                
                        <strong>Public Key:</strong><br/>
                        <textarea id="dc-pub-key-ta" rows="8" cols="128" maxsize="8192" 
                        unselectable="on" disabled readonly/>
                        <br/><br/>
                
                        <div class="dc-ruler-align">
                            <button id="dc-keygen-send-pub-btn" class="dc-button">Send Public Key</button>
                        </div>
                        <br/>
                        
                        <ul class="dc-list dc-list-red">
                            <li>Never rely on copying these keys. Use the "Send Public Key" button 
                            to send your key.</li>
                            <li>Public keys are automatically encoded with a random salts.</li>
                            <li>Posting these keys directly won't work since they aren't encoded 
                            in the format required.</li>
                        </ul>
                    </div>
                    <div class="tab-content" id="dc-handshake-tab">
                        <p style="text-align: center;">
                            <b style="font-size: large;">Key Derivation</b>
                        </p>
                        <br/>
                        
                        <p>
                            <span style="text-decoration: underline; color: #ff0000;">
                                <strong>NOTE:</strong>
                            </span>
                        </p>
                        <ul class="dc-list dc-list-red">
                            <li>Copy your partner's private key EXACTLY as it was posted.</li>
                            <li>Your last generated private key from the "Key Generation" tab 
                            will be used to compute these keys.</li>
                        </ul>
                        <br/>
                        
                        <strong>Partner's Public Key:</strong><br/>
                        <textarea id="dc-handshake-ppk" rows="8" cols="128" maxsize="16384"/>
                        <br/><br/>
                        
                        <div class="dc-ruler-align">
                            <button id="dc-handshake-paste-btn" class="dc-button dc-button-inverse">
                            Paste From Clipboard</button>
                            <button id="dc-handshake-compute-btn" class="dc-button">Compute Secret Keys</button>
                        </div>
                        
                        <ul class="dc-list dc-list-red">
                            <li id="dc-handshake-algorithm">...</li>
                            <li id="dc-handshake-salts">...</li>
                            <li id="dc-handshake-secret">...</li>
                        </ul>
                        <br/>
                        
                        <strong id="dc-handshake-prim-lbl">Primary Secret:</strong><br/>
                        <textarea id="dc-handshake-primary-key" rows="1" columns="128" maxsize="32768"
                         style="max-height: 14px;user-select: none;" unselectable="on" disabled/>
                        <br/><br/>
                        
                        <strong id="dc-handshake-sec-lbl">Secondary Secret:</strong><br/>
                        <textarea id="dc-handshake-secondary-key" rows="1" columns="128" maxsize="32768"
                         style="max-height: 14px;user-select: none;" unselectable="on" disabled/>
                        <br/><br/>
                        
                        <div class="stat stat-bar" style="width:70%;">
                            <span id="dc-exchange-status" class="stat-bar-rating" style="width: 0;"/>
                        </div><br/>
                        
                        <div class="dc-ruler-align">
                            <button id="dc-handshake-cpy-keys-btn" class="dc-button dc-button-inverse">
                            Copy Keys & Nuke</button>
                            <button id="dc-handshake-apply-keys-btn" class="dc-button">
                            Apply Generated Passwords</button>
                        </div>
                    </div>
                </div>
            </div>
            `;

        /**
         * @desc The Base64 encoded SVG containing the unlocked status icon.
         * @type {string}
         */
        this.unlockIcon = "PHN2ZyBjbGFzcz0iZGMtc3ZnIiBmaWxsPSJsaWdodGdyZXkiIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAwIDI0I" +
            "DI0IiB3aWR0aD0iMjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTdjMS4xIDAgMi0u" +
            "OSAyLTJzLS45LTItMi0yLTIgLjktMiAyIC45IDIgMiAyem02LTloLTFWNmMwLTIuNzYtMi4yNC01LTUtNVM3IDMuMjQgNyA2aDEuOWM" +
            "wLTEuNzEgMS4zOS0zLjEgMy4xLTMuMSAxLjcxIDAgMy4xIDEuMzkgMy4xIDMuMXYySDZjLTEuMSAwLTIgLjktMiAydjEwYzAgMS4xLj" +
            "kgMiAyIDJoMTJjMS4xIDAgMi0uOSAyLTJWMTBjMC0xLjEtLjktMi0yLTJ6bTAgMTJINlYxMGgxMnYxMHoiPjwvcGF0aD48L3N2Zz4=";

        /**
         * @desc The Base64 encoded SVG containing the locked status icon.
         * @type {string}
         */
        this.lockIcon = "PHN2ZyBjbGFzcz0iZGMtc3ZnIiBmaWxsPSJsaWdodGdyZXkiIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAwIDI0IDI" +
            "0IiB3aWR0aD0iMjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0aCBkPSJNMCAwaDI0djI0SD" +
            "BWMHoiIGlkPSJhIi8+PC9kZWZzPjxjbGlwUGF0aCBpZD0iYiI+PHVzZSBvdmVyZmxvdz0idmlzaWJsZSIgeGxpbms6aHJlZj0iI2EiL" +
            "z48L2NsaXBQYXRoPjxwYXRoIGNsaXAtcGF0aD0idXJsKCNiKSIgZD0iTTEyIDE3YzEuMSAwIDItLjkgMi0ycy0uOS0yLTItMi0yIC45" +
            "LTIgMiAuOSAyIDIgMnptNi05aC0xVjZjMC0yLjc2LTIuMjQtNS01LTVTNyAzLjI0IDcgNnYySDZjLTEuMSAwLTIgLjktMiAydjEwYzA" +
            "gMS4xLjkgMiAyIDJoMTJjMS4xIDAgMi0uOSAyLTJWMTBjMC0xLjEtLjktMi0yLTJ6TTguOSA2YzAtMS43MSAxLjM5LTMuMSAzLjEtMy" +
            "4xczMuMSAxLjM5IDMuMSAzLjF2Mkg4LjlWNnpNMTggMjBINlYxMGgxMnYxMHoiLz48L3N2Zz4=";

        /**
         * @desc These contain all libraries that will be loaded dynamically in the current JS VM.
         * @type {{string, string}}
         */
        this.libraries = {
                        'currify.js': "!function(n){if(\"object\"==typeof exports&&\"undefined\"!=typeof module)module.exports=n();else if(\"function\"==typeof define&&define.amd)define([],n);else{var r;(r=\"undefined\"!=typeof window?window:\"undefined\"!=typeof global?global:\"undefined\"!=typeof self?self:this).currify=n()}}(function(){var n,r,e;return function n(r,e,t){function o(f,u){if(!e[f]){if(!r[f]){var c=\"function\"==typeof require&&require;if(!u&&c)return c(f,!0);if(i)return i(f,!0);var p=new Error(\"Cannot find module '\"+f+\"'\");throw p.code=\"MODULE_NOT_FOUND\",p}var l=e[f]={exports:{}};r[f][0].call(l.exports,function(n){var e=r[f][1][n];return o(e||n)},l,l.exports,n,r,e,t)}return e[f].exports}for(var i=\"function\"==typeof require&&require,f=0;f<t.length;f++)o(t[f]);return o}({currify:[function(n,r,e){\"use strict\";var t=function n(r){return[function(n){return r.apply(void 0,arguments)},function(n,e){return r.apply(void 0,arguments)},function(n,e,t){return r.apply(void 0,arguments)},function(n,e,t,o){return r.apply(void 0,arguments)},function(n,e,t,o,i){return r.apply(void 0,arguments)}]};function o(n){if(\"function\"!=typeof n)throw Error(\"fn should be function!\")}r.exports=function n(r){for(var e=arguments.length,i=Array(e>1?e-1:0),f=1;f<e;f++)i[f-1]=arguments[f];if(o(r),i.length>=r.length)return r.apply(void 0,i);var u=function e(){return n.apply(void 0,[r].concat(i,Array.prototype.slice.call(arguments)))},c=r.length-i.length-1,p;return t(u)[c]||u}},{}]},{},[\"currify\"])(\"currify\")});\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAiXSwibmFtZXMiOlsiZiIsImV4cG9ydHMiLCJtb2R1bGUiLCJkZWZpbmUiLCJhbWQiLCJnIiwid2luZG93IiwiZ2xvYmFsIiwic2VsZiIsInRoaXMiLCJjdXJyaWZ5IiwiZSIsInQiLCJuIiwiciIsInMiLCJvIiwidSIsImEiLCJyZXF1aXJlIiwiaSIsIkVycm9yIiwiY29kZSIsImwiLCJjYWxsIiwibGVuZ3RoIiwiZm4iLCJhcHBseSIsInVuZGVmaW5lZCIsImFyZ3VtZW50cyIsImIiLCJjIiwiZCIsImNoZWNrIiwiX2xlbiIsImFyZ3MiLCJBcnJheSIsIl9rZXkiLCJhZ2FpbiIsImNvbmNhdCIsInByb3RvdHlwZSIsInNsaWNlIiwiY291bnQiLCJmdW5jIl0sIm1hcHBpbmdzIjoiQ0FBQSxTQUFVQSxHQUFHLEdBQW9CLGlCQUFWQyxTQUFvQyxvQkFBVEMsT0FBc0JBLE9BQU9ELFFBQVFELFNBQVMsR0FBbUIsbUJBQVRHLFFBQXFCQSxPQUFPQyxJQUFLRCxVQUFVSCxPQUFPLENBQUMsSUFBSUssR0FBa0NBLEVBQWIsb0JBQVRDLE9BQXdCQSxPQUErQixvQkFBVEMsT0FBd0JBLE9BQTZCLG9CQUFQQyxLQUFzQkEsS0FBWUMsTUFBT0MsUUFBVVYsS0FBNVQsQ0FBbVUsV0FBVyxJQUFJRyxFQUFPRCxFQUFPRCxFQUFRLE9BQU8sU0FBVVUsRUFBRUMsRUFBRUMsRUFBRUMsR0FBRyxTQUFTQyxFQUFFQyxFQUFFQyxHQUFHLElBQUlKLEVBQUVHLEdBQUcsQ0FBQyxJQUFJSixFQUFFSSxHQUFHLENBQUMsSUFBSUUsRUFBa0IsbUJBQVRDLFNBQXFCQSxRQUFRLElBQUlGLEdBQUdDLEVBQUUsT0FBT0EsRUFBRUYsR0FBRSxHQUFJLEdBQUdJLEVBQUUsT0FBT0EsRUFBRUosR0FBRSxHQUFJLElBQUloQixFQUFFLElBQUlxQixNQUFNLHVCQUF1QkwsRUFBRSxLQUFLLE1BQU1oQixFQUFFc0IsS0FBSyxtQkFBbUJ0QixFQUFFLElBQUl1QixFQUFFVixFQUFFRyxJQUFJZixZQUFZVyxFQUFFSSxHQUFHLEdBQUdRLEtBQUtELEVBQUV0QixRQUFRLFNBQVNVLEdBQUcsSUFBSUUsRUFBRUQsRUFBRUksR0FBRyxHQUFHTCxHQUFHLE9BQU9JLEVBQUVGLEdBQUlGLElBQUlZLEVBQUVBLEVBQUV0QixRQUFRVSxFQUFFQyxFQUFFQyxFQUFFQyxHQUFHLE9BQU9ELEVBQUVHLEdBQUdmLFFBQWtELElBQTFDLElBQUltQixFQUFrQixtQkFBVEQsU0FBcUJBLFFBQWdCSCxFQUFFLEVBQUVBLEVBQUVGLEVBQUVXLE9BQU9ULElBQUlELEVBQUVELEVBQUVFLElBQUksT0FBT0QsRUFBdmIsRUFBNGJMLFNBQVcsU0FBU1MsRUFBUWpCLEVBQU9ELEdBQ3QwQixhQUVBLElBQUlELEVBQUksU0FBU0EsRUFBRTBCLEdBQ2YsT0FFSSxTQUFVUixHQUNOLE9BQU9RLEVBQUdDLFdBQU1DLEVBQVdDLFlBQzVCLFNBQVVYLEVBQUdZLEdBQ1osT0FBT0osRUFBR0MsV0FBTUMsRUFBV0MsWUFDNUIsU0FBVVgsRUFBR1ksRUFBR0MsR0FDZixPQUFPTCxFQUFHQyxXQUFNQyxFQUFXQyxZQUM1QixTQUFVWCxFQUFHWSxFQUFHQyxFQUFHQyxHQUNsQixPQUFPTixFQUFHQyxXQUFNQyxFQUFXQyxZQUM1QixTQUFVWCxFQUFHWSxFQUFHQyxFQUFHQyxFQUFHckIsR0FDckIsT0FBT2UsRUFBR0MsV0FBTUMsRUFBV0MsY0F1QnZDLFNBQVNJLEVBQU1QLEdBQ1gsR0FBa0IsbUJBQVBBLEVBQW1CLE1BQU1MLE1BQU0sMEJBcEI5Q25CLEVBQU9ELFFBQVUsU0FBU1MsRUFBUWdCLEdBQzlCLElBQUssSUFBSVEsRUFBT0wsVUFBVUosT0FBUVUsRUFBT0MsTUFBTUYsRUFBTyxFQUFJQSxFQUFPLEVBQUksR0FBSUcsRUFBTyxFQUFHQSxFQUFPSCxFQUFNRyxJQUM1RkYsRUFBS0UsRUFBTyxHQUFLUixVQUFVUSxHQUsvQixHQUZBSixFQUFNUCxHQUVGUyxFQUFLVixRQUFVQyxFQUFHRCxPQUFRLE9BQU9DLEVBQUdDLFdBQU1DLEVBQVdPLEdBRXpELElBQUlHLEVBQVEsU0FBU0EsSUFDakIsT0FBTzVCLEVBQVFpQixXQUFNQyxHQUFZRixHQUFJYSxPQUFPSixFQUFNQyxNQUFNSSxVQUFVQyxNQUFNakIsS0FBS0ssY0FHN0VhLEVBQVFoQixFQUFHRCxPQUFTVSxFQUFLVixPQUFTLEVBQ2xDa0IsRUFFSixPQUZXM0MsRUFBRXNDLEdBQU9JLElBRUxKLGFBTVosV0F6Q2dXLENBeUNwViJ9",
            'sjcl.js': "\"use strict\";var sjcl={cipher:{},hash:{},keyexchange:{},mode:{},misc:{},codec:{},exception:{corrupt:function(t){this.toString=function(){return\"CORRUPT: \"+this.message},this.message=t},invalid:function(t){this.toString=function(){return\"INVALID: \"+this.message},this.message=t},bug:function(t){this.toString=function(){return\"BUG: \"+this.message},this.message=t},notReady:function(t){this.toString=function(){return\"NOT READY: \"+this.message},this.message=t}}};function t(t,e,i){if(4!==e.length)throw new sjcl.exception.invalid(\"invalid aes block size\");var c=t.b[i],s=e[0]^c[0],n=e[i?3:1]^c[1],r=e[2]^c[2];e=e[i?1:3]^c[3];var o,a,l,h=c.length/4-2,d,u=4,f=[0,0,0,0];t=(o=t.s[i])[0];var p=o[1],m=o[2],j=o[3],y=o[4];for(d=0;d<h;d++)o=t[s>>>24]^p[n>>16&255]^m[r>>8&255]^j[255&e]^c[u],a=t[n>>>24]^p[r>>16&255]^m[e>>8&255]^j[255&s]^c[u+1],l=t[r>>>24]^p[e>>16&255]^m[s>>8&255]^j[255&n]^c[u+2],e=t[e>>>24]^p[s>>16&255]^m[n>>8&255]^j[255&r]^c[u+3],u+=4,s=o,n=a,r=l;for(d=0;4>d;d++)f[i?3&-d:d]=y[s>>>24]<<24^y[n>>16&255]<<16^y[r>>8&255]<<8^y[255&e]^c[u++],o=s,s=n,n=r,r=e,e=o;return f}function u(t,e){var i,c,s,n=t.F,r=t.b,o=n[0],a=n[1],l=n[2],h=n[3],d=n[4],u=n[5],f=n[6],p=n[7];for(i=0;64>i;i++)16>i?c=e[i]:(c=e[i+1&15],s=e[i+14&15],c=e[15&i]=(c>>>7^c>>>18^c>>>3^c<<25^c<<14)+(s>>>17^s>>>19^s>>>10^s<<15^s<<13)+e[15&i]+e[i+9&15]|0),c=c+p+(d>>>6^d>>>11^d>>>25^d<<26^d<<21^d<<7)+(f^d&(u^f))+r[i],p=f,f=u,u=d,d=h+c|0,h=l,l=a,o=c+((a=o)&l^h&(a^l))+(a>>>2^a>>>13^a>>>22^a<<30^a<<19^a<<10)|0;n[0]=n[0]+o|0,n[1]=n[1]+a|0,n[2]=n[2]+l|0,n[3]=n[3]+h|0,n[4]=n[4]+d|0,n[5]=n[5]+u|0,n[6]=n[6]+f|0,n[7]=n[7]+p|0}function A(t,e){var i,c=sjcl.random.K[t],s=[];for(i in c)c.hasOwnProperty(i)&&s.push(c[i]);for(i=0;i<s.length;i++)s[i](e)}function C(t,e){\"undefined\"!=typeof window&&window.performance&&\"function\"==typeof window.performance.now?t.addEntropy(window.performance.now(),e,\"loadtime\"):t.addEntropy((new Date).valueOf(),e,\"loadtime\")}function y(t){t.b=z(t).concat(z(t)),t.L=new sjcl.cipher.aes(t.b)}function z(t){for(var e=0;4>e&&(t.h[e]=t.h[e]+1|0,!t.h[e]);e++);return t.L.encrypt(t.h)}function B(t,e){return function(){e.apply(t,arguments)}}sjcl.cipher.aes=function(t){this.s[0][0][0]||this.O();var e,i,c,s,n=this.s[0][4],r=this.s[1],o=1;if(4!==(e=t.length)&&6!==e&&8!==e)throw new sjcl.exception.invalid(\"invalid aes key size\");for(this.b=[c=t.slice(0),s=[]],t=e;t<4*e+28;t++)i=c[t-1],(0==t%e||8===e&&4==t%e)&&(i=n[i>>>24]<<24^n[i>>16&255]<<16^n[i>>8&255]<<8^n[255&i],0==t%e&&(i=i<<8^i>>>24^o<<24,o=o<<1^283*(o>>7))),c[t]=c[t-e]^i;for(e=0;t;e++,t--)i=c[3&e?t:t-4],s[e]=4>=t||4>e?i:r[0][n[i>>>24]]^r[1][n[i>>16&255]]^r[2][n[i>>8&255]]^r[3][n[255&i]]},sjcl.cipher.aes.prototype={encrypt:function(e){return t(this,e,0)},decrypt:function(e){return t(this,e,1)},s:[[[],[],[],[],[]],[[],[],[],[],[]]],O:function(){var t=this.s[0],e=this.s[1],i=t[4],c=e[4],s,n,r,o=[],a=[],l,h,d,u;for(s=0;256>s;s++)a[(o[s]=s<<1^283*(s>>7))^s]=s;for(n=r=0;!i[n];n^=l||1,r=a[r]||1)for(d=(d=r^r<<1^r<<2^r<<3^r<<4)>>8^255&d^99,i[n]=d,c[d]=n,u=16843009*(h=o[s=o[l=o[n]]])^65537*s^257*l^16843008*n,h=257*o[d]^16843008*d,s=0;4>s;s++)t[s][n]=h=h<<24^h>>>8,e[s][d]=u=u<<24^u>>>8;for(s=0;5>s;s++)t[s]=t[s].slice(0),e[s]=e[s].slice(0)}},sjcl.bitArray={bitSlice:function(t,e,i){return t=sjcl.bitArray.$(t.slice(e/32),32-(31&e)).slice(1),void 0===i?t:sjcl.bitArray.clamp(t,i-e)},extract:function(t,e,i){var c=Math.floor(-e-i&31);return(-32&(e+i-1^e)?t[e/32|0]<<32-c^t[e/32+1|0]>>>c:t[e/32|0]>>>c)&(1<<i)-1},concat:function(t,e){if(0===t.length||0===e.length)return t.concat(e);var i=t[t.length-1],c=sjcl.bitArray.getPartial(i);return 32===c?t.concat(e):sjcl.bitArray.$(e,c,0|i,t.slice(0,t.length-1))},bitLength:function(t){var e=t.length;return 0===e?0:32*(e-1)+sjcl.bitArray.getPartial(t[e-1])},clamp:function(t,e){if(32*t.length<e)return t;var i=(t=t.slice(0,Math.ceil(e/32))).length;return e&=31,0<i&&e&&(t[i-1]=sjcl.bitArray.partial(e,t[i-1]&2147483648>>e-1,1)),t},partial:function(t,e,i){return 32===t?e:(i?0|e:e<<32-t)+1099511627776*t},getPartial:function(t){return Math.round(t/1099511627776)||32},equal:function(t,e){if(sjcl.bitArray.bitLength(t)!==sjcl.bitArray.bitLength(e))return!1;var i=0,c;for(c=0;c<t.length;c++)i|=t[c]^e[c];return 0===i},$:function(t,e,i,c){var s;for(s=0,void 0===c&&(c=[]);32<=e;e-=32)c.push(i),i=0;if(0===e)return c.concat(t);for(s=0;s<t.length;s++)c.push(i|t[s]>>>e),i=t[s]<<32-e;return s=t.length?t[t.length-1]:0,t=sjcl.bitArray.getPartial(s),c.push(sjcl.bitArray.partial(e+t&31,32<e+t?i:c.pop(),1)),c},i:function(t,e){return[t[0]^e[0],t[1]^e[1],t[2]^e[2],t[3]^e[3]]},byteswapM:function(t){var e,i;for(e=0;e<t.length;++e)i=t[e],t[e]=i>>>24|i>>>8&65280|(65280&i)<<8|i<<24;return t}},sjcl.codec.utf8String={fromBits:function(t){var e=\"\",i=sjcl.bitArray.bitLength(t),c,s;for(c=0;c<i/8;c++)0==(3&c)&&(s=t[c/4]),e+=String.fromCharCode(s>>>8>>>8>>>8),s<<=8;return decodeURIComponent(escape(e))},toBits:function(t){t=unescape(encodeURIComponent(t));var e=[],i,c=0;for(i=0;i<t.length;i++)c=c<<8|t.charCodeAt(i),3==(3&i)&&(e.push(c),c=0);return 3&i&&e.push(sjcl.bitArray.partial(8*(3&i),c)),e}},sjcl.codec.hex={fromBits:function(t){var e=\"\",i;for(i=0;i<t.length;i++)e+=(0xf00000000000+(0|t[i])).toString(16).substr(4);return e.substr(0,sjcl.bitArray.bitLength(t)/4)},toBits:function(t){var e,i=[],c;for(c=(t=t.replace(/\\s|0x/g,\"\")).length,t+=\"00000000\",e=0;e<t.length;e+=8)i.push(0^parseInt(t.substr(e,8),16));return sjcl.bitArray.clamp(i,4*c)}},sjcl.codec.base32={B:\"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567\",X:\"0123456789ABCDEFGHIJKLMNOPQRSTUV\",BITS:32,BASE:5,REMAINING:27,fromBits:function(t,e,i){var c=sjcl.codec.base32.BASE,s=sjcl.codec.base32.REMAINING,n=\"\",r=0,o=sjcl.codec.base32.B,a=0,l=sjcl.bitArray.bitLength(t);for(i&&(o=sjcl.codec.base32.X),i=0;n.length*c<l;)n+=o.charAt((a^t[i]>>>r)>>>s),r<c?(a=t[i]<<c-r,r+=s,i++):(a<<=c,r-=c);for(;7&n.length&&!e;)n+=\"=\";return n},toBits:function(t,e){t=t.replace(/\\s|=/g,\"\").toUpperCase();var i=sjcl.codec.base32.BITS,c=sjcl.codec.base32.BASE,s=sjcl.codec.base32.REMAINING,n=[],r,o=0,a=sjcl.codec.base32.B,l=0,h,d=\"base32\";for(e&&(a=sjcl.codec.base32.X,d=\"base32hex\"),r=0;r<t.length;r++){if(0>(h=a.indexOf(t.charAt(r)))){if(!e)try{return sjcl.codec.base32hex.toBits(t)}catch(t){}throw new sjcl.exception.invalid(\"this isn't \"+d+\"!\")}o>s?(o-=s,n.push(l^h>>>o),l=h<<i-o):l^=h<<i-(o+=c)}return 56&o&&n.push(sjcl.bitArray.partial(56&o,l,1)),n}},sjcl.codec.base32hex={fromBits:function(t,e){return sjcl.codec.base32.fromBits(t,e,1)},toBits:function(t){return sjcl.codec.base32.toBits(t,1)}},sjcl.codec.base64={B:\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\",fromBits:function(t,e,i){var c=\"\",s=0,n=sjcl.codec.base64.B,r=0,o=sjcl.bitArray.bitLength(t);for(i&&(n=n.substr(0,62)+\"-_\"),i=0;6*c.length<o;)c+=n.charAt((r^t[i]>>>s)>>>26),6>s?(r=t[i]<<6-s,s+=26,i++):(r<<=6,s-=6);for(;3&c.length&&!e;)c+=\"=\";return c},toBits:function(t,e){t=t.replace(/\\s|=/g,\"\");var i=[],c,s=0,n=sjcl.codec.base64.B,r=0,o;for(e&&(n=n.substr(0,62)+\"-_\"),c=0;c<t.length;c++){if(0>(o=n.indexOf(t.charAt(c))))throw new sjcl.exception.invalid(\"this isn't base64!\");26<s?(s-=26,i.push(r^o>>>s),r=o<<32-s):r^=o<<32-(s+=6)}return 56&s&&i.push(sjcl.bitArray.partial(56&s,r,1)),i}},sjcl.codec.base64url={fromBits:function(t){return sjcl.codec.base64.fromBits(t,1,1)},toBits:function(t){return sjcl.codec.base64.toBits(t,1)}},sjcl.hash.sha256=function(t){this.b[0]||this.O(),t?(this.F=t.F.slice(0),this.A=t.A.slice(0),this.l=t.l):this.reset()},sjcl.hash.sha256.hash=function(t){return(new sjcl.hash.sha256).update(t).finalize()},sjcl.hash.sha256.prototype={blockSize:512,reset:function(){return this.F=this.Y.slice(0),this.A=[],this.l=0,this},update:function(t){\"string\"==typeof t&&(t=sjcl.codec.utf8String.toBits(t));var e,i=this.A=sjcl.bitArray.concat(this.A,t);if(e=this.l,9007199254740991<(t=this.l=e+sjcl.bitArray.bitLength(t)))throw new sjcl.exception.invalid(\"Cannot hash more than 2^53 - 1 bits\");if(\"undefined\"!=typeof Uint32Array){var c=new Uint32Array(i),s=0;for(e=512+e-(512+e&511);e<=t;e+=512)u(this,c.subarray(16*s,16*(s+1))),s+=1;i.splice(0,16*s)}else for(e=512+e-(512+e&511);e<=t;e+=512)u(this,i.splice(0,16));return this},finalize:function(){var t,e=this.A,i=this.F,e;for(t=(e=sjcl.bitArray.concat(e,[sjcl.bitArray.partial(1,1)])).length+2;15&t;t++)e.push(0);for(e.push(Math.floor(this.l/4294967296)),e.push(0|this.l);e.length;)u(this,e.splice(0,16));return this.reset(),i},Y:[],b:[],O:function(){function t(t){return 4294967296*(t-Math.floor(t))|0}for(var e=0,i=2,c,s;64>e;i++){for(s=!0,c=2;c*c<=i;c++)if(0==i%c){s=!1;break}s&&(8>e&&(this.Y[e]=t(Math.pow(i,.5))),this.b[e]=t(Math.pow(i,1/3)),e++)}}},sjcl.mode.ccm={name:\"ccm\",G:[],listenProgress:function(t){sjcl.mode.ccm.G.push(t)},unListenProgress:function(t){-1<(t=sjcl.mode.ccm.G.indexOf(t))&&sjcl.mode.ccm.G.splice(t,1)},fa:function(t){var e=sjcl.mode.ccm.G.slice(),i;for(i=0;i<e.length;i+=1)e[i](t)},encrypt:function(t,e,i,c,s){var n,r=e.slice(0),o=sjcl.bitArray,a=o.bitLength(i)/8,l=o.bitLength(r)/8;if(s=s||64,c=c||[],7>a)throw new sjcl.exception.invalid(\"ccm: iv must be at least 7 bytes\");for(n=2;4>n&&l>>>8*n;n++);return n<15-a&&(n=15-a),i=o.clamp(i,8*(15-n)),e=sjcl.mode.ccm.V(t,e,i,c,s,n),r=sjcl.mode.ccm.C(t,r,i,e,s,n),o.concat(r.data,r.tag)},decrypt:function(t,e,i,c,s){s=s||64,c=c||[];var n=sjcl.bitArray,r=n.bitLength(i)/8,o=n.bitLength(e),a=n.clamp(e,o-s),l=n.bitSlice(e,o-s),o=(o-s)/8;if(7>r)throw new sjcl.exception.invalid(\"ccm: iv must be at least 7 bytes\");for(e=2;4>e&&o>>>8*e;e++);if(e<15-r&&(e=15-r),i=n.clamp(i,8*(15-e)),a=sjcl.mode.ccm.C(t,a,i,l,s,e),t=sjcl.mode.ccm.V(t,a.data,i,c,s,e),!n.equal(a.tag,t))throw new sjcl.exception.corrupt(\"ccm: tag doesn't match\");return a.data},na:function(t,e,i,c,s,n){var r=[],o=sjcl.bitArray,a=o.i;if(c=[o.partial(8,(e.length?64:0)|c-2<<2|n-1)],(c=o.concat(c,i))[3]|=s,c=t.encrypt(c),e.length)for(65279>=(i=o.bitLength(e)/8)?r=[o.partial(16,i)]:4294967295>=i&&(r=o.concat([o.partial(16,65534)],[i])),r=o.concat(r,e),e=0;e<r.length;e+=4)c=t.encrypt(a(c,r.slice(e,e+4).concat([0,0,0])));return c},V:function(t,e,i,c,s,n){var r=sjcl.bitArray,o=r.i;if((s/=8)%2||4>s||16<s)throw new sjcl.exception.invalid(\"ccm: invalid tag length\");if(4294967295<c.length||4294967295<e.length)throw new sjcl.exception.bug(\"ccm: can't deal with 4GiB or more data\");for(i=sjcl.mode.ccm.na(t,c,i,s,r.bitLength(e)/8,n),c=0;c<e.length;c+=4)i=t.encrypt(o(i,e.slice(c,c+4).concat([0,0,0])));return r.clamp(i,8*s)},C:function(t,e,i,c,s,n){var r,o=sjcl.bitArray;r=o.i;var a=e.length,l=o.bitLength(e),h=a/50,d=h;if(i=o.concat([o.partial(8,n-1)],i).concat([0,0,0]).slice(0,4),c=o.bitSlice(r(c,t.encrypt(i)),0,s),!a)return{tag:c,data:[]};for(r=0;r<a;r+=4)r>h&&(sjcl.mode.ccm.fa(r/a),h+=d),i[3]++,s=t.encrypt(i),e[r]^=s[0],e[r+1]^=s[1],e[r+2]^=s[2],e[r+3]^=s[3];return{tag:c,data:o.clamp(e,l)}}},sjcl.mode.ocb2={name:\"ocb2\",encrypt:function(t,e,i,c,s,n){if(128!==sjcl.bitArray.bitLength(i))throw new sjcl.exception.invalid(\"ocb iv must be 128 bits\");var r,o=sjcl.mode.ocb2.S,a=sjcl.bitArray,l=a.i,h=[0,0,0,0];i=o(t.encrypt(i));var d,u=[];for(c=c||[],s=s||64,r=0;r+4<e.length;r+=4)h=l(h,d=e.slice(r,r+4)),u=u.concat(l(i,t.encrypt(l(i,d)))),i=o(i);return d=e.slice(r),e=a.bitLength(d),r=t.encrypt(l(i,[0,0,0,e])),h=l(h,l((d=a.clamp(l(d.concat([0,0,0]),r),e)).concat([0,0,0]),r)),h=t.encrypt(l(h,l(i,o(i)))),c.length&&(h=l(h,n?c:sjcl.mode.ocb2.pmac(t,c))),u.concat(a.concat(d,a.clamp(h,s)))},decrypt:function(t,e,i,c,s,n){if(128!==sjcl.bitArray.bitLength(i))throw new sjcl.exception.invalid(\"ocb iv must be 128 bits\");s=s||64;var r=sjcl.mode.ocb2.S,o=sjcl.bitArray,a=o.i,l=[0,0,0,0],h=r(t.encrypt(i)),d,u,f=sjcl.bitArray.bitLength(e)-s,p=[];for(c=c||[],i=0;i+4<f/32;i+=4)l=a(l,d=a(h,t.decrypt(a(h,e.slice(i,i+4))))),p=p.concat(d),h=r(h);if(u=f-32*i,l=a(l,d=a(d=t.encrypt(a(h,[0,0,0,u])),o.clamp(e.slice(i),u).concat([0,0,0]))),l=t.encrypt(a(l,a(h,r(h)))),c.length&&(l=a(l,n?c:sjcl.mode.ocb2.pmac(t,c))),!o.equal(o.clamp(l,s),o.bitSlice(e,f)))throw new sjcl.exception.corrupt(\"ocb: tag doesn't match\");return p.concat(o.clamp(d,u))},pmac:function(t,e){var i,c=sjcl.mode.ocb2.S,s=sjcl.bitArray,n=s.i,r=[0,0,0,0],o,o=n(o=t.encrypt([0,0,0,0]),c(c(o)));for(i=0;i+4<e.length;i+=4)o=c(o),r=n(r,t.encrypt(n(o,e.slice(i,i+4))));return i=e.slice(i),128>s.bitLength(i)&&(o=n(o,c(o)),i=s.concat(i,[-2147483648,0,0,0])),r=n(r,i),t.encrypt(n(c(n(o,c(o))),r))},S:function(t){return[t[0]<<1^t[1]>>>31,t[1]<<1^t[2]>>>31,t[2]<<1^t[3]>>>31,t[3]<<1^135*(t[0]>>>31)]}},sjcl.mode.gcm={name:\"gcm\",encrypt:function(t,e,i,c,s){var n=e.slice(0);return e=sjcl.bitArray,c=c||[],t=sjcl.mode.gcm.C(!0,t,n,c,i,s||128),e.concat(t.data,t.tag)},decrypt:function(t,e,i,c,s){var n=e.slice(0),r=sjcl.bitArray,o=r.bitLength(n);if(s=s||128,c=c||[],s<=o?(e=r.bitSlice(n,o-s),n=r.bitSlice(n,0,o-s)):(e=n,n=[]),t=sjcl.mode.gcm.C(!1,t,n,c,i,s),!r.equal(t.tag,e))throw new sjcl.exception.corrupt(\"gcm: tag doesn't match\");return t.data},ka:function(t,e){var i,c,s,n,r,o=sjcl.bitArray.i;for(s=[0,0,0,0],n=e.slice(0),i=0;128>i;i++){for((c=0!=(t[Math.floor(i/32)]&1<<31-i%32))&&(s=o(s,n)),r=0!=(1&n[3]),c=3;0<c;c--)n[c]=n[c]>>>1|(1&n[c-1])<<31;n[0]>>>=1,r&&(n[0]^=-520093696)}return s},j:function(t,e,i){var c,s=i.length;for(e=e.slice(0),c=0;c<s;c+=4)e[0]^=4294967295&i[c],e[1]^=4294967295&i[c+1],e[2]^=4294967295&i[c+2],e[3]^=4294967295&i[c+3],e=sjcl.mode.gcm.ka(e,t);return e},C:function(t,e,i,c,s,n){var r,o,a,l,h,d,u,f,p=sjcl.bitArray;for(d=i.length,u=p.bitLength(i),f=p.bitLength(c),o=p.bitLength(s),r=e.encrypt([0,0,0,0]),96===o?(s=s.slice(0),s=p.concat(s,[1])):(s=sjcl.mode.gcm.j(r,[0,0,0,0],s),s=sjcl.mode.gcm.j(r,s,[0,0,Math.floor(o/4294967296),4294967295&o])),o=sjcl.mode.gcm.j(r,[0,0,0,0],c),h=s.slice(0),c=o.slice(0),t||(c=sjcl.mode.gcm.j(r,o,i)),l=0;l<d;l+=4)h[3]++,a=e.encrypt(h),i[l]^=a[0],i[l+1]^=a[1],i[l+2]^=a[2],i[l+3]^=a[3];return i=p.clamp(i,u),t&&(c=sjcl.mode.gcm.j(r,o,i)),t=[Math.floor(f/4294967296),4294967295&f,Math.floor(u/4294967296),4294967295&u],c=sjcl.mode.gcm.j(r,c,t),a=e.encrypt(s),c[0]^=a[0],c[1]^=a[1],c[2]^=a[2],c[3]^=a[3],{tag:p.bitSlice(c,0,n),data:i}}},sjcl.misc.hmac=function(t,e){this.W=e=e||sjcl.hash.sha256;var i=[[],[]],c,s=e.prototype.blockSize/32;for(this.w=[new e,new e],t.length>s&&(t=e.hash(t)),c=0;c<s;c++)i[0][c]=909522486^t[c],i[1][c]=1549556828^t[c];this.w[0].update(i[0]),this.w[1].update(i[1]),this.R=new e(this.w[0])},sjcl.misc.hmac.prototype.encrypt=sjcl.misc.hmac.prototype.mac=function(t){if(this.aa)throw new sjcl.exception.invalid(\"encrypt on already updated hmac called!\");return this.update(t),this.digest(t)},sjcl.misc.hmac.prototype.reset=function(){this.R=new this.W(this.w[0]),this.aa=!1},sjcl.misc.hmac.prototype.update=function(t){this.aa=!0,this.R.update(t)},sjcl.misc.hmac.prototype.digest=function(){var t=this.R.finalize(),t=new this.W(this.w[1]).update(t).finalize();return this.reset(),t},sjcl.misc.pbkdf2=function(t,e,i,c,s){if(i=i||1e4,0>c||0>i)throw new sjcl.exception.invalid(\"invalid params to pbkdf2\");\"string\"==typeof t&&(t=sjcl.codec.utf8String.toBits(t)),\"string\"==typeof e&&(e=sjcl.codec.utf8String.toBits(e)),t=new(s=s||sjcl.misc.hmac)(t);var n,r,o,a,l=[],h=sjcl.bitArray;for(a=1;32*l.length<(c||1);a++){for(s=n=t.encrypt(h.concat(e,[a])),r=1;r<i;r++)for(n=t.encrypt(n),o=0;o<n.length;o++)s[o]^=n[o];l=l.concat(s)}return c&&(l=h.clamp(l,c)),l},sjcl.prng=function(t){this.c=[new sjcl.hash.sha256],this.m=[0],this.P=0,this.H={},this.N=0,this.U={},this.Z=this.f=this.o=this.ha=0,this.b=[0,0,0,0,0,0,0,0],this.h=[0,0,0,0],this.L=void 0,this.M=t,this.D=!1,this.K={progress:{},seeded:{}},this.u=this.ga=0,this.I=1,this.J=2,this.ca=65536,this.T=[0,48,64,96,128,192,256,384,512,768,1024],this.da=3e4,this.ba=80},sjcl.prng.prototype={randomWords:function(t,e){var i=[],c,s;if((c=this.isReady(e))===this.u)throw new sjcl.exception.notReady(\"generator isn't seeded\");if(c&this.J){c=!(c&this.I),s=[];var n=0,r;for(this.Z=s[0]=(new Date).valueOf()+this.da,r=0;16>r;r++)s.push(4294967296*Math.random()|0);for(r=0;r<this.c.length&&(s=s.concat(this.c[r].finalize()),n+=this.m[r],this.m[r]=0,c||!(this.P&1<<r));r++);for(this.P>=1<<this.c.length&&(this.c.push(new sjcl.hash.sha256),this.m.push(0)),this.f-=n,n>this.o&&(this.o=n),this.P++,this.b=sjcl.hash.sha256.hash(this.b.concat(s)),this.L=new sjcl.cipher.aes(this.b),c=0;4>c&&(this.h[c]=this.h[c]+1|0,!this.h[c]);c++);}for(c=0;c<t;c+=4)0==(c+1)%this.ca&&y(this),s=z(this),i.push(s[0],s[1],s[2],s[3]);return y(this),i.slice(0,t)},setDefaultParanoia:function(t,e){if(0===t&&\"Setting paranoia=0 will ruin your security; use it only for testing\"!==e)throw new sjcl.exception.invalid(\"Setting paranoia=0 will ruin your security; use it only for testing\");this.M=t},addEntropy:function(t,e,i){i=i||\"user\";var c,s,n=(new Date).valueOf(),r=this.H[i],o=this.isReady(),a=0;switch(void 0===(c=this.U[i])&&(c=this.U[i]=this.ha++),void 0===r&&(r=this.H[i]=0),this.H[i]=(this.H[i]+1)%this.c.length,typeof t){case\"number\":void 0===e&&(e=1),this.c[r].update([c,this.N++,1,e,n,1,0|t]);break;case\"object\":if(\"[object Uint32Array]\"===(i=Object.prototype.toString.call(t))){for(s=[],i=0;i<t.length;i++)s.push(t[i]);t=s}else for(\"[object Array]\"!==i&&(a=1),i=0;i<t.length&&!a;i++)\"number\"!=typeof t[i]&&(a=1);if(!a){if(void 0===e)for(i=e=0;i<t.length;i++)for(s=t[i];0<s;)e++,s>>>=1;this.c[r].update([c,this.N++,2,e,n,t.length].concat(t))}break;case\"string\":void 0===e&&(e=t.length),this.c[r].update([c,this.N++,3,e,n,t.length]),this.c[r].update(t);break;default:a=1}if(a)throw new sjcl.exception.bug(\"random: addEntropy only supports number, array of numbers or string\");this.m[r]+=e,this.f+=e,o===this.u&&(this.isReady()!==this.u&&A(\"seeded\",Math.max(this.o,this.f)),A(\"progress\",this.getProgress()))},isReady:function(t){return t=this.T[void 0!==t?t:this.M],this.o&&this.o>=t?this.m[0]>this.ba&&(new Date).valueOf()>this.Z?this.J|this.I:this.I:this.f>=t?this.J|this.u:this.u},getProgress:function(t){return t=this.T[t||this.M],this.o>=t?1:this.f>t?1:this.f/t},startCollectors:function(){if(!this.D){if(this.a={loadTimeCollector:B(this,this.ma),mouseCollector:B(this,this.oa),keyboardCollector:B(this,this.la),accelerometerCollector:B(this,this.ea),touchCollector:B(this,this.qa)},window.addEventListener)window.addEventListener(\"load\",this.a.loadTimeCollector,!1),window.addEventListener(\"mousemove\",this.a.mouseCollector,!1),window.addEventListener(\"keypress\",this.a.keyboardCollector,!1),window.addEventListener(\"devicemotion\",this.a.accelerometerCollector,!1),window.addEventListener(\"touchmove\",this.a.touchCollector,!1);else{if(!document.attachEvent)throw new sjcl.exception.bug(\"can't attach event\");document.attachEvent(\"onload\",this.a.loadTimeCollector),document.attachEvent(\"onmousemove\",this.a.mouseCollector),document.attachEvent(\"keypress\",this.a.keyboardCollector)}this.D=!0}},stopCollectors:function(){this.D&&(window.removeEventListener?(window.removeEventListener(\"load\",this.a.loadTimeCollector,!1),window.removeEventListener(\"mousemove\",this.a.mouseCollector,!1),window.removeEventListener(\"keypress\",this.a.keyboardCollector,!1),window.removeEventListener(\"devicemotion\",this.a.accelerometerCollector,!1),window.removeEventListener(\"touchmove\",this.a.touchCollector,!1)):document.detachEvent&&(document.detachEvent(\"onload\",this.a.loadTimeCollector),document.detachEvent(\"onmousemove\",this.a.mouseCollector),document.detachEvent(\"keypress\",this.a.keyboardCollector)),this.D=!1)},addEventListener:function(t,e){this.K[t][this.ga++]=e},removeEventListener:function(t,e){var i,c,s=this.K[t],n=[];for(c in s)s.hasOwnProperty(c)&&s[c]===e&&n.push(c);for(i=0;i<n.length;i++)delete s[c=n[i]]},la:function(){C(this,1)},oa:function(t){var e,i;try{e=t.x||t.clientX||t.offsetX||0,i=t.y||t.clientY||t.offsetY||0}catch(t){i=e=0}0!=e&&0!=i&&this.addEntropy([e,i],2,\"mouse\"),C(this,0)},qa:function(t){t=t.touches[0]||t.changedTouches[0],this.addEntropy([t.pageX||t.clientX,t.pageY||t.clientY],1,\"touch\"),C(this,0)},ma:function(){C(this,2)},ea:function(t){if(t=t.accelerationIncludingGravity.x||t.accelerationIncludingGravity.y||t.accelerationIncludingGravity.z,window.orientation){var e=window.orientation;\"number\"==typeof e&&this.addEntropy(e,1,\"accelerometer\")}t&&this.addEntropy(t,2,\"accelerometer\"),C(this,0)}},sjcl.random=new sjcl.prng(6);t:try{var D,E,F,G;if(G=\"undefined\"!=typeof module&&module.exports){var H;try{H=require(\"crypto\")}catch(t){H=null}G=E=H}if(G&&E.randomBytes)D=E.randomBytes(128),D=new Uint32Array(new Uint8Array(D).buffer),sjcl.random.addEntropy(D,1024,\"crypto['randomBytes']\");else if(\"undefined\"!=typeof window&&\"undefined\"!=typeof Uint32Array){if(F=new Uint32Array(32),window.crypto&&window.crypto.getRandomValues)window.crypto.getRandomValues(F);else{if(!window.msCrypto||!window.msCrypto.getRandomValues)break t;window.msCrypto.getRandomValues(F)}sjcl.random.addEntropy(F,1024,\"crypto['getRandomValues']\")}}catch(t){\"undefined\"!=typeof window&&window.console&&(console.log(\"There was an error collecting entropy from the browser:\"),console.log(t))}sjcl.json={defaults:{v:1,iter:1e4,ks:128,ts:64,mode:\"ccm\",adata:\"\",cipher:\"aes\"},ja:function(t,e,i,c){i=i||{},c=c||{};var s=sjcl.json,n=s.g({iv:sjcl.random.randomWords(4,0)},s.defaults),r;if(s.g(n,i),i=n.adata,\"string\"==typeof n.salt&&(n.salt=sjcl.codec.base64.toBits(n.salt)),\"string\"==typeof n.iv&&(n.iv=sjcl.codec.base64.toBits(n.iv)),!sjcl.mode[n.mode]||!sjcl.cipher[n.cipher]||\"string\"==typeof t&&100>=n.iter||64!==n.ts&&96!==n.ts&&128!==n.ts||128!==n.ks&&192!==n.ks&&256!==n.ks||2>n.iv.length||4<n.iv.length)throw new sjcl.exception.invalid(\"json encrypt: invalid parameters\");return\"string\"==typeof t?(t=(r=sjcl.misc.cachedPbkdf2(t,n)).key.slice(0,n.ks/32),n.salt=r.salt):sjcl.ecc&&t instanceof sjcl.ecc.elGamal.publicKey&&(r=t.kem(),n.kemtag=r.tag,t=r.key.slice(0,n.ks/32)),\"string\"==typeof e&&(e=sjcl.codec.utf8String.toBits(e)),\"string\"==typeof i&&(n.adata=i=sjcl.codec.utf8String.toBits(i)),r=new sjcl.cipher[n.cipher](t),s.g(c,n),c.key=t,n.ct=\"ccm\"===n.mode&&sjcl.arrayBuffer&&sjcl.arrayBuffer.ccm&&e instanceof ArrayBuffer?sjcl.arrayBuffer.ccm.encrypt(r,e,n.iv,i,n.ts):sjcl.mode[n.mode].encrypt(r,e,n.iv,i,n.ts),n},encrypt:function(t,e,i,c){var s=sjcl.json,n=s.ja.apply(s,arguments);return s.encode(n)},ia:function(t,e,i,c){i=i||{},c=c||{};var s=sjcl.json,n,r;if(n=(e=s.g(s.g(s.g({},s.defaults),e),i,!0)).adata,\"string\"==typeof e.salt&&(e.salt=sjcl.codec.base64.toBits(e.salt)),\"string\"==typeof e.iv&&(e.iv=sjcl.codec.base64.toBits(e.iv)),!sjcl.mode[e.mode]||!sjcl.cipher[e.cipher]||\"string\"==typeof t&&100>=e.iter||64!==e.ts&&96!==e.ts&&128!==e.ts||128!==e.ks&&192!==e.ks&&256!==e.ks||!e.iv||2>e.iv.length||4<e.iv.length)throw new sjcl.exception.invalid(\"json decrypt: invalid parameters\");return\"string\"==typeof t?(t=(r=sjcl.misc.cachedPbkdf2(t,e)).key.slice(0,e.ks/32),e.salt=r.salt):sjcl.ecc&&t instanceof sjcl.ecc.elGamal.secretKey&&(t=t.unkem(sjcl.codec.base64.toBits(e.kemtag)).slice(0,e.ks/32)),\"string\"==typeof n&&(n=sjcl.codec.utf8String.toBits(n)),r=new sjcl.cipher[e.cipher](t),n=\"ccm\"===e.mode&&sjcl.arrayBuffer&&sjcl.arrayBuffer.ccm&&e.ct instanceof ArrayBuffer?sjcl.arrayBuffer.ccm.decrypt(r,e.ct,e.iv,e.tag,n,e.ts):sjcl.mode[e.mode].decrypt(r,e.ct,e.iv,n,e.ts),s.g(c,e),c.key=t,1===i.raw?n:sjcl.codec.utf8String.fromBits(n)},decrypt:function(t,e,i,c){var s=sjcl.json;return s.ia(t,s.decode(e),i,c)},encode:function(t){var e,i=\"{\",c=\"\";for(e in t)if(t.hasOwnProperty(e)){if(!e.match(/^[a-z0-9]+$/i))throw new sjcl.exception.invalid(\"json encode: invalid property name\");switch(i+=c+'\"'+e+'\":',c=\",\",typeof t[e]){case\"number\":case\"boolean\":i+=t[e];break;case\"string\":i+='\"'+escape(t[e])+'\"';break;case\"object\":i+='\"'+sjcl.codec.base64.fromBits(t[e],0)+'\"';break;default:throw new sjcl.exception.bug(\"json encode: unsupported type\")}}return i+\"}\"},decode:function(t){if(!(t=t.replace(/\\s/g,\"\")).match(/^\\{.*\\}$/))throw new sjcl.exception.invalid(\"json decode: this isn't json!\");t=t.replace(/^\\{|\\}$/g,\"\").split(/,/);var e={},i,c;for(i=0;i<t.length;i++){if(!(c=t[i].match(/^\\s*(?:([\"']?)([a-z][a-z0-9]*)\\1)\\s*:\\s*(?:(-?\\d+)|\"([a-z0-9+\\/%*_.@=\\-]*)\"|(true|false))$/i)))throw new sjcl.exception.invalid(\"json decode: this isn't json!\");null!=c[3]?e[c[2]]=parseInt(c[3],10):null!=c[4]?e[c[2]]=c[2].match(/^(ct|adata|salt|iv)$/)?sjcl.codec.base64.toBits(c[4]):unescape(c[4]):null!=c[5]&&(e[c[2]]=\"true\"===c[5])}return e},g:function(t,e,i){if(void 0===t&&(t={}),void 0===e)return t;for(var c in e)if(e.hasOwnProperty(c)){if(i&&void 0!==t[c]&&t[c]!==e[c])throw new sjcl.exception.invalid(\"required parameter overridden\");t[c]=e[c]}return t},sa:function(t,e){var i={},c;for(c in t)t.hasOwnProperty(c)&&t[c]!==e[c]&&(i[c]=t[c]);return i},ra:function(t,e){var i={},c;for(c=0;c<e.length;c++)void 0!==t[e[c]]&&(i[e[c]]=t[e[c]]);return i}},sjcl.encrypt=sjcl.json.encrypt,sjcl.decrypt=sjcl.json.decrypt,sjcl.misc.pa={},sjcl.misc.cachedPbkdf2=function(t,e){var i=sjcl.misc.pa,c;return c=(e=e||{}).iter||1e3,(c=(i=i[t]=i[t]||{})[c]=i[c]||{firstSalt:e.salt&&e.salt.length?e.salt.slice(0):sjcl.random.randomWords(2,0)})[i=void 0===e.salt?c.firstSalt:e.salt]=c[i]||sjcl.misc.pbkdf2(t,i,e.iter),{key:c[i].slice(0),salt:i.slice(0)}},\"undefined\"!=typeof module&&module.exports&&(module.exports=sjcl),\"function\"==typeof define&&define([],function(){return sjcl});\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAiXSwibmFtZXMiOlsic2pjbCIsImNpcGhlciIsImhhc2giLCJrZXlleGNoYW5nZSIsIm1vZGUiLCJtaXNjIiwiY29kZWMiLCJleGNlcHRpb24iLCJjb3JydXB0IiwiYSIsInRoaXMiLCJ0b1N0cmluZyIsIm1lc3NhZ2UiLCJpbnZhbGlkIiwiYnVnIiwibm90UmVhZHkiLCJ0IiwiYiIsImMiLCJsZW5ndGgiLCJkIiwiZSIsImYiLCJnIiwiaCIsImsiLCJsIiwibiIsIm0iLCJwIiwiciIsInMiLCJxIiwidiIsInciLCJ4IiwidSIsIkYiLCJBIiwicmFuZG9tIiwiSyIsImhhc093blByb3BlcnR5IiwicHVzaCIsIkMiLCJ3aW5kb3ciLCJwZXJmb3JtYW5jZSIsIm5vdyIsImFkZEVudHJvcHkiLCJEYXRlIiwidmFsdWVPZiIsInkiLCJ6IiwiY29uY2F0IiwiTCIsImFlcyIsImVuY3J5cHQiLCJCIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJPIiwic2xpY2UiLCJwcm90b3R5cGUiLCJkZWNyeXB0IiwiYml0QXJyYXkiLCJiaXRTbGljZSIsIiQiLCJjbGFtcCIsImV4dHJhY3QiLCJNYXRoIiwiZmxvb3IiLCJnZXRQYXJ0aWFsIiwiYml0TGVuZ3RoIiwiY2VpbCIsInBhcnRpYWwiLCJyb3VuZCIsImVxdWFsIiwicG9wIiwiaSIsImJ5dGVzd2FwTSIsInV0ZjhTdHJpbmciLCJmcm9tQml0cyIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImRlY29kZVVSSUNvbXBvbmVudCIsImVzY2FwZSIsInRvQml0cyIsInVuZXNjYXBlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiY2hhckNvZGVBdCIsImhleCIsInN1YnN0ciIsInJlcGxhY2UiLCJwYXJzZUludCIsImJhc2UzMiIsIlgiLCJCSVRTIiwiQkFTRSIsIlJFTUFJTklORyIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwiaW5kZXhPZiIsImJhc2UzMmhleCIsImJhc2U2NCIsImJhc2U2NHVybCIsInNoYTI1NiIsInJlc2V0IiwidXBkYXRlIiwiZmluYWxpemUiLCJibG9ja1NpemUiLCJZIiwiVWludDMyQXJyYXkiLCJzdWJhcnJheSIsInNwbGljZSIsInBvdyIsImNjbSIsIm5hbWUiLCJHIiwibGlzdGVuUHJvZ3Jlc3MiLCJ1bkxpc3RlblByb2dyZXNzIiwiZmEiLCJWIiwiZGF0YSIsInRhZyIsIm5hIiwib2NiMiIsIlMiLCJwbWFjIiwiZ2NtIiwia2EiLCJqIiwiaG1hYyIsIlciLCJSIiwibWFjIiwiYWEiLCJkaWdlc3QiLCJwYmtkZjIiLCJwcm5nIiwiUCIsIkgiLCJOIiwiVSIsIloiLCJvIiwiaGEiLCJNIiwiRCIsInByb2dyZXNzIiwic2VlZGVkIiwiZ2EiLCJJIiwiSiIsImNhIiwiVCIsImRhIiwiYmEiLCJyYW5kb21Xb3JkcyIsImlzUmVhZHkiLCJzZXREZWZhdWx0UGFyYW5vaWEiLCJPYmplY3QiLCJjYWxsIiwibWF4IiwiZ2V0UHJvZ3Jlc3MiLCJzdGFydENvbGxlY3RvcnMiLCJsb2FkVGltZUNvbGxlY3RvciIsIm1hIiwibW91c2VDb2xsZWN0b3IiLCJvYSIsImtleWJvYXJkQ29sbGVjdG9yIiwibGEiLCJhY2NlbGVyb21ldGVyQ29sbGVjdG9yIiwiZWEiLCJ0b3VjaENvbGxlY3RvciIsInFhIiwiYWRkRXZlbnRMaXN0ZW5lciIsImRvY3VtZW50IiwiYXR0YWNoRXZlbnQiLCJzdG9wQ29sbGVjdG9ycyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJkZXRhY2hFdmVudCIsImNsaWVudFgiLCJvZmZzZXRYIiwiY2xpZW50WSIsIm9mZnNldFkiLCJ0b3VjaGVzIiwiY2hhbmdlZFRvdWNoZXMiLCJwYWdlWCIsInBhZ2VZIiwiYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSIsIm9yaWVudGF0aW9uIiwiRSIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXF1aXJlIiwicmFuZG9tQnl0ZXMiLCJVaW50OEFycmF5IiwiYnVmZmVyIiwiY3J5cHRvIiwiZ2V0UmFuZG9tVmFsdWVzIiwibXNDcnlwdG8iLCJjb25zb2xlIiwibG9nIiwianNvbiIsImRlZmF1bHRzIiwiaXRlciIsImtzIiwidHMiLCJhZGF0YSIsImphIiwiaXYiLCJzYWx0IiwiY2FjaGVkUGJrZGYyIiwia2V5IiwiZWNjIiwiZWxHYW1hbCIsInB1YmxpY0tleSIsImtlbSIsImtlbXRhZyIsImN0IiwiYXJyYXlCdWZmZXIiLCJBcnJheUJ1ZmZlciIsImVuY29kZSIsImlhIiwic2VjcmV0S2V5IiwidW5rZW0iLCJyYXciLCJkZWNvZGUiLCJtYXRjaCIsInNwbGl0Iiwic2EiLCJyYSIsInBhIiwiZmlyc3RTYWx0IiwiZGVmaW5lIl0sIm1hcHBpbmdzIjoiQUFBQSxhQUFhLElBQUlBLE1BQU1DLFVBQVVDLFFBQVFDLGVBQWVDLFFBQVFDLFFBQVFDLFNBQVNDLFdBQVdDLFFBQVEsU0FBU0MsR0FBR0MsS0FBS0MsU0FBUyxXQUFXLE1BQU0sWUFBWUQsS0FBS0UsU0FBU0YsS0FBS0UsUUFBUUgsR0FBR0ksUUFBUSxTQUFTSixHQUFHQyxLQUFLQyxTQUFTLFdBQVcsTUFBTSxZQUFZRCxLQUFLRSxTQUFTRixLQUFLRSxRQUFRSCxHQUFHSyxJQUFJLFNBQVNMLEdBQUdDLEtBQUtDLFNBQVMsV0FBVyxNQUFNLFFBQVFELEtBQUtFLFNBQVNGLEtBQUtFLFFBQVFILEdBQUdNLFNBQVMsU0FBU04sR0FBR0MsS0FBS0MsU0FBUyxXQUFXLE1BQU0sY0FBY0QsS0FBS0UsU0FBU0YsS0FBS0UsUUFBUUgsS0FLeGMsU0FBU08sRUFBRVAsRUFBRVEsRUFBRUMsR0FBRyxHQUFHLElBQUlELEVBQUVFLE9BQU8sTUFBTSxJQUFJbkIsS0FBS08sVUFBVU0sUUFBUSwwQkFBMEIsSUFBSU8sRUFBRVgsRUFBRVEsRUFBRUMsR0FBR0csRUFBRUosRUFBRSxHQUFHRyxFQUFFLEdBQUdFLEVBQUVMLEVBQUVDLEVBQUUsRUFBRSxHQUFHRSxFQUFFLEdBQUdHLEVBQUVOLEVBQUUsR0FBR0csRUFBRSxHQUFHSCxFQUFFQSxFQUFFQyxFQUFFLEVBQUUsR0FBR0UsRUFBRSxHQUFHLElBQUlJLEVBQUVDLEVBQUVDLEVBQUVDLEVBQUVQLEVBQUVELE9BQU8sRUFBRSxFQUFFUyxFQUFFQyxFQUFFLEVBQUVDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBWXJCLEdBQVRlLEVBQUVmLEVBQUVzQixFQUFFYixJQUFPLEdBQUcsSUFBSWMsRUFBRVIsRUFBRSxHQUFHUyxFQUFFVCxFQUFFLEdBQUdVLEVBQUVWLEVBQUUsR0FBR1csRUFBRVgsRUFBRSxHQUFHLElBQUlJLEVBQUUsRUFBRUEsRUFBRUQsRUFBRUMsSUFBSUosRUFBRWYsRUFBRVksSUFBSSxJQUFJVyxFQUFFVixHQUFHLEdBQUcsS0FBS1csRUFBRVYsR0FBRyxFQUFFLEtBQUtXLEVBQUksSUFBRmpCLEdBQU9HLEVBQUVTLEdBQUdKLEVBQUVoQixFQUFFYSxJQUFJLElBQUlVLEVBQUVULEdBQUcsR0FBRyxLQUFLVSxFQUFFaEIsR0FBRyxFQUFFLEtBQUtpQixFQUFJLElBQUZiLEdBQU9ELEVBQUVTLEVBQUUsR0FBR0gsRUFBRWpCLEVBQUVjLElBQUksSUFBSVMsRUFBRWYsR0FBRyxHQUFHLEtBQUtnQixFQUFFWixHQUFHLEVBQUUsS0FBS2EsRUFBSSxJQUFGWixHQUFPRixFQUFFUyxFQUFFLEdBQUdaLEVBQUVSLEVBQUVRLElBQUksSUFBSWUsRUFBRVgsR0FBRyxHQUFHLEtBQUtZLEVBQUVYLEdBQUcsRUFBRSxLQUFLWSxFQUFJLElBQUZYLEdBQU9ILEVBQUVTLEVBQUUsR0FBR0EsR0FBRyxFQUFFUixFQUFFRyxFQUFFRixFQUFFRyxFQUFFRixFQUFFRyxFQUFFLElBQUlFLEVBQ0ksRUFBRSxFQUFFQSxFQUFFQSxJQUFJRSxFQUFFWixFQUFFLEdBQUdVLEVBQUVBLEdBQUdPLEVBQUVkLElBQUksS0FBSyxHQUFHYyxFQUFFYixHQUFHLEdBQUcsTUFBTSxHQUFHYSxFQUFFWixHQUFHLEVBQUUsTUFBTSxFQUFFWSxFQUFJLElBQUZsQixHQUFPRyxFQUFFUyxLQUFLTCxFQUFFSCxFQUFFQSxFQUFFQyxFQUFFQSxFQUFFQyxFQUFFQSxFQUFFTixFQUFFQSxFQUFFTyxFQUFFLE9BQU9NLEVBY3ZtQixTQUFTTSxFQUFFM0IsRUFBRVEsR0FBRyxJQUFJQyxFQUFFRSxFQUFFQyxFQUFFQyxFQUFFYixFQUFFNEIsRUFBRWQsRUFBRWQsRUFBRVEsRUFBRU8sRUFBRUYsRUFBRSxHQUFHRyxFQUFFSCxFQUFFLEdBQUdJLEVBQUVKLEVBQUUsR0FBR0ssRUFBRUwsRUFBRSxHQUFHTSxFQUFFTixFQUFFLEdBQUdPLEVBQUVQLEVBQUUsR0FBR1EsRUFBRVIsRUFBRSxHQUFHVSxFQUFFVixFQUFFLEdBQUcsSUFBSUosRUFBRSxFQUFFLEdBQUdBLEVBQUVBLElBQUksR0FBR0EsRUFBRUUsRUFBRUgsRUFBRUMsSUFBSUUsRUFBRUgsRUFBRUMsRUFBRSxFQUFFLElBQUlHLEVBQUVKLEVBQUVDLEVBQUUsR0FBRyxJQUFJRSxFQUFFSCxFQUFJLEdBQUZDLElBQU9FLElBQUksRUFBRUEsSUFBSSxHQUFHQSxJQUFJLEVBQUVBLEdBQUcsR0FBR0EsR0FBRyxLQUFLQyxJQUFJLEdBQUdBLElBQUksR0FBR0EsSUFBSSxHQUFHQSxHQUFHLEdBQUdBLEdBQUcsSUFBSUosRUFBSSxHQUFGQyxHQUFNRCxFQUFFQyxFQUFFLEVBQUUsSUFBSSxHQUFHRSxFQUFFQSxFQUFFWSxHQUFHSixJQUFJLEVBQUVBLElBQUksR0FBR0EsSUFBSSxHQUFHQSxHQUFHLEdBQUdBLEdBQUcsR0FBR0EsR0FBRyxJQUFJRSxFQUFFRixHQUFHQyxFQUFFQyxJQUFJUCxFQUFFTCxHQUFHYyxFQUFFRixFQUFFQSxFQUFFRCxFQUFFQSxFQUFFRCxFQUFFQSxFQUFFRCxFQUFFUCxFQUFFLEVBQUVPLEVBQUVELEVBQUVBLEVBQUVELEVBQU1ELEVBQUVKLElBQU5LLEVBQUVELEdBQVNFLEVBQUVDLEdBQUdGLEVBQUVDLEtBQUtELElBQUksRUFBRUEsSUFBSSxHQUFHQSxJQUFJLEdBQUdBLEdBQUcsR0FBR0EsR0FBRyxHQUFHQSxHQUFHLElBQUksRUFBRUgsRUFBRSxHQUFHQSxFQUFFLEdBQUdFLEVBQUUsRUFBRUYsRUFBRSxHQUFHQSxFQUFFLEdBQUdHLEVBQUUsRUFBRUgsRUFBRSxHQUFHQSxFQUFFLEdBQUdJLEVBQUUsRUFBRUosRUFBRSxHQUFHQSxFQUFFLEdBQUdLLEVBQUUsRUFBRUwsRUFBRSxHQUFHQSxFQUFFLEdBQUdNLEVBQUUsRUFBRU4sRUFBRSxHQUFHQSxFQUFFLEdBQUdPLEVBQUUsRUFBRVAsRUFBRSxHQUFHQSxFQUFFLEdBQUdRLEVBQUUsRUFBRVIsRUFBRSxHQUNsZkEsRUFBRSxHQUFHVSxFQUFFLEVBMEJYLFNBQVNNLEVBQUU3QixFQUFFUSxHQUFHLElBQUlDLEVBQUVFLEVBQUVwQixLQUFLdUMsT0FBT0MsRUFBRS9CLEdBQUdZLEtBQUssSUFBSUgsS0FBS0UsRUFBRUEsRUFBRXFCLGVBQWV2QixJQUFJRyxFQUFFcUIsS0FBS3RCLEVBQUVGLElBQUksSUFBSUEsRUFBRSxFQUFFQSxFQUFFRyxFQUFFRixPQUFPRCxJQUFJRyxFQUFFSCxHQUFHRCxHQUFHLFNBQVMwQixFQUFFbEMsRUFBRVEsR0FBRyxvQkFBcUIyQixRQUFRQSxPQUFPQyxhQUFhLG1CQUFvQkQsT0FBT0MsWUFBWUMsSUFBSXJDLEVBQUVzQyxXQUFXSCxPQUFPQyxZQUFZQyxNQUFNN0IsRUFBRSxZQUFZUixFQUFFc0MsWUFBVyxJQUFLQyxNQUFNQyxVQUFVaEMsRUFBRSxZQUFZLFNBQVNpQyxFQUFFekMsR0FBR0EsRUFBRVEsRUFBRWtDLEVBQUUxQyxHQUFHMkMsT0FBT0QsRUFBRTFDLElBQUlBLEVBQUU0QyxFQUFFLElBQUlyRCxLQUFLQyxPQUFPcUQsSUFBSTdDLEVBQUVRLEdBQUcsU0FBU2tDLEVBQUUxQyxHQUFHLElBQUksSUFBSVEsRUFBRSxFQUFFLEVBQUVBLElBQUlSLEVBQUVlLEVBQUVQLEdBQUdSLEVBQUVlLEVBQUVQLEdBQUcsRUFBRSxHQUFHUixFQUFFZSxFQUFFUCxJQUFJQSxLQUFLLE9BQU9SLEVBQUU0QyxFQUFFRSxRQUFROUMsRUFBRWUsR0FDaGUsU0FBU2dDLEVBQUUvQyxFQUFFUSxHQUFHLE9BQU8sV0FBV0EsRUFBRXdDLE1BQU1oRCxFQUFFaUQsWUEvQzVDMUQsS0FBS0MsT0FBT3FELElBQUksU0FBUzdDLEdBQUdDLEtBQUtxQixFQUFFLEdBQUcsR0FBRyxJQUFJckIsS0FBS2lELElBQUksSUFBSTFDLEVBQUVDLEVBQUVFLEVBQUVDLEVBQUVDLEVBQUVaLEtBQUtxQixFQUFFLEdBQUcsR0FBR1IsRUFBRWIsS0FBS3FCLEVBQUUsR0FBa0JQLEVBQUUsRUFBRSxHQUFHLEtBQXRCUCxFQUFFUixFQUFFVSxTQUF5QixJQUFJRixHQUFHLElBQUlBLEVBQUUsTUFBTSxJQUFJakIsS0FBS08sVUFBVU0sUUFBUSx3QkFBbUQsSUFBM0JILEtBQUtPLEdBQUdHLEVBQUVYLEVBQUVtRCxNQUFNLEdBQUd2QyxNQUFVWixFQUFFUSxFQUFFUixFQUFFLEVBQUVRLEVBQUUsR0FBR1IsSUFBS1MsRUFBRUUsRUFBRVgsRUFBRSxJQUFNLEdBQUlBLEVBQUVRLEdBQUcsSUFBSUEsR0FBRyxHQUFJUixFQUFFUSxLQUFFQyxFQUFFSSxFQUFFSixJQUFJLEtBQUssR0FBR0ksRUFBRUosR0FBRyxHQUFHLE1BQU0sR0FBR0ksRUFBRUosR0FBRyxFQUFFLE1BQU0sRUFBRUksRUFBSSxJQUFGSixHQUFPLEdBQUlULEVBQUVRLElBQUlDLEVBQUVBLEdBQUcsRUFBRUEsSUFBSSxHQUFHTSxHQUFHLEdBQUdBLEVBQUVBLEdBQUcsRUFBRSxLQUFLQSxHQUFHLEtBQUlKLEVBQUVYLEdBQUdXLEVBQUVYLEVBQUVRLEdBQUdDLEVBQUUsSUFBSUQsRUFBRSxFQUFFUixFQUFFUSxJQUFJUixJQUFJUyxFQUFFRSxFQUFJLEVBQUZILEVBQUlSLEVBQUVBLEVBQUUsR0FBR1ksRUFBRUosR0FBRyxHQUFHUixHQUFHLEVBQUVRLEVBQUVDLEVBQUVLLEVBQUUsR0FBR0QsRUFBRUosSUFBSSxLQUFLSyxFQUFFLEdBQUdELEVBQUVKLEdBQUcsR0FBRyxNQUFNSyxFQUFFLEdBQUdELEVBQUVKLEdBQUcsRUFBRSxNQUFNSyxFQUFFLEdBQUdELEVBQ3pmLElBRDJmSixLQUUzZmxCLEtBQUtDLE9BQU9xRCxJQUFJTyxXQUFXTixRQUFRLFNBQVM5QyxHQUFHLE9BQU9PLEVBQUVOLEtBQUtELEVBQUUsSUFBSXFELFFBQVEsU0FBU3JELEdBQUcsT0FBT08sRUFBRU4sS0FBS0QsRUFBRSxJQUFJc0Isc0NBQXNDNEIsRUFBRSxXQUFXLElBQUlsRCxFQUFFQyxLQUFLcUIsRUFBRSxHQUFHZCxFQUFFUCxLQUFLcUIsRUFBRSxHQUFHYixFQUFFVCxFQUFFLEdBQUdXLEVBQUVILEVBQUUsR0FBR0ksRUFBRUMsRUFBRUMsRUFBRUMsS0FBS0MsS0FBS0MsRUFBRUMsRUFBRUMsRUFBRUMsRUFBRSxJQUFJUixFQUFFLEVBQUUsSUFBTUEsRUFBRUEsSUFBSUksR0FBR0QsRUFBRUgsR0FBR0EsR0FBRyxFQUFFLEtBQUtBLEdBQUcsSUFBSUEsR0FBR0EsRUFBRSxJQUFJQyxFQUFFQyxFQUFFLEdBQUdMLEVBQUVJLEdBQUdBLEdBQUdJLEdBQUcsRUFBRUgsRUFBRUUsRUFBRUYsSUFBSSxFQUFFLElBQTRCSyxHQUF4QkEsRUFBRUwsRUFBRUEsR0FBRyxFQUFFQSxHQUFHLEVBQUVBLEdBQUcsRUFBRUEsR0FBRyxJQUFPLEVBQUksSUFBRkssRUFBTSxHQUFHVixFQUFFSSxHQUFHTSxFQUFFUixFQUFFUSxHQUFHTixFQUFtQk8sRUFBRSxVQUFuQkYsRUFBRUgsRUFBRUgsRUFBRUcsRUFBRUUsRUFBRUYsRUFBRUYsTUFBbUIsTUFBUUQsRUFBRSxJQUFNSyxFQUFFLFNBQVVKLEVBQUVLLEVBQUUsSUFBTUgsRUFBRUksR0FBRyxTQUFVQSxFQUFFUCxFQUFFLEVBQUUsRUFBRUEsRUFBRUEsSUFBSVosRUFBRVksR0FBR0MsR0FBR0ssRUFBRUEsR0FBRyxHQUFHQSxJQUFJLEVBQUVWLEVBQUVJLEdBQUdPLEdBQUdDLEVBQUVBLEdBQUcsR0FBR0EsSUFBSSxFQUFFLElBQUlSLEVBQ0ksRUFBRSxFQUFFQSxFQUFFQSxJQUFJWixFQUFFWSxHQUFHWixFQUFFWSxHQUFHdUMsTUFBTSxHQUFHM0MsRUFBRUksR0FBR0osRUFBRUksR0FBR3VDLE1BQU0sS0FHampCNUQsS0FBSytELFVBQVVDLFNBQVMsU0FBU3ZELEVBQUVRLEVBQUVDLEdBQXVELE9BQXBEVCxFQUFFVCxLQUFLK0QsU0FBU0UsRUFBRXhELEVBQUVtRCxNQUFNM0MsRUFBRSxJQUFJLElBQU0sR0FBRkEsSUFBTzJDLE1BQU0sUUFBVSxJQUFTMUMsRUFBRVQsRUFBRVQsS0FBSytELFNBQVNHLE1BQU16RCxFQUFFUyxFQUFFRCxJQUFJa0QsUUFBUSxTQUFTMUQsRUFBRVEsRUFBRUMsR0FBRyxJQUFJRSxFQUFFZ0QsS0FBS0MsT0FBT3BELEVBQUVDLEVBQUUsSUFBSSxRQUFrQixJQUFWRCxFQUFFQyxFQUFFLEVBQUVELEdBQU9SLEVBQUVRLEVBQUUsR0FBRyxJQUFJLEdBQUdHLEVBQUVYLEVBQUVRLEVBQUUsR0FBRyxFQUFFLEtBQUtHLEVBQUVYLEVBQUVRLEVBQUUsR0FBRyxLQUFLRyxJQUFJLEdBQUdGLEdBQUcsR0FBR2tDLE9BQU8sU0FBUzNDLEVBQUVRLEdBQUcsR0FBRyxJQUFJUixFQUFFVSxRQUFRLElBQUlGLEVBQUVFLE9BQU8sT0FBT1YsRUFBRTJDLE9BQU9uQyxHQUFHLElBQUlDLEVBQUVULEVBQUVBLEVBQUVVLE9BQU8sR0FBR0MsRUFBRXBCLEtBQUsrRCxTQUFTTyxXQUFXcEQsR0FBRyxPQUFPLEtBQUtFLEVBQUVYLEVBQUUyQyxPQUFPbkMsR0FBR2pCLEtBQUsrRCxTQUFTRSxFQUFFaEQsRUFBRUcsRUFBSSxFQUFGRixFQUFJVCxFQUFFbUQsTUFBTSxFQUFFbkQsRUFBRVUsT0FBTyxLQUFLb0QsVUFBVSxTQUFTOUQsR0FBRyxJQUFJUSxFQUFFUixFQUFFVSxPQUFPLE9BQU8sSUFDdGZGLEVBQUUsRUFBRSxJQUFJQSxFQUFFLEdBQUdqQixLQUFLK0QsU0FBU08sV0FBVzdELEVBQUVRLEVBQUUsS0FBS2lELE1BQU0sU0FBU3pELEVBQUVRLEdBQUcsR0FBRyxHQUFHUixFQUFFVSxPQUFPRixFQUFFLE9BQU9SLEVBQStCLElBQUlTLEdBQWpDVCxFQUFFQSxFQUFFbUQsTUFBTSxFQUFFUSxLQUFLSSxLQUFLdkQsRUFBRSxNQUFhRSxPQUFpRixPQUExRUYsR0FBSSxHQUFHLEVBQUVDLEdBQUdELElBQUlSLEVBQUVTLEVBQUUsR0FBR2xCLEtBQUsrRCxTQUFTVSxRQUFReEQsRUFBRVIsRUFBRVMsRUFBRSxHQUFHLFlBQVlELEVBQUUsRUFBRSxJQUFXUixHQUFHZ0UsUUFBUSxTQUFTaEUsRUFBRVEsRUFBRUMsR0FBRyxPQUFPLEtBQUtULEVBQUVRLEdBQUdDLEVBQUksRUFBRkQsRUFBSUEsR0FBRyxHQUFHUixHQUFHLGNBQWNBLEdBQUc2RCxXQUFXLFNBQVM3RCxHQUFHLE9BQU8yRCxLQUFLTSxNQUFNakUsRUFBRSxnQkFBZ0IsSUFBSWtFLE1BQU0sU0FBU2xFLEVBQUVRLEdBQUcsR0FBR2pCLEtBQUsrRCxTQUFTUSxVQUFVOUQsS0FBS1QsS0FBSytELFNBQVNRLFVBQVV0RCxHQUFHLE9BQU0sRUFBRyxJQUFJQyxFQUFFLEVBQUVFLEVBQUUsSUFBSUEsRUFBRSxFQUFFQSxFQUFFWCxFQUFFVSxPQUFPQyxJQUFJRixHQUFHVCxFQUFFVyxHQUFHSCxFQUFFRyxHQUFHLE9BQU8sSUFDOWVGLEdBQUcrQyxFQUFFLFNBQVN4RCxFQUFFUSxFQUFFQyxFQUFFRSxHQUFHLElBQUlDLEVBQU0sSUFBSkEsRUFBRSxPQUFNLElBQVNELElBQUlBLE1BQU0sSUFBSUgsRUFBRUEsR0FBRyxHQUFHRyxFQUFFc0IsS0FBS3hCLEdBQUdBLEVBQUUsRUFBRSxHQUFHLElBQUlELEVBQUUsT0FBT0csRUFBRWdDLE9BQU8zQyxHQUFHLElBQUlZLEVBQUUsRUFBRUEsRUFBRVosRUFBRVUsT0FBT0UsSUFBSUQsRUFBRXNCLEtBQUt4QixFQUFFVCxFQUFFWSxLQUFLSixHQUFHQyxFQUFFVCxFQUFFWSxJQUFJLEdBQUdKLEVBQW9ILE9BQWxISSxFQUFFWixFQUFFVSxPQUFPVixFQUFFQSxFQUFFVSxPQUFPLEdBQUcsRUFBRVYsRUFBRVQsS0FBSytELFNBQVNPLFdBQVdqRCxHQUFHRCxFQUFFc0IsS0FBSzFDLEtBQUsrRCxTQUFTVSxRQUFReEQsRUFBRVIsRUFBRSxHQUFHLEdBQUdRLEVBQUVSLEVBQUVTLEVBQUVFLEVBQUV3RCxNQUFNLElBQVd4RCxHQUFHeUQsRUFBRSxTQUFTcEUsRUFBRVEsR0FBRyxPQUFPUixFQUFFLEdBQUdRLEVBQUUsR0FBR1IsRUFBRSxHQUFHUSxFQUFFLEdBQUdSLEVBQUUsR0FBR1EsRUFBRSxHQUFHUixFQUFFLEdBQUdRLEVBQUUsS0FBSzZELFVBQVUsU0FBU3JFLEdBQUcsSUFBSVEsRUFBRUMsRUFBRSxJQUFJRCxFQUFFLEVBQUVBLEVBQUVSLEVBQUVVLFNBQVNGLEVBQUVDLEVBQUVULEVBQUVRLEdBQUdSLEVBQUVRLEdBQUdDLElBQUksR0FBR0EsSUFBSSxFQUFFLE9BQVUsTUFBRkEsSUFBVyxFQUFFQSxHQUFHLEdBQUcsT0FBT1QsSUFDMWRULEtBQUtNLE1BQU15RSxZQUFZQyxTQUFTLFNBQVN2RSxHQUFHLElBQUlRLEVBQUUsR0FBR0MsRUFBRWxCLEtBQUsrRCxTQUFTUSxVQUFVOUQsR0FBR1csRUFBRUMsRUFBRSxJQUFJRCxFQUFFLEVBQUVBLEVBQUVGLEVBQUUsRUFBRUUsSUFBSSxJQUFPLEVBQUZBLEtBQU9DLEVBQUVaLEVBQUVXLEVBQUUsSUFBSUgsR0FBR2dFLE9BQU9DLGFBQWE3RCxJQUFJLElBQUksSUFBSSxHQUFHQSxJQUFJLEVBQUUsT0FBTzhELG1CQUFtQkMsT0FBT25FLEtBQUtvRSxPQUFPLFNBQVM1RSxHQUFHQSxFQUFFNkUsU0FBU0MsbUJBQW1COUUsSUFBSSxJQUFJUSxLQUFLQyxFQUFFRSxFQUFFLEVBQUUsSUFBSUYsRUFBRSxFQUFFQSxFQUFFVCxFQUFFVSxPQUFPRCxJQUFJRSxFQUFFQSxHQUFHLEVBQUVYLEVBQUUrRSxXQUFXdEUsR0FBRyxJQUFPLEVBQUZBLEtBQU9ELEVBQUV5QixLQUFLdEIsR0FBR0EsRUFBRSxHQUFpRCxPQUE1QyxFQUFGRixHQUFLRCxFQUFFeUIsS0FBSzFDLEtBQUsrRCxTQUFTVSxRQUFRLEdBQUssRUFBRnZELEdBQUtFLElBQVdILElBQ2xaakIsS0FBS00sTUFBTW1GLEtBQUtULFNBQVMsU0FBU3ZFLEdBQUcsSUFBSVEsRUFBRSxHQUFHQyxFQUFFLElBQUlBLEVBQUUsRUFBRUEsRUFBRVQsRUFBRVUsT0FBT0QsSUFBSUQsSUFBYSxnQkFBSCxFQUFMUixFQUFFUyxLQUFzQlAsU0FBUyxJQUFJK0UsT0FBTyxHQUFHLE9BQU96RSxFQUFFeUUsT0FBTyxFQUFFMUYsS0FBSytELFNBQVNRLFVBQVU5RCxHQUFHLElBQUk0RSxPQUFPLFNBQVM1RSxHQUFHLElBQUlRLEVBQUVDLEtBQUtFLEVBQXFELElBQTFCQSxHQUF6QlgsRUFBRUEsRUFBRWtGLFFBQVEsU0FBUyxLQUFReEUsT0FBT1YsR0FBSSxXQUFlUSxFQUFFLEVBQUVBLEVBQUVSLEVBQUVVLE9BQU9GLEdBQUcsRUFBRUMsRUFBRXdCLEtBQWdDLEVBQTNCa0QsU0FBU25GLEVBQUVpRixPQUFPekUsRUFBRSxHQUFHLEtBQU8sT0FBT2pCLEtBQUsrRCxTQUFTRyxNQUFNaEQsRUFBRSxFQUFFRSxLQUMzVnBCLEtBQUtNLE1BQU11RixRQUFRckMsRUFBRSxtQ0FBbUNzQyxFQUFFLG1DQUFtQ0MsS0FBSyxHQUFHQyxLQUFLLEVBQUVDLFVBQVUsR0FBR2pCLFNBQVMsU0FBU3ZFLEVBQUVRLEVBQUVDLEdBQUcsSUFBSUUsRUFBRXBCLEtBQUtNLE1BQU11RixPQUFPRyxLQUFLM0UsRUFBRXJCLEtBQUtNLE1BQU11RixPQUFPSSxVQUFVM0UsRUFBRSxHQUFHQyxFQUFFLEVBQUVDLEVBQUV4QixLQUFLTSxNQUFNdUYsT0FBT3JDLEVBQUUvQixFQUFFLEVBQUVDLEVBQUUxQixLQUFLK0QsU0FBU1EsVUFBVTlELEdBQThCLElBQTNCUyxJQUFJTSxFQUFFeEIsS0FBS00sTUFBTXVGLE9BQU9DLEdBQU81RSxFQUFFLEVBQUVJLEVBQUVILE9BQU9DLEVBQUVNLEdBQUdKLEdBQUdFLEVBQUUwRSxRQUFRekUsRUFBRWhCLEVBQUVTLEtBQUtLLEtBQUtGLEdBQUdFLEVBQUVILEdBQUdLLEVBQUVoQixFQUFFUyxJQUFJRSxFQUFFRyxFQUFFQSxHQUFHRixFQUFFSCxNQUFNTyxJQUFJTCxFQUFFRyxHQUFHSCxHQUFHLEtBQWMsRUFBVEUsRUFBRUgsU0FBV0YsR0FBR0ssR0FBRyxJQUFJLE9BQU9BLEdBQUcrRCxPQUFPLFNBQVM1RSxFQUFFUSxHQUFHUixFQUFFQSxFQUFFa0YsUUFBUSxRQUFRLElBQUlRLGNBQWMsSUFBSWpGLEVBQUVsQixLQUFLTSxNQUFNdUYsT0FBT0UsS0FDcmYzRSxFQUFFcEIsS0FBS00sTUFBTXVGLE9BQU9HLEtBQUszRSxFQUFFckIsS0FBS00sTUFBTXVGLE9BQU9JLFVBQVUzRSxLQUFLQyxFQUFFQyxFQUFFLEVBQUVDLEVBQUV6QixLQUFLTSxNQUFNdUYsT0FBT3JDLEVBQUU5QixFQUFFLEVBQUVDLEVBQUVDLEVBQUUsU0FBa0QsSUFBekNYLElBQUlRLEVBQUV6QixLQUFLTSxNQUFNdUYsT0FBT0MsRUFBRWxFLEVBQUUsYUFBaUJMLEVBQUUsRUFBRUEsRUFBRWQsRUFBRVUsT0FBT0ksSUFBSSxDQUEwQixHQUFHLEdBQTVCSSxFQUFFRixFQUFFMkUsUUFBUTNGLEVBQUV5RixPQUFPM0UsS0FBVyxDQUFDLElBQUlOLEVBQUUsSUFBSSxPQUFPakIsS0FBS00sTUFBTStGLFVBQVVoQixPQUFPNUUsR0FBRyxNQUFNb0IsSUFBSSxNQUFNLElBQUk3QixLQUFLTyxVQUFVTSxRQUFRLGNBQWNlLEVBQUUsS0FBTUosRUFBRUgsR0FBR0csR0FBR0gsRUFBRUMsRUFBRW9CLEtBQUtoQixFQUFFQyxJQUFJSCxHQUFHRSxFQUFFQyxHQUFHVCxFQUFFTSxHQUFTRSxHQUFHQyxHQUFHVCxHQUFYTSxHQUFHSixHQUEyRCxPQUE1QyxHQUFGSSxHQUFNRixFQUFFb0IsS0FBSzFDLEtBQUsrRCxTQUFTVSxRQUFVLEdBQUZqRCxFQUFLRSxFQUFFLElBQVdKLElBQzlhdEIsS0FBS00sTUFBTStGLFdBQVdyQixTQUFTLFNBQVN2RSxFQUFFUSxHQUFHLE9BQU9qQixLQUFLTSxNQUFNdUYsT0FBT2IsU0FBU3ZFLEVBQUVRLEVBQUUsSUFBSW9FLE9BQU8sU0FBUzVFLEdBQUcsT0FBT1QsS0FBS00sTUFBTXVGLE9BQU9SLE9BQU81RSxFQUFFLEtBQzVJVCxLQUFLTSxNQUFNZ0csUUFBUTlDLEVBQUUsbUVBQW1Fd0IsU0FBUyxTQUFTdkUsRUFBRVEsRUFBRUMsR0FBRyxJQUFJRSxFQUFFLEdBQUdDLEVBQUUsRUFBRUMsRUFBRXRCLEtBQUtNLE1BQU1nRyxPQUFPOUMsRUFBRWpDLEVBQUUsRUFBRUMsRUFBRXhCLEtBQUsrRCxTQUFTUSxVQUFVOUQsR0FBOEIsSUFBM0JTLElBQUlJLEVBQUVBLEVBQUVvRSxPQUFPLEVBQUUsSUFBSSxNQUFVeEUsRUFBRSxFQUFFLEVBQUVFLEVBQUVELE9BQU9LLEdBQUdKLEdBQUdFLEVBQUU0RSxRQUFRM0UsRUFBRWQsRUFBRVMsS0FBS0csS0FBSyxJQUFJLEVBQUVBLEdBQUdFLEVBQUVkLEVBQUVTLElBQUksRUFBRUcsRUFBRUEsR0FBRyxHQUFHSCxNQUFNSyxJQUFJLEVBQUVGLEdBQUcsR0FBRyxLQUFjLEVBQVRELEVBQUVELFNBQVdGLEdBQUdHLEdBQUcsSUFBSSxPQUFPQSxHQUFHaUUsT0FBTyxTQUFTNUUsRUFBRVEsR0FBR1IsRUFBRUEsRUFBRWtGLFFBQVEsUUFBUSxJQUFJLElBQUl6RSxLQUFLRSxFQUFFQyxFQUFFLEVBQUVDLEVBQUV0QixLQUFLTSxNQUFNZ0csT0FBTzlDLEVBQUVqQyxFQUFFLEVBQUVDLEVBQTZCLElBQTNCUCxJQUFJSyxFQUFFQSxFQUFFb0UsT0FBTyxFQUFFLElBQUksTUFBVXRFLEVBQUUsRUFBRUEsRUFBRVgsRUFBRVUsT0FBT0MsSUFBSSxDQUN0ZCxHQUFHLEdBRG9kSSxFQUFFRixFQUFFOEUsUUFBUTNGLEVBQUV5RixPQUFPOUUsS0FDcmUsTUFBTSxJQUFJcEIsS0FBS08sVUFBVU0sUUFBUSxzQkFBc0IsR0FBR1EsR0FBR0EsR0FBRyxHQUFHSCxFQUFFd0IsS0FBS25CLEVBQUVDLElBQUlILEdBQUdFLEVBQUVDLEdBQUcsR0FBR0gsR0FBU0UsR0FBR0MsR0FBRyxJQUFYSCxHQUFHLEdBQTRELE9BQTVDLEdBQUZBLEdBQU1ILEVBQUV3QixLQUFLMUMsS0FBSytELFNBQVNVLFFBQVUsR0FBRnBELEVBQUtFLEVBQUUsSUFBV0wsSUFBSWxCLEtBQUtNLE1BQU1pRyxXQUFXdkIsU0FBUyxTQUFTdkUsR0FBRyxPQUFPVCxLQUFLTSxNQUFNZ0csT0FBT3RCLFNBQVN2RSxFQUFFLEVBQUUsSUFBSTRFLE9BQU8sU0FBUzVFLEdBQUcsT0FBT1QsS0FBS00sTUFBTWdHLE9BQU9qQixPQUFPNUUsRUFBRSxLQUFLVCxLQUFLRSxLQUFLc0csT0FBTyxTQUFTL0YsR0FBR0MsS0FBS08sRUFBRSxJQUFJUCxLQUFLaUQsSUFBSWxELEdBQUdDLEtBQUsyQixFQUFFNUIsRUFBRTRCLEVBQUV1QixNQUFNLEdBQUdsRCxLQUFLNEIsRUFBRTdCLEVBQUU2QixFQUFFc0IsTUFBTSxHQUFHbEQsS0FBS2dCLEVBQUVqQixFQUFFaUIsR0FBR2hCLEtBQUsrRixTQUFTekcsS0FBS0UsS0FBS3NHLE9BQU90RyxLQUFLLFNBQVNPLEdBQUcsT0FBTSxJQUFLVCxLQUFLRSxLQUFLc0csUUFBUUUsT0FBT2pHLEdBQUdrRyxZQUN0Z0IzRyxLQUFLRSxLQUFLc0csT0FBTzNDLFdBQVcrQyxVQUFVLElBQUlILE1BQU0sV0FBcUQsT0FBMUMvRixLQUFLMkIsRUFBRTNCLEtBQUttRyxFQUFFakQsTUFBTSxHQUFHbEQsS0FBSzRCLEtBQUs1QixLQUFLZ0IsRUFBRSxFQUFTaEIsTUFBTWdHLE9BQU8sU0FBU2pHLEdBQUcsaUJBQWtCQSxJQUFJQSxFQUFFVCxLQUFLTSxNQUFNeUUsV0FBV00sT0FBTzVFLElBQUksSUFBSVEsRUFBRUMsRUFBRVIsS0FBSzRCLEVBQUV0QyxLQUFLK0QsU0FBU1gsT0FBTzFDLEtBQUs0QixFQUFFN0IsR0FBa0QsR0FBL0NRLEVBQUVQLEtBQUtnQixFQUEyQyxrQkFBekNqQixFQUFFQyxLQUFLZ0IsRUFBRVQsRUFBRWpCLEtBQUsrRCxTQUFTUSxVQUFVOUQsSUFBeUIsTUFBTSxJQUFJVCxLQUFLTyxVQUFVTSxRQUFRLHVDQUF1QyxHQUFHLG9CQUFxQmlHLFlBQVksQ0FBQyxJQUFJMUYsRUFBRSxJQUFJMEYsWUFBWTVGLEdBQUdHLEVBQUUsRUFBRSxJQUFJSixFQUFFLElBQUlBLEdBQUcsSUFBSUEsRUFBRSxLQUFPQSxHQUFHUixFQUFFUSxHQUFHLElBQUltQixFQUFFMUIsS0FBS1UsRUFBRTJGLFNBQVMsR0FBRzFGLEVBQzllLElBQUlBLEVBQUUsS0FBS0EsR0FBRyxFQUFFSCxFQUFFOEYsT0FBTyxFQUFFLEdBQUczRixRQUFRLElBQUlKLEVBQUUsSUFBSUEsR0FBRyxJQUFJQSxFQUFFLEtBQU9BLEdBQUdSLEVBQUVRLEdBQUcsSUFBSW1CLEVBQUUxQixLQUFLUSxFQUFFOEYsT0FBTyxFQUFFLEtBQUssT0FBT3RHLE1BQU1pRyxTQUFTLFdBQVcsSUFBSWxHLEVBQUVRLEVBQUVQLEtBQUs0QixFQUFFcEIsRUFBRVIsS0FBSzJCLEVBQUVwQixFQUF1RCxJQUFJUixHQUEzRFEsRUFBRWpCLEtBQUsrRCxTQUFTWCxPQUFPbkMsR0FBR2pCLEtBQUsrRCxTQUFTVSxRQUFRLEVBQUUsTUFBYXRELE9BQU8sRUFBSSxHQUFGVixFQUFLQSxJQUFJUSxFQUFFeUIsS0FBSyxHQUEwQyxJQUF2Q3pCLEVBQUV5QixLQUFLMEIsS0FBS0MsTUFBTTNELEtBQUtnQixFQUFFLGFBQWtCVCxFQUFFeUIsS0FBWSxFQUFQaEMsS0FBS2dCLEdBQUtULEVBQUVFLFFBQVFpQixFQUFFMUIsS0FBS08sRUFBRStGLE9BQU8sRUFBRSxLQUFrQixPQUFidEcsS0FBSytGLFFBQWV2RixHQUFHMkYsS0FBSzVGLEtBQUswQyxFQUFFLFdBQVcsU0FBU2xELEVBQUVBLEdBQUcsT0FBTyxZQUFhQSxFQUFFMkQsS0FBS0MsTUFBTTVELElBQUksRUFBRSxJQUFJLElBQUlRLEVBQUUsRUFBRUMsRUFBRSxFQUFFRSxFQUFFQyxFQUFFLEdBQUdKLEVBQUVDLElBQUksQ0FBTSxJQUFMRyxHQUFFLEVBQU9ELEVBQUUsRUFBRUEsRUFBRUEsR0FBR0YsRUFBRUUsSUFBSSxHQUFHLEdBQUlGLEVBQUVFLEVBQUUsQ0FBQ0MsR0FDemYsRUFBRyxNQUFNQSxJQUFJLEVBQUVKLElBQUlQLEtBQUttRyxFQUFFNUYsR0FBR1IsRUFBRTJELEtBQUs2QyxJQUFJL0YsRUFBRSxNQUFNUixLQUFLTyxFQUFFQSxHQUFHUixFQUFFMkQsS0FBSzZDLElBQUkvRixFQUFFLEVBQUUsSUFBSUQsUUFHckZqQixLQUFLSSxLQUFLOEcsS0FBS0MsS0FBSyxNQUFNQyxLQUFLQyxlQUFlLFNBQVM1RyxHQUFHVCxLQUFLSSxLQUFLOEcsSUFBSUUsRUFBRTFFLEtBQUtqQyxJQUFJNkcsaUJBQWlCLFNBQVM3RyxJQUFpQyxHQUE5QkEsRUFBRVQsS0FBS0ksS0FBSzhHLElBQUlFLEVBQUVoQixRQUFRM0YsS0FBU1QsS0FBS0ksS0FBSzhHLElBQUlFLEVBQUVKLE9BQU92RyxFQUFFLElBQUk4RyxHQUFHLFNBQVM5RyxHQUFHLElBQUlRLEVBQUVqQixLQUFLSSxLQUFLOEcsSUFBSUUsRUFBRXhELFFBQVExQyxFQUFFLElBQUlBLEVBQUUsRUFBRUEsRUFBRUQsRUFBRUUsT0FBT0QsR0FBRyxFQUFFRCxFQUFFQyxHQUFHVCxJQUFJOEMsUUFBUSxTQUFTOUMsRUFBRVEsRUFBRUMsRUFBRUUsRUFBRUMsR0FBRyxJQUFJQyxFQUFFQyxFQUFFTixFQUFFMkMsTUFBTSxHQUFHcEMsRUFBRXhCLEtBQUsrRCxTQUFTdEMsRUFBRUQsRUFBRStDLFVBQVVyRCxHQUFHLEVBQUVRLEVBQUVGLEVBQUUrQyxVQUFVaEQsR0FBRyxFQUFrQixHQUFoQkYsRUFBRUEsR0FBRyxHQUFHRCxFQUFFQSxNQUFTLEVBQUVLLEVBQUUsTUFBTSxJQUFJekIsS0FBS08sVUFBVU0sUUFBUSxvQ0FBb0MsSUFBSVMsRUFBRSxFQUFFLEVBQUVBLEdBQUdJLElBQUksRUFBRUosRUFBRUEsS0FDdFksT0FEMllBLEVBQUUsR0FBR0csSUFBSUgsRUFBRSxHQUFHRyxHQUFHUCxFQUFFTSxFQUFFMEMsTUFBTWhELEVBQzllLEdBQUcsR0FBR0ksSUFBSUwsRUFBRWpCLEtBQUtJLEtBQUs4RyxJQUFJTSxFQUFFL0csRUFBRVEsRUFBRUMsRUFBRUUsRUFBRUMsRUFBRUMsR0FBR0MsRUFBRXZCLEtBQUtJLEtBQUs4RyxJQUFJdkUsRUFBRWxDLEVBQUVjLEVBQUVMLEVBQUVELEVBQUVJLEVBQUVDLEdBQVVFLEVBQUU0QixPQUFPN0IsRUFBRWtHLEtBQUtsRyxFQUFFbUcsTUFBTTVELFFBQVEsU0FBU3JELEVBQUVRLEVBQUVDLEVBQUVFLEVBQUVDLEdBQUdBLEVBQUVBLEdBQUcsR0FBR0QsRUFBRUEsTUFBTSxJQUFJRSxFQUFFdEIsS0FBSytELFNBQVN4QyxFQUFFRCxFQUFFaUQsVUFBVXJELEdBQUcsRUFBRU0sRUFBRUYsRUFBRWlELFVBQVV0RCxHQUFHUSxFQUFFSCxFQUFFNEMsTUFBTWpELEVBQUVPLEVBQUVILEdBQUdLLEVBQUVKLEVBQUUwQyxTQUFTL0MsRUFBRU8sRUFBRUgsR0FBR0csR0FBR0EsRUFBRUgsR0FBRyxFQUFFLEdBQUcsRUFBRUUsRUFBRSxNQUFNLElBQUl2QixLQUFLTyxVQUFVTSxRQUFRLG9DQUFvQyxJQUFJSSxFQUFFLEVBQUUsRUFBRUEsR0FBR08sSUFBSSxFQUFFUCxFQUFFQSxLQUErRyxHQUExR0EsRUFBRSxHQUFHTSxJQUFJTixFQUFFLEdBQUdNLEdBQUdMLEVBQUVJLEVBQUU0QyxNQUFNaEQsRUFBRSxHQUFHLEdBQUdELElBQUlRLEVBQUV6QixLQUFLSSxLQUFLOEcsSUFBSXZFLEVBQUVsQyxFQUFFZ0IsRUFBRVAsRUFBRVEsRUFBRUwsRUFBRUosR0FBR1IsRUFBRVQsS0FBS0ksS0FBSzhHLElBQUlNLEVBQUUvRyxFQUFFZ0IsRUFBRWdHLEtBQUt2RyxFQUFFRSxFQUFFQyxFQUFFSixJQUFPSyxFQUFFcUQsTUFBTWxELEVBQUVpRyxJQUFJakgsR0FBRyxNQUFNLElBQUlULEtBQUtPLFVBQVVDLFFBQVEsMEJBQ2hnQixPQUFPaUIsRUFBRWdHLE1BQU1FLEdBQUcsU0FBU2xILEVBQUVRLEVBQUVDLEVBQUVFLEVBQUVDLEVBQUVDLEdBQUcsSUFBSUMsS0FBS0MsRUFBRXhCLEtBQUsrRCxTQUFTdEMsRUFBRUQsRUFBRXFELEVBQXFGLEdBQW5GekQsR0FBR0ksRUFBRWlELFFBQVEsR0FBR3hELEVBQUVFLE9BQU8sR0FBRyxHQUFHQyxFQUFFLEdBQUcsRUFBRUUsRUFBRSxLQUFJRixFQUFFSSxFQUFFNEIsT0FBT2hDLEVBQUVGLElBQUssSUFBSUcsRUFBRUQsRUFBRVgsRUFBRThDLFFBQVFuQyxHQUFNSCxFQUFFRSxPQUFPLElBQXVCLFFBQW5CRCxFQUFFTSxFQUFFK0MsVUFBVXRELEdBQUcsR0FBV00sR0FBR0MsRUFBRWlELFFBQVEsR0FBR3ZELElBQUksWUFBWUEsSUFBSUssRUFBRUMsRUFBRTRCLFFBQVE1QixFQUFFaUQsUUFBUSxHQUFHLFNBQVN2RCxLQUFLSyxFQUFFQyxFQUFFNEIsT0FBTzdCLEVBQUVOLEdBQUdBLEVBQUUsRUFBRUEsRUFBRU0sRUFBRUosT0FBT0YsR0FBRyxFQUFFRyxFQUFFWCxFQUFFOEMsUUFBUTlCLEVBQUVMLEVBQUVHLEVBQUVxQyxNQUFNM0MsRUFBRUEsRUFBRSxHQUFHbUMsUUFBUSxFQUFFLEVBQUUsTUFBTSxPQUFPaEMsR0FBR29HLEVBQUUsU0FBUy9HLEVBQUVRLEVBQUVDLEVBQUVFLEVBQUVDLEVBQUVDLEdBQUcsSUFBSUMsRUFBRXZCLEtBQUsrRCxTQUFTdkMsRUFBRUQsRUFBRXNELEVBQU8sSUFBTHhELEdBQUcsR0FBTyxHQUFHLEVBQUVBLEdBQUcsR0FBR0EsRUFBRSxNQUFNLElBQUlyQixLQUFLTyxVQUFVTSxRQUFRLDJCQUMxZCxHQUFHLFdBQVdPLEVBQUVELFFBQVEsV0FBV0YsRUFBRUUsT0FBTyxNQUFNLElBQUluQixLQUFLTyxVQUFVTyxJQUFJLDBDQUF5RixJQUEvQ0ksRUFBRWxCLEtBQUtJLEtBQUs4RyxJQUFJUyxHQUFHbEgsRUFBRVcsRUFBRUYsRUFBRUcsRUFBRUUsRUFBRWdELFVBQVV0RCxHQUFHLEVBQUVLLEdBQU9GLEVBQUUsRUFBRUEsRUFBRUgsRUFBRUUsT0FBT0MsR0FBRyxFQUFFRixFQUFFVCxFQUFFOEMsUUFBUS9CLEVBQUVOLEVBQUVELEVBQUUyQyxNQUFNeEMsRUFBRUEsRUFBRSxHQUFHZ0MsUUFBUSxFQUFFLEVBQUUsTUFBTSxPQUFPN0IsRUFBRTJDLE1BQU1oRCxFQUFFLEVBQUVHLElBQUlzQixFQUFFLFNBQVNsQyxFQUFFUSxFQUFFQyxFQUFFRSxFQUFFQyxFQUFFQyxHQUFHLElBQUlDLEVBQUVDLEVBQUV4QixLQUFLK0QsU0FBU3hDLEVBQUVDLEVBQUVxRCxFQUFFLElBQUlwRCxFQUFFUixFQUFFRSxPQUFPTyxFQUFFRixFQUFFK0MsVUFBVXRELEdBQUdVLEVBQUVGLEVBQUUsR0FBR0csRUFBRUQsRUFBa0csR0FBaEdULEVBQUVNLEVBQUU0QixRQUFRNUIsRUFBRWlELFFBQVEsRUFBRW5ELEVBQUUsSUFBSUosR0FBR2tDLFFBQVEsRUFBRSxFQUFFLElBQUlRLE1BQU0sRUFBRSxHQUFHeEMsRUFBRUksRUFBRXdDLFNBQVN6QyxFQUFFSCxFQUFFWCxFQUFFOEMsUUFBUXJDLElBQUksRUFBRUcsSUFBT0ksRUFBRSxPQUFPaUcsSUFBSXRHLEVBQUVxRyxTQUFTLElBQUlsRyxFQUFFLEVBQUVBLEVBQUVFLEVBQUVGLEdBQUcsRUFBRUEsRUFBRUksSUFBSTNCLEtBQUtJLEtBQUs4RyxJQUFJSyxHQUFHaEcsRUFDcmdCRSxHQUFHRSxHQUFHQyxHQUFHVixFQUFFLEtBQUtHLEVBQUVaLEVBQUU4QyxRQUFRckMsR0FBR0QsRUFBRU0sSUFBSUYsRUFBRSxHQUFHSixFQUFFTSxFQUFFLElBQUlGLEVBQUUsR0FBR0osRUFBRU0sRUFBRSxJQUFJRixFQUFFLEdBQUdKLEVBQUVNLEVBQUUsSUFBSUYsRUFBRSxHQUFHLE9BQU9xRyxJQUFJdEcsRUFBRXFHLEtBQUtqRyxFQUFFMEMsTUFBTWpELEVBQUVTLE1BQ3JIMUIsS0FBS0ksS0FBS3dILE1BQU1ULEtBQUssT0FBTzVELFFBQVEsU0FBUzlDLEVBQUVRLEVBQUVDLEVBQUVFLEVBQUVDLEVBQUVDLEdBQUcsR0FBRyxNQUFNdEIsS0FBSytELFNBQVNRLFVBQVVyRCxHQUFHLE1BQU0sSUFBSWxCLEtBQUtPLFVBQVVNLFFBQVEsMkJBQTJCLElBQUlVLEVBQUVDLEVBQUV4QixLQUFLSSxLQUFLd0gsS0FBS0MsRUFBRXBHLEVBQUV6QixLQUFLK0QsU0FBU3JDLEVBQUVELEVBQUVvRCxFQUFFbEQsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHVCxFQUFFTSxFQUFFZixFQUFFOEMsUUFBUXJDLElBQUksSUFBSVUsRUFBRUMsS0FBcUIsSUFBaEJULEVBQUVBLE1BQU1DLEVBQUVBLEdBQUcsR0FBT0UsRUFBRSxFQUFFQSxFQUFFLEVBQUVOLEVBQUVFLE9BQU9JLEdBQUcsRUFBbUJJLEVBQUVELEVBQUVDLEVBQXJCQyxFQUFFWCxFQUFFMkMsTUFBTXJDLEVBQUVBLEVBQUUsSUFBWU0sRUFBRUEsRUFBRXVCLE9BQU8xQixFQUFFUixFQUFFVCxFQUFFOEMsUUFBUTdCLEVBQUVSLEVBQUVVLE1BQU1WLEVBQUVNLEVBQUVOLEdBQ3JTLE9BRHdTVSxFQUFFWCxFQUFFMkMsTUFBTXJDLEdBQUdOLEVBQUVRLEVBQUU4QyxVQUFVM0MsR0FBR0wsRUFBRWQsRUFBRThDLFFBQVE3QixFQUFFUixHQUFHLEVBQUUsRUFBRSxFQUFFRCxLQUF5Q1UsRUFBRUQsRUFBRUMsRUFBRUQsR0FBMUNFLEVBQUVILEVBQUV5QyxNQUFNeEMsRUFBRUUsRUFBRXdCLFFBQVEsRUFBRSxFQUFFLElBQUk3QixHQUFHTixJQUFhbUMsUUFBUSxFQUFFLEVBQUUsSUFBSTdCLElBQUlJLEVBQUVsQixFQUFFOEMsUUFBUTdCLEVBQUVDLEVBQUVELEVBQUVSLEVBQUVNLEVBQUVOLE1BQzFlRSxFQUFFRCxTQUFTUSxFQUFFRCxFQUFFQyxFQUFFTCxFQUFFRixFQUFFcEIsS0FBS0ksS0FBS3dILEtBQUtFLEtBQUtySCxFQUFFVyxLQUFZUyxFQUFFdUIsT0FBTzNCLEVBQUUyQixPQUFPeEIsRUFBRUgsRUFBRXlDLE1BQU12QyxFQUFFTixNQUFNeUMsUUFBUSxTQUFTckQsRUFBRVEsRUFBRUMsRUFBRUUsRUFBRUMsRUFBRUMsR0FBRyxHQUFHLE1BQU10QixLQUFLK0QsU0FBU1EsVUFBVXJELEdBQUcsTUFBTSxJQUFJbEIsS0FBS08sVUFBVU0sUUFBUSwyQkFBMkJRLEVBQUVBLEdBQUcsR0FBRyxJQUFJRSxFQUFFdkIsS0FBS0ksS0FBS3dILEtBQUtDLEVBQUVyRyxFQUFFeEIsS0FBSytELFNBQVN0QyxFQUFFRCxFQUFFcUQsRUFBRW5ELEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBR0MsRUFBRUosRUFBRWQsRUFBRThDLFFBQVFyQyxJQUFJVSxFQUFFQyxFQUFFQyxFQUFFOUIsS0FBSytELFNBQVNRLFVBQVV0RCxHQUFHSSxFQUFFVyxLQUFhLElBQVJaLEVBQUVBLE1BQVVGLEVBQUUsRUFBRUEsRUFBRSxFQUFFWSxFQUFFLEdBQUdaLEdBQUcsRUFBd0NRLEVBQUVELEVBQUVDLEVBQTFDRSxFQUFFSCxFQUFFRSxFQUFFbEIsRUFBRXFELFFBQVFyQyxFQUFFRSxFQUFFVixFQUFFMkMsTUFBTTFDLEVBQUVBLEVBQUUsT0FBZWMsRUFBRUEsRUFBRW9CLE9BQU94QixHQUFHRCxFQUFFSixFQUFFSSxHQUN2VixHQUQwVkUsRUFBRUMsRUFBRSxHQUFHWixFQUN0YlEsRUFBRUQsRUFBRUMsRUFEZ2RFLEVBQUVILEVBQTlCRyxFQUFFbkIsRUFBRThDLFFBQVE5QixFQUFFRSxHQUFHLEVBQUUsRUFBRSxFQUFFRSxLQUFXTCxFQUFFMEMsTUFBTWpELEVBQUUyQyxNQUFNMUMsR0FBR1csR0FBR3VCLFFBQVEsRUFDL2YsRUFBRSxNQUFjMUIsRUFBRWpCLEVBQUU4QyxRQUFROUIsRUFBRUMsRUFBRUQsRUFBRUUsRUFBRUosRUFBRUksTUFBTVAsRUFBRUQsU0FBU08sRUFBRUQsRUFBRUMsRUFBRUosRUFBRUYsRUFBRXBCLEtBQUtJLEtBQUt3SCxLQUFLRSxLQUFLckgsRUFBRVcsTUFBU0ksRUFBRW1ELE1BQU1uRCxFQUFFMEMsTUFBTXhDLEVBQUVMLEdBQUdHLEVBQUV3QyxTQUFTL0MsRUFBRWEsSUFBSSxNQUFNLElBQUk5QixLQUFLTyxVQUFVQyxRQUFRLDBCQUEwQixPQUFPd0IsRUFBRW9CLE9BQU81QixFQUFFMEMsTUFBTXRDLEVBQUVDLEtBQUtpRyxLQUFLLFNBQVNySCxFQUFFUSxHQUFHLElBQUlDLEVBQUVFLEVBQUVwQixLQUFLSSxLQUFLd0gsS0FBS0MsRUFBRXhHLEVBQUVyQixLQUFLK0QsU0FBU3pDLEVBQUVELEVBQUV3RCxFQUFFdEQsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHQyxFQUF1QkEsRUFBRUYsRUFBekJFLEVBQUVmLEVBQUU4QyxTQUFTLEVBQUUsRUFBRSxFQUFFLElBQVVuQyxFQUFFQSxFQUFFSSxLQUFLLElBQUlOLEVBQUUsRUFBRUEsRUFBRSxFQUFFRCxFQUFFRSxPQUFPRCxHQUFHLEVBQUVNLEVBQUVKLEVBQUVJLEdBQUdELEVBQUVELEVBQUVDLEVBQUVkLEVBQUU4QyxRQUFRakMsRUFBRUUsRUFBRVAsRUFBRTJDLE1BQU0xQyxFQUFFQSxFQUFFLE1BQ3JaLE9BRDJaQSxFQUFFRCxFQUFFMkMsTUFBTTFDLEdBQUcsSUFBSUcsRUFBRWtELFVBQVVyRCxLQUFLTSxFQUFFRixFQUFFRSxFQUFFSixFQUFFSSxJQUFJTixFQUFFRyxFQUFFK0IsT0FBT2xDLElBQUksV0FBVyxFQUFFLEVBQUUsS0FBS0ssRUFBRUQsRUFBRUMsRUFBRUwsR0FDM2VULEVBQUU4QyxRQUFRakMsRUFBRUYsRUFBRUUsRUFBRUUsRUFBRUosRUFBRUksS0FBS0QsS0FBS3NHLEVBQUUsU0FBU3BILEdBQUcsT0FBT0EsRUFBRSxJQUFJLEVBQUVBLEVBQUUsS0FBSyxHQUFHQSxFQUFFLElBQUksRUFBRUEsRUFBRSxLQUFLLEdBQUdBLEVBQUUsSUFBSSxFQUFFQSxFQUFFLEtBQUssR0FBR0EsRUFBRSxJQUFJLEVBQUUsS0FBS0EsRUFBRSxLQUFLLE9BQzVJVCxLQUFLSSxLQUFLMkgsS0FBS1osS0FBSyxNQUFNNUQsUUFBUSxTQUFTOUMsRUFBRVEsRUFBRUMsRUFBRUUsRUFBRUMsR0FBRyxJQUFJQyxFQUFFTCxFQUFFMkMsTUFBTSxHQUFnRSxPQUE3RDNDLEVBQUVqQixLQUFLK0QsU0FBUzNDLEVBQUVBLE1BQU1YLEVBQUVULEtBQUtJLEtBQUsySCxJQUFJcEYsR0FBRSxFQUFHbEMsRUFBRWEsRUFBRUYsRUFBRUYsRUFBRUcsR0FBRyxLQUFZSixFQUFFbUMsT0FBTzNDLEVBQUVnSCxLQUFLaEgsRUFBRWlILE1BQU01RCxRQUFRLFNBQVNyRCxFQUFFUSxFQUFFQyxFQUFFRSxFQUFFQyxHQUFHLElBQUlDLEVBQUVMLEVBQUUyQyxNQUFNLEdBQUdyQyxFQUFFdkIsS0FBSytELFNBQVN2QyxFQUFFRCxFQUFFZ0QsVUFBVWpELEdBQWdILEdBQTdHRCxFQUFFQSxHQUFHLElBQUlELEVBQUVBLE1BQU1DLEdBQUdHLEdBQUdQLEVBQUVNLEVBQUV5QyxTQUFTMUMsRUFBRUUsRUFBRUgsR0FBR0MsRUFBRUMsRUFBRXlDLFNBQVMxQyxFQUFFLEVBQUVFLEVBQUVILEtBQUtKLEVBQUVLLEVBQUVBLE1BQU1iLEVBQUVULEtBQUtJLEtBQUsySCxJQUFJcEYsR0FBRSxFQUFHbEMsRUFBRWEsRUFBRUYsRUFBRUYsRUFBRUcsSUFBT0UsRUFBRW9ELE1BQU1sRSxFQUFFaUgsSUFBSXpHLEdBQUcsTUFBTSxJQUFJakIsS0FBS08sVUFBVUMsUUFBUSwwQkFBMEIsT0FBT0MsRUFBRWdILE1BQU1PLEdBQUcsU0FBU3ZILEVBQUVRLEdBQUcsSUFBSUMsRUFBRUUsRUFBRUMsRUFBRUMsRUFBRUMsRUFBRUMsRUFBRXhCLEtBQUsrRCxTQUFTYyxFQUNsZCxJQURvZHhELEdBQUcsRUFBRSxFQUMzZSxFQUFFLEdBQUdDLEVBQUVMLEVBQUUyQyxNQUFNLEdBQU8xQyxFQUFFLEVBQUUsSUFBSUEsRUFBRUEsSUFBSSxDQUFxRSxLQUFuRUUsRUFBRSxJQUFLWCxFQUFFMkQsS0FBS0MsTUFBTW5ELEVBQUUsS0FBSyxHQUFHLEdBQUdBLEVBQUUsT0FBT0csRUFBRUcsRUFBRUgsRUFBRUMsSUFBSUMsRUFBRSxJQUFVLEVBQUxELEVBQUUsSUFBVUYsRUFBRSxFQUFFLEVBQUVBLEVBQUVBLElBQUlFLEVBQUVGLEdBQUdFLEVBQUVGLEtBQUssR0FBVSxFQUFQRSxFQUFFRixFQUFFLEtBQU8sR0FBR0UsRUFBRSxNQUFNLEVBQUVDLElBQUlELEVBQUUsS0FBSyxXQUFZLE9BQU9ELEdBQUc0RyxFQUFFLFNBQVN4SCxFQUFFUSxFQUFFQyxHQUFHLElBQUlFLEVBQUVDLEVBQUVILEVBQUVDLE9BQW9CLElBQWJGLEVBQUVBLEVBQUUyQyxNQUFNLEdBQU94QyxFQUFFLEVBQUVBLEVBQUVDLEVBQUVELEdBQUcsRUFBRUgsRUFBRSxJQUFJLFdBQVdDLEVBQUVFLEdBQUdILEVBQUUsSUFBSSxXQUFXQyxFQUFFRSxFQUFFLEdBQUdILEVBQUUsSUFBSSxXQUFXQyxFQUFFRSxFQUFFLEdBQUdILEVBQUUsSUFBSSxXQUFXQyxFQUFFRSxFQUFFLEdBQUdILEVBQUVqQixLQUFLSSxLQUFLMkgsSUFBSUMsR0FBRy9HLEVBQUVSLEdBQUcsT0FBT1EsR0FBRzBCLEVBQUUsU0FBU2xDLEVBQUVRLEVBQUVDLEVBQUVFLEVBQUVDLEVBQUVDLEdBQUcsSUFBSUMsRUFBRUMsRUFBRUMsRUFBRUMsRUFBRUMsRUFBRUMsRUFBRUMsRUFBRUMsRUFBRUUsRUFBRWhDLEtBQUsrRCxTQUN0TCxJQUQrTG5DLEVBQUVWLEVBQUVDLE9BQU9VLEVBQUVHLEVBQUV1QyxVQUFVckQsR0FBR1ksRUFBRUUsRUFBRXVDLFVBQVVuRCxHQUFHSSxFQUFFUSxFQUFFdUMsVUFBVWxELEdBQ3pmRSxFQUFFTixFQUFFc0MsU0FBUyxFQUFFLEVBQUUsRUFBRSxJQUFJLEtBQUsvQixHQUFHSCxFQUFFQSxFQUFFdUMsTUFBTSxHQUFHdkMsRUFBRVcsRUFBRW9CLE9BQU8vQixHQUFHLE1BQU1BLEVBQUVyQixLQUFLSSxLQUFLMkgsSUFBSUUsRUFBRTFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBR0YsR0FBR0EsRUFBRXJCLEtBQUtJLEtBQUsySCxJQUFJRSxFQUFFMUcsRUFBRUYsR0FBRyxFQUFFLEVBQUUrQyxLQUFLQyxNQUFNN0MsRUFBRSxZQUFlLFdBQUZBLEtBQWdCQSxFQUFFeEIsS0FBS0ksS0FBSzJILElBQUlFLEVBQUUxRyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUdILEdBQUdPLEVBQUVOLEVBQUV1QyxNQUFNLEdBQUd4QyxFQUFFSSxFQUFFb0MsTUFBTSxHQUFHbkQsSUFBSVcsRUFBRXBCLEtBQUtJLEtBQUsySCxJQUFJRSxFQUFFMUcsRUFBRUMsRUFBRU4sSUFBUVEsRUFBRSxFQUFFQSxFQUFFRSxFQUFFRixHQUFHLEVBQUVDLEVBQUUsS0FBS0YsRUFBRVIsRUFBRXNDLFFBQVE1QixHQUFHVCxFQUFFUSxJQUFJRCxFQUFFLEdBQUdQLEVBQUVRLEVBQUUsSUFBSUQsRUFBRSxHQUFHUCxFQUFFUSxFQUFFLElBQUlELEVBQUUsR0FBR1AsRUFBRVEsRUFBRSxJQUFJRCxFQUFFLEdBQ3pTLE9BRDRTUCxFQUFFYyxFQUFFa0MsTUFBTWhELEVBQUVXLEdBQUdwQixJQUFJVyxFQUFFcEIsS0FBS0ksS0FBSzJILElBQUlFLEVBQUUxRyxFQUFFQyxFQUFFTixJQUFJVCxHQUFHMkQsS0FBS0MsTUFBTXZDLEVBQUUsWUFBZSxXQUFGQSxFQUFhc0MsS0FBS0MsTUFBTXhDLEVBQUUsWUFBZSxXQUFGQSxHQUFjVCxFQUFFcEIsS0FBS0ksS0FBSzJILElBQUlFLEVBQUUxRyxFQUFFSCxFQUFFWCxHQUFHZ0IsRUFBRVIsRUFBRXNDLFFBQVFsQyxHQUM1ZkQsRUFBRSxJQUFJSyxFQUFFLEdBQUdMLEVBQUUsSUFBSUssRUFBRSxHQUFHTCxFQUFFLElBQUlLLEVBQUUsR0FBR0wsRUFBRSxJQUFJSyxFQUFFLElBQVVpRyxJQUFJMUYsRUFBRWdDLFNBQVM1QyxFQUFFLEVBQUVFLEdBQUdtRyxLQUFLdkcsS0FBS2xCLEtBQUtLLEtBQUs2SCxLQUFLLFNBQVN6SCxFQUFFUSxHQUFHUCxLQUFLeUgsRUFBRWxILEVBQUVBLEdBQUdqQixLQUFLRSxLQUFLc0csT0FBTyxJQUFJdEYsVUFBVUUsRUFBRUMsRUFBRUosRUFBRTRDLFVBQVUrQyxVQUFVLEdBQWtELElBQS9DbEcsS0FBS3dCLEdBQUcsSUFBSWpCLEVBQUUsSUFBSUEsR0FBR1IsRUFBRVUsT0FBT0UsSUFBSVosRUFBRVEsRUFBRWYsS0FBS08sSUFBUVcsRUFBRSxFQUFFQSxFQUFFQyxFQUFFRCxJQUFJRixFQUFFLEdBQUdFLEdBQVEsVUFBTFgsRUFBRVcsR0FBYUYsRUFBRSxHQUFHRSxHQUFRLFdBQUxYLEVBQUVXLEdBQWNWLEtBQUt3QixFQUFFLEdBQUd3RSxPQUFPeEYsRUFBRSxJQUFJUixLQUFLd0IsRUFBRSxHQUFHd0UsT0FBT3hGLEVBQUUsSUFBSVIsS0FBSzBILEVBQUUsSUFBSW5ILEVBQUVQLEtBQUt3QixFQUFFLEtBQ2hYbEMsS0FBS0ssS0FBSzZILEtBQUtyRSxVQUFVTixRQUFRdkQsS0FBS0ssS0FBSzZILEtBQUtyRSxVQUFVd0UsSUFBSSxTQUFTNUgsR0FBRyxHQUFHQyxLQUFLNEgsR0FBRyxNQUFNLElBQUl0SSxLQUFLTyxVQUFVTSxRQUFRLDJDQUEwRCxPQUFmSCxLQUFLZ0csT0FBT2pHLEdBQVVDLEtBQUs2SCxPQUFPOUgsSUFBSVQsS0FBS0ssS0FBSzZILEtBQUtyRSxVQUFVNEMsTUFBTSxXQUFXL0YsS0FBSzBILEVBQUUsSUFBSTFILEtBQUt5SCxFQUFFekgsS0FBS3dCLEVBQUUsSUFBSXhCLEtBQUs0SCxJQUFHLEdBQUl0SSxLQUFLSyxLQUFLNkgsS0FBS3JFLFVBQVU2QyxPQUFPLFNBQVNqRyxHQUFHQyxLQUFLNEgsSUFBRyxFQUFHNUgsS0FBSzBILEVBQUUxQixPQUFPakcsSUFBSVQsS0FBS0ssS0FBSzZILEtBQUtyRSxVQUFVMEUsT0FBTyxXQUFXLElBQUk5SCxFQUFFQyxLQUFLMEgsRUFBRXpCLFdBQVdsRyxFQUFFLElBQUtDLEtBQUt5SCxFQUFFekgsS0FBS3dCLEVBQUUsSUFBS3dFLE9BQU9qRyxHQUFHa0csV0FBd0IsT0FBYmpHLEtBQUsrRixRQUFlaEcsR0FDemVULEtBQUtLLEtBQUttSSxPQUFPLFNBQVMvSCxFQUFFUSxFQUFFQyxFQUFFRSxFQUFFQyxHQUFZLEdBQVRILEVBQUVBLEdBQUcsSUFBTyxFQUFFRSxHQUFHLEVBQUVGLEVBQUUsTUFBTSxJQUFJbEIsS0FBS08sVUFBVU0sUUFBUSw0QkFBNEIsaUJBQWtCSixJQUFJQSxFQUFFVCxLQUFLTSxNQUFNeUUsV0FBV00sT0FBTzVFLElBQUksaUJBQWtCUSxJQUFJQSxFQUFFakIsS0FBS00sTUFBTXlFLFdBQVdNLE9BQU9wRSxJQUF3QlIsRUFBRSxJQUF0QlksRUFBRUEsR0FBR3JCLEtBQUtLLEtBQUs2SCxNQUFhekgsR0FBRyxJQUFJYSxFQUFFQyxFQUFFQyxFQUFFQyxFQUFFQyxLQUFLQyxFQUFFM0IsS0FBSytELFNBQVMsSUFBSXRDLEVBQUUsRUFBRSxHQUFHQyxFQUFFUCxRQUFRQyxHQUFHLEdBQUdLLElBQUksQ0FBZ0MsSUFBL0JKLEVBQUVDLEVBQUViLEVBQUU4QyxRQUFRNUIsRUFBRXlCLE9BQU9uQyxHQUFHUSxLQUFTRixFQUFFLEVBQUVBLEVBQUVMLEVBQUVLLElBQUksSUFBSUQsRUFBRWIsRUFBRThDLFFBQVFqQyxHQUFHRSxFQUFFLEVBQUVBLEVBQUVGLEVBQUVILE9BQU9LLElBQUlILEVBQUVHLElBQUlGLEVBQUVFLEdBQUdFLEVBQUVBLEVBQUUwQixPQUFPL0IsR0FBdUIsT0FBcEJELElBQUlNLEVBQUVDLEVBQUV1QyxNQUFNeEMsRUFBRU4sSUFBV00sR0FDbGQxQixLQUFLeUksS0FBSyxTQUFTaEksR0FBR0MsS0FBS1EsR0FBRyxJQUFJbEIsS0FBS0UsS0FBS3NHLFFBQVE5RixLQUFLa0IsR0FBRyxHQUFHbEIsS0FBS2dJLEVBQUUsRUFBRWhJLEtBQUtpSSxLQUFLakksS0FBS2tJLEVBQUUsRUFBRWxJLEtBQUttSSxLQUFLbkksS0FBS29JLEVBQUVwSSxLQUFLWSxFQUFFWixLQUFLcUksRUFBRXJJLEtBQUtzSSxHQUFHLEVBQUV0SSxLQUFLTyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBR1AsS0FBS2MsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHZCxLQUFLMkMsT0FBRSxFQUFPM0MsS0FBS3VJLEVBQUV4SSxFQUFFQyxLQUFLd0ksR0FBRSxFQUFHeEksS0FBSzhCLEdBQUcyRyxZQUFZQyxXQUFXMUksS0FBSzBCLEVBQUUxQixLQUFLMkksR0FBRyxFQUFFM0ksS0FBSzRJLEVBQUUsRUFBRTVJLEtBQUs2SSxFQUFFLEVBQUU3SSxLQUFLOEksR0FBRyxNQUFROUksS0FBSytJLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBTSxJQUFJLElBQUksSUFBSSxNQUFNL0ksS0FBS2dKLEdBQUcsSUFBSWhKLEtBQUtpSixHQUFHLElBQ3hXM0osS0FBS3lJLEtBQUs1RSxXQUFXK0YsWUFBWSxTQUFTbkosRUFBRVEsR0FBRyxJQUFJQyxLQUFLRSxFQUF3QkMsRUFBRSxJQUF4QkQsRUFBRVYsS0FBS21KLFFBQVE1SSxNQUFnQlAsS0FBSzBCLEVBQUUsTUFBTSxJQUFJcEMsS0FBS08sVUFBVVEsU0FBUywwQkFBMEIsR0FBR0ssRUFBRVYsS0FBSzZJLEVBQUUsQ0FBQ25JLElBQUlBLEVBQUVWLEtBQUs0SSxHQUFHakksS0FBSyxJQUFJQyxFQUFFLEVBQUVDLEVBQTJDLElBQXpDYixLQUFLb0ksRUFBRXpILEVBQUUsSUFBRyxJQUFLMkIsTUFBTUMsVUFBVXZDLEtBQUtnSixHQUFPbkksRUFBRSxFQUFFLEdBQUdBLEVBQUVBLElBQUlGLEVBQUVxQixLQUFLLFdBQVkwQixLQUFLN0IsU0FBUyxHQUFHLElBQUloQixFQUFFLEVBQUVBLEVBQUViLEtBQUtRLEVBQUVDLFNBQVNFLEVBQUVBLEVBQUUrQixPQUFPMUMsS0FBS1EsRUFBRUssR0FBR29GLFlBQVlyRixHQUFHWixLQUFLa0IsRUFBRUwsR0FBR2IsS0FBS2tCLEVBQUVMLEdBQUcsRUFBRUgsS0FBS1YsS0FBS2dJLEVBQUUsR0FBR25ILElBQUlBLEtBQ3JTLElBRDBTYixLQUFLZ0ksR0FBRyxHQUFHaEksS0FBS1EsRUFBRUMsU0FBU1QsS0FBS1EsRUFBRXdCLEtBQUssSUFBSTFDLEtBQUtFLEtBQUtzRyxRQUFROUYsS0FBS2tCLEVBQUVjLEtBQUssSUFBSWhDLEtBQUtZLEdBQUdBLEVBQUVBLEVBQUVaLEtBQUtxSSxJQUFJckksS0FBS3FJLEVBQy9lekgsR0FBR1osS0FBS2dJLElBQUloSSxLQUFLTyxFQUFFakIsS0FBS0UsS0FBS3NHLE9BQU90RyxLQUFLUSxLQUFLTyxFQUFFbUMsT0FBTy9CLElBQUlYLEtBQUsyQyxFQUFFLElBQUlyRCxLQUFLQyxPQUFPcUQsSUFBSTVDLEtBQUtPLEdBQU9HLEVBQUUsRUFBRSxFQUFFQSxJQUFJVixLQUFLYyxFQUFFSixHQUFHVixLQUFLYyxFQUFFSixHQUFHLEVBQUUsR0FBR1YsS0FBS2MsRUFBRUosSUFBSUEsTUFBTSxJQUFJQSxFQUFFLEVBQUVBLEVBQUVYLEVBQUVXLEdBQUcsRUFBRSxJQUFLQSxFQUFFLEdBQUdWLEtBQUs4SSxJQUFJdEcsRUFBRXhDLE1BQU1XLEVBQUU4QixFQUFFekMsTUFBTVEsRUFBRXdCLEtBQUtyQixFQUFFLEdBQUdBLEVBQUUsR0FBR0EsRUFBRSxHQUFHQSxFQUFFLElBQVksT0FBUjZCLEVBQUV4QyxNQUFhUSxFQUFFMEMsTUFBTSxFQUFFbkQsSUFBSXFKLG1CQUFtQixTQUFTckosRUFBRVEsR0FBRyxHQUFHLElBQUlSLEdBQUcsd0VBQXdFUSxFQUFFLE1BQU0sSUFBSWpCLEtBQUtPLFVBQVVNLFFBQVEsdUVBQXVFSCxLQUFLdUksRUFBRXhJLEdBQUdzQyxXQUFXLFNBQVN0QyxFQUNBUSxFQUFFQyxHQUFHQSxFQUFFQSxHQUFHLE9BQU8sSUFBSUUsRUFBRUMsRUFBRUMsR0FBRSxJQUFLMEIsTUFBTUMsVUFBVTFCLEVBQUViLEtBQUtpSSxFQUFFekgsR0FBR00sRUFBRWQsS0FBS21KLFVBQVVwSSxFQUFFLEVBQW9ILFlBQXRHLEtBQVpMLEVBQUVWLEtBQUttSSxFQUFFM0gsTUFBZ0JFLEVBQUVWLEtBQUttSSxFQUFFM0gsR0FBR1IsS0FBS3NJLFdBQU0sSUFBU3pILElBQUlBLEVBQUViLEtBQUtpSSxFQUFFekgsR0FBRyxHQUFHUixLQUFLaUksRUFBRXpILElBQUlSLEtBQUtpSSxFQUFFekgsR0FBRyxHQUFHUixLQUFLUSxFQUFFQyxjQUFxQlYsR0FBRyxJQUFLLGNBQVMsSUFBU1EsSUFBSUEsRUFBRSxHQUFHUCxLQUFLUSxFQUFFSyxHQUFHbUYsUUFBUXRGLEVBQUVWLEtBQUtrSSxJQUFJLEVBQUUzSCxFQUFFSyxFQUFFLEVBQUksRUFBRmIsSUFBTSxNQUFNLElBQUssU0FBNkMsR0FBRywwQkFBdkNTLEVBQUU2SSxPQUFPbEcsVUFBVWxELFNBQVNxSixLQUFLdkosSUFBaUMsQ0FBTSxJQUFMWSxLQUFTSCxFQUFFLEVBQUVBLEVBQUVULEVBQUVVLE9BQU9ELElBQUlHLEVBQUVxQixLQUFLakMsRUFBRVMsSUFBSVQsRUFBRVksT0FBTyxJQUFJLG1CQUFtQkgsSUFBSU8sRUFBRSxHQUFHUCxFQUFFLEVBQUVBLEVBQUVULEVBQUVVLFNBQVNNLEVBQUVQLElBQUksaUJBQWtCVCxFQUFFUyxLQUN0L0JPLEVBQUUsR0FBRyxJQUFJQSxFQUFFLENBQUMsUUFBRyxJQUFTUixFQUFFLElBQUlDLEVBQUVELEVBQUUsRUFBRUMsRUFBRVQsRUFBRVUsT0FBT0QsSUFBSSxJQUFJRyxFQUFFWixFQUFFUyxHQUFHLEVBQUVHLEdBQUdKLElBQUlJLEtBQU0sRUFBRVgsS0FBS1EsRUFBRUssR0FBR21GLFFBQVF0RixFQUFFVixLQUFLa0ksSUFBSSxFQUFFM0gsRUFBRUssRUFBRWIsRUFBRVUsUUFBUWlDLE9BQU8zQyxJQUFJLE1BQU0sSUFBSyxjQUFTLElBQVNRLElBQUlBLEVBQUVSLEVBQUVVLFFBQVFULEtBQUtRLEVBQUVLLEdBQUdtRixRQUFRdEYsRUFBRVYsS0FBS2tJLElBQUksRUFBRTNILEVBQUVLLEVBQUViLEVBQUVVLFNBQVNULEtBQUtRLEVBQUVLLEdBQUdtRixPQUFPakcsR0FBRyxNQUFNLFFBQVFnQixFQUFFLEVBQUUsR0FBR0EsRUFBRSxNQUFNLElBQUl6QixLQUFLTyxVQUFVTyxJQUFJLHVFQUF1RUosS0FBS2tCLEVBQUVMLElBQUlOLEVBQUVQLEtBQUtZLEdBQUdMLEVBQUVPLElBQUlkLEtBQUswQixJQUFJMUIsS0FBS21KLFlBQVluSixLQUFLMEIsR0FBR0UsRUFBRSxTQUFTOEIsS0FBSzZGLElBQUl2SixLQUFLcUksRUFBRXJJLEtBQUtZLElBQUlnQixFQUFFLFdBQVc1QixLQUFLd0osaUJBQ3JlTCxRQUFRLFNBQVNwSixHQUFpQyxPQUE5QkEsRUFBRUMsS0FBSytJLE9BQUUsSUFBU2hKLEVBQUVBLEVBQUVDLEtBQUt1SSxHQUFVdkksS0FBS3FJLEdBQUdySSxLQUFLcUksR0FBR3RJLEVBQUVDLEtBQUtrQixFQUFFLEdBQUdsQixLQUFLaUosS0FBSSxJQUFLM0csTUFBTUMsVUFBVXZDLEtBQUtvSSxFQUFFcEksS0FBSzZJLEVBQUU3SSxLQUFLNEksRUFBRTVJLEtBQUs0SSxFQUFFNUksS0FBS1ksR0FBR2IsRUFBRUMsS0FBSzZJLEVBQUU3SSxLQUFLMEIsRUFBRTFCLEtBQUswQixHQUFHOEgsWUFBWSxTQUFTekosR0FBd0IsT0FBckJBLEVBQUVDLEtBQUsrSSxFQUFFaEosR0FBSUMsS0FBS3VJLEdBQVV2SSxLQUFLcUksR0FBR3RJLEVBQUUsRUFBRUMsS0FBS1ksRUFBRWIsRUFBRSxFQUFFQyxLQUFLWSxFQUFFYixHQUFHMEosZ0JBQWdCLFdBQVcsSUFBSXpKLEtBQUt3SSxFQUFFLENBQW1MLEdBQWxMeEksS0FBS0QsR0FBRzJKLGtCQUFrQjVHLEVBQUU5QyxLQUFLQSxLQUFLMkosSUFBSUMsZUFBZTlHLEVBQUU5QyxLQUFLQSxLQUFLNkosSUFBSUMsa0JBQWtCaEgsRUFBRTlDLEtBQUtBLEtBQUsrSixJQUFJQyx1QkFBdUJsSCxFQUFFOUMsS0FBS0EsS0FBS2lLLElBQUlDLGVBQWVwSCxFQUFFOUMsS0FBS0EsS0FBS21LLEtBQVFqSSxPQUFPa0ksaUJBQWlCbEksT0FBT2tJLGlCQUFpQixPQUM1Z0JwSyxLQUFLRCxFQUFFMkosbUJBQWtCLEdBQUl4SCxPQUFPa0ksaUJBQWlCLFlBQVlwSyxLQUFLRCxFQUFFNkosZ0JBQWUsR0FBSTFILE9BQU9rSSxpQkFBaUIsV0FBV3BLLEtBQUtELEVBQUUrSixtQkFBa0IsR0FBSTVILE9BQU9rSSxpQkFBaUIsZUFBZXBLLEtBQUtELEVBQUVpSyx3QkFBdUIsR0FBSTlILE9BQU9rSSxpQkFBaUIsWUFBWXBLLEtBQUtELEVBQUVtSyxnQkFBZSxPQUFTLENBQUEsSUFBR0csU0FBU0MsWUFBNkwsTUFBTSxJQUFJaEwsS0FBS08sVUFBVU8sSUFBSSxzQkFBOU1pSyxTQUFTQyxZQUFZLFNBQVN0SyxLQUFLRCxFQUFFMkosbUJBQW1CVyxTQUFTQyxZQUFZLGNBQWN0SyxLQUFLRCxFQUFFNkosZ0JBQWdCUyxTQUFTQyxZQUFZLFdBQVd0SyxLQUFLRCxFQUFFK0osbUJBQ3hkOUosS0FBS3dJLEdBQUUsSUFBSytCLGVBQWUsV0FBV3ZLLEtBQUt3SSxJQUFJdEcsT0FBT3NJLHFCQUFxQnRJLE9BQU9zSSxvQkFBb0IsT0FBT3hLLEtBQUtELEVBQUUySixtQkFBa0IsR0FBSXhILE9BQU9zSSxvQkFBb0IsWUFBWXhLLEtBQUtELEVBQUU2SixnQkFBZSxHQUFJMUgsT0FBT3NJLG9CQUFvQixXQUFXeEssS0FBS0QsRUFBRStKLG1CQUFrQixHQUFJNUgsT0FBT3NJLG9CQUFvQixlQUFleEssS0FBS0QsRUFBRWlLLHdCQUF1QixHQUFJOUgsT0FBT3NJLG9CQUFvQixZQUFZeEssS0FBS0QsRUFBRW1LLGdCQUFlLElBQUtHLFNBQVNJLGNBQWNKLFNBQVNJLFlBQVksU0FBU3pLLEtBQUtELEVBQUUySixtQkFBbUJXLFNBQVNJLFlBQVksY0FDaGdCekssS0FBS0QsRUFBRTZKLGdCQUFnQlMsU0FBU0ksWUFBWSxXQUFXekssS0FBS0QsRUFBRStKLG9CQUFvQjlKLEtBQUt3SSxHQUFFLElBQUs0QixpQkFBaUIsU0FBU3JLLEVBQUVRLEdBQUdQLEtBQUs4QixFQUFFL0IsR0FBR0MsS0FBSzJJLE1BQU1wSSxHQUFHaUssb0JBQW9CLFNBQVN6SyxFQUFFUSxHQUFHLElBQUlDLEVBQUVFLEVBQUVDLEVBQUVYLEtBQUs4QixFQUFFL0IsR0FBR2EsS0FBSyxJQUFJRixLQUFLQyxFQUFFQSxFQUFFb0IsZUFBZXJCLElBQUlDLEVBQUVELEtBQUtILEdBQUdLLEVBQUVvQixLQUFLdEIsR0FBRyxJQUFJRixFQUFFLEVBQUVBLEVBQUVJLEVBQUVILE9BQU9ELFdBQWtCRyxFQUFkRCxFQUFFRSxFQUFFSixLQUFnQnVKLEdBQUcsV0FBVzlILEVBQUVqQyxLQUFLLElBQUk2SixHQUFHLFNBQVM5SixHQUFHLElBQUlRLEVBQUVDLEVBQUUsSUFBSUQsRUFBRVIsRUFBRTBCLEdBQUcxQixFQUFFMkssU0FBUzNLLEVBQUU0SyxTQUFTLEVBQUVuSyxFQUFFVCxFQUFFeUMsR0FBR3pDLEVBQUU2SyxTQUFTN0ssRUFBRThLLFNBQVMsRUFBRSxNQUFNbkssR0FBR0YsRUFBRUQsRUFBRSxFQUFFLEdBQUdBLEdBQUcsR0FBR0MsR0FBR1IsS0FBS3FDLFlBQVk5QixFQUFFQyxHQUFHLEVBQUUsU0FBU3lCLEVBQUVqQyxLQUFLLElBQUltSyxHQUFHLFNBQVNwSyxHQUFHQSxFQUN2ZkEsRUFBRStLLFFBQVEsSUFBSS9LLEVBQUVnTCxlQUFlLEdBQUcvSyxLQUFLcUMsWUFBWXRDLEVBQUVpTCxPQUFPakwsRUFBRTJLLFFBQVEzSyxFQUFFa0wsT0FBT2xMLEVBQUU2SyxTQUFTLEVBQUUsU0FBUzNJLEVBQUVqQyxLQUFLLElBQUkySixHQUFHLFdBQVcxSCxFQUFFakMsS0FBSyxJQUFJaUssR0FBRyxTQUFTbEssR0FBMEcsR0FBdkdBLEVBQUVBLEVBQUVtTCw2QkFBNkJ6SixHQUFHMUIsRUFBRW1MLDZCQUE2QjFJLEdBQUd6QyxFQUFFbUwsNkJBQTZCekksRUFBS1AsT0FBT2lKLFlBQVksQ0FBQyxJQUFJNUssRUFBRTJCLE9BQU9pSixZQUFZLGlCQUFrQjVLLEdBQUdQLEtBQUtxQyxXQUFXOUIsRUFBRSxFQUFFLGlCQUFpQlIsR0FBR0MsS0FBS3FDLFdBQVd0QyxFQUFFLEVBQUUsaUJBQWlCa0MsRUFBRWpDLEtBQUssS0FFeFdWLEtBQUt1QyxPQUFPLElBQUl2QyxLQUFLeUksS0FBSyxHQUNsRmhJLEVBQUUsSUFBSSxJQUFJeUksRUFBRTRDLEVBQUV6SixFQUFFK0UsRUFBRSxHQUFHQSxFQUFFLG9CQUFxQjJFLFFBQVFBLE9BQU9DLFFBQVEsQ0FBQyxJQUFJckQsRUFBRSxJQUFJQSxFQUFFc0QsUUFBUSxVQUFVLE1BQU14TCxHQUFHa0ksRUFBRSxLQUFLdkIsRUFBRTBFLEVBQUVuRCxFQUFFLEdBQUd2QixHQUFHMEUsRUFBRUksWUFBWWhELEVBQUU0QyxFQUFFSSxZQUFZLEtBQUtoRCxFQUFFLElBQUlwQyxZQUFZLElBQUtxRixXQUFXakQsR0FBSWtELFFBQVFwTSxLQUFLdUMsT0FBT1EsV0FBV21HLEVBQUUsS0FBSyw4QkFBOEIsR0FBRyxvQkFBcUJ0RyxRQUFRLG9CQUFxQmtFLFlBQVksQ0FBdUIsR0FBdEJ6RSxFQUFFLElBQUl5RSxZQUFZLElBQU9sRSxPQUFPeUosUUFBUXpKLE9BQU95SixPQUFPQyxnQkFBZ0IxSixPQUFPeUosT0FBT0MsZ0JBQWdCakssT0FBUSxDQUFBLElBQUdPLE9BQU8ySixXQUFVM0osT0FBTzJKLFNBQVNELGdCQUN4ZCxNQUFNN0wsRUFEa2VtQyxPQUFPMkosU0FBU0QsZ0JBQWdCakssR0FDaGdCckMsS0FBS3VDLE9BQU9RLFdBQVdWLEVBQUUsS0FBSyw4QkFBOEIsTUFBTTVCLEdBQUcsb0JBQXFCbUMsUUFBUUEsT0FBTzRKLFVBQVVBLFFBQVFDLElBQUksMkRBQTJERCxRQUFRQyxJQUFJaE0sSUFDbk5ULEtBQUswTSxNQUFNQyxVQUFVMUssRUFBRSxFQUFFMkssS0FBSyxJQUFJQyxHQUFHLElBQUlDLEdBQUcsR0FBRzFNLEtBQUssTUFBTTJNLE1BQU0sR0FBRzlNLE9BQU8sT0FBTytNLEdBQUcsU0FBU3ZNLEVBQUVRLEVBQUVDLEVBQUVFLEdBQUdGLEVBQUVBLE1BQU1FLEVBQUVBLE1BQU0sSUFBSUMsRUFBRXJCLEtBQUswTSxLQUFLcEwsRUFBRUQsRUFBRUUsR0FBRzBMLEdBQUdqTixLQUFLdUMsT0FBT3FILFlBQVksRUFBRSxJQUFJdkksRUFBRXNMLFVBQVVwTCxFQUF1SixHQUFySkYsRUFBRUUsRUFBRUQsRUFBRUosR0FBR0EsRUFBRUksRUFBRXlMLE1BQU0saUJBQWtCekwsRUFBRTRMLE9BQU81TCxFQUFFNEwsS0FBS2xOLEtBQUtNLE1BQU1nRyxPQUFPakIsT0FBTy9ELEVBQUU0TCxPQUFPLGlCQUFrQjVMLEVBQUUyTCxLQUFLM0wsRUFBRTJMLEdBQUdqTixLQUFLTSxNQUFNZ0csT0FBT2pCLE9BQU8vRCxFQUFFMkwsTUFBU2pOLEtBQUtJLEtBQUtrQixFQUFFbEIsUUFBUUosS0FBS0MsT0FBT3FCLEVBQUVyQixTQUFTLGlCQUFrQlEsR0FBRyxLQUFLYSxFQUFFc0wsTUFBTSxLQUFLdEwsRUFBRXdMLElBQUksS0FBS3hMLEVBQUV3TCxJQUFJLE1BQU14TCxFQUFFd0wsSUFBSSxNQUFNeEwsRUFBRXVMLElBQUksTUFBTXZMLEVBQUV1TCxJQUFJLE1BQVF2TCxFQUFFdUwsSUFBSSxFQUFFdkwsRUFBRTJMLEdBQUc5TCxRQUN6ZSxFQUFFRyxFQUFFMkwsR0FBRzlMLE9BQU8sTUFBTSxJQUFJbkIsS0FBS08sVUFBVU0sUUFBUSxvQ0FDK0QsTUFEM0IsaUJBQWtCSixHQUFpQ0EsR0FBOUJjLEVBQUV2QixLQUFLSyxLQUFLOE0sYUFBYTFNLEVBQUVhLElBQU84TCxJQUFJeEosTUFBTSxFQUFFdEMsRUFBRXVMLEdBQUcsSUFBSXZMLEVBQUU0TCxLQUFLM0wsRUFBRTJMLE1BQU1sTixLQUFLcU4sS0FBSzVNLGFBQWFULEtBQUtxTixJQUFJQyxRQUFRQyxZQUFZaE0sRUFBRWQsRUFBRStNLE1BQU1sTSxFQUFFbU0sT0FBT2xNLEVBQUVtRyxJQUFJakgsRUFBRWMsRUFBRTZMLElBQUl4SixNQUFNLEVBQUV0QyxFQUFFdUwsR0FBRyxLQUFLLGlCQUFrQjVMLElBQUlBLEVBQUVqQixLQUFLTSxNQUFNeUUsV0FBV00sT0FBT3BFLElBQUksaUJBQWtCQyxJQUFJSSxFQUFFeUwsTUFBTTdMLEVBQUVsQixLQUFLTSxNQUFNeUUsV0FBV00sT0FBT25FLElBQUlLLEVBQUUsSUFBSXZCLEtBQUtDLE9BQU9xQixFQUFFckIsUUFBUVEsR0FBR1ksRUFBRUUsRUFBRUgsRUFBRUUsR0FBR0YsRUFBRWdNLElBQUkzTSxFQUFFYSxFQUFFb00sR0FBRyxRQUFRcE0sRUFBRWxCLE1BQU1KLEtBQUsyTixhQUFhM04sS0FBSzJOLFlBQVl6RyxLQUMzZmpHLGFBQWEyTSxZQUFZNU4sS0FBSzJOLFlBQVl6RyxJQUFJM0QsUUFBUWhDLEVBQUVOLEVBQUVLLEVBQUUyTCxHQUFHL0wsRUFBRUksRUFBRXdMLElBQUk5TSxLQUFLSSxLQUFLa0IsRUFBRWxCLE1BQU1tRCxRQUFRaEMsRUFBRU4sRUFBRUssRUFBRTJMLEdBQUcvTCxFQUFFSSxFQUFFd0wsSUFBV3hMLEdBQUdpQyxRQUFRLFNBQVM5QyxFQUFFUSxFQUFFQyxFQUFFRSxHQUFHLElBQUlDLEVBQUVyQixLQUFLME0sS0FBS3BMLEVBQUVELEVBQUUyTCxHQUFHdkosTUFBTXBDLEVBQUVxQyxXQUFXLE9BQU9yQyxFQUFFd00sT0FBT3ZNLElBQUl3TSxHQUFHLFNBQVNyTixFQUFFUSxFQUFFQyxFQUFFRSxHQUFHRixFQUFFQSxNQUFNRSxFQUFFQSxNQUFNLElBQUlDLEVBQUVyQixLQUFLME0sS0FBK0NwTCxFQUFFQyxFQUE4SSxHQUE1SUQsR0FBOUNMLEVBQUVJLEVBQUVFLEVBQUVGLEVBQUVFLEVBQUVGLEVBQUVFLEtBQUtGLEVBQUVzTCxVQUFVMUwsR0FBR0MsR0FBRSxJQUFnQjZMLE1BQU0saUJBQWtCOUwsRUFBRWlNLE9BQU9qTSxFQUFFaU0sS0FBS2xOLEtBQUtNLE1BQU1nRyxPQUFPakIsT0FBT3BFLEVBQUVpTSxPQUFPLGlCQUFrQmpNLEVBQUVnTSxLQUFLaE0sRUFBRWdNLEdBQUdqTixLQUFLTSxNQUFNZ0csT0FBT2pCLE9BQU9wRSxFQUFFZ00sTUFBU2pOLEtBQUtJLEtBQUthLEVBQUViLFFBQVFKLEtBQUtDLE9BQU9nQixFQUFFaEIsU0FBUyxpQkFDdmVRLEdBQUcsS0FBS1EsRUFBRTJMLE1BQU0sS0FBSzNMLEVBQUU2TCxJQUFJLEtBQUs3TCxFQUFFNkwsSUFBSSxNQUFNN0wsRUFBRTZMLElBQUksTUFBTTdMLEVBQUU0TCxJQUFJLE1BQU01TCxFQUFFNEwsSUFBSSxNQUFRNUwsRUFBRTRMLEtBQUs1TCxFQUFFZ00sSUFBSSxFQUFFaE0sRUFBRWdNLEdBQUc5TCxRQUFRLEVBQUVGLEVBQUVnTSxHQUFHOUwsT0FBTyxNQUFNLElBQUluQixLQUFLTyxVQUFVTSxRQUFRLG9DQUMwQixNQURVLGlCQUFrQkosR0FBaUNBLEdBQTlCYyxFQUFFdkIsS0FBS0ssS0FBSzhNLGFBQWExTSxFQUFFUSxJQUFPbU0sSUFBSXhKLE1BQU0sRUFBRTNDLEVBQUU0TCxHQUFHLElBQUk1TCxFQUFFaU0sS0FBSzNMLEVBQUUyTCxNQUFNbE4sS0FBS3FOLEtBQUs1TSxhQUFhVCxLQUFLcU4sSUFBSUMsUUFBUVMsWUFBWXROLEVBQUVBLEVBQUV1TixNQUFNaE8sS0FBS00sTUFBTWdHLE9BQU9qQixPQUFPcEUsRUFBRXdNLFNBQVM3SixNQUFNLEVBQUUzQyxFQUFFNEwsR0FBRyxLQUFLLGlCQUFrQnZMLElBQUlBLEVBQUV0QixLQUFLTSxNQUFNeUUsV0FBV00sT0FBTy9ELElBQUlDLEVBQUUsSUFBSXZCLEtBQUtDLE9BQU9nQixFQUFFaEIsUUFBUVEsR0FBR2EsRUFBRSxRQUNyZkwsRUFBRWIsTUFBTUosS0FBSzJOLGFBQWEzTixLQUFLMk4sWUFBWXpHLEtBQUtqRyxFQUFFeU0sY0FBY0UsWUFBWTVOLEtBQUsyTixZQUFZekcsSUFBSXBELFFBQVF2QyxFQUFFTixFQUFFeU0sR0FBR3pNLEVBQUVnTSxHQUFHaE0sRUFBRXlHLElBQUlwRyxFQUFFTCxFQUFFNkwsSUFBSTlNLEtBQUtJLEtBQUthLEVBQUViLE1BQU0wRCxRQUFRdkMsRUFBRU4sRUFBRXlNLEdBQUd6TSxFQUFFZ00sR0FBRzNMLEVBQUVMLEVBQUU2TCxJQUFJekwsRUFBRUUsRUFBRUgsRUFBRUgsR0FBR0csRUFBRWdNLElBQUkzTSxFQUFTLElBQUlTLEVBQUUrTSxJQUFJM00sRUFBRXRCLEtBQUtNLE1BQU15RSxXQUFXQyxTQUFTMUQsSUFBSXdDLFFBQVEsU0FBU3JELEVBQUVRLEVBQUVDLEVBQUVFLEdBQUcsSUFBSUMsRUFBRXJCLEtBQUswTSxLQUFLLE9BQU9yTCxFQUFFeU0sR0FBR3JOLEVBQUVZLEVBQUU2TSxPQUFPak4sR0FBR0MsRUFBRUUsSUFBSXlNLE9BQU8sU0FBU3BOLEdBQUcsSUFBSVEsRUFBRUMsRUFBRSxJQUFJRSxFQUFFLEdBQUcsSUFBSUgsS0FBS1IsRUFBRSxHQUFHQSxFQUFFZ0MsZUFBZXhCLEdBQUcsQ0FBQyxJQUFJQSxFQUFFa04sTUFBTSxnQkFBZ0IsTUFBTSxJQUFJbk8sS0FBS08sVUFBVU0sUUFBUSxzQ0FDcmIsT0FEMmRLLEdBQUdFLEVBQUUsSUFDN2VILEVBQUUsS0FBS0csRUFBRSxXQUFrQlgsRUFBRVEsSUFBSSxJQUFLLFNBQVMsSUFBSyxVQUFVQyxHQUFHVCxFQUFFUSxHQUFHLE1BQU0sSUFBSyxTQUFTQyxHQUFHLElBQUlrRSxPQUFPM0UsRUFBRVEsSUFBSSxJQUFJLE1BQU0sSUFBSyxTQUFTQyxHQUFHLElBQUlsQixLQUFLTSxNQUFNZ0csT0FBT3RCLFNBQVN2RSxFQUFFUSxHQUFHLEdBQUcsSUFBSSxNQUFNLFFBQVEsTUFBTSxJQUFJakIsS0FBS08sVUFBVU8sSUFBSSxrQ0FBbUMsT0FBT0ksRUFBRSxLQUFLZ04sT0FBTyxTQUFTek4sR0FBeUIsS0FBdEJBLEVBQUVBLEVBQUVrRixRQUFRLE1BQU0sS0FBVXdJLE1BQU0sWUFBWSxNQUFNLElBQUluTyxLQUFLTyxVQUFVTSxRQUFRLGlDQUFpQ0osRUFBRUEsRUFBRWtGLFFBQVEsV0FBVyxJQUFJeUksTUFBTSxLQUFLLElBQUluTixLQUFLQyxFQUFFRSxFQUFFLElBQUlGLEVBQUUsRUFBRUEsRUFBRVQsRUFBRVUsT0FBT0QsSUFBSSxDQUFDLEtBQUtFLEVBQUVYLEVBQUVTLEdBQUdpTixNQUFNLGdHQUFnRyxNQUFNLElBQUluTyxLQUFLTyxVQUFVTSxRQUFRLGlDQUNqbkIsTUFBTU8sRUFBRSxHQUFHSCxFQUFFRyxFQUFFLElBQUl3RSxTQUFTeEUsRUFBRSxHQUFHLElBQUksTUFBTUEsRUFBRSxHQUFHSCxFQUFFRyxFQUFFLElBQUlBLEVBQUUsR0FBRytNLE1BQU0sd0JBQXdCbk8sS0FBS00sTUFBTWdHLE9BQU9qQixPQUFPakUsRUFBRSxJQUFJa0UsU0FBU2xFLEVBQUUsSUFBSSxNQUFNQSxFQUFFLEtBQUtILEVBQUVHLEVBQUUsSUFBSSxTQUFTQSxFQUFFLElBQUksT0FBT0gsR0FBR00sRUFBRSxTQUFTZCxFQUFFUSxFQUFFQyxHQUFzQixRQUFuQixJQUFTVCxJQUFJQSxXQUFTLElBQVNRLEVBQUUsT0FBT1IsRUFBRSxJQUFJLElBQUlXLEtBQUtILEVBQUUsR0FBR0EsRUFBRXdCLGVBQWVyQixHQUFHLENBQUMsR0FBR0YsUUFBRyxJQUFTVCxFQUFFVyxJQUFJWCxFQUFFVyxLQUFLSCxFQUFFRyxHQUFHLE1BQU0sSUFBSXBCLEtBQUtPLFVBQVVNLFFBQVEsaUNBQWlDSixFQUFFVyxHQUFHSCxFQUFFRyxHQUFHLE9BQU9YLEdBQUc0TixHQUFHLFNBQVM1TixFQUFFUSxHQUFHLElBQUlDLEtBQUtFLEVBQUUsSUFBSUEsS0FBS1gsRUFBRUEsRUFBRWdDLGVBQWVyQixJQUFJWCxFQUFFVyxLQUFLSCxFQUFFRyxLQUFLRixFQUFFRSxHQUFHWCxFQUFFVyxJQUFJLE9BQU9GLEdBQUdvTixHQUFHLFNBQVM3TixFQUNBUSxHQUFHLElBQUlDLEtBQUtFLEVBQUUsSUFBSUEsRUFBRSxFQUFFQSxFQUFFSCxFQUFFRSxPQUFPQyxTQUFJLElBQVNYLEVBQUVRLEVBQUVHLE1BQU1GLEVBQUVELEVBQUVHLElBQUlYLEVBQUVRLEVBQUVHLEtBQUssT0FBT0YsSUFBSWxCLEtBQUt1RCxRQUFRdkQsS0FBSzBNLEtBQUtuSixRQUFRdkQsS0FBSzhELFFBQVE5RCxLQUFLME0sS0FBSzVJLFFBQVE5RCxLQUFLSyxLQUFLa08sTUFBTXZPLEtBQUtLLEtBQUs4TSxhQUFhLFNBQVMxTSxFQUFFUSxHQUFHLElBQUlDLEVBQUVsQixLQUFLSyxLQUFLa08sR0FBR25OLEVBQWlOLE9BQXZNQSxHQUFSSCxFQUFFQSxPQUFVMkwsTUFBTSxLQUFvQnhMLEdBQWhCRixFQUFFQSxFQUFFVCxHQUFHUyxFQUFFVCxRQUFXVyxHQUFHRixFQUFFRSxLQUFLb04sVUFBVXZOLEVBQUVpTSxNQUFNak0sRUFBRWlNLEtBQUsvTCxPQUFPRixFQUFFaU0sS0FBS3RKLE1BQU0sR0FBRzVELEtBQUt1QyxPQUFPcUgsWUFBWSxFQUFFLEtBQUkxSSxPQUFFLElBQVNELEVBQUVpTSxLQUFLOUwsRUFBRW9OLFVBQVV2TixFQUFFaU0sTUFBVTlMLEVBQUVGLElBQUlsQixLQUFLSyxLQUFLbUksT0FBTy9ILEVBQUVTLEVBQUVELEVBQUUyTCxPQUFhUSxJQUFJaE0sRUFBRUYsR0FBRzBDLE1BQU0sR0FBR3NKLEtBQUtoTSxFQUFFMEMsTUFBTSxLQUNyOUIsb0JBQXFCbUksUUFBUUEsT0FBT0MsVUFBVUQsT0FBT0MsUUFBUWhNLE1BQU0sbUJBQW9CeU8sUUFBUUEsVUFBVSxXQUFXLE9BQU96TyJ9",
            'smalltalk.js': "\"use strict\";$(\"head\").append(\"<style>.smalltalk{display:flex;align-items:center;flex-direction:column;justify-content:center;transition:200ms opacity;bottom:0;left:0;overflow:auto;padding:20px;position:fixed;right:0;top:0;z-index:100}.smalltalk + .smalltalk{transition:ease 1s;display:none}.smalltalk .page{border-radius:3px;background:white;box-shadow:0 4px 23px 5px rgba(0, 0, 0, .2), 0 2px 6px rgba(0, 0, 0, .15);color:#333;min-width:400px;padding:0;position:relative;z-index:0}@media only screen and (max-width: 500px){.smalltalk .page{min-width:0}}.smalltalk .page > .close-button{background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAQAAAC1QeVaAAAAUklEQVR4XqXPYQrAIAhAYW/gXd8NJxTopVqsGEhtf+L9/ERU2k/HSMFQpKcYJeNFI9Be0LCMij8cYyjj5EHIivGBkwLfrbX3IF8PqumVmnDpEG+eDsKibPG2JwAAAABJRU5ErkJggg==') no-repeat center;height:14px;position:absolute;right:7px;top:7px;width:14px;z-index:1}.smalltalk .page > .close-button:hover{background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAQAAAC1QeVaAAAAnUlEQVR4XoWQQQ6CQAxFewjkJkMCyXgJPMk7AiYczyBeZEAX6AKctGIaN+bt+trk9wtGQc/IkhnoKGxqqiWxOSZalapWFZ6VrIUDExsN0a5JRBq9LoVOR0eEQMoEhKizXhhsn0p1sCWVo7CwOf1RytPL8CPvwuBUoHL6ugeK30CVD1TqK7V/hdpe+VNChhOzV8xWny/+xosHF8578W/Hmc1OOC3wmwAAAABJRU5ErkJggg==')}.smalltalk .page header{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:500px;user-select:none;color:#333;font-size:120%;font-weight:bold;margin:0;padding:14px 17px;text-shadow:white 0 1px 2px}.smalltalk .page .content-area{overflow:hidden;text-overflow:ellipsis;padding:6px 17px;position:relative}.smalltalk .page .action-area{padding:14px 17px}button{font-family:Ubuntu, Arial, sans-serif}.smalltalk .smalltalk,.smalltalk button{min-height:2em;min-width:4em}.smalltalk button{appearance:none;user-select:none;background-image:linear-gradient(#ededed, #ededed 38%, #dedede);border:1px solid rgba(0, 0, 0, 0.25);border-radius:2px;box-shadow:0 1px 0 rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.75);color:#444;font:inherit;margin:0 1px 0 0;text-shadow:0 1px 0 rgb(240, 240, 240)}.smalltalk button::-moz-focus-inner{border:0}.smalltalk button:enabled:active{background-image:linear-gradient(#e7e7e7, #e7e7e7 38%, #d7d7d7);box-shadow:none;text-shadow:none}.smalltalk .page .button-strip{display:flex;flex-direction:row;justify-content:flex-end}.smalltalk .page .button-strip > button{margin-left:10px}.smalltalk input{width:100%;border:1px solid #bfbfbf;border-radius:2px;box-sizing:border-box;color:#444;font:inherit;margin:0;min-height:2em;padding:3px;outline:none}.smalltalk button:enabled:focus,.smalltalk input:enabled:focus{transition:border-color 200ms;border-color:rgb(77, 144, 254);outline:none}\");const BUTTON_OK=[\"OK\"],BUTTON_OK_CANCEL=[\"OK\",\"Cancel\"],__smalltalk_remove=__smalltalk_bind(__smalltalk_removeEl,\".smalltalk\"),__smalltalk_store=t=>{const a={value:t};return function(t){return arguments.length?(a.value=t,t):a.value}};function _alert(t,a){return __smalltalk_showDialog(t,a,\"\",BUTTON_OK,{cancel:!1})}function _prompt(t,a,e=\"\",l){const n=__smalltalk_getType(l),o=String(e).replace(/\"/g,\"&quot;\"),s=`<input type=\"${n}\" value=\"${o}\" data-name=\"js-input\">`;return __smalltalk_showDialog(t,a,s,BUTTON_OK_CANCEL,l)}function _confirm(t,a,e){return __smalltalk_showDialog(t,a,\"\",BUTTON_OK_CANCEL,e)}function __smalltalk_getType(t={}){const{type:a}=t;return\"password\"===a?\"password\":\"text\"}function __smalltalk_getTemplate(t,a,e,l){const n=a.replace(/\\n/g,\"<br>\");return`<div class=\"page\">\\n        <div data-name=\"js-close\" class=\"close-button\"></div>\\n        <header>${t}</header>\\n        <div class=\"content-area\">${n}${e}</div>\\n        <div class=\"action-area\">\\n            <div class=\"button-strip\"> ${l.map((t,a)=>`<button tabindex=${a} data-name=\"js-${t.toLowerCase()}\">${t}</button>`).join(\"\")}\\n            </div>\\n        </div>\\n    </div>`}function __smalltalk_showDialog(t,a,e,l,n){const o=__smalltalk_store(),s=__smalltalk_store(),i=document.createElement(\"div\"),r=[\"cancel\",\"close\",\"ok\"],_=new Promise((t,a)=>{const e=n&&!n.cancel,l=()=>{};o(t),s(e?l:a)});return i.innerHTML=__smalltalk_getTemplate(t,a,e,l),i.className=\"smalltalk\",document.body.appendChild(i),__smalltalk_find(i,[\"ok\",\"input\"]).forEach(t=>t.focus()),__smalltalk_find(i,[\"input\"]).forEach(t=>{t.setSelectionRange(0,e.length)}),__smalltalk_addListenerAll(\"click\",i,r,t=>__smalltalk_closeDialog(t.target,i,o(),s())),[\"click\",\"contextmenu\"].forEach(t=>i.addEventListener(t,()=>__smalltalk_find(i,[\"ok\",\"input\"]).forEach(t=>t.focus()))),i.addEventListener(\"keydown\",currify(__smalltalk_keyDownEvent)(i,o(),s())),_}function __smalltalk_keyDownEvent(t,a,e,l){const n={ENTER:13,ESC:27,TAB:9,LEFT:37,UP:38,RIGHT:39,DOWN:40},o=l.keyCode,s=l.target,i=[\"ok\",\"cancel\",\"input\"],r=__smalltalk_find(t,i).map(__smalltalk_getDataName);switch(o){case n.ENTER:__smalltalk_closeDialog(s,t,a,e),l.preventDefault();break;case n.ESC:__smalltalk_remove(),e();break;case n.TAB:l.shiftKey&&__smalltalk_tab(t,r),__smalltalk_tab(t,r),l.preventDefault();break;default:[\"left\",\"right\",\"up\",\"down\"].filter(t=>o===n[t.toUpperCase()]).forEach(()=>{__smalltalk_changeButtonFocus(t,r)})}l.stopPropagation()}function __smalltalk_getDataName(t){return t.getAttribute(\"data-name\").replace(\"js-\",\"\")}function __smalltalk_changeButtonFocus(t,a){const e=document.activeElement,l=__smalltalk_getDataName(e),n=/ok|cancel/.test(l),o=a.length-1,s=t=>\"cancel\"===t?\"ok\":\"cancel\";if(\"input\"===l||!o||!n)return;const i=s(l);__smalltalk_find(t,[i]).forEach(t=>{t.focus()})}const __smalltalk_getIndex=(t,a)=>a===t?0:a+1;function __smalltalk_tab(t,a){const e=document.activeElement,l=__smalltalk_getDataName(e),n=a.length-1,o=a.indexOf(l),s=__smalltalk_getIndex(n,o),i=a[s];__smalltalk_find(t,[i]).forEach(t=>t.focus())}function __smalltalk_closeDialog(t,a,e,l){const n=t.getAttribute(\"data-name\").replace(\"js-\",\"\");if(/close|cancel/.test(n))return l(),void __smalltalk_remove();const o=__smalltalk_find(a,[\"input\"]).reduce((t,a)=>a.value,null);e(o),__smalltalk_remove()}function __smalltalk_find(t,a){const e=t=>t,l=a.map(a=>t.querySelector(`[data-name=\"js-${a}\"]`)).filter(e);return l}function __smalltalk_addListenerAll(t,a,e,l){__smalltalk_find(a,e).forEach(a=>a.addEventListener(t,l))}function __smalltalk_removeEl(t){const a=document.querySelector(t);a.parentElement.removeChild(a)}function __smalltalk_bind(t,...a){return()=>t(...a)}\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAiXSwibmFtZXMiOlsiJCIsImFwcGVuZCIsIkJVVFRPTl9PSyIsIkJVVFRPTl9PS19DQU5DRUwiLCJfX3NtYWxsdGFsa19yZW1vdmUiLCJfX3NtYWxsdGFsa19iaW5kIiwiX19zbWFsbHRhbGtfcmVtb3ZlRWwiLCJfX3NtYWxsdGFsa19zdG9yZSIsInZhbHVlIiwiZGF0YSIsImFyZ3VtZW50cyIsImxlbmd0aCIsIl9hbGVydCIsInRpdGxlIiwibXNnIiwiX19zbWFsbHRhbGtfc2hvd0RpYWxvZyIsImNhbmNlbCIsIl9wcm9tcHQiLCJvcHRpb25zIiwidHlwZSIsIl9fc21hbGx0YWxrX2dldFR5cGUiLCJ2YWwiLCJTdHJpbmciLCJyZXBsYWNlIiwidmFsdWVTdHIiLCJfY29uZmlybSIsIl9fc21hbGx0YWxrX2dldFRlbXBsYXRlIiwiYnV0dG9ucyIsImVuY29kZWRNc2ciLCJtYXAiLCJuYW1lIiwiaSIsInRvTG93ZXJDYXNlIiwiam9pbiIsIm9rIiwiZGlhbG9nIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY2xvc2VCdXR0b25zIiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwibm9DYW5jZWwiLCJlbXB0eSIsImlubmVySFRNTCIsImNsYXNzTmFtZSIsImJvZHkiLCJhcHBlbmRDaGlsZCIsIl9fc21hbGx0YWxrX2ZpbmQiLCJmb3JFYWNoIiwiZWwiLCJmb2N1cyIsInNldFNlbGVjdGlvblJhbmdlIiwiX19zbWFsbHRhbGtfYWRkTGlzdGVuZXJBbGwiLCJldmVudCIsIl9fc21hbGx0YWxrX2Nsb3NlRGlhbG9nIiwidGFyZ2V0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImN1cnJpZnkiLCJfX3NtYWxsdGFsa19rZXlEb3duRXZlbnQiLCJLRVkiLCJFTlRFUiIsIkVTQyIsIlRBQiIsIkxFRlQiLCJVUCIsIlJJR0hUIiwiRE9XTiIsImtleUNvZGUiLCJuYW1lc0FsbCIsIm5hbWVzIiwiX19zbWFsbHRhbGtfZ2V0RGF0YU5hbWUiLCJwcmV2ZW50RGVmYXVsdCIsInNoaWZ0S2V5IiwiX19zbWFsbHRhbGtfdGFiIiwiZmlsdGVyIiwidG9VcHBlckNhc2UiLCJfX3NtYWxsdGFsa19jaGFuZ2VCdXR0b25Gb2N1cyIsInN0b3BQcm9wYWdhdGlvbiIsImdldEF0dHJpYnV0ZSIsImFjdGl2ZSIsImFjdGl2ZUVsZW1lbnQiLCJhY3RpdmVOYW1lIiwiaXNCdXR0b24iLCJ0ZXN0IiwiY291bnQiLCJnZXROYW1lIiwiX19zbWFsbHRhbGtfZ2V0SW5kZXgiLCJpbmRleCIsImFjdGl2ZUluZGV4IiwiaW5kZXhPZiIsInJlZHVjZSIsImVsZW1lbnQiLCJub3RFbXB0eSIsImEiLCJlbGVtZW50cyIsInF1ZXJ5U2VsZWN0b3IiLCJwYXJlbnQiLCJmbiIsInBhcmVudEVsZW1lbnQiLCJyZW1vdmVDaGlsZCIsImFyZ3MiXSwibWFwcGluZ3MiOiJBQUFBLGFBRUFBLEVBQUUsUUFBUUMsT0FBTyw2bkZBRWpCLE1BQU1DLFdBQWEsTUFDYkMsa0JBQW9CLEtBQU0sVUFFMUJDLG1CQUFxQkMsaUJBQWtCQyxxQkFBc0IsY0FHN0RDLGtCQUFzQkMsSUFDeEIsTUFBTUMsR0FDRkQsTUFBQUEsR0FHSixPQUFPLFNBQVdBLEdBQ2QsT0FBTUUsVUFBVUMsUUFHaEJGLEVBQUtELE1BQVFBLEVBRU5BLEdBSklDLEVBQUtELFFBUXhCLFNBQVNJLE9BQVFDLEVBQU9DLEdBQ3BCLE9BQU9DLHVCQUF3QkYsRUFBT0MsRUFBSyxHQUFJWixXQUFhYyxRQUFRLElBR3hFLFNBQVNDLFFBQVNKLEVBQU9DLEVBQUtOLEVBQVEsR0FBSVUsR0FDdEMsTUFBTUMsRUFBT0Msb0JBQXFCRixHQUU1QkcsRUFBTUMsT0FBUWQsR0FDZmUsUUFBUyxLQUFNLFVBRWRDLGtCQUE0QkwsYUFBa0JFLDJCQUVwRCxPQUFPTix1QkFBd0JGLEVBQU9DLEVBQUtVLEVBQVVyQixpQkFBa0JlLEdBRzNFLFNBQVNPLFNBQVVaLEVBQU9DLEVBQUtJLEdBQzNCLE9BQU9ILHVCQUF3QkYsRUFBT0MsRUFBSyxHQUFJWCxp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"
        };
    }

    /* ============================================================== */

    /* ===================== STANDARD CALLBACKS ===================== */

    /**
     * @public
     * @desc Starts the script execution. This is called by BetterDiscord if the plugin is enabled.
     */
    start() {
        /* Backup class instance. */
        const self = this;

        /* Perform idiot-proof check to make sure the user named the plugin `discordCrypt.plugin.js` */
        if ( !discordCrypt.validPluginName() ) {
            _alert(
                "Oops!\r\n\r\n" +
                "It seems you didn't read discordCrypt's usage guide. :(\r\n" +
                "You need to name this plugin exactly as follows to allow it to function correctly.\r\n\r\n" +
                "\t" + discordCrypt.getPluginName() + "\r\n\r\n\r\n" +
                "You should probably check the usage guide again just in case you missed anything else. :)",
                'Hi There! - DiscordCrypt'
            );
            return;
        }

        /* Perform startup and load the config file if not already loaded. */
        if ( !this.configFile ) {
            /* Load the master password. */
            this.loadMasterPassword();

            /* Don't do anything further till we have a configuration file. */
            return;
        }

        /* Add the toolbar. */
        this.loadToolbar();

        /* Attach the message handler. */
        this.attachHandler();

        /* Process any blocks on an interval since Discord loves to throttle messages. */
        this.scanInterval = setInterval( () => {
            self.decodeMessages();
        }, self.configFile.encryptScanDelay );

        /* The toolbar fails to properly load on switches to the friends list. Create an interval to do this. */
        this.toolbarReloadInterval = setInterval( () => {
            self.loadToolbar();
            self.attachHandler();
        }, 5000 );

        /* Don't check for updates if running a debug version. */
        if ( !discordCrypt.__shouldIgnoreUpdates( this.getVersion() ) ) {
            /* Check for any new updates. */
            this.checkForUpdates();

            /* Add an update handler to check for updates every 60 minutes. */
            this.updateHandlerInterval = setInterval( () => {
                self.checkForUpdates();
            }, 3600000 );
        }
    }

    /**
     * @public
     * @desc Stops the script execution. This is called by BetterDiscord if the plugin is disabled or during shutdown.
     */
    stop() {
        /* Nothing needs to be done since start() wouldn't have triggered. */
        if ( !discordCrypt.validPluginName() )
            return;

        /* Remove onMessage event handler hook. */
        $( this.channelTextAreaClass ).off( "keydown.dcrypt" );

        /* Unload the decryption interval. */
        clearInterval( this.scanInterval );

        /* Unload the toolbar reload interval. */
        clearInterval( this.toolbarReloadInterval );

        /* Unload the update handler. */
        clearInterval( this.updateHandlerInterval );

        /* Unload elements. */
        $( "#dc-overlay" ).remove();
        $( '#dc-lock-btn' ).remove();
        $( '#dc-passwd-btn' ).remove();
        $( '#dc-exchange-btn' ).remove();
        $( '#dc-settings-btn' ).remove();
        $( '#dc-toolbar-line' ).remove();

        /* Clear the configuration file. */
        this.configFile = null;
    }

    /**
     * @public
     * @desc Triggered when the script has to load resources. This is called once upon Discord startup.
     */
    load() {
        const vm = require( 'vm' );

        /* Inject application CSS. */
        discordCrypt.injectCSS( 'dc-css', this.appCss );

        /* Inject all compiled libraries. */
        for ( let name in this.libraries ) {
            vm.runInThisContext( this.libraries[ name ], {
                filename: name,
                displayErrors: false
            } );
        }
    }

    /**
     * @public
     * @desc Triggered when the script needs to unload its resources. This is called during Discord shutdown.
     */
    unload() {
        /* Clear the injected CSS. */
        discordCrypt.clearCSS( 'dc-css' );
    }

    /**
     * @public
     * @desc Triggered by BetterDiscord when the current channel has been switched.
     */
    onSwitch() {
        /* Skip if no valid configuration is loaded. */
        if ( !this.configFile )
            return;

        discordCrypt.log( 'Detected chat switch.', 'debug' );

        /* Add the toolbar. */
        this.loadToolbar();

        /* Attach the message handler. */
        this.attachHandler();

        /* Decrypt any messages. */
        this.decodeMessages();
    }

    /**
     * @public
     * @desc Triggered when the current channel or DM adds a new message to the display.
     *      Attempt to decode messages once a new message has been received.
     */
    onMessage() {
        /* Skip if no valid configuration is loaded. */
        if ( !this.configFile )
            return;

        discordCrypt.log( 'Detected new message.', 'Decoding ...', 'debug' );

        /* Immediately decode the message. */
        this.decodeMessages();
    }

    /* =================== END STANDARD CALLBACKS =================== */

    /* =================== CONFIGURATION DATA CBS =================== */

    /**
     * @private
     * @desc Performed when updating a configuration file across versions.
     */
    onUpdate() {
        /* Placeholder for future use. */
    }

    /**
     * @private
     * @desc Returns the default settings for the plugin.
     * @returns {
     *  {
     *      version: string,
     *      defaultPassword: string,
     *      encodeMessageTrigger: string,
     *      encryptScanDelay: number,
     *      encryptMode: number,
     *      encryptBlockMode: string,
     *      encodeAll: boolean,
     *      paddingMode: string,
     *      passList: {},
     *      up1Host: string,
     *      up1ApiKey: string
     *  }
     * }
     */
    getDefaultConfig() {
        return {
            /* Current Version. */
            version: this.getVersion(),
            /* Default password for servers not set. */
            defaultPassword: "秘一密比无为有秘习个界一万定为界人是的要人每的但了又你上着密定已",
            /* Defines what needs to be typed at the end of a message to encrypt it. */
            encodeMessageTrigger: "ENC",
            /* How often to scan for encrypted messages. */
            encryptScanDelay: 1000,
            /* Default encryption mode. */
            encryptMode: 7, /* AES(Camellia) */
            /* Default block operation mode for ciphers. */
            encryptBlockMode: 'CBC',
            /* Encode all messages automatically when a password has been set. */
            encodeAll: true,
            /* Default padding mode for blocks. */
            paddingMode: 'PKC7',
            /* Password array of objects for users or channels. */
            passList: {},
            /* Contains the URL of the Up1 client. */
            up1Host: 'https://share.riseup.net',
            /* Contains the API key used for transactions with the Up1 host. */
            up1ApiKey: '59Mnk5nY6eCn4bi9GvfOXhMH54E7Bh6EMJXtyJfs'
        };
    }

    /**
     * @private
     * @desc Checks if the configuration file exists.
     * @returns {boolean} Returns true if the configuration file exists.
     */
    configExists() {
        /* Attempt to parse the configuration file. */
        let data = bdPluginStorage.get( this.getName(), 'config' );

        /* The returned data must be defined and non-empty. */
        return data && data !== null && data !== '';
    }

    /**
     * @private
     * @desc Loads the configuration file from `discordCrypt.config.json`
     * @returns {boolean}
     */
    loadConfig() {
        discordCrypt.log( 'Loading configuration file ...' );

        /* Attempt to parse the configuration file. */
        let data = bdPluginStorage.get( this.getName(), 'config' );

        /* Check if the config file exists. */
        if ( !data || data === null || data === '' ) {
            /* File doesn't exist, create a new one. */
            this.configFile = this.getDefaultConfig();

            /* Save the config. */
            this.saveConfig();

            /* Nothing further to do. */
            return true;
        }

        /* Try parsing the decrypted data. */
        try {
            this.configFile = JSON.parse(
                discordCrypt.aes256_decrypt_gcm( data.data, this.masterPassword, 'PKC7', 'utf8', false )
            );
        }
        catch ( err ) {
            discordCrypt.log( 'Decryption of configuration file failed - ' + err, 'error' );
            return false;
        }

        /* If it fails, return an error. */
        if ( !this.configFile || !this.configFile.version ) {
            discordCrypt.log( 'Decryption of configuration file failed.', 'error' );
            return false;
        }

        /* Check for version mismatch. */
        if ( this.configFile.version !== this.getVersion() ) {
            /* Perform whatever needs to be done before updating. */
            this.onUpdate();

            /* Preserve the old version for logging. */
            let oldVersion = this.configFile.version;

            /* Preserve the old password list before updating. */
            let oldCache = this.configFile.passList;

            /* Get the most recent default configuration. */
            this.configFile = this.getDefaultConfig();

            /* Now restore the password list. */
            this.configFile.passList = oldCache;

            /* Save the new configuration. */
            this.saveConfig();

            /* Alert. */
            discordCrypt.log( 'Updated plugin version from v' + oldVersion + ' to v' + this.getVersion() + '.' );
            return true;
        }

        discordCrypt.log( 'Loaded configuration file! - v' + this.configFile.version );
        return true;
    }

    /**
     * @private
     * @desc Saves the configuration file with the current password using AES-256 in GCM mode.
     */
    saveConfig() {
        discordCrypt.log( 'Saving configuration file ...' );

        /* Encrypt the message using the master password and save the encrypted data. */
        bdPluginStorage.set( this.getName(), 'config', {
            data:
                discordCrypt.aes256_encrypt_gcm(
                    JSON.stringify( this.configFile ),
                    this.masterPassword,
                    'PKC7',
                    false
                )
        } );
    }

    /**
     * @private
     * @desc Updates and saves the configuration data used and updates a given button's text.
     * @param {Object} btn The jQuery button to set the update text for.
     */
    saveSettings( btn ) {
        /* Save self. */
        const self = this;

        /* Clear the old message decoder. */
        clearInterval( this.scanInterval );

        /* Save the configuration file. */
        this.saveConfig();

        /* Set a new decoder to use any updated configurations. */
        setInterval( ( function () {
            self.decodeMessages( true );
        } ), this.configFile.encryptScanDelay );

        /* Tell the user that their settings were applied. */
        btn.innerHTML = "Saved & Applied!";

        /* Reset the original text after a second. */
        setTimeout( ( function () {
            btn.innerHTML = "Save & Apply";
        } ), 1000 );
    }

    /**
     * @private
     * @desc Resets the default configuration data used and updates a given button's text.
     * @param {Object} btn The jQuery button to set the update text for.
     */
    resetSettings( btn ) {
        /* Save self. */
        const self = this;

        /* Clear the old message decoder. */
        clearInterval( this.scanInterval );

        /* Retrieve the default configuration. */
        this.configFile = this.getDefaultConfig();

        /* Save the configuration file to update any settings. */
        this.saveConfig();

        /* Set a new decoder to use any updated configurations. */
        setInterval( ( function () {
            self.decodeMessages( true );
        } ), self.configFile.encryptScanDelay );

        /* Tell the user that their settings were reset. */
        btn.innerHTML = "Restored Default Settings!";

        /* Reset the original text after a second. */
        setTimeout( ( function () {
            btn.innerHTML = "Reset Settings";
        } ), 1000 );
    }

    /**
     * @private
     * @desc Update the current password field and save the config file.
     */
    updatePasswords() {
        /* Don't save if the password overlay is not open. */
        if ( $( '#dc-overlay-password' )[ 0 ].style.display !== 'block' )
            return;

        let prim = $( "#dc-password-primary" );
        let sec = $( "#dc-password-secondary" );

        /* Check if a primary password has actually been entered. */
        if ( !( prim[ 0 ].value !== '' && prim[ 0 ].value.length > 1 ) )
            delete this.configFile.passList[ discordCrypt.getChannelId() ];
        else {
            /* Update the password field for this id. */
            this.configFile.passList[ discordCrypt.getChannelId() ] =
                discordCrypt.createPassword( prim[ 0 ].value, '' );

            /* Only check for a secondary password if the primary password has been entered. */
            if ( sec[ 0 ].value !== '' && sec[ 0 ].value.length > 1 )
                this.configFile.passList[ discordCrypt.getChannelId() ].secondary = sec[ 0 ].value;

            /* Update the password toolbar. */
            prim[ 0 ].value = "";
            sec[ 0 ].value = "";
        }

        /* Save the configuration file and decode any messages. */
        this.saveConfig();

        /* Decode any messages with the new password(s). */
        this.decodeMessages( true );
    }

    /* ================= END CONFIGURATION CBS ================= */

    /* =================== PROJECT UTILITIES =================== */

    /**
     * @public
     * @desc Returns the name of the plugin file expected on the disk.
     * @returns {string}
     */
    static getPluginName() {
        return 'discordCrypt.plugin.js';
    }

    /**
     * @public
     * @desc Check if the plugin is named correctly by attempting to open the plugin file in the BetterDiscord
     *      plugin path.
     * @returns {boolean}
     */
    static validPluginName() {
        return require( 'fs' )
            .existsSync( require( 'path' )
                .join( discordCrypt.getPluginsPath(), discordCrypt.getPluginName() ) );
    }

    /**
     * @public
     * @desc Returns the platform-specific path to BetterDiscord's plugin directory.
     * @returns {string} The expected path ( which may not exist ) to BetterDiscord's plugin directory.
     */
    static getPluginsPath() {
        const process = require( 'process' );
        return (
            process.platform === 'win32' ?
                process.env.APPDATA :
                process.platform === 'darwin' ?
                    process.env.HOME + '/Library/Preferences' :
                    process.env.HOME + '/.config'
        ) + '/BetterDiscord/plugins/';
    }

    /**
     * @callback updateCallback
     * @param {string} file_data The update file's data.
     * @param {string} short_hash A 64-bit SHA-256 checksum of the new update.
     * @param {string} new_version The new version of the update.
     * @param {string} full_changelog The full changelog.
     */

    /**
     * @public
     * @desc Checks the update server for an encrypted update.
     * @param {updateCallback} onUpdateCallback
     * @returns {boolean}
     * @example
     * checkForUpdate( ( file_data, short_hash, new_version, full_changelog ) =>
     *      console.log( `New Update Available: #${short_hash} - v${new_version}` );
     *      console.log( `Changelog:\n${full_changelog}` );
     * } );
     */
    static checkForUpdate( onUpdateCallback ) {
        /* Update URL and request method. */
        const update_url = 'https://gitlab.com/leogx9r/DiscordCrypt/raw/master/src/' + discordCrypt.getPluginName();
        const changelog_url = 'https://gitlab.com/leogx9r/DiscordCrypt/raw/master/src/CHANGELOG';

        /* Make sure the callback is a function. */
        if ( typeof onUpdateCallback !== 'function' )
            return false;

        /* Perform the request. */
        try {
            /* Download the update. */
            discordCrypt.__getRequest( update_url, ( statusCode, errorString, data ) => {
                /* Make sure no error occurred. */
                if ( statusCode !== 200 ) {
                    /* Log the error accordingly. */
                    switch ( statusCode ) {
                        case 404:
                            discordCrypt.log( 'Update URL is broken.', 'error' );
                            break;
                        case 403:
                            discordCrypt.log( 'Forbidden request when checking for updates.', 'error' );
                            break;
                        default:
                            discordCrypt.log( 'Error while fetching update: ' + errorString, 'error' );
                            break;
                    }

                    return;
                }

                /* Format properly. */
                data = data.replace( '\r', '' );

                /* Get the local file. */
                let localFile = '//META{"name":"discordCrypt"}*//\n';
                try {
                    localFile = require( 'fs' ).readFileSync(
                        require( 'path' ).join(
                            discordCrypt.getPluginsPath(),
                            discordCrypt.getPluginName()
                        )
                    ).toString().replace( '\r', '' );
                }
                catch ( e ) {
                }

                /* Check the first line which contains the metadata to make sure that they're equal. */
                if ( data.split( '\n' )[ 0 ] !== localFile.split( '\n' )[ 0 ] ) {
                    discordCrypt.log( 'Plugin metadata is missing from either the local or update file.', 'error' );
                    return;
                }

                /* Read the current hash of the plugin and compare them.. */
                let currentHash = discordCrypt.sha256( localFile );
                let hash = discordCrypt.sha256( data );
                let shortHash = Buffer.from( hash, 'base64' )
                    .toString( 'hex' )
                    .slice( 0, 8 );

                /* If the hash equals the retrieved one, no update is needed. */
                if ( hash === currentHash ) {
                    discordCrypt.log( 'No Update Needed - #' + shortHash );
                    return true;
                }

                /* Try parsing a version number. */
                let version_number = '';
                try {
                    version_number = data.match( /('[0-9]+\.[0-9]+\.[0-9]+')/gi ).toString().replace( /('*')/g, '' );
                }
                catch ( e ) {
                }

                /* Now get the changelog. */
                try {
                    /* Fetch the changelog from the URL. */
                    discordCrypt.__getRequest( changelog_url, ( statusCode, errorString, changelog ) => {
                        /* Perform the callback. */
                        onUpdateCallback( data, shortHash, version_number, statusCode == 200 ? changelog : '' );
                    } );
                }
                catch ( e ) {
                    discordCrypt.log( 'Error fetching the changelog.', 'warn' );

                    /* Perform the callback without a changelog. */
                    onUpdateCallback( data, shortHash, version_number, '' );
                }
            } );
        }
        catch ( ex ) {
            /* Handle failure. */
            discordCrypt.log( 'Error while retrieving update: ' + ex.toString(), 'warn' );
            return false;
        }

        return true;
    }

    /**
     * @private
     * @description Returns the current message ID used by Discord.
     * @returns {string | undefined}
     */
    static getChannelId() {
        return window.location.pathname.split( '/' ).pop();
    }

    /**
     * @public
     * @desc Creates a password object using a primary and secondary password.
     * @param {string} primary_password The primary password.
     * @param {string} secondary_password The secondary password.
     * @returns {{primary: string, secondary: string}} Object containing the two passwords.
     */
    static createPassword( primary_password, secondary_password ) {
        return { primary: primary_password, secondary: secondary_password };
    }

    /**
     * @public
     * @desc Returns functions to locate exported webpack modules.
     * @returns {{find, findByUniqueProperties, findByDisplayName, findByDispatchToken, findByDispatchNames}}
     */
    static getWebpackModuleSearcher() {
        /* [ Credits to the creator. ] */
        const req = typeof( webpackJsonp ) === "function" ?
            webpackJsonp(
                [],
                { '__extra_id__': ( module, _export_, req ) => _export_.default = req },
                [ '__extra_id__' ]
            ).default :
            webpackJsonp.push( [
                [],
                { '__extra_id__': ( _module_, exports, req ) => _module_.exports = req },
                [ [ '__extra_id__' ] ] ]
            );

        delete req.m[ '__extra_id__' ];
        delete req.c[ '__extra_id__' ];

        /**
         * @desc Predicate for searching module.
         * @callback modulePredicate
         * @param {*} module Module to test.
         * @return {boolean} Returns `true` if `module` matches predicate.
         */

        /**
         * @desc Look through all modules of internal Discord's Webpack and return first one that matches filter
         *      predicate. At first this function will look through already loaded modules cache.
         *      If no loaded modules match, then this function tries to load all modules and match for them.
         *      Loading any module may have unexpected side effects, like changing current locale of moment.js,
         *      so in that case there will be a warning the console.
         *      If no module matches, this function returns `null`.
         *      ou should always try to provide a predicate that will match something,
         *      but your code should be ready to receive `null` in case of changes in Discord's codebase.
         *      If module is ES6 module and has default property, consider default first;
         *      otherwise, consider the full module object.
         * @param {modulePredicate} filter Predicate to match module
         * @param {boolean} force_load Whether to force load all modules if cached modules don't work.
         * @return {*} First module that matches `filter` or `null` if none match.
         */
        const find = ( filter, force_load ) => {
            for ( let i in req.c ) {
                if ( req.c.hasOwnProperty( i ) ) {
                    let m = req.c[ i ].exports;

                    if ( m && m.__esModule && m.default )
                        m = m.default;

                    if ( m && filter( m ) )
                        return m;
                }
            }

            if ( force_load ) {
                discordCrypt.log( "Couldn't find module in existing cache. Loading all modules.", 'warn' );

                for ( let i = 0; i < req.m.length; ++i ) {
                    try {
                        let m = req( i );
                        if ( m && m.__esModule && m.default && filter( m.default ) )
                            return m.default;
                        if ( m && filter( m ) )
                            return m;
                    }
                    catch ( e ) {
                    }
                }

                discordCrypt.log( 'Cannot find React module.', 'warn' );
            }

            return null;
        };

        /**
         * @desc Look through all modules of internal Discord's Webpack and return first object that has all of
         *      following properties. You should be ready that in any moment, after Discord update,
         *      this function may start returning `null` (if no such object exists anymore) or even some
         *      different object with the same properties. So you should provide all property names that
         *      you use, and often even some extra properties to make sure you'll get exactly what you want.
         * @param {string[]} propNames Array of property names to look for.
         * @param {boolean} [force_load] Whether to force load all modules if cached modules don't work.
         * @returns {object} First module that matches `propNames` or `null` if none match.
         */
        const findByUniqueProperties = ( propNames, force_load = true ) =>
            find( module => propNames.every( prop => module[ prop ] !== undefined ), force_load );

        /**
         * @desc Look through all modules of internal Discord's Webpack and return first object that has
         *      `displayName` property with following value. This is useful for searching for React components by
         *      name. Take into account that not all components are exported as modules. Also, there might be
         *      several components with the same name.
         * @param {string} displayName Display name property value to look for.
         * @param {boolean} [force_load] Whether to force load all modules if cached modules don't work.
         * @return {object} First module that matches `displayName` or `null` if none match.
         */
        const findByDisplayName = ( displayName, force_load = true ) =>
            find( module => module.displayName === displayName, force_load );

        /**
         * @desc Look through all modules of internal Discord's Webpack and return the first object that matches
         *      a dispatch token's ID. These usually contain a bundle of `_actionHandlers` used to handle events
         *      internally.
         * @param {int} token The internal token ID number.
         * @param {boolean} [force_load] Whether to force load all modules if cached modules don't work.
         * @return {object} First module that matches the dispatch ID or `null` if none match.
         */
        const findByDispatchToken = ( token, force_load = false ) =>
            find( module =>
                module[ '_dispatchToken' ] !== undefined &&
                module[ '_dispatchToken' ] === `ID_${token}` &&
                module[ '_actionHandlers' ] !== undefined,
                force_load
            );

        /**
         * @desc Look through all modules of internal Discord's Webpack and return the first object that matches
         *      every dispatcher name provided.
         * @param {string[]} dispatchNames Names of events to search for.
         * @return {object} First module that matches every dispatch name provided or null if no full matches.
         */
        const findByDispatchNames = dispatchNames => {
            for ( let i = 0; i < 500; i++ ) {
                let dispatcher = findByDispatchToken( i );

                if ( !dispatcher )
                    continue;

                if ( dispatchNames.every( prop => dispatcher._actionHandlers.hasOwnProperty( prop ) ) )
                    return dispatcher;
            }
            return null;
        };

        return { find, findByUniqueProperties, findByDisplayName, findByDispatchToken, findByDispatchNames };
    }

    /**
     * @private
     * @desc Dumps all function callback handlers with their names, IDs and function prototypes. [ Debug Function ]
     * @returns {Array} Returns an array of all IDs and identifier callbacks.
     */
    static dumpWebpackModuleCallbacks() {
        /* Resolve the finder function. */
        let finder = discordCrypt.getWebpackModuleSearcher().findByDispatchToken;

        /* Create the dumping array. */
        let dump = [];

        /* Iterate over let's say 500 possible modules ? In reality, there's < 100. */
        for ( let i = 0; i < 500; i++ ) {
            /* Locate the module. */
            let module = finder( i );

            /* Skip if it's invalid. */
            if ( !module )
                continue;

            /* Create an entry in the array. */
            dump[ i ] = {};

            /* Loop over every property name in the action handler. */
            for ( let prop in module._actionHandlers ) {

                /* Quick sanity check. */
                if ( !module._actionHandlers.hasOwnProperty( prop ) )
                    continue;

                /* Assign the module property name and it's basic prototype. */
                dump[ i ][ prop ] = module._actionHandlers[ prop ].prototype.constructor.toString().split( '{' )[ 0 ];
            }
        }

        /* Return any found module handlers. */
        return dump;
    }

    /**
     * @private
     * @desc Returns the React modules loaded natively in Discord.
     * @returns {{
     *      ChannelProps: Object|null,
     *      MessageParser: Object|null,
     *      MessageController: Object|null,
     *      MessageActionTypes: Object|null,
     *      MessageDispatcher: Object|null,
     *      MessageQueue: Object|null,
     *      HighlightJS: Object|null
     *  }}
     */
    static getReactModules() {
        const WebpackModules = discordCrypt.getWebpackModuleSearcher();

        return {
            ChannelProps:
                discordCrypt.getChannelId() === '@me' ?
                    null :
                    discordCrypt.__getElementReactOwner( $( 'form' )[ 0 ] ).props.channel,
            MessageParser: WebpackModules
                .findByUniqueProperties( [ 'createMessage', 'parse', 'unparse' ] ),
            MessageController: WebpackModules
                .findByUniqueProperties( [ "sendClydeError", "sendBotMessage" ] ),
            MessageActionTypes: WebpackModules
                .findByUniqueProperties( [ "ActionTypes", "ActivityTypes" ] ),
            MessageDispatcher: WebpackModules
                .findByUniqueProperties( [ "dispatch", "maybeDispatch", "dirtyDispatch" ] ),
            MessageQueue: WebpackModules
                .findByUniqueProperties( [ "enqueue", "handleSend", "handleResponse" ] ),
            HighlightJS: WebpackModules
                .findByUniqueProperties( [ 'initHighlighting', 'highlightBlock', 'highlightAuto' ] ),
        };
    }

    /**
     * @private
     * @desc Sends an embedded message to Discord.
     * @param {string} embedded_text The message body of the embed.
     * @param {string} embedded_header The text to display at the top of the embed.
     * @param {string} embedded_footer The text to display at the bottom of the embed.
     * @param {string|int} embedded_color A hex color used to outline the left side of the embed.
     * @param {string} message_content Message content to be attached above the embed.
     * @param {int|undefined} channel_id If specified, sends the embedded message to this channel instead of the
     *      current channel.
     */
    static sendEmbeddedMessage(
        /* string */ embedded_text,
        /* string */ embedded_header,
        /* string */ embedded_footer,
        /* int */    embedded_color = 0x551A8B,
        /* string */ message_content = '',
        /* int */    channel_id = undefined
    ) {
        let mention_everyone = false;

        /* Finds appropriate React modules. */
        const React = discordCrypt.getReactModules();

        /* Parse the message content to the required format if applicable.. */
        if ( typeof message_content === 'string' && message_content.length ) {
            /* Sanity check. */
            if ( React.MessageParser === null ) {
                discordCrypt.log( 'Could not locate the MessageParser module!', 'error' );
                return;
            }

            try {
                message_content = React.MessageParser.parse( React.ChannelProps, message_content ).content;

                /* Check for @everyone or @here mentions. */
                if ( message_content.includes( '@everyone' ) || message_content.includes( '@here' ) )
                    mention_everyone = true;
            }
            catch ( e ) {
                message_content = '';
            }
        }
        else
            message_content = '';

        /* Generate a unique nonce for this message. */
        let _nonce = parseInt( require( 'crypto' ).randomBytes( 6 ).toString( 'hex' ), 16 );

        /* Save the Channel ID. */
        let _channel = channel_id !== undefined ? channel_id : discordCrypt.getChannelId();

        /* Sanity check. */
        if ( React.MessageQueue === null ) {
            discordCrypt.log( 'Could not locate the MessageQueue module!', 'error' );
            return;
        }

        /* Create the message object and add it to the queue. */
        React.MessageQueue.enqueue( {
            type: 'send',
            message: {
                channelId: _channel,
                nonce: _nonce,
                content: message_content,
                mention_everyone: mention_everyone,
                tts: false,
                embed: {
                    type: "rich",
                    url: "https://gitlab.com/leogx9r/DiscordCrypt",
                    color: embedded_color || 0x551A8B,
                    timestamp: ( new Date() ).toISOString(),
                    output_mime_type: "text/x-html",
                    encoding: "utf-16",
                    author: {
                        name: embedded_header || '-----MESSAGE-----',
                        icon_url: 'https://i.imgur.com/NC0PcLA.png',
                        url: 'https://discord.me/discordCrypt'
                    },
                    footer: {
                        text: embedded_footer || 'DiscordCrypt',
                        icon_url: 'https://i.imgur.com/9y1uGB0.png',
                        url: 'https://gitlab.com/leogx9r/DiscordCrypt/tags/' +
                        embedded_footer[ 0 ] === 'v' ? embedded_footer : ''
                    },
                    description: embedded_text,
                }
            }
        }, ( r ) => {
            /* Sanity check. */
            if ( React.MessageController === null ) {
                discordCrypt.log( 'Could not locate the MessageController module!', 'error' );
                return;
            }

            /* Check if an error occurred and inform Clyde bot about it. */
            if ( !r.ok ) {
                /* Perform Clyde dispatch if necessary. */
                if (
                    r.status >= 400 &&
                    r.status < 500 &&
                    r.body &&
                    !React.MessageController.sendClydeError( _channel, r.body.code )
                ) {
                    /* Log the error in case we can't manually dispatch the error. */
                    discordCrypt.log( 'Error sending message: ' + r.status, 'error' );

                    /* Sanity check. */
                    if ( React.MessageDispatcher === null || React.MessageActionTypes === null ) {
                        discordCrypt.log( 'Could not locate the MessageDispatcher module!', 'error' );
                        return;
                    }

                    React.MessageDispatcher.dispatch( {
                        type: React.MessageActionTypes.ActionTypes.MESSAGE_SEND_FAILED,
                        messageId: _nonce,
                        channelId: _channel
                    } );
                }
            }
            else {
                /* Receive the message normally. */
                React.MessageController.receiveMessage( _channel, r.body );
            }
        } );
    }

    /**
     * @public
     * @desc Logs a message to the console in HTML coloring. ( For Electron clients. )
     * @param {string} message The message to log to the console.
     * @param {string} method The indication level of the message.
     *      This can be either ['info', 'warn', 'error', 'success']
     *
     * @example
     * log( 'Hello World!' );
     *
     * @example
     * log( 'This is printed in yellow.', 'warn' );
     *
     * @example
     * log( 'This is printed in red.', 'error' );
     *
     * @example
     * log( 'This is printed green.', 'success' );
     *
     */
    static log( message, method = "info" ) {
        try {
            console[ method ]( "%c[DiscordCrypt]%c - " + message, "color: #7f007f; font-weight: bold;", "" );
        }
        catch ( ex ) {
        }
    }

    /**
     * @private
     * @desc Injects a CSS style element into the header tag.
     * @param {string} id The HTML ID string used to identify this CSS style segment.
     * @param {string} css The actual CSS style excluding the <style> tags.
     * @example
     * injectCSS( 'my-css', 'p { font-size: 32px; }' );
     */
    static injectCSS( id, css ) {
        /* Inject into the header tag. */
        $( "head" )
            .append( $( "<style>", { id: id.replace( /^[^a-z]+|[^\w-]+/gi, "" ), html: css } ) )
    }

    /**
     * @private
     * @desc Clears an injected element via its ID tag.
     * @param {string} id The HTML ID string used to identify this CSS style segment.
     * @example
     * clearCSS( 'my-css' );
     */
    static clearCSS( id = undefined ) {
        /* Make sure the ID is a valid string. */
        if ( !id || typeof id !== 'string' || !id.length )
            return;

        /* Remove the element. */
        $( "#" + id.replace( /^[^a-z]+|[^\w-]+/gi, "" ) ).remove();
    }

    /* ================= END PROJECT UTILITIES ================= */

    /* ================= BEGIN MAIN CALLBACKS ================== */

    /**
     * @desc Hooks a dispatcher from Discord's internals.
     * @author samogot & Leonardo Gates
     * @param {object} dispatcher The action dispatcher containing an array of _actionHandlers.
     * @param {string} methodName The name of the method to hook.
     * @param {string} options The type of hook to apply. [ 'before', 'after', 'instead', 'revert' ]
     * @param {boolean} [options.once=false] Set to `true` if you want to automatically unhook method after first call.
     * @param {boolean} [options.silent=false] Set to `true` if you want to suppress log messages about patching and
     *      unhooking. Useful to avoid clogging the console in case of frequent conditional hooking/unhooking, for
     *      example from another monkeyPatch callback.
     * @return {function} Returns the function used to cancel the hook.
     */
    static hookDispatcher( dispatcher, methodName, options ) {
        const { before, after, instead, once = false, silent = false } = options;
        const origMethod = dispatcher._actionHandlers[ methodName ];

        const cancel = () => {
            if ( !silent )
                discordCrypt.log( `Unhooking "${methodName}" ...` );
            dispatcher[ methodName ] = origMethod;
        };

        const suppressErrors = ( method, description ) => ( ... params ) => {
            try {
                return method( ... params );
            }
            catch ( e ) {
                discordCrypt.log( 'Error occurred in ' + description, 'error' )
            }
        };

        if ( !dispatcher._actionHandlers[ methodName ].__hooked ) {
            if ( !silent )
                discordCrypt.log( `Hooking "${methodName}" ...` );

            dispatcher._actionHandlers[ methodName ] = function () {
                /**
                 * @interface
                 * @name PatchData
                 * @property {object} thisObject Original `this` value in current call of patched method.
                 * @property {Arguments} methodArguments Original `arguments` object in current call of patched method.
                 *      Please, never change function signatures, as it may cause a lot of problems in future.
                 * @property {cancelPatch} cancelPatch Function with no arguments and no return value that may be called
                 *      to reverse patching of current method. Calling this function prevents running of this callback
                 *      on further original method calls.
                 * @property {function} originalMethod Reference to the original method that is patched. You can use it
                 *      if you need some special usage. You should explicitly provide a value for `this` and any method
                 *      arguments when you call this function.
                 * @property {function} callOriginalMethod This is a shortcut for calling original method using `this` and
                 *      `arguments` from original call.
                 * @property {*} returnValue This is a value returned from original function call. This property is
                 *      available only in `after` callback or in `instead` callback after calling `callOriginalMethod` function.
                 */
                const data = {
                    thisObject: this,
                    methodArguments: arguments,
                    cancelPatch: cancel,
                    originalMethod: origMethod,
                    callOriginalMethod: () => data.returnValue =
                        data.originalMethod.apply( data.thisObject, data.methodArguments )
                };
                if ( instead ) {
                    const tempRet =
                        suppressErrors( instead, `${methodName} called hook via 'instead'.` )( data );

                    if ( tempRet !== undefined )
                        data.returnValue = tempRet;
                }
                else {

                    if ( before )
                        suppressErrors( before, `${methodName} called hook via 'before'.` )( data );

                    data.callOriginalMethod();

                    if ( after )
                        suppressErrors( after, `${methodName} called hook via 'after'.` )( data );
                }
                if ( once )
                    cancel();

                return data.returnValue;
            };

            dispatcher._actionHandlers[ methodName ].__hooked = true;
            dispatcher._actionHandlers[ methodName ].__cancel = cancel;
        }
        return dispatcher._actionHandlers[ methodName ].__cancel;
    }

    hookMessageCallbacks() {

        /* Find the main message dispatcher if not already found. */
        if ( !this.messageDispatcher ) {
            this.messageDispatcher = discordCrypt.getWebpackModuleSearcher().findByDispatchNames( [
                'MESSAGE_CREATE',
                'MESSAGE_UPDATE',
                'MESSAGE_DELETE',
                'LOAD_MESSAGES'
            ] );
        }

        /* Don't proceed if it failed. */
        if ( !this.messageDispatcher ) {
            discordCrypt.log( `Failed to locate the message dispatcher!`, 'error' );
            return;
        }

        discordCrypt.hookDispatcher(
            this.messageDispatcher,
            'MESSAGE_UPDATE',
            {
                after: ( e ) => {
                    if ( e.methodArguments[ 0 ].message.channel_id === discordCrypt.getChannelId() )
                        discordCrypt.log( `${JSON.stringify( e.methodArguments[ 0 ].message )}` );
                }
            }
        );
    }

    unhookMessageCallbacks() {
        if ( !this.messageDispatcher )
            return;

        for ( let prop in this.messageDispatcher._actionHandlers ) {
            if ( prop.hasOwnProperty( '__cancel' ) )
                prop.__cancel();
        }
    }

    /**
     * @private
     * @desc Loads the master-password unlocking prompt.
     */
    loadMasterPassword() {
        const self = this;

        if ( $( '#dc-master-overlay' ).length !== 0 )
            return;

        /* Check if the database exists. */
        const cfg_exists = self.configExists();

        const action_msg = cfg_exists ? 'Unlock Database' : 'Create Database';

        /* Construct the password updating field. */
        $( document.body ).prepend( this.masterPasswordHtml );

        const pwd_field = $( '#dc-db-password' );
        const cancel_btn = $( '#dc-cancel-btn' );
        const unlock_btn = $( '#dc-unlock-database-btn' );
        const master_status = $( '#dc-master-status' );
        const master_header_message = $( '#dc-header-master-msg' );
        const master_prompt_message = $( '#dc-prompt-master-msg' );

        /* Use these messages based on whether we're creating a database or unlocking it. */
        master_header_message.text(
            cfg_exists ?
                '---------- Database Is Locked ----------' :
                '---------- Database Not Found ----------'
        );
        master_prompt_message.text(
            cfg_exists ?
                'Enter Password:' :
                'Enter New Password:'
        );
        unlock_btn.text( action_msg );

        /* Force the database element to load. */
        document.getElementById( 'dc-master-overlay' ).style.display = 'block';

        /* Check for ENTER key press to execute unlocks. */
        pwd_field.on( "keydown", ( function ( e ) {
            let code = e.keyCode || e.which;

            /* Execute on ENTER/RETURN only. */
            if ( code !== 13 )
                return;

            unlock_btn.click();
        } ) );

        /* Handle unlock button clicks. */
        unlock_btn.click( ( function () {

            /* Disable the button before clicking. */
            unlock_btn.attr( 'disabled', true );

            /* Update the text. */
            if ( cfg_exists )
                unlock_btn.text( 'Unlocking Database ...' );
            else
                unlock_btn.text( 'Creating Database ...' );

            /* Get the password entered. */
            let password = pwd_field[ 0 ].value;

            /* Validate the field entered contains some value. */
            if ( password === null || password === '' ) {
                unlock_btn.text( action_msg );
                unlock_btn.attr( 'disabled', false );
                return;
            }

            /* Hash the password. */
            discordCrypt.scrypt
            (
                Buffer.from( password ),
                Buffer.from( discordCrypt.whirlpool( password, true ), 'hex' ),
                32,
                4096,
                8,
                1,
                ( error, progress, pwd ) => {
                    if ( error ) {
                        /* Update the button's text. */
                        if ( cfg_exists )
                            unlock_btn.text( 'Invalid Password!' );
                        else
                            unlock_btn.text( 'Error: ' + error );

                        /* Clear the text field. */
                        pwd_field[ 0 ].value = '';

                        /* Reset the progress bar. */
                        master_status.css( 'width', '0%' );

                        /* Reset the text of the button after 1 second. */
                        setTimeout( ( function () {
                            unlock_btn.text( action_msg );
                        } ), 1000 );

                        discordCrypt.log( error.toString(), 'error' );
                        return true;
                    }

                    if ( progress )
                        master_status.css( 'width', parseInt( progress * 100 ) + '%' );

                    if ( pwd ) {
                        /* To test whether this is the correct password or not, we have to attempt to use it. */
                        self.masterPassword = Buffer.from( pwd, 'hex' );

                        /* Attempt to load the database with this password. */
                        if ( !self.loadConfig() ) {
                            self.configFile = null;

                            /* Update the button's text. */
                            if ( cfg_exists )
                                unlock_btn.text( 'Invalid Password!' );
                            else
                                unlock_btn.text( 'Failed to create the database!' );

                            /* Clear the text field. */
                            pwd_field[ 0 ].value = '';

                            /* Reset the progress bar. */
                            master_status.css( 'width', '0%' );

                            /* Reset the text of the button after 1 second. */
                            setTimeout( ( function () {
                                unlock_btn.text( action_msg );
                            } ), 1000 );

                            /* Proceed no further. */
                            unlock_btn.attr( 'disabled', false );
                            return false;
                        }

                        /* We may now call the start() function. */
                        self.start();

                        /* And update the button text. */
                        if ( cfg_exists )
                            unlock_btn.text( 'Unlocked Successfully!' );
                        else
                            unlock_btn.text( 'Created Successfully!' );

                        /* Close the overlay after 1 second. */
                        setTimeout( ( function () {
                            $( '#dc-master-overlay' ).remove();
                        } ), 1000 );
                    }

                    return false;
                }
            );
        } ) );

        /* Handle cancel button presses. */
        cancel_btn.click( ( function () {
            /* Use a 300 millisecond delay. */
            setTimeout(
                ( function () {
                    /* Remove the prompt overlay. */
                    $( '#dc-master-overlay' ).remove();

                    /* Do some quick cleanup. */
                    self.masterPassword = null;
                    self.configFile = null;
                } ), 300
            );
        } ) );
    }

    /**
     * @private
     * @desc Performs an async update checking and handles actually updating the current version if necessary.
     */
    checkForUpdates() {
        const self = this;

        setTimeout( () => {
            /* Proxy call. */
            try {
                discordCrypt.checkForUpdate( ( file_data, short_hash, new_version, full_changelog ) => {
                    const replacePath = require( 'path' )
                        .join( discordCrypt.getPluginsPath(), discordCrypt.getPluginName() );
                    const fs = require( 'fs' );

                    /* Alert the user of the update and changelog. */
                    $( '#dc-overlay' )[ 0 ].style.display = 'block';
                    $( '#dc-update-overlay' )[ 0 ].style.display = 'block';

                    /* Update the version info. */
                    $( '#dc-new-version' )
                        .text( `New Version: ${new_version === '' ? 'N/A' : new_version} ( #${short_hash} )` );
                    $( '#dc-old-version' ).text( `Old Version: ${self.getVersion()}` );

                    /* Update the changelog. */
                    let dc_changelog = $( '#dc-changelog' );
                    dc_changelog.val(
                        typeof full_changelog === "string" && full_changelog.length > 0 ?
                            full_changelog :
                            'N/A'
                    );

                    /* Scroll to the top of the changelog. */
                    dc_changelog.scrollTop( 0 );

                    /* Replace the file. */
                    fs.writeFile( replacePath, file_data, ( err ) => {
                        if ( err ) {
                            discordCrypt.log(
                                `Unable to replace the target plugin. ( ${err} )\nDestination: ${replacePath}`, 'error'
                            );
                            _alert( 'Failed to apply the update!', 'Error During Update' );
                        }
                    } );
                } );
            }
            catch ( ex ) {
                discordCrypt.log( ex, 'warn' );
            }
        }, 1000 );
    }

    /**
     * @private
     * @desc Sets the active tab index in the exchange key menu.
     * @param {int} index The index ( 0-2 ) of the page to activate.
     * @example
     * setActiveTab( 1 );
     */
    static setActiveTab( index ) {
        let tab_names = [ 'dc-about-tab', 'dc-keygen-tab', 'dc-handshake-tab' ];
        let tabs = $( '.dc-tab-link' );

        /* Hide all tabs. */
        for ( let i = 0; i < tab_names.length; i++ )
            $( '#' + tab_names[ i ] )[ 0 ].style.display = 'none';

        /* Deactivate all links. */
        for ( let i = 0; i < tabs.length; i++ )
            tabs[ i ].className = tabs[ i ].className.split( ' active' ).join( '' );

        switch ( index ) {
            case 0:
                $( '#dc-tab-info-btn' )[ 0 ].className += ' active';
                $( '#dc-about-tab' )[ 0 ].style.display = 'block';
                break;
            case 1:
                $( '#dc-tab-keygen-btn' )[ 0 ].className += ' active';
                $( '#dc-keygen-tab' )[ 0 ].style.display = 'block';
                break;
            case 2:
                $( '#dc-tab-handshake-btn' )[ 0 ].className += ' active';
                $( '#dc-handshake-tab' )[ 0 ].style.display = 'block';
                break;
            default:
                break;
        }
    }

    /**
     * @private
     * @desc Inserts the plugin's option toolbar to the current toolbar and handles all triggers.
     */
    loadToolbar() {
        /* Skip if the configuration hasn't been loaded. */
        if ( !this.configFile )
            return;

        /* Skip if we're not in an active channel. */
        if ( discordCrypt.getChannelId() === '@me' )
            return;

        /* Toolbar buttons and their icons if it doesn't exist. */
        if ( $( '#dc-passwd-btn' ).length !== 0 )
            return;

        /* Inject the toolbar. */
        $( this.searchUiClass ).parent().parent().parent().prepend( this.toolbarHtml );

        /* Set the SVG button class. */
        $( '.dc-svg' ).attr( 'class', 'dc-svg' );

        /* Set the initial status icon. */
        if ( $( '#dc-lock-btn' ).length > 0 ) {
            if ( this.configFile.encodeAll ) {
                $( '#dc-lock-btn' ).attr( 'title', 'Disable Message Encryption' );
                $( '#dc-lock-btn' )[ 0 ].innerHTML = Buffer.from( this.lockIcon, 'base64' ).toString( 'utf8' );
            }
            else {
                $( '#dc-lock-btn' ).attr( 'title', 'Enable Message Encryption' );
                $( '#dc-lock-btn' )[ 0 ].innerHTML = Buffer.from( this.unlockIcon, 'base64' ).toString( 'utf8' );
            }

            /* Set the button class. */
            $( '.dc-svg' ).attr( 'class', 'dc-svg' );
        }

        /* Inject the settings. */
        $( document.body ).prepend( this.settingsMenuHtml );

        /* Also by default, set the about tab to be shown. */
        discordCrypt.setActiveTab( 0 );

        /* Update all settings from the settings panel. */
        $( '#dc-settings-encrypt-trigger' )[ 0 ].value = this.configFile.encodeMessageTrigger;
        $( '#dc-settings-default-pwd' )[ 0 ].value = this.configFile.defaultPassword;
        $( '#dc-settings-scan-delay' )[ 0 ].value = this.configFile.encryptScanDelay;
        $( '#dc-settings-padding-mode' )[ 0 ].value = this.configFile.paddingMode.toLowerCase();
        $( '#dc-settings-cipher-mode' )[ 0 ].value = this.configFile.encryptBlockMode.toLowerCase();
        $( '#dc-primary-cipher' )[ 0 ].value = discordCrypt.cipherIndexToString( this.configFile.encryptMode, false );
        $( '#dc-secondary-cipher' )[ 0 ].value = discordCrypt.cipherIndexToString( this.configFile.encryptMode, true );

        /* Handle clipboard upload button. */
        $( '#dc-clipboard-upload-btn' ).click( discordCrypt.on_upload_encrypted_clipboard_button_clicked( this ) );

        /* Handle file button clicked. */
        $( '#dc-file-btn' ).click( discordCrypt.on_file_button_clicked );

        /* Handle alter file path button. */
        $( '#dc-select-file-path-btn' ).click( discordCrypt.on_alter_file_button_clicked );

        /* Handle file upload button. */
        $( '#dc-file-upload-btn' ).click( discordCrypt.on_upload_file_button_clicked( this ) );

        /* Handle file button cancelled. */
        $( '#dc-file-cancel-btn' ).click( discordCrypt.on_cancel_file_upload_button_clicked );

        /* Handle Settings tab opening. */
        $( '#dc-settings-btn' ).click( discordCrypt.on_settings_button_clicked );

        /* Handle Settings tab closing. */
        $( '#dc-exit-settings-btn' ).click( discordCrypt.on_settings_close_button_clicked );

        /* Handle Save settings. */
        $( '#dc-settings-save-btn' ).click( discordCrypt.on_save_settings_button_clicked( this ) );

        /* Handle Reset settings. */
        $( '#dc-settings-reset-btn' ).click( discordCrypt.on_reset_settings_button_clicked( this ) );

        /* Handle Restart-Now button clicking. */
        $( '#dc-restart-now-btn' ).click( discordCrypt.on_restart_now_button_clicked );

        /* Handle Restart-Later button clicking. */
        $( '#dc-restart-later-btn' ).click( discordCrypt.on_restart_later_button_clicked );

        /* Handle Info tab switch. */
        $( '#dc-tab-info-btn' ).click( discordCrypt.on_info_tab_button_clicked );

        /* Handle Keygen tab switch. */
        $( '#dc-tab-keygen-btn' ).click( discordCrypt.on_exchange_tab_button_clicked );

        /* Handle Handshake tab switch. */
        $( '#dc-tab-handshake-btn' ).click( discordCrypt.on_handshake_tab_button_clicked );

        /* Handle exit tab button. */
        $( '#dc-exit-exchange-btn' ).click( discordCrypt.on_close_exchange_button_clicked );

        /* Open exchange menu. */
        $( '#dc-exchange-btn' ).click( discordCrypt.on_open_exchange_button_clicked );

        /* Quickly generate and send a public key. */
        $( '#dc-quick-exchange-btn' ).click( discordCrypt.on_quick_send_public_key_button_clicked );

        /* Repopulate the bit length options for the generator when switching handshake algorithms. */
        $( '#dc-keygen-method' ).change( discordCrypt.on_exchange_algorithm_changed );

        /* Generate a new key-pair on clicking. */
        $( '#dc-keygen-gen-btn' ).click( discordCrypt.on_generate_new_key_pair_button_clicked );

        /* Clear the public & private key fields. */
        $( '#dc-keygen-clear-btn' ).click( discordCrypt.on_keygen_clear_button_clicked );

        /* Send the public key to the current channel. */
        $( '#dc-keygen-send-pub-btn' ).click( discordCrypt.on_keygen_send_public_key_button_clicked( this ) );

        /* Paste the data from the clipboard to the public key field. */
        $( '#dc-handshake-paste-btn' ).click( discordCrypt.on_handshake_paste_public_key_button_clicked );

        /* Compute the primary and secondary keys. */
        $( '#dc-handshake-compute-btn' ).click( discordCrypt.on_handshake_compute_button_clicked( this ) );

        /* Copy the primary and secondary key to the clipboard. */
        $( '#dc-handshake-cpy-keys-btn' ).click( discordCrypt.on_handshake_copy_keys_button_clicked );

        /* Apply generated keys to the current channel. */
        $( '#dc-handshake-apply-keys-btn' ).click( discordCrypt.on_handshake_apply_keys_button_clicked( this ) );

        /* Show the overlay when clicking the password button. */
        $( '#dc-passwd-btn' ).click( discordCrypt.on_passwd_button_clicked );

        /* Update the password for the user once clicked. */
        $( '#dc-save-pwd' ).click( discordCrypt.on_save_passwords_button_clicked( this ) );

        /* Reset the password for the user to the default. */
        $( '#dc-reset-pwd' ).click( discordCrypt.on_reset_passwords_button_clicked( this ) );

        /* Hide the overlay when clicking cancel. */
        $( '#dc-cancel-btn' ).click( discordCrypt.on_cancel_password_button_clicked );

        /* Copy the current passwords to the clipboard. */
        $( '#dc-cpy-pwds-btn' ).click( discordCrypt.on_copy_current_passwords_button_clicked( this ) );

        /* Set whether auto-encryption is enabled or disabled. */
        $( '#dc-lock-btn' ).click( discordCrypt.on_lock_button_clicked( this ) );
    }

    /**
     * @private
     * @desc Attached a handler to the message area and dispatches encrypted messages if necessary.
     */
    attachHandler() {
        const self = this;

        /* Get the text area. */
        let textarea = $( this.channelTextAreaClass );

        /* Make sure we got one element. */
        if ( textarea.length !== 1 )
            return;

        /* Replace any old handlers before adding the new one. */
        textarea.off( "keydown.dcrypt" ).on( "keydown.dcrypt", ( function ( e ) {
            let code = e.keyCode || e.which;

            /* Skip if we don't have a valid configuration. */
            if ( !self.configFile )
                return;

            /* Execute on ENTER/RETURN only. */
            if ( code !== 13 )
                return;

            /* Skip if shift key is down indicating going to a new line. */
            if ( e.shiftKey )
                return;

            /* Skip if autocomplete dialog is opened. */
            if ( !!$( self.autoCompleteClass )[ 0 ] )
                return;

            /* Send the encrypted message. */
            if ( self.sendEncryptedMessage( $( this ).val() ) != 0 )
                return;

            /* Clear text field. */
            discordCrypt.__getElementReactOwner( $( 'form' )[ 0 ] ).setState( { textValue: '' } );

            /* Cancel the default sending action. */
            e.preventDefault();
            e.stopPropagation();
        } ) );
    }

    /**
     * @private
     * @desc Parses a public key message and adds the exchange button to it if necessary.
     * @param {Object} obj The jQuery object of the current message being examined.
     * @returns {boolean} Returns true.
     */
    parseKeyMessage( obj ) {
        /* Extract the algorithm info from the message's metadata. */
        let metadata = discordCrypt.__extractKeyInfo( obj.text().replace( /\r?\n|\r/g, '' ), true );

        /* Compute the fingerprint of our currently known public key if any to determine if to proceed. */
        let local_fingerprint = discordCrypt.sha256( Buffer.from( $( '#dc-pub-key-ta' ).val(), 'hex' ), 'hex' );

        /* Skip if this is our current public key. */
        if ( metadata[ 'fingerprint' ] === local_fingerprint ) {
            obj.css( 'display', 'none' );
            return true;
        }

        /* Create a button allowing the user to perform a key exchange with this public key. */
        let button = $( "<button>Perform Key Exchange</button>" )
            .addClass( 'dc-button' )
            .addClass( 'dc-button-inverse' );

        /* Remove margins. */
        button.css( 'margin-left', '0' );
        button.css( 'margin-right', '0' );

        /* Move the button a bit down from the key's text. */
        button.css( 'margin-top', '2%' );

        /* Allow full width. */
        button.css( 'width', '100%' );

        /* Handle clicks. */
        button.click( ( function () {

            /* Simulate pressing the exchange key button. */
            $( '#dc-exchange-btn' ).click();

            /* If the current algorithm differs, change it and generate then send a new key. */
            if (
                $( '#dc-keygen-method' )[ 0 ].value !== metadata[ 'algorithm' ] ||
                parseInt( $( '#dc-keygen-algorithm' )[ 0 ].value ) !== metadata[ 'bit_length' ]
            ) {
                /* Switch. */
                $( '#dc-keygen-method' )[ 0 ].value = metadata[ 'algorithm' ];

                /* Fire the change event so the second list updates. */
                $( '#dc-keygen-method' ).change();

                /* Update the key size. */
                $( '#dc-keygen-algorithm' )[ 0 ].value = metadata[ 'bit_length' ];

                /* Generate a new key pair. */
                $( '#dc-keygen-gen-btn' ).click();

                /* Send the public key. */
                $( '#dc-keygen-send-pub-btn' ).click();
            }
            /* If we don't have a key yet, generate and send one. */
            else if ( $( '#dc-pub-key-ta' )[ 0 ].value === '' ) {
                /* Generate a new key pair. */
                $( '#dc-keygen-gen-btn' ).click();

                /* Send the public key. */
                $( '#dc-keygen-send-pub-btn' ).click();
            }

            /* Open the handshake menu. */
            $( '#dc-tab-handshake-btn' ).click();

            /* Apply the key to the field. */
            $( '#dc-handshake-ppk' )[ 0 ].value = obj.text();

            /* Click compute. */
            $( '#dc-handshake-compute-btn' ).click();
        } ) );

        /* Add the button. */
        obj.parent().append( button );

        /* Set the text to an identifiable color. */
        obj.css( 'color', 'blue' );

        return true;
    }

    /**
     * @private
     * @desc Parses a message object and attempts to decrypt it..
     * @param {Object} obj The jQuery object of the current message being examined.
     * @param {string} primaryKey The primary key used to decrypt the message.
     * @param {string} secondaryKey The secondary key used to decrypt the message.
     * @param {Object} ReactModules The modules retrieved by calling getReactModules()
     * @returns {boolean} Returns true if the message has been decrypted.
     */
    parseSymmetric( obj, primaryKey, secondaryKey, ReactModules ) {
        let message = $( obj );
        let dataMsg;

        /**************************************************************************************************************
         *  MESSAGE FORMAT:
         *
         *  + 0x0000 [ 4        Chars ] - Message Magic | Key Magic
         *  + 0x0004 [ 8 ( #4 ) Chars ] - Message Metadata ( #1 ) | Key Data ( #3 )
         *  + 0x000C [ ?        Chars ] - Cipher Text
         *
         *  * 0x0004 - Options - Substituted Base64 encoding of a single word stored in Little Endian.
         *      [ 31 ... 24 ] - Algorithm ( 0-24 = Dual )
         *      [ 23 ... 16 ] - Block Mode ( 0 = CBC | 1 = CFB | 2 = OFB )
         *      [ 15 ... 08 ] - Padding Mode ( #2 )
         *      [ 07 ... 00 ] - Random Padding Byte
         *
         *  #1 - Substitute( Base64( Encryption Algorithm << 24 | Padding Mode << 16 | Block Mode << 8 | RandomByte ) )
         *  #2 - ( 0 - PKCS #7 | 1 = ANSI X9.23 | 2 = ISO 10126 | 3 = ISO97971 )
         *  #3 - Substitute( Base64( ( Key Algorithm Type & 0xff ) + Public Key ) )
         *  #4 - 8 Byte Metadata For Messages Only
         *
         **************************************************************************************************************/

        /* Skip if the message is <= size of the total header. */
        if ( message.text().length <= 12 )
            return false;

        /* Split off the magic. */
        let magic = message.text().slice( 0, 4 );

        /* If this is a public key, just add a button and continue. */
        if ( magic === this.encodedKeyHeader )
            return this.parseKeyMessage( message );

        /* Make sure it has the correct header. */
        if ( magic !== this.encodedMessageHeader )
            return false;

        /* Try to deserialize the metadata. */
        let metadata = discordCrypt.metaDataDecode( message.text().slice( 4, 12 ) );

        /* Try looking for an algorithm, mode and padding type. */
        /* Algorithm first. */
        if ( metadata[ 0 ] >= this.encryptModes.length )
            return false;

        /* Cipher mode next. */
        if ( metadata[ 1 ] >= this.encryptBlockModes.length )
            return false;

        /* Padding after. */
        if ( metadata[ 2 ] >= this.paddingModes.length )
            return false;

        /* Decrypt the message. */
        dataMsg = discordCrypt.symmetricDecrypt( message.text().replace( /\r?\n|\r/g, '' )
            .substr( 12 ), primaryKey, secondaryKey, metadata[ 0 ], metadata[ 1 ], metadata[ 2 ], true );

        /* If decryption didn't fail, set the decoded text along with a green foreground. */
        if ( ( typeof dataMsg === 'string' || dataMsg instanceof String ) && dataMsg !== "" ) {
            /* Expand the message to the maximum width. */
            message.parent().parent().parent().parent().css( 'max-width', '100%' );

            /* Process the message and apply all necessary element modifications. */
            dataMsg = discordCrypt.postProcessMessage( dataMsg, this.configFile.up1Host );

            /* Set the new HTML. */
            message[ 0 ].innerHTML = dataMsg.html;

            /* If this contains code blocks, highlight them. */
            if ( dataMsg.code ) {
                /* Sanity check. */
                if ( ReactModules.HighlightJS !== null ) {

                    /* The inner element contains a <span></span> class, get all children beneath that. */
                    let elements = $( message.children()[ 0 ] ).children();

                    /* Loop over each element to get the markup division list. */
                    for ( let i = 0; i < elements.length; i++ ) {
                        /* Highlight the element's <pre><code></code></code> block. */
                        ReactModules.HighlightJS.highlightBlock( $( elements[ i ] ).children()[ 0 ] );

                        /* Reset the class name. */
                        $( elements[ i ] ).children()[ 0 ].className = 'hljs';
                    }
                }
                else
                    discordCrypt.log( 'Could not locate HighlightJS module!', 'error' );
            }

            /* Decrypted messages get set to green. */
            message.css( 'color', 'green' );
        }
        else {
            /* If it failed, set a red foreground and set a decryption failure message to prevent further retries. */
            if ( dataMsg === 1 )
                message.text( '[ ERROR ] AUTHENTICATION OF CIPHER TEXT FAILED !!!' );
            else if ( dataMsg === 2 )
                message.text( '[ ERROR ] FAILED TO DECRYPT CIPHER TEXT !!!' );
            else
                message.text( '[ ERROR ] DECRYPTION FAILURE. INVALID KEY OR MALFORMED MESSAGE !!!' );
            message.css( 'color', 'red' );
        }

        /* Message has been parsed. */
        return true;
    }

    /**
     * @private
     * @desc Processes a decrypted message and formats any elements needed in HTML.
     * @param message The message to process.
     * @param {string} [embed_link_prefix] Optional search link prefix for URLs to embed in frames.
     * @returns {{url: boolean, code: boolean, html: (string|*)}}
     */
    static postProcessMessage( message, embed_link_prefix ) {
        /* HTML escape characters. */
        const html_escape_characters = { '&': '&amp;', '<': '&lt', '>': '&gt;' };

        /* Remove any injected HTML. */
        message = message.replace( /[&<>]/g, x => html_escape_characters[ x ] );

        /* Extract any code blocks from the message. */
        let processed = discordCrypt.__buildCodeBlockMessage( message );
        let hasCode = processed.code;

        /* Extract any URLs. */
        processed = discordCrypt.__buildUrlMessage( processed.html, embed_link_prefix );
        let hasUrl = processed.url;

        /* Return the raw HTML. */
        return {
            url: hasUrl,
            code: hasCode,
            html: processed.html,
        };
    }

    /**
     * @private
     * @desc Iterates all messages in the current channel and tries to decrypt each, skipping cached results.
     */
    decodeMessages() {
        /* Skip if a valid configuration file has not been loaded. */
        if ( !this.configFile || !this.configFile.version )
            return;

        /* Save self. */
        const self = this;

        /* Get the current channel ID. */
        let id = discordCrypt.getChannelId();

        /* Use the default password for decryption if one hasn't been defined for this channel. */
        let password = Buffer.from(
            this.configFile.passList[ id ] && this.configFile.passList[ id ].primary ?
                this.configFile.passList[ id ].primary :
                this.configFile.defaultPassword
        );
        let secondary = Buffer.from(
            this.configFile.passList[ id ] && this.configFile.passList[ id ].secondary ?
                this.configFile.passList[ id ].secondary :
                this.configFile.defaultPassword
        );

        /* Look through each markup element to find an embedDescription. */
        let React = discordCrypt.getReactModules();
        $( this.messageMarkupClass ).each( ( function () {
            /* Skip classes with no embeds. */
            if ( !this.className.includes( 'embedDescription' ) )
                return;

            /* Skip parsed messages. */
            if ( $( this ).data( 'dc-parsed' ) !== undefined )
                return;

            /* Try parsing a symmetric message. */
            self.parseSymmetric( this, password, secondary, React );

            /* Set the flag. */
            $( this ).data( 'dc-parsed', true );
        } ) );
    }

    /**
     * @private
     * @desc Sends an encrypted message to the current channel.
     * @param {string} message The unencrypted message to send.
     * @param {boolean} force_send Whether to ignore checking for the encryption trigger and always encrypt and send.
     * @returns {number} Returns 1 if the message failed to be parsed correctly and 0 on success.
     * @param {int|undefined} channel_id If specified, sends the embedded message to this channel instead of the
     *      current channel.
     */
    sendEncryptedMessage( message, force_send = false, channel_id = undefined ) {
        /* Let's use a maximum message size of 1200 instead of 2000 to account for encoding, new line feeds & packet
         header. */
        const maximum_encoded_data = 1200;

        /* Add the message signal handler. */
        const escapeCharacters = [ "#", "/", ":" ];
        const crypto = require( 'crypto' );

        let cleaned;

        /* Skip messages starting with pre-defined escape characters. */
        if ( escapeCharacters.indexOf( message[ 0 ] ) !== -1 )
            return 1;

        /* If we're not encoding all messages or we don't have a password, strip off the magic string. */
        if ( force_send === false &&
            ( !this.configFile.passList[ discordCrypt.getChannelId() ] ||
                !this.configFile.passList[ discordCrypt.getChannelId() ].primary ||
                !this.configFile.encodeAll )
        ) {
            /* Try splitting via the defined split-arg. */
            message = message.split( '|' );

            /* Check if the message actually has the split arg. */
            if ( message.length <= 0 )
                return 1;

            /* Check if it has the trigger. */
            if ( message[ message.length - 1 ] !== this.configFile.encodeMessageTrigger )
                return 1;

            /* Use the first part of the message. */
            cleaned = message[ 0 ];
        }
        /* Make sure we have a valid password. */
        else {
            /* Use the whole message. */
            cleaned = message;
        }

        /* Check if we actually have a message ... */
        if ( cleaned.length === 0 )
            return 1;

        /* Try parsing any user-tags. */
        let parsed = discordCrypt.__extractTags( cleaned );

        /* Sanity check for messages with just spaces or new line feeds in it. */
        if ( parsed[ 0 ].length !== 0 ) {
            /* Extract the message to be encrypted. */
            cleaned = parsed[ 0 ];
        }

        /* Add content tags. */
        let user_tags = parsed[ 1 ].length > 0 ? parsed[ 1 ] : '';

        /* Get the passwords. */
        let primaryPassword = Buffer.from(
            this.configFile.passList[ discordCrypt.getChannelId() ] ?
                this.configFile.passList[ discordCrypt.getChannelId() ].primary :
                this.configFile.defaultPassword
        );

        let secondaryPassword = Buffer.from(
            this.configFile.passList[ discordCrypt.getChannelId() ] ?
                this.configFile.passList[ discordCrypt.getChannelId() ].secondary :
                this.configFile.defaultPassword
        );

        /* Returns the number of bytes a given string is in Base64. */
        function getBase64EncodedLength( len ) {
            return parseInt( ( len / 3 ) * 4 ) % 4 === 0 ? ( len / 3 ) * 4 :
                parseInt( ( len / 3 ) * 4 ) + 4 - ( parseInt( ( len / 3 ) * 4 ) % 4 );
        }

        /* If the message length is less than the threshold, we can send it without splitting. */
        if ( getBase64EncodedLength( cleaned.length ) < maximum_encoded_data ) {
            /* Encrypt the message. */
            let msg = discordCrypt.symmetricEncrypt(
                cleaned,
                primaryPassword,
                secondaryPassword,
                this.configFile.encryptMode,
                this.configFile.encryptBlockMode,
                this.configFile.paddingMode,
                true
            );

            /* Append the header to the message normally. */
            msg = this.encodedMessageHeader + discordCrypt.metaDataEncode
            (
                this.configFile.encryptMode,
                this.configFile.encryptBlockMode,
                this.configFile.paddingMode,
                parseInt( crypto.randomBytes( 1 )[ 0 ] )
            ) + msg;

            /* Break up the message into lines. */
            msg = msg.replace( /(.{32})/g, ( e ) => {
                return e + "\r\n"
            } );

            /* Send the message. */
            discordCrypt.sendEmbeddedMessage(
                msg,
                this.messageHeader,
                'v' + this.getVersion().replace( '-debug', '' ),
                0x551A8B,
                user_tags,
                channel_id
            );
        }
        else {
            /* Determine how many packets we need to split this into. */
            let packets = discordCrypt.__splitStringChunks( cleaned, maximum_encoded_data );
            for ( let i = 0; i < packets.length; i++ ) {
                /* Encrypt the message. */
                let msg = discordCrypt.symmetricEncrypt(
                    packets[ i ],
                    primaryPassword,
                    secondaryPassword,
                    this.configFile.encryptMode,
                    this.configFile.encryptBlockMode,
                    this.configFile.paddingMode,
                    true
                );

                /* Append the header to the message normally. */
                msg = this.encodedMessageHeader + discordCrypt.metaDataEncode
                (
                    this.configFile.encryptMode,
                    this.configFile.encryptBlockMode,
                    this.configFile.paddingMode,
                    parseInt( crypto.randomBytes( 1 )[ 0 ] )
                ) + msg;

                /* Break up the message into lines. */
                msg = msg.replace( /(.{32})/g, ( e ) => {
                    return e + "\r\n"
                } );

                /* Send the message. */
                discordCrypt.sendEmbeddedMessage(
                    msg,
                    this.messageHeader,
                    'v' + this.getVersion().replace( '-debug', '' ),
                    0x551A8B,
                    i === 0 ? user_tags : '',
                    channel_id
                );
            }
        }

        return 0;
    }

    /* =============== BEGIN UI HANDLE CALLBACKS =============== */

    /**
     * @private
     * @desc Opens the file uploading menu.
     */
    static on_file_button_clicked() {
        /* Show main background. */
        $( '#dc-overlay' )[ 0 ].style.display = 'block';

        /* Show the upload overlay. */
        $( '#dc-overlay-upload' )[ 0 ].style.display = 'block';
    }

    /**
     * @private
     * @desc Opens the file menu selection.
     */
    static on_alter_file_button_clicked() {
        /* Create an input element. */
        let file = require( 'electron' ).remote.dialog.showOpenDialog( {
            title: 'Select a file to encrypt and upload',
            label: 'Select',
            message: 'Maximum file size is 50 MB',
            properties: [ 'openFile', 'showHiddenFiles', 'treatPackageAsDirectory' ]
        } );

        /* Ignore if no file was selected. */
        if ( !file.length || !file[ 0 ].length )
            return;

        /* Set the file path to the selected path. */
        $( '#dc-file-path' ).val( file[ 0 ] );
    }

    /**
     * @private
     * @desc Uploads the clipboard's current contents and sends the encrypted link.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_upload_encrypted_clipboard_button_clicked( /* discordCrypt */ self ) {
        return () => {
            /* Since this is an async operation, we need to backup the channel ID before doing this. */
            let channel_id = discordCrypt.getChannelId();

            /* Upload the clipboard. */
            discordCrypt.__up1UploadClipboard(
                self.configFile.up1Host,
                self.configFile.up1ApiKey,
                sjcl,
                ( error_string, file_url, deletion_link ) => {
                    /* Do some sanity checking. */
                    if ( error_string !== null || typeof file_url !== 'string' || typeof deletion_link !== 'string' ) {
                        _alert( error_string, 'Failed to upload the clipboard!' );
                        return;
                    }

                    /* Format and send the message. */
                    self.sendEncryptedMessage( `${file_url}`, true, channel_id );

                    /* Copy the deletion link to the clipboard. */
                    require( 'electron' ).clipboard.writeText( `Delete URL: ${deletion_link}` );
                }
            );
        };
    }

    /**
     * @private
     * @desc  Uploads the selected file and sends the encrypted link.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_upload_file_button_clicked( /* discordCrypt */ self ) {
        return () => {
            const fs = require( 'original-fs' );

            let file_path_field = $( '#dc-file-path' );
            let file_upload_btn = $( '#dc-file-upload-btn' );
            let message_textarea = $( '#dc-file-message-textarea' );
            let send_deletion_link = $( '#dc-file-deletion-checkbox' ).is( ':checked' );
            let randomize_file_name = $( '#dc-file-name-random-checkbox' ).is( ':checked' );

            /* Send the additional text first if it's valid. */
            if ( message_textarea.val().length > 0 )
                self.sendEncryptedMessage( message_textarea.val(), true );

            /* Since this is an async operation, we need to backup the channel ID before doing this. */
            let channel_id = discordCrypt.getChannelId();

            /* Clear the message field. */
            message_textarea.val( '' );

            /* Sanity check the file. */
            if ( !fs.existsSync( file_path_field.val() ) ) {
                file_path_field.val( '' );
                return;
            }

            /* Set the status text. */
            file_upload_btn.text( 'Uploading ...' );
            file_upload_btn[ 0 ].className = 'dc-button dc-button-inverse';

            /* Upload the file. */
            discordCrypt.__up1UploadFile(
                file_path_field.val(),
                self.configFile.up1Host,
                self.configFile.up1ApiKey,
                sjcl,
                ( error_string, file_url, deletion_link ) => {
                    /* Do some sanity checking. */
                    if ( error_string !== null || typeof file_url !== 'string' || typeof deletion_link !== 'string' ) {
                        /* Set the status text. */
                        file_upload_btn.text( 'Failed to upload the file!' );
                        discordCrypt.log( error_string, 'error' );

                        /* Clear the file path. */
                        file_path_field.val( '' );

                        /* Reset the status text after 1 second. */
                        setTimeout( () => {
                            file_upload_btn.text( 'Upload' );
                            file_upload_btn[ 0 ].className = 'dc-button';
                        }, 1000 );

                        return;
                    }

                    /* Format and send the message. */
                    self.sendEncryptedMessage(
                        `${file_url}${send_deletion_link ? '\n\nDelete URL: ' + deletion_link : ''}`,
                        true,
                        channel_id
                    );

                    /* Clear the file path. */
                    file_path_field.val( '' );

                    /* Indicate success. */
                    file_upload_btn.text( 'Upload Successful!' );

                    /* Reset the status text after 1 second and close the dialog. */
                    setTimeout( () => {
                        file_upload_btn.text( 'Upload' );
                        file_upload_btn[ 0 ].className = 'dc-button';

                        /* Close. */
                        $( '#dc-file-cancel-btn' ).click();
                    }, 1000 );
                },
                randomize_file_name
            );
        };
    }

    /**
     * @private
     * @desc Closes the file upload dialog.
     */
    static on_cancel_file_upload_button_clicked() {
        /* Clear old file name. */
        $( '#dc-file-path' ).val( '' );

        /* Show main background. */
        $( '#dc-overlay' )[ 0 ].style.display = 'none';

        /* Show the upload overlay. */
        $( '#dc-overlay-upload' )[ 0 ].style.display = 'none';
    }

    /**
     * @private
     * @desc Opens the settings menu.
     */
    static on_settings_button_clicked() {
        /* Show main background. */
        $( '#dc-overlay' )[ 0 ].style.display = 'block';

        /* Show the main settings menu. */
        $( '#dc-overlay-settings' )[ 0 ].style.display = 'block';
    }

    /**
     * @private
     * @desc Closes the settings menu.
     */
    static on_settings_close_button_clicked() {
        /* Hide main background. */
        $( '#dc-overlay' )[ 0 ].style.display = 'none';

        /* Hide the main settings menu. */
        $( '#dc-overlay-settings' )[ 0 ].style.display = 'none';
    }

    /**
     * @private
     * @desc Saves all settings.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_save_settings_button_clicked( /* discordCrypt */ self ) {
        return () => {
            /* Update all settings from the settings panel. */
            self.configFile.encodeMessageTrigger = $( '#dc-settings-encrypt-trigger' )[ 0 ].value;
            self.configFile.encryptBlockMode = $( '#dc-settings-cipher-mode' )[ 0 ].value;
            self.configFile.defaultPassword = $( '#dc-settings-default-pwd' )[ 0 ].value;
            self.configFile.encryptScanDelay = $( '#dc-settings-scan-delay' )[ 0 ].value;
            self.configFile.paddingMode = $( '#dc-settings-padding-mode' )[ 0 ].value;
            self.configFile.encryptMode = discordCrypt
                .cipherStringToIndex( $( '#dc-primary-cipher' )[ 0 ].value, $( '#dc-secondary-cipher' )[ 0 ].value );

            $( '#dc-primary-cipher' )[ 0 ].value = discordCrypt
                .cipherIndexToString( self.configFile.encryptMode, false );
            $( '#dc-secondary-cipher' )[ 0 ].value = discordCrypt
                .cipherIndexToString( self.configFile.encryptMode, true );

            /* Handle master password updates if necessary. */
            if ( $( '#dc-master-password' )[ 0 ].value !== '' ) {
                let password = $( '#dc-master-password' )[ 0 ].value;

                /* Reset the password field. */
                $( '#dc-master-password' )[ 0 ].value = '';

                /* Hash the password. */
                discordCrypt.scrypt
                (
                    Buffer.from( password ),
                    Buffer.from( discordCrypt.whirlpool( password, true ), 'hex' ),
                    32,
                    4096,
                    8,
                    1,
                    ( error, progress, pwd ) => {
                        if ( error ) {
                            /* Alert the user. */
                            _alert( 'Error setting the new database password. Check the console for more info.' );

                            discordCrypt.log( error.toString(), 'error' );
                            return true;
                        }

                        if ( pwd ) {
                            /* Now update the password. */
                            self.masterPassword = Buffer.from( pwd, 'hex' );

                            /* Save the configuration file and update the button text. */
                            self.saveSettings( $( '#dc-settings-save-btn' )[ 0 ] );
                        }

                        return false;
                    }
                );
            }
            else {
                /* Save the configuration file and update the button text. */
                self.saveSettings( $( '#dc-settings-save-btn' )[ 0 ] );
            }
        };
    }

    /**
     * @private
     * @desc Resets the user settings to their default values.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_reset_settings_button_clicked( /* discordCrypt */ self ) {
        return () => {
            /* Resets the configuration file and update the button text. */
            self.resetSettings( $( '#dc-settings-reset-btn' )[ 0 ] );

            /* Update all settings from the settings panel. */
            $( '#dc-master-password' )[ 0 ].value = '';
            $( '#dc-settings-default-pwd' )[ 0 ].value = self.configFile.defaultPassword;
            $( '#dc-settings-scan-delay' )[ 0 ].value = self.configFile.encryptScanDelay;
            $( '#dc-settings-encrypt-trigger' )[ 0 ].value = self.configFile.encodeMessageTrigger;
            $( '#dc-settings-padding-mode' )[ 0 ].value = self.configFile.paddingMode.toLowerCase();
            $( '#dc-settings-cipher-mode' )[ 0 ].value = self.configFile.encryptBlockMode.toLowerCase();
            $( '#dc-primary-cipher' )[ 0 ].value = discordCrypt
                .cipherIndexToString( self.configFile.encryptMode, false );
            $( '#dc-secondary-cipher' )[ 0 ].value = discordCrypt
                .cipherIndexToString( self.configFile.encryptMode, true );
        };
    }

    /**
     * @private
     * @desc Restarts the app by performing a window.location.reload()
     */
    static on_restart_now_button_clicked() {
        /* Window reload is simple enough. */
        location.reload();
    }

    /**
     * @private
     * @desc Closes the upload available panel.
     */
    static on_restart_later_button_clicked() {
        /* Hide the update and changelog. */
        $( '#dc-overlay' )[ 0 ].style.display = 'none';
        $( '#dc-update-overlay' )[ 0 ].style.display = 'none';
    }

    /**
     * @private
     * @desc Switches view to the Info tab.
     */
    static on_info_tab_button_clicked() {
        /* Switch to tab 0. */
        discordCrypt.setActiveTab( 0 );
    }

    /**
     * @private
     * @desc Switches view to the Key Exchange tab.
     */
    static on_exchange_tab_button_clicked() {
        /* Switch to tab 1. */
        discordCrypt.setActiveTab( 1 );
    }

    /**
     * @private
     * @desc Switches view to the Handshake tab.
     */
    static on_handshake_tab_button_clicked() {
        /* Switch to tab 2. */
        discordCrypt.setActiveTab( 2 );
    }

    /**
     * @private
     * @desc Closes the key exchange menu.
     */
    static on_close_exchange_button_clicked() {
        /* Hide main background. */
        $( '#dc-overlay' )[ 0 ].style.display = 'none';

        /* Hide the entire exchange key menu. */
        $( '#dc-overlay-exchange' )[ 0 ].style.display = 'none';
    }

    /**
     * @private
     * @desc Opens the key exchange menu.
     */
    static on_open_exchange_button_clicked() {
        /* Show background. */
        $( '#dc-overlay' )[ 0 ].style.display = 'block';

        /* Show main menu. */
        $( '#dc-overlay-exchange' )[ 0 ].style.display = 'block';
    }

    /**
     * @private
     * @desc Generates and sends a new public key.
     */
    static on_quick_send_public_key_button_clicked() {
        /* Don't bother opening a menu. Just generate the key. */
        $( '#dc-keygen-gen-btn' ).click();

        /* Now send it. */
        $( '#dc-keygen-send-pub-btn' ).click();
    }

    /**
     * @private
     * @desc Switches the key lengths to their correct values.
     */
    static on_exchange_algorithm_changed() {
        /* Variable bit lengths. */
        let dh_bl = discordCrypt.getDHBitSizes(), ecdh_bl = discordCrypt.getECDHBitSizes();

        /* Clear the old select list. */
        $( '#dc-keygen-algorithm option' ).each( ( function () {
            $( this ).remove();
        } ) );

        /* Repopulate the entries. */
        switch ( $( '#dc-keygen-method' )[ 0 ].value ) {
            case 'dh':
                for ( let i = 0; i < dh_bl.length; i++ ) {
                    let v = dh_bl[ i ];
                    $( '#dc-keygen-algorithm' )[ 0 ].append( new Option( v, v, i === ( dh_bl.length - 1 ) ) );
                }
                break;
            case 'ecdh':
                for ( let i = 0; i < ecdh_bl.length; i++ ) {
                    let v = ecdh_bl[ i ];
                    $( '#dc-keygen-algorithm' )[ 0 ].append( new Option( v, v, i === ( ecdh_bl.length - 1 ) ) );
                }
                break;
            default:
                return;
        }
    }

    /**
     * @private
     * @desc Generates a new key pair using the selected algorithm.
     */
    static on_generate_new_key_pair_button_clicked() {
        let dh_bl = discordCrypt.getDHBitSizes(), ecdh_bl = discordCrypt.getECDHBitSizes();
        let max_salt_len = 32, min_salt_len = 16, salt_len;
        let index, raw_buffer, pub_buffer;
        let key, crypto = require( 'crypto' );

        /* Get the current algorithm. */
        switch ( $( '#dc-keygen-method' )[ 0 ].value ) {
            case 'dh':
                /* Generate a new Diffie-Hellman RSA key from the bit size specified. */
                key = discordCrypt.generateDH( parseInt( $( '#dc-keygen-algorithm' )[ 0 ].value ) );

                /* Calculate the index number starting from 0. */
                index = dh_bl.indexOf( parseInt( $( '#dc-keygen-algorithm' )[ 0 ].value ) );
                break;
            case 'ecdh':
                /* Generate a new Elliptic-Curve Diffie-Hellman key from the bit size specified. */
                key = discordCrypt.generateECDH( parseInt( $( '#dc-keygen-algorithm' )[ 0 ].value ) );

                /* Calculate the index number starting from dh_bl.length. */
                index = ( ecdh_bl.indexOf( parseInt( $( '#dc-keygen-algorithm' )[ 0 ].value ) ) + dh_bl.length );
                break;
            default:
                /* Should never happen. */
                return;
        }

        /* Sanity check. */
        if (
            !key ||
            key === undefined ||
            typeof key.getPrivateKey === 'undefined' ||
            typeof key.getPublicKey === 'undefined'
        )
            return;

        /* Copy the private key to this instance. */
        discordCrypt.privateExchangeKey = key;

        /*****************************************************************************************
         *   [ PUBLIC PAYLOAD STRUCTURE ]
         *   +0x00 - Algorithm + Bit size [ 0-6 = DH ( 768, 1024, 1536, 2048, 3072, 4096, 8192 ) |
         *                                  7-12 = ECDH ( 224, 256, 384, 409, 521, 571 ) ]
         *   +0x01 - Salt length
         *   +0x02 - Salt[ Salt.length ]
         *   +0x02 + Salt.length - Public key
         ****************************************************************************************/

        /* Calculate a random salt length. */
        salt_len = ( parseInt( crypto.randomBytes( 1 ).toString( 'hex' ), 16 ) % ( max_salt_len - min_salt_len ) ) +
            min_salt_len;

        /* Copy the buffer. */
        pub_buffer = Buffer.from(
            key.getPublicKey( 'hex', $( '#dc-keygen-method' )[ 0 ].value === 'ecdh' ?
                'compressed' :
                undefined
            ),
            'hex'
        );

        /* Create a blank payload. */
        raw_buffer = Buffer.alloc( 2 + salt_len + pub_buffer.length );

        /* Write the algorithm index. */
        raw_buffer.writeInt8( index, 0 );

        /* Write the salt length. */
        raw_buffer.writeInt8( salt_len, 1 );

        /* Generate a random salt and copy it to the buffer. */
        crypto.randomBytes( salt_len ).copy( raw_buffer, 2 );

        /* Copy the public key to the buffer. */
        pub_buffer.copy( raw_buffer, 2 + salt_len );

        /* Get the public key then display it. */
        $( '#dc-pub-key-ta' )[ 0 ].value = raw_buffer.toString( 'hex' );

        /* Get the private key then display it. */
        $( '#dc-priv-key-ta' )[ 0 ].value = key.getPrivateKey( 'hex' );
    }

    /**
     * @private
     * @desc Clears any public and private keys generated.
     */
    static on_keygen_clear_button_clicked() {
        /* Clear the key textareas. */
        $( '#dc-pub-key-ta' )[ 0 ].value = $( '#dc-priv-key-ta' )[ 0 ].value = '';
    }

    /**
     * @private
     * @desc Sends the currently generate public key in the correct format.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_keygen_send_public_key_button_clicked( /* discordCrypt */ self ) {
        return () => {
            /* Don't bother if it's empty. */
            if ( $( '#dc-pub-key-ta' )[ 0 ].value === '' )
                return;

            /* The text area stores a hex encoded binary. Convert it to a Base64 message to save space. */
            let message = Buffer.from( $( '#dc-pub-key-ta' )[ 0 ].value, 'hex' ).toString( 'base64' );

            /* Add the header to the message and encode it. */
            message = self.encodedKeyHeader + discordCrypt.substituteMessage( message, true );

            /* Split the message by adding a new line every 32 characters like a standard PGP message. */
            let formatted_message = message.replace( /(.{32})/g, ( e ) => {
                return e + "\r\n"
            } );

            /* Calculate the algorithm string. */
            let algo_str = ( $( '#dc-keygen-method' )[ 0 ].value !== 'ecdh' ? 'DH-' : 'ECDH-' ) +
                $( '#dc-keygen-algorithm' )[ 0 ].value;

            /* Send the message. */
            let header = `-----BEGIN ${algo_str} PUBLIC KEY-----`,
                footer = `-----END ${algo_str} PUBLIC KEY----- | v${self.getVersion().replace( '-debug', '' )}`;

            discordCrypt.sendEmbeddedMessage( formatted_message, header, footer, 0x720000 );

            /* Update the button text & reset after 1 second.. */
            $( '#dc-keygen-send-pub-btn' )[ 0 ].innerText = 'Sent The Public Key!';

            setTimeout( ( function () {
                $( '#dc-keygen-send-pub-btn' )[ 0 ].innerText = 'Send Public Key';
            } ), 1000 );
        };
    }

    /**
     * @private
     * @desc Pastes what is stored in the clipboard to the handshake public key field.
     */
    static on_handshake_paste_public_key_button_clicked() {
        $( '#dc-handshake-ppk' )[ 0 ].value = require( 'electron' ).clipboard.readText();
    }

    /**
     * @private
     * @desc Computes a shared secret and generates passwords based on a DH/ECDH key exchange.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_handshake_compute_button_clicked( /* discordCrypt */ self ) {
        return () => {
            let value, algorithm, payload, salt_len, salt, user_salt_len, user_salt;
            let isUserSaltPrimary;

            /* Provide some way of showing the user the result without actually giving it away. */
            function displaySecret( input_hex ) {
                const charset = "!@#$%^&*()_-+=[{]}\\|'\";:/?.>,<";
                let output = '';

                for ( let i = 0; i < parseInt( input_hex.length / 2 ); i++ )
                    output += charset[ parseInt( input_hex.substr( i * 2, 2 ) ) & ( charset.length - 1 ) ];

                return output;
            }

            /* Skip if no public key was entered. */
            if ( !$( '#dc-handshake-ppk' )[ 0 ].value || !$( '#dc-handshake-ppk' )[ 0 ].value.length )
                return;

            /* Skip if the user hasn't generated a key of their own. */
            if ( !$( '#dc-pub-key-ta' )[ 0 ].value || !$( '#dc-pub-key-ta' )[ 0 ].value.length ) {
                /* Update the text. */
                $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'You Didn\'t Generate A Key!';
                setTimeout( ( function () {
                    $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Compute Secret Keys';
                } ), 1000 );
                return;
            }

            /* Check if the message header is valid. */
            if (
                $( '#dc-handshake-ppk' )[ 0 ].value.replace( /\r?\n|\r/g, "" )
                    .slice( 0, 4 ) !== self.encodedKeyHeader
            )
                return;

            /* Snip off the header. */
            let blob = $( '#dc-handshake-ppk' )[ 0 ].value.replace( /\r?\n|\r/g, "" ).slice( 4 );

            /* Skip if invalid UTF-16 encoded message. */
            if ( !discordCrypt.isValidUtf16( blob ) )
                return;

            try {
                /* Decode the message. */
                value = Buffer.from( discordCrypt.substituteMessage( blob ), 'base64' );
            }
            catch ( e ) {
                /* Update the text. */
                $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Invalid Public Key!';
                setTimeout( ( function () {
                    $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Compute Secret Keys';
                } ), 1000 );
                return;
            }

            /* Check the algorithm they're using is the same as ours. */
            algorithm = value.readInt8( 0 );

            /* Check the algorithm is valid. */
            if ( !discordCrypt.isValidExchangeAlgorithm( algorithm ) ) {
                /* Update the text. */
                $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Invalid Algorithm!';
                setTimeout( ( function () {
                    $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Compute Secret Keys';
                } ), 1000 );
                return;
            }

            /* Read the user's generated public key. */
            let user_pub_key = Buffer.from( $( '#dc-pub-key-ta' )[ 0 ].value, 'hex' );

            /* Check the algorithm used is the same as ours. */
            if ( user_pub_key.readInt8( 0 ) !== algorithm ) {
                /* Update the text. */
                $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Mismatched Algorithm!';
                setTimeout( ( function () {
                    $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Compute Secret Keys';
                } ), 1000 );
                return;
            }

            /* Update the algorithm text. */
            $( '#dc-handshake-algorithm' )[ 0 ].innerText = 'Exchange Algorithm: ' +
                discordCrypt.indexToExchangeAlgorithmString( algorithm );

            /* Get the salt length. */
            salt_len = value.readInt8( 1 );

            /* Make sure the salt length is valid. */
            if ( salt_len < 16 || salt_len > 32 ) {
                /* Update the text. */
                $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Invalid Salt Length!';
                setTimeout( ( function () {
                    $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Compute Secret Keys';
                } ), 1000 );
                return;
            }

            /* Read the public salt. */
            salt = Buffer.from( value.subarray( 2, 2 + salt_len ) );

            /* Read the user's salt length. */
            user_salt_len = user_pub_key.readInt8( 1 );

            /* Read the user salt. */
            user_salt = Buffer.from( user_pub_key.subarray( 2, 2 + user_salt_len ) );

            /* Update the salt text. */
            $( '#dc-handshake-salts' )[ 0 ].innerText =
                `Salts: [ ${displaySecret( salt.toString( 'hex' ) )}, ` +
                `${displaySecret( user_salt.toString( 'hex' ) )} ]`;

            /* Read the public key and convert it to a hex string. */
            payload = Buffer.from( value.subarray( 2 + salt_len ) ).toString( 'hex' );

            /* Return if invalid. */
            if ( !discordCrypt.privateExchangeKey || discordCrypt.privateExchangeKey === undefined ||
                typeof discordCrypt.privateExchangeKey.computeSecret === 'undefined' ) {
                /* Update the text. */
                $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Failed To Calculate Private Key!';
                setTimeout( ( function () {
                    $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Compute Secret Keys';
                } ), 1000 );
                return;
            }

            /* Compute the local secret as a hex string. */
            let derived_secret =
                discordCrypt.computeExchangeSharedSecret( discordCrypt.privateExchangeKey, payload, false, false );

            /* Show error and quit if derivation fails. */
            if ( !derived_secret || !derived_secret.length ) {
                /* Update the text. */
                $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Failed To Derive Key!';
                setTimeout( ( function () {
                    $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Compute Secret Keys';
                } ), 1000 );
                return;
            }

            /* Display the first 32 characters of it. */
            $( '#dc-handshake-secret' )[ 0 ].innerText =
                `Derived Secret: [ ${displaySecret( derived_secret.length > 64 ?
                    derived_secret.substring( 0, 64 ) :
                    derived_secret )
                    } ]`;

            /* We have two salts. We can't know which one is our primary salt so just do a simple check on which
             Salt32 is bigger. */
            if ( user_salt_len === salt_len ) {
                for ( let i = 2; i < parseInt( user_salt_len / 4 ); i += 4 ) {
                    let usl = user_salt.readUInt32BE( i ), sl = salt.readUInt32BE( i );

                    if ( usl === sl )
                        continue;

                    isUserSaltPrimary = usl > sl;
                    break;
                }

                /* Salts are equal, should never happen. */
                if ( isUserSaltPrimary === undefined ) {
                    /* Update the text. */
                    $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Both Salts Are Equal ?!';
                    setTimeout(
                        ( function () {
                            $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Compute Secret Keys';
                        } ),
                        1000
                    );
                    return;
                }
            }
            else
                isUserSaltPrimary = user_salt_len > salt_len;

            /* Create hashed salt from the two user-generated salts. */
            let primary_hash = Buffer.from(
                discordCrypt.sha512( isUserSaltPrimary ? user_salt : salt, true ),
                'hex'
            );
            let secondary_hash = Buffer.from(
                discordCrypt.whirlpool( isUserSaltPrimary ? salt : user_salt, true ),
                'hex'
            );

            /* Global progress for async callbacks. */
            let primary_progress = 0, secondary_progress = 0;

            /* Calculate the primary key. */
            discordCrypt.scrypt(
                Buffer.from( derived_secret + secondary_hash.toString( 'hex' ), 'hex' ),
                primary_hash,
                256,
                3072,
                16,
                2,
                ( error, progress, key ) => {
                    if ( error ) {
                        /* Update the text. */
                        $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Failed Generating Primary Key!';
                        setTimeout(
                            ( function () {
                                $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Compute Secret Keys';
                            } ),
                            1000
                        );
                        return true;
                    }

                    /* Update progress. */
                    if ( progress ) {
                        primary_progress = progress * 50;

                        $( '#dc-exchange-status' )
                            .css( 'width', parseInt( primary_progress + secondary_progress ) + '%' );
                    }

                    if ( key ) {
                        /* Generate a quality report and apply the password. */
                        $( '#dc-handshake-prim-lbl' ).text( `Primary Key: ( Quality - ${
                            discordCrypt.entropicBitLength( key.toString( 'base64' ) )
                            } Bits )` );
                        $( '#dc-handshake-primary-key' )[ 0 ].value = key.toString( 'base64' );

                        /* Since more iterations are done for the primary key, this takes 4x as long thus will
                           always finish second. We can thus restore the original Generate text for the button once
                           this is done. */
                        $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Compute Secret Keys';

                        /* Now we clear the additional information. */
                        $( '#dc-handshake-algorithm' )[ 0 ].innerText = '...';
                        $( '#dc-handshake-secret' )[ 0 ].innerText = '...';
                        $( '#dc-handshake-salts' )[ 0 ].innerText = '...';
                        $( '#dc-exchange-status' ).css( 'width', '0%' );
                    }

                    return false;
                }
            );

            /* Calculate all salts needed. */
            let primary_salt = isUserSaltPrimary ? user_salt : salt;
            let secondary_salt = isUserSaltPrimary ? salt : user_salt;
            let secondary_password = Buffer.from(
                primary_salt.toString( 'hex' ) + derived_secret + secondary_salt.toString( 'hex' ),
                'hex'
            );

            /* Calculate the secondary key. */
            discordCrypt.scrypt( secondary_password, secondary_hash, 256, 3072, 8, 1, ( error, progress, key ) => {
                if ( error ) {
                    /* Update the text. */
                    $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Failed Generating Secondary Key!';
                    setTimeout(
                        ( function () {
                            $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Compute Secret Keys';
                        } ),
                        1000
                    );
                    return true;
                }

                if ( progress ) {
                    secondary_progress = progress * 50;
                    $( '#dc-exchange-status' ).css( 'width', parseInt( primary_progress + secondary_progress ) + '%' );
                }

                if ( key ) {
                    /* Generate a quality report and apply the password. */
                    $( '#dc-handshake-sec-lbl' ).text( `Secondary Key: ( Quality - ${
                        discordCrypt.entropicBitLength( key.toString( 'base64' ) )
                        } Bits )` );
                    $( '#dc-handshake-secondary-key' )[ 0 ].value = key.toString( 'base64' );
                }

                return false;
            } );

            /* Update the text. */
            $( '#dc-handshake-compute-btn' )[ 0 ].innerText = 'Generating Keys ...';

            /* Finally clear all volatile information. */
            discordCrypt.privateExchangeKey = undefined;
            $( '#dc-handshake-ppk' )[ 0 ].value = '';
            $( '#dc-priv-key-ta' )[ 0 ].value = '';
            $( '#dc-pub-key-ta' )[ 0 ].value = '';
        };
    }

    /**
     * @private
     * @desc Copies the currently generated passwords from a key exchange to the clipboard then erases them.
     */
    static on_handshake_copy_keys_button_clicked() {
        /* Don't bother if it's empty. */
        if ( $( '#dc-handshake-primary-key' )[ 0 ].value === '' ||
            $( '#dc-handshake-secondary-key' )[ 0 ].value === '' )
            return;

        /* Format the text and copy it to the clipboard. */
        require( 'electron' ).clipboard.writeText(
            'Primary Key: ' + $( '#dc-handshake-primary-key' )[ 0 ].value + '\r\n\r\n' +
            'Secondary Key: ' + $( '#dc-handshake-secondary-key' )[ 0 ].value
        );

        /* Nuke. */
        $( '#dc-handshake-primary-key' )[ 0 ].value = $( '#dc-handshake-secondary-key' )[ 0 ].value = '';

        /* Update the button text & reset after 1 second. */
        $( '#dc-handshake-cpy-keys-btn' )[ 0 ].innerText = 'Coped Keys To Clipboard!';

        setTimeout( ( function () {
            $( '#dc-handshake-cpy-keys-btn' )[ 0 ].innerText = 'Copy Keys & Nuke';
            $( '#dc-handshake-prim-lbl' ).text( 'Primary Key: ' );
            $( '#dc-handshake-sec-lbl' ).text( 'Secondary Key: ' );
        } ), 1000 );
    }

    /**
     * @private
     * @desc Applies the generate passwords to the current channel or DM.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_handshake_apply_keys_button_clicked( /* discordCrypt */ self ) {
        return () => {
            /* Skip if no primary key was generated. */
            if ( !$( '#dc-handshake-primary-key' )[ 0 ].value || !$( '#dc-handshake-primary-key' )[ 0 ].value.length )
                return;

            /* Skip if no secondary key was generated. */
            if ( !$( '#dc-handshake-secondary-key' )[ 0 ].value ||
                !$( '#dc-handshake-secondary-key' )[ 0 ].value.length )
                return;

            /* Create the password object and nuke. */
            let pwd = discordCrypt.createPassword(
                $( '#dc-handshake-primary-key' )[ 0 ].value,
                $( '#dc-handshake-secondary-key' )[ 0 ].value
            );
            $( '#dc-handshake-primary-key' )[ 0 ].value = $( '#dc-handshake-secondary-key' )[ 0 ].value = '';

            /* Apply the passwords and save the config. */
            self.configFile.passList[ discordCrypt.getChannelId() ] = pwd;
            self.saveConfig();

            /* Update the text and reset it after 1 second. */
            $( '#dc-handshake-apply-keys-btn' )[ 0 ].innerText = 'Applied & Saved!';
            setTimeout( ( function () {
                $( '#dc-handshake-apply-keys-btn' )[ 0 ].innerText = 'Apply Generated Passwords';

                /* Reset quality bit length fields. */
                $( '#dc-handshake-prim-lbl' ).text( 'Primary Key: ' );
                $( '#dc-handshake-sec-lbl' ).text( 'Secondary Key: ' );

                /* Hide main background. */
                $( '#dc-overlay' )[ 0 ].style.display = 'none';

                /* Hide the entire exchange key menu. */
                $( '#dc-overlay-exchange' )[ 0 ].style.display = 'none';

                /* Reset the index to the info tab. */
                discordCrypt.setActiveTab( 0 );
            } ), 1000 );
        }
    }

    /**
     * @private
     * @desc Opens the password editor menu.
     */
    static on_passwd_button_clicked() {
        $( '#dc-overlay' )[ 0 ].style.display = 'block';
        $( '#dc-overlay-password' )[ 0 ].style.display = 'block';
    }

    /**
     * @private
     * @desc Saves the entered passwords for the current channel or DM.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_save_passwords_button_clicked( /* discordCrypt */ self ) {
        return () => {
            let btn = $( '#dc-save-pwd' );

            /* Update the password and save it. */
            self.updatePasswords();

            /* Update the text for the button. */
            btn.text( "Saved!" );

            /* Reset the text for the password button after a 1 second delay. */
            setTimeout( ( function () {
                /* Reset text. */
                btn.text( "Save Password" );

                /* Clear the fields. */
                $( "#dc-password-primary" )[ 0 ].value = '';
                $( "#dc-password-secondary" )[ 0 ].value = '';

                /* Close. */
                $( '#dc-overlay' )[ 0 ].style.display = 'none';
                $( '#dc-overlay-password' )[ 0 ].style.display = 'none';
            } ), 1000 );
        };
    }

    /**
     * @private
     * @desc Resets passwords for the current channel or DM to their defaults.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_reset_passwords_button_clicked( /* discordCrypt */ self ) {
        return () => {
            let btn = $( '#dc-reset-pwd' );

            /* Reset the configuration for this user and save the file. */
            delete self.configFile.passList[ discordCrypt.getChannelId() ];
            self.saveConfig();

            /* Update the text for the button. */
            btn.text( "Password Reset!" );

            setTimeout( ( function () {
                /* Reset text. */
                btn.text( "Reset Password" );

                /* Clear the fields. */
                $( "#dc-password-primary" )[ 0 ].value = '';
                $( "#dc-password-secondary" )[ 0 ].value = '';

                /* Close. */
                $( '#dc-overlay' )[ 0 ].style.display = 'none';
                $( '#dc-overlay-password' )[ 0 ].style.display = 'none';
            } ), 1000 );
        };
    }

    /**
     * @private
     * @desc Closes the password editor menu.
     */
    static on_cancel_password_button_clicked() {
        /* Clear the fields. */
        $( "#dc-password-primary" )[ 0 ].value = '';
        $( "#dc-password-secondary" )[ 0 ].value = '';

        /* Close after a .25 second delay. */
        setTimeout( ( function () {
            /* Close. */
            $( '#dc-overlay' )[ 0 ].style.display = 'none';
            $( '#dc-overlay-password' )[ 0 ].style.display = 'none';
        } ), 250 );
    }

    /**
     * @private
     * @desc Copies the passwords from the current channel or DM to the clipboard.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_copy_current_passwords_button_clicked( /* discordCrypt */ self ) {
        return () => {
            let currentKeys = self.configFile.passList[ discordCrypt.getChannelId() ];

            /* If no password is currently generated, write the default key. */
            if ( !currentKeys ) {
                require( 'electron' ).clipboard.writeText( 'Default Password: ' + self.configFile.defaultPassword );
                return;
            }

            /* Write to the clipboard. */
            require( 'electron' ).clipboard.writeText(
                "Primary Key: " + currentKeys.primary + "\r\n\r\n" +
                "Secondary Key: " + currentKeys.secondary
            );

            /* Alter the button text. */
            $( '#dc-cpy-pwds-btn' ).text( 'Copied Keys To Clipboard!' );

            /* Reset the button after 1 second close the prompt. */
            setTimeout( ( function () {
                /* Reset. */
                $( '#dc-cpy-pwds-btn' ).text( 'Copy Current Passwords!' );

                /* Close. */
                $( '#dc-cancel-btn' ).click();
            } ), 1000 );
        };
    }

    /**
     * @private
     * @desc Enables or disables automatic message encryption.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_lock_button_clicked( /* discordCrypt */ self ) {
        return () => {
            /* Update the icon and toggle. */
            if ( !self.configFile.encodeAll ) {
                $( '#dc-lock-btn' ).attr( 'title', 'Disable Message Encryption' );
                $( '#dc-lock-btn' )[ 0 ].innerHTML = Buffer.from( self.lockIcon, 'base64' ).toString( 'utf8' );
                self.configFile.encodeAll = true;
            }
            else {
                $( '#dc-lock-btn' ).attr( 'title', 'Enable Message Encryption' );
                $( '#dc-lock-btn' )[ 0 ].innerHTML = Buffer.from( self.unlockIcon, 'base64' ).toString( 'utf8' );
                self.configFile.encodeAll = false;
            }

            /* Set the button class. */
            $( '.dc-svg' ).attr( 'class', 'dc-svg' );

            /* Save config. */
            self.saveConfig();
        };
    }

    /* ================ END UI HANDLE CALLBACKS ================ */

    /* =================== END MAIN CALLBACKS ================== */

    /* =============== BEGIN CRYPTO CALLBACKS ================== */

    /* ======================= UTILITIES ======================= */

    /**
     * @callback getResultCallback
     * @param {int} statusCode The HTTP static code of the operation.
     * @param {string|null} The HTTP error string if an error occurred.
     * @param {string} data The returned data from the request.
     */

    /**
     * @private
     * @desc Checks if the plugin should ignore auto-updates.
     *      Usually in a developer environment, a simple symlink is ( or should be ) used to link the current build
     *      file to the plugin path allowing faster deployment.
     * @param {string} version Version string of the plugin to include in the check.
     * @return {boolean} Returns false if the plugin should auto-update.
     */
    static __shouldIgnoreUpdates( version ) {
        const fs = require( 'fs' );
        const path = require( 'path' );
        const plugin_file = path.join( discordCrypt.getPluginsPath(), discordCrypt.getPluginName() );

        return fs.existsSync( plugin_file ) &&
            ( fs.lstatSync( plugin_file ).isSymbolicLink() || version.indexOf( '-debug' ) !== -1 );
    }

    /**
     * @public
     * @desc Performs an HTTP request returns the result to the callback.
     * @param {string} url The URL of the request.
     * @param {getResultCallback} callback The callback triggered when the request is complete or an error occurs.
     * @private
     */
    static __getRequest( url, callback ) {
        try {
            require( 'request' )( url, ( error, response, result ) => {
                callback( response.statusCode, response.statusMessage, result );
            } );
        }
        catch ( ex ) {
            callback( -1, ex.toString() );
        }
    }

    /**
     * @private
     * @desc Get React component instance of closest owner of DOM element matched by filter.
     * @author noodlebox
     * @param {Element} element DOM element to start react component searching.
     * @param {object} options Filter to match React component by display name.
     *      If `include` if provided, `exclude` value is ignored.
     * @param {string[]} options.include Array of names to allow.
     * @param {string[]} options.exclude Array of names to ignore.
     * @return {object|null} Closest matched React component instance or null if none is matched.
     */
    static __getElementReactOwner(
        element,
        {
            include,
            exclude = [ "Popout", "Tooltip", "Scroller", "BackgroundFlash" ]
        } = {}
    ) {
        if ( element === undefined )
            return undefined;

        /**
         * Get React Internal Instance mounted to DOM element
         * @author noodlebox
         * @param {Element} e DOM element to get React Internal Instance from
         * @return {object|null} Returns React Internal Instance mounted to this element if exists
         */
        const getOwnerReactInstance = e => e[ Object.keys( e ).find( k => k.startsWith( "__reactInternalInstance" ) ) ];
        const excluding = include === undefined;
        const filter = excluding ? exclude : include;

        function classFilter( owner ) {
            const name = owner.type.displayName || owner.type.name || null;
            return ( name !== null && !!( filter.includes( name ) ^ excluding ) );
        }

        for ( let c = getOwnerReactInstance( element ).return; !_.isNil( c ); c = c.return ) {
            if ( _.isNil( c ) )
                continue;

            if ( !_.isNil( c.stateNode ) && !( c.stateNode instanceof HTMLElement ) && classFilter( c ) )
                return c.stateNode;
        }

        return undefined;
    }

    /**
     * @public
     * @desc Returns the exchange algorithm and bit size for the given metadata as well as a fingerprint.
     * @param {string} key_message The encoded metadata to extract the information from.
     * @param {boolean} header_present Whether the message's magic string is attached to the input.
     * @returns {{bit_length: int, algorithm: string, fingerprint: string}|null} Returns the algorithm's bit length and
     *      name or null.
     * @example
     * __extractKeyInfo( '㑼㑷㑵㑳㐁㑢', true );
     * @example
     * __extractKeyInfo( '㐁㑢', false );
     */
    static __extractKeyInfo( key_message, header_present = false ) {
        try {
            let output = [];
            let msg = key_message;

            /* Strip the header if necessary. */
            if ( header_present )
                msg = msg.slice( 4 );

            /* Decode the message to Base64. */
            msg = discordCrypt.substituteMessage( msg );

            /* Decode the message to raw bytes. */
            msg = Buffer.from( msg, 'base64' );

            /* Sanity check. */
            if ( !discordCrypt.isValidExchangeAlgorithm( msg[ 0 ] ) )
                return null;

            /* Create a fingerprint for the blob. */
            output[ 'fingerprint' ] = discordCrypt.sha256( msg, true );

            /* Buffer[0] contains the algorithm type. Reverse it. */
            output[ 'bit_length' ] = discordCrypt.indexToAlgorithmBitLength( msg[ 0 ] );
            output[ 'algorithm' ] = discordCrypt.indexToExchangeAlgorithmString( msg[ 0 ] )
                .split( '-' )[ 0 ].toLowerCase();

            return output;
        }
        catch ( e ) {
            return null;
        }
    }

    /**
     * @public
     * @desc Splits the input text into chunks according to the specified length.
     * @param {string} input_string The input string.
     * @param {int} max_length The maximum length of the string before splitting.
     * @returns {Array} An array of split strings.
     * @private
     */
    static __splitStringChunks( input_string, max_length ) {
        /* Sanity check. */
        if ( !max_length || max_length < 0 )
            return input_string;

        /* Calculate the maximum number of chunks this can be split into. */
        const num_chunks = Math.ceil( input_string.length / max_length );
        const ret = new Array( num_chunks );

        /* Split each chunk and add it to the output array. */
        for ( let i = 0, offset = 0; i < num_chunks; ++i, offset += max_length )
            ret[ i ] = input_string.substr( offset, max_length );

        return ret;
    }

    /**
     * @public
     * @desc Determines if the given string is a valid username according to Discord's standards.
     * @param {string} name The name of the user and their discriminator.
     * @returns {boolean} Returns true if the username is valid.
     * @example
     * console.log( __isValidUserName( 'Person#1234' ) ); // true
     * @example
     * console.log( __isValidUserName( 'Person#123' ) ); // false
     * @example
     * console.log( __isValidUserName( 'Person#' ) ); // false
     * @example
     * console.log( __isValidUserName( 'Person1234' ) ); // false
     */
    static __isValidUserName( name ) {
        /* Make sure this is actually a string. */
        if ( typeof name !== 'string' )
            return false;

        /* The name must start with the '@' symbol. */
        if ( name[ 0 ] !== '@' )
            return false;

        /* Iterate through the rest of the name and check for the correct format. */
        for ( let i = 1; i < name.length; i++ ) {
            /* Names can't have spaces or '@' symbols. */
            if ( name[ i ] === ' ' || name[ i ] === '@' )
                return false;

            /* Make sure the discriminator is present. */
            if ( i !== 1 && name[ i ] === '#' ) {
                /* The discriminator is 4 characters long. */
                if ( name.length - i - 1 === 4 ) {
                    try {
                        /* Slice off the discriminator. */
                        let n = name.slice( i + 1, i + 5 );
                        /* Do a weak check to ensure that the Base-10 parsed integer is the same as the string. */
                        return !isNaN( n ) && parseInt( n, 10 ) == n;
                    }
                        /* If parsing or slicing somehow fails, this isn't valid. */
                    catch ( e ) {
                        return false;
                    }
                }
            }
        }

        /* No discriminator found means it's invalid. */
        return false;
    }

    /**
     * @public
     * @desc Extracts all tags from the given message and removes any tagged discriminators.
     * @param {string} message The input message to extract all tags from.
     * @returns {{ processed_message: string, user_tags: Array }}
     */
    static __extractTags( message ) {
        let split_msg = message.split( ' ' );
        let cleaned_tags = '', cleaned_msg = '';
        let user_tags = [];

        /* Iterate over each segment and check for usernames. */
        for ( let i = 0, k = 0; i < split_msg.length; i++ ) {
            if ( this.__isValidUserName( split_msg[ i ] ) ) {
                user_tags[ k++ ] = split_msg[ i ];
                cleaned_msg += split_msg[ i ].split( '#' )[ 0 ] + ' ';
            }
            /* Check for @here or @everyone. */
            else if ( split_msg[ i ] === '@everyone' || split_msg[ i ] === '@here' ) {
                user_tags[ k++ ] = split_msg[ i ];
                cleaned_msg += split_msg[ i ] + ' ';
            }
            else
                cleaned_msg += split_msg[ i ] + ' ';
        }

        /* Join all tags to a single string. */
        for ( let i = 0; i < user_tags.length; i++ )
            cleaned_tags += user_tags[ i ] + ' ';

        /* Return the parsed message and user tags. */
        return [ cleaned_msg.trim(), cleaned_tags.trim() ];
    }

    /**
     * @callback codeBlockDescriptor
     * @param {int} start_pos The starting position of the code block.
     * @param {int} end_pos The ending position of the code block.
     * @param {string} language The language identifier of the code within this block.
     * @param {string} raw_code The raw code within the code block.
     * @param {string} captured_block The entire markdown formatted code block.
     */

    /**
     * @public
     * @desc Extracts raw code blocks from a message and returns a descriptive array.
     *      N.B. This does not remove the code blocks from the message.
     * @param {string} message The message to extract all code blocks from.
     * @returns {Array} Returns an array of codeBlockDescriptor() objects.
     */
    static __extractCodeBlocks( message ) {
        /* This regex only extracts code blocks. */
        let code_block_expr = new RegExp( /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm ),
            inline_block_expr = new RegExp( /(`([^`].*?)`)/g ),
            _matched;

        /* Array to store all the extracted blocks in. */
        let _code_blocks = [];

        /* Loop through each tested RegExp result. */
        while ( ( _matched = code_block_expr.exec( message ) ) ) {
            /* Insert the captured data. */
            _code_blocks.push( {
                start_pos: _matched.index,
                end_pos: _matched.index + _matched[ 1 ].length,
                language: _matched[ 3 ].trim().length === 0 ? 'text' : _matched[ 3 ].trim(),
                raw_code: _matched[ 4 ],
                captured_block: _matched[ 1 ]
            } );
        }

        /* Match inline code blocks. */
        while ( ( _matched = inline_block_expr.exec( message ) ) ) {
            /* Insert the captured data. */
            _code_blocks.push( {
                start_pos: _matched.index,
                end_pos: _matched.index + _matched[ 0 ].length,
                language: 'inline',
                raw_code: message
                    .substr( _matched.index, _matched.index + _matched[ 0 ].length )
                    .split( '`' )[ 1 ],
                captured_block: _matched[ 0 ]
            } );
        }

        return _code_blocks;
    }

    /**
     * @public
     * @desc Extracts raw URLs from a message.
     *      N.B. This does not remove the URLs from the message.
     * @param {string} message The message to extract the URLs from.
     * @returns {Array} Returns an array of URLs detected int the message.
     * @example
     * __extractUrls( 'Hello https://google.com' );
     * //
     * [ 'https://google.com' ]
     */
    static __extractUrls( message ) {
        /* This regex only extracts HTTP/HTTPS/FTP and FILE URLs. */
        let url_expr = new RegExp( /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig ),
            matched;

        /* Array to store all the extracted URLs in. */
        let urls = [];

        /* Loop through each tested RegExp result. */
        while ( ( matched = url_expr.exec( message ) ) ) {
            /* Insert the captured data. */
            urls.push( matched[ 0 ] );
        }

        return urls;
    }

    /**
     * @public
     * @desc Extracts code blocks from a message and formats them in HTML to the proper format.
     * @param {string} message The message to format code blocks from.
     * @returns {{code: boolean, html: string}} Returns whether the message contains code blocks and the formatted HTML.
     * @example
     * __buildCodeBlockMessage('```\nHello World!\n```');
     * //
     * {
     *      "code": true,
     *      "html": "<div class=\"markup line-scanned\" data-colour=\"true\" style=\"color: rgb(111, 0, 0);\">
     *                  <pre class=\"hljs\">
     *                      <code class=\"dc-code-block hljs\" style=\"position: relative;\">
     *                          <ol><li>Hello World!</li></ol>
     *                      </code>
     *                  </pre>
     *              </div>"
     * }
     */
    static __buildCodeBlockMessage( message ) {
        try {
            /* Extract code blocks. */
            let _extracted = discordCrypt.__extractCodeBlocks( message );

            /* Throw an exception which will be caught to wrap the message normally. */
            if ( !_extracted.length )
                throw 'No code blocks available.';

            /* Loop over each expanded code block. */
            for ( let i = 0; i < _extracted.length; i++ ) {
                /* Inline code blocks get styled differently. */
                if ( _extracted[ i ].language !== 'inline' ) {
                    let _lines = '';

                    /* Remove any line-reset characters and split the message into lines. */
                    let _code = _extracted[ i ].raw_code.replace( "\r", '' ).split( "\n" );

                    /* Wrap each line in list elements. */
                    /* We start from position 1 since the regex leaves us with 2 blank lines. */
                    for ( let j = 1; j < _code.length - 1; j++ )
                        _lines += `<li>${_code[ j ]}</li>`;

                    /* Split the HTML message according to the full markdown code block. */
                    message = message.split( _extracted[ i ].captured_block );

                    /* Replace the code with an HTML formatted code block. */
                    message = message.join(
                        '<div class="markup line-scanned" data-colour="true" style="color: rgb(111, 0, 0);">' +
                        `<pre class="hljs"><code class="dc-code-block hljs 
                        ${_extracted[ i ].language === 'text' ? '' : _extracted[ i ].language}"
                         style="position: relative;">` +
                        `<ol>${_lines}</ol></code></pre></div>`
                    );
                }
                else {
                    /* Split the HTML message according to the inline markdown code block. */
                    message = message.split( _extracted[ i ].captured_block );

                    /* Replace the data with a inline code class. */
                    message = message.join( `<code class="inline">${_extracted[ i ].raw_code}</code>` );
                }
            }

            /* Return the parsed message. */
            return {
                code: true,
                html: message
            };
        }
        catch ( e ) {
            /* Wrap the message normally. */
            return {
                code: false,
                html: message
            };
        }
    }

    /**
     * @public
     * @desc Extracts URLs from a message and formats them accordingly.
     * @param {string} message The input message to format URLs from.
     * @param {string} [embed_link_prefix] Optional search link prefix for URLs to embed in frames.
     * @returns {{url: boolean, html: string}} Returns whether the message contains URLs and the formatted HTML.
     */
    static __buildUrlMessage( message, embed_link_prefix ) {
        try {
            /* Extract the URLs. */
            let _extracted = discordCrypt.__extractUrls( message );

            /* Throw an exception which will be caught to wrap the message normally. */
            if ( !_extracted.length )
                throw 'No URLs available.';

            /* Loop over each URL and format it. */
            for ( let i = 0; i < _extracted.length; i++ ) {
                let join = '';

                /* Split the message according to the URL and replace it. */
                message = message.split( _extracted[ i ] );

                /* If this is an Up1 host, we can directly embed it. Obviously don't embed deletion links.*/
                if (
                    embed_link_prefix !== undefined &&
                    _extracted[ i ].startsWith( `${embed_link_prefix}/#` ) &&
                    _extracted[ i ].indexOf( 'del?ident=' ) === -1
                )
                    join = `<iframe src=${_extracted[ i ]} width="400px" height="400px"></iframe><br/><br/>`;

                /* Join the message together. */
                message = message.join( join + `<a target="_blank" href="${_extracted[ i ]}">${_extracted[ i ]}</a>` );
            }

            /* Wrap the message in span tags. */
            return {
                url: true,
                html: `<span>${message}</span>`
            };
        }
        catch ( e ) {
            /* Wrap the message normally. */
            return {
                url: false,
                html: message
            };
        }
    }

    /**
     * @public
     * @desc Returns a string, Buffer() or Array() as a buffered object.
     * @param {string|Buffer|Array} input The input variable.
     * @param {boolean|undefined} [is_input_hex] If set to true, the input is parsed as a hex string. If false, it is
     *      parsed as a Base64 string. If this value is undefined, it is parsed as a UTF-8 string.
     * @returns {Buffer} Returns a Buffer object.
     * @throws {string} Thrown an unsupported type error if the input is neither a string, Buffer or Array.
     */
    static __toBuffer( input, is_input_hex = undefined ) {

        /* No conversion needed, return it as-is. */
        if ( Buffer.isBuffer( input ) )
            return input;

        /* If the message is either a Hex, Base64 or UTF-8 encoded string, convert it to a buffer. */
        if ( typeof input === 'string' )
            return Buffer.from( input, is_input_hex === undefined ? 'utf8' : is_input_hex ? 'hex' : 'base64' );

        /* Convert the Array to a Buffer object first. */
        if ( Array.isArray( input ) )
            return Buffer.from( input );

        /* Throw if an invalid type was passed. */
        throw 'Input is neither an Array(), Buffer() or a string.';
    }

    /**
     * @public
     * @desc Creates a hash of the specified algorithm and returns either a hex-encoded or base64-encoded digest.
     * @param {string|Buffer|Array} message The message to perform the hash on.
     * @param {string} algorithm The specified hash algorithm to use.
     * @param {boolean} [to_hex] If true, converts the output to hex else it converts it to Base64.
     * @param {boolean} hmac If this is true, an HMAC hash is created using a secret.
     * @param {string|Buffer|Array} secret The input secret used for the creation of an HMAC object.
     * @returns {string} Returns either a Base64 or hex string on success and an empty string on failure.
     * @example
     * console.log( __createHash( 'Hello World!', 'sha256', true ) );
     * // "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
     * @example
     * console.log( __createHash( 'Hello World', 'sha256', true, true, 'My Secret' ) );
     * // "852f78f917c4408000a8a94be61687865000bec5b2b77c0704dc5ad73ea06368"
     */
    static __createHash( message, algorithm, to_hex, hmac, secret ) {
        try {
            const crypto = require( 'crypto' );

            /* Create the hash algorithm. */
            const hash = hmac ? crypto.createHmac( algorithm, secret ) :
                crypto.createHash( algorithm );

            /* Hash the data. */
            hash.update( message );

            /* Return the digest. */
            return hash.digest( to_hex ? 'hex' : 'base64' );
        }
        catch ( e ) {
            return '';
        }
    }

    /**
     * @callback pbkdf2Callback
     * @param {string} error The error that occurred during processing or null on success.
     * @param {string} hash The hash either as a hex or Base64 encoded string ( or null on failure ).
     */

    /**
     * @public
     * @desc Computes a key-derivation based on the PBKDF2 standard and returns a hex or base64 encoded digest.
     * @param {string|Buffer|Array} input The input value to hash.
     * @param {string|Buffer|Array} salt The secret value used to derive the hash.
     * @param {boolean} [to_hex] Whether to conver the result to a hex string or a Base64 string.
     * @param {boolean} [is_input_hex] Whether to treat the input as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {boolean} [is_salt_hex] Whether to treat the salt as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {pbkdf2Callback} [callback] The callback function if performing an async request.
     * @param {string} algorithm The name of the hash algorithm to use.
     * @param {int} key_length The length of the desired key in bytes.
     * @param {int} iterations The number of recursive iterations to use to produce the resulting hash.
     * @returns {string} If a callback is not specified, this returns the hex or Base64 result or an empty string on
     *      failure.
     * @example
     * __pbkdf2( 'Hello World!', 'Super Secret', true, undefined, undefined, undefined, 'sha256', 32, 10000 );
     * // "89205432badb5b1e53c7bb930d428afd0f98e5702c4e549ea2da4cfefe8af254"
     * @example
     * __pbkdf2( 'ABC', 'Salty!', true, undefined, undefined, ( e, h ) => { console.log( `Hash: ${h}` ); },
     *      'sha256', 32, 1000 );
     * // Hash: f0e110b17b02006bbbcecb8eb295421c69081a6ecda75c94d55d20759dc295b1
     */
    static __pbkdf2( input, salt, to_hex, is_input_hex, is_salt_hex, callback, algorithm, key_length, iterations ) {
        const crypto = require( 'crypto' );
        let _input, _salt;

        /* Convert necessary data to Buffer objects. */
        if ( typeof input === 'object' ) {
            if ( Buffer.isBuffer( input ) )
                _input = input;
            else if ( Array.isArray )
                _input = Buffer.from( input );
            else
                _input = Buffer.from( input, is_input_hex === undefined ? 'utf8' : is_input_hex ? 'hex' : 'base64' );
        }
        else if ( typeof input === 'string' )
            _input = Buffer.from( input, 'utf8' );

        if ( typeof salt === 'object' ) {
            if ( Buffer.isBuffer( salt ) )
                _salt = salt;
            else if ( Array.isArray )
                _salt = Buffer.from( salt );
            else
                _salt = Buffer.from( salt, is_salt_hex === undefined ? 'utf8' : is_salt_hex ? 'hex' : 'base64' );
        }
        else if ( typeof salt === 'string' )
            _salt = Buffer.from( salt, 'utf8' );

        /* For function callbacks, use the async method else use the synchronous method. */
        if ( typeof callback === 'function' )
            crypto.pbkdf2( _input, _salt, iterations, key_length, algorithm, ( e, key ) => {
                callback( e, !e ? key.toString( to_hex ? 'hex' : 'base64' ) : '' );
            } );
        else
            try {
                return crypto.pbkdf2Sync( _input, _salt, iterations, key_length, algorithm )
                    .toString( to_hex ? 'hex' : 'base64' );
            }
            catch ( e ) {
                throw e;
            }
    }

    /**
     * @public
     * @desc Pads or un-pads the input message using the specified encoding format and block size.
     * @param {string|Buffer|Array} message The input message to either pad or unpad.
     * @param {string} padding_scheme The padding scheme used. This can be either: [ ISO1, ISO9, PKC7, ANS2 ]
     * @param {int} block_size The block size that the padding scheme must align the message to.
     * @param {boolean} [is_hex] Whether to treat the message as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {boolean} [remove_padding] Whether to remove the padding applied to the message. If undefined, it is
     *      treated as false.
     * @returns {Buffer} Returns the padded or unpadded message as a Buffer object.
     */
    static __padMessage( message, padding_scheme, block_size, is_hex = undefined, remove_padding = undefined ) {
        let _message, _padBytes;

        /* Returns the number of bytes required to pad a message based on the block size. */
        function __getPaddingLength( totalLength, blockSize ) {
            return totalLength % blockSize === blockSize ? blockSize : blockSize - ( totalLength % blockSize );
        }

        /* Pads a message according to the PKCS #7 / PKCS #5 format. */
        function __PKCS7( message, paddingBytes, remove ) {
            if ( remove === undefined ) {
                /* Allocate required padding length + message length. */
                let padded = Buffer.alloc( message.length + paddingBytes );

                /* Copy the message. */
                message.copy( padded );

                /* Append the number of padding bytes according to PKCS #7 / PKCS #5 format. */
                Buffer.alloc( paddingBytes ).fill( paddingBytes ).copy( padded, message.length );

                /* Return the result. */
                return padded;
            }
            else {
                /* Remove the padding indicated by the last byte. */
                return message.slice( 0, message.length - message.readInt8( message.length - 1 ) );
            }
        }

        /* Pads a message according to the ANSI X9.23 format. */
        function __ANSIX923( message, paddingBytes, remove ) {
            if ( remove === undefined ) {
                /* Allocate required padding length + message length. */
                let padded = Buffer.alloc( message.length + paddingBytes );

                /* Copy the message. */
                message.copy( padded );

                /* Append null-bytes till the end of the message. */
                Buffer.alloc( paddingBytes - 1 ).fill( 0x00 ).copy( padded, message.length );

                /* Append the padding length as the final byte of the message. */
                Buffer.alloc( 1 ).fill( paddingBytes ).copy( padded, message.length + paddingBytes - 1 );

                /* Return the result. */
                return padded;
            }
            else {
                /* Remove the padding indicated by the last byte. */
                return message.slice( 0, message.length - message.readInt8( message.length - 1 ) );
            }
        }

        /* Pads a message according to the ISO 10126 format. */
        function __ISO10126( message, paddingBytes, remove ) {
            const crypto = require( 'crypto' );

            if ( remove === undefined ) {
                /* Allocate required padding length + message length. */
                let padded = Buffer.alloc( message.length + paddingBytes );

                /* Copy the message. */
                message.copy( padded );

                /* Copy random data to the end of the message. */
                crypto.randomBytes( paddingBytes - 1 ).copy( padded, message.length );

                /* Write the padding length at the last byte. */
                padded.writeUInt8( paddingBytes, message.length + paddingBytes - 1 );

                /* Return the result. */
                return padded;
            }
            else {
                /* Remove the padding indicated by the last byte. */
                return message.slice( 0, message.length - message.readUInt8( message.length - 1 ) );
            }
        }

        /* Pads a message according to the ISO 97971 format. */
        function __ISO97971( message, paddingBytes, remove ) {
            if ( remove === undefined ) {
                /* Allocate required padding length + message length. */
                let padded = Buffer.alloc( message.length + paddingBytes );

                /* Copy the message. */
                message.copy( padded );

                /* Append the first byte as 0x80 */
                Buffer.alloc( 1 ).fill( 0x80 ).copy( padded, message.length );

                /* Fill the rest of the padding with zeros. */
                Buffer.alloc( paddingBytes - 1 ).fill( 0x00 ).copy( message, message.length + 1 );

                /* Return the result. */
                return padded;
            }
            else {

                /* Scan backwards. */
                let lastIndex = message.length - 1;

                /* Find the amount of null padding bytes. */
                for ( ; lastIndex > 0; lastIndex-- )
                    /* If a null byte is encountered, split at this index. */
                    if ( message[ lastIndex ] !== 0x00 )
                        break;

                /* Remove the null-padding. */
                let cleaned = message.slice( 0, lastIndex + 1 );

                /* Remove the final byte which is 0x80. */
                return cleaned.slice( 0, cleaned.length - 1 );
            }
        }

        /* Convert the message to a Buffer object. */
        _message = discordCrypt.__toBuffer( message, is_hex );

        /* Get the number of bytes required to pad this message. */
        _padBytes = remove_padding ? 0 : __getPaddingLength( _message.length, block_size / 8 );

        /* Apply the message padding based on the format specified. */
        switch ( padding_scheme.toUpperCase() ) {
            case 'PKC7':
                return __PKCS7( _message, _padBytes, remove_padding );
            case 'ANS2':
                return __ANSIX923( _message, _padBytes, remove_padding );
            case 'ISO1':
                return __ISO10126( _message, _padBytes, remove_padding );
            case 'ISO9':
                return __ISO97971( _message, _padBytes, remove_padding );
            default:
                return '';
        }
    }

    /**
     * @public
     * @desc Determines whether the passed cipher name is valid.
     * @param {string} cipher The name of the cipher to check.
     * @returns {boolean} Returns true if the cipher name is valid.
     * @example
     * console.log( __isValidCipher( 'aes-256-cbc' ) ); // True
     * @example
     * console.log( __isValidCipher( 'aes-256-gcm' ) ); // True
     * @example
     * console.log( __isValidCipher( 'camellia-256-gcm' ) ); // False
     */
    static __isValidCipher( cipher ) {
        const crypto = require( 'crypto' );
        let isValid = false;

        /* Iterate all valid Crypto ciphers and compare the name. */
        let cipher_name = cipher.toLowerCase();
        crypto.getCiphers().every( ( s ) => {
            /* If the cipher matches, stop iterating. */
            if ( s === cipher_name ) {
                isValid = true;
                return false;
            }

            /* Continue iterating. */
            return true;
        } );

        /* Return the result. */
        return isValid;
    }

    /**
     * @public
     * @desc Converts a given key or iv into a buffer object. Performs a hash of the key it doesn't match the blockSize.
     * @param {string|Buffer|Array} key The key to perform validation on.
     * @param {int} key_size_bits The bit length of the desired key.
     * @param {boolean} [use_whirlpool] If the key length is 512-bits, use Whirlpool or SHA-512 hashing.
     * @returns {Buffer} Returns a Buffer() object containing the key of the desired length.
     */
    static __validateKeyIV( key, key_size_bits = 256, use_whirlpool = undefined ) {
        /* Get the designed hashing algorithm. */
        let keyBytes = key_size_bits / 8;

        /* If the length of the key isn't of the desired size, hash it. */
        if ( key.length !== keyBytes ) {
            let hash;

            /* Get the appropriate hasher for the key size. */
            switch ( keyBytes ) {
                case 8:
                    hash = discordCrypt.whirlpool64;
                    break;
                case 16:
                    hash = discordCrypt.sha512_128;
                    break;
                case 20:
                    hash = discordCrypt.sha160;
                    break;
                case 24:
                    hash = discordCrypt.whirlpool192;
                    break;
                case 32:
                    hash = discordCrypt.sha256;
                    break;
                case 64:
                    hash = use_whirlpool !== undefined ? discordCrypt.sha512 : discordCrypt.whirlpool;
                    break;
                default:
                    throw 'Invalid block size specified for key or iv. Only 64, 128, 160, 192, 256 and 512 bit keys' +
                    ' are supported.';
            }
            /* Hash the key and return it as a buffer. */
            return Buffer.from( hash( key, true ), 'hex' );
        }
        else
            return Buffer.from( key );
    }

    /**
     * @public
     * @desc Convert the message to a buffer object.
     * @param {string|Buffer|Array} message The input message.
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @returns {Buffer} Returns a Buffer() object containing the message.
     * @throws An exception indicating the input message type is neither an Array(), Buffer() or string.
     */
    static __validateMessage( message, is_message_hex = undefined ) {
        /* Convert the message to a buffer. */
        try {
            return discordCrypt.__toBuffer( message, is_message_hex );
        }
        catch ( e ) {
            throw 'exception - Invalid message type.';
        }
    }

    /**
     * @public
     * @desc Returns the string encoded mime type of a file based on the file extension.
     * @param {string} file_path The path to the file in question.
     * @returns {string} Returns the known file extension's MIME type or "application/octet-stream".
     */
    static __getFileMimeType( file_path ) {
        /* Look up the Mime type from the file extension. */
        let type = require( 'mime-types' ).lookup( require( 'path' ).extname( file_path ) );

        /* Default to an octet stream if it fails. */
        return type === false ? 'application/octet-stream' : type;
    }

    /**
     * @private
     * @desc Attempts to read the clipboard and converts either Images or text to raw Buffer() objects.
     * @returns {{ mime_type: string, name: string|null, data: Buffer|null }} Contains clipboard data. May be null.
     */
    static __clipboardToBuffer() {
        /* Request the clipboard object. */
        let clipboard = require( 'electron' ).clipboard;

        /* Sanity check. */
        if ( !clipboard )
            return { mime_type: '', name: '', data: null };

        /* We use original-fs to bypass any file-restrictions ( Eg. ASAR ) for reading. */
        let fs = require( 'original-fs' ),
            path = require( 'path' );

        /* The clipboard must have at least one type available. */
        if ( clipboard.availableFormats().length === 0 )
            return { mime_type: '', name: '', data: null };

        /* Get all available formats. */
        let mime_type = clipboard.availableFormats();
        let data, tmp = '', name = '', is_file = false;

        /* Loop over each format and try getting the data. */
        for ( let i = 0; i < mime_type.length; i++ ) {
            let format = mime_type[ i ].split( '/' );

            /* For types, prioritize images. */
            switch ( format[ 0 ] ) {
                case 'image':
                    /* Convert the image type. */
                    switch ( format[ 1 ].toLowerCase() ) {
                        case 'png':
                            data = clipboard.readImage().toPNG();
                            break;
                        case 'bmp':
                        case 'bitmap':
                            data = clipboard.readImage().toBitmap();
                            break;
                        case 'jpg':
                        case 'jpeg':
                            data = clipboard.readImage().toJPEG( 100 );
                            break;
                        default:
                            break;
                    }
                    break;
                case 'text':
                    tmp = clipboard.readText();

                    /* For text, see if this is a file path. */
                    if ( fs.existsSync( tmp ) ) {
                        /* Read the file and store the file name. */
                        data = fs.readFileSync( tmp );
                        name = path.basename( tmp );
                        is_file = true;
                    }
                    else {
                        /* Convert the text to a buffer. */
                        data = Buffer.from( tmp, 'utf8' );
                    }
                    break;
                default:
                    break;
            }

            /* Keep trying till it has at least a byte of data to return. */
            if ( data && data.length > 0 ) {
                /* If this is a file, try getting the file's MIME type. */
                if ( is_file )
                    mime_type[ i ] = discordCrypt.__getFileMimeType( tmp );

                /* Return the data. */
                return {
                    mime_type: mime_type[ i ],
                    name: name,
                    data: data
                }
            }
        }

        return { mime_type: '', name: '', data: null };
    }

    /**
     * @callback encryptedFileCallback
     * @param {string} error_string The error that occurred during operation or null if no error occurred.
     * @param {Buffer} encrypted_data The resulting encrypted buffer as a Buffer() object.
     * @param {string} identity The encoded identity of the encrypted file.
     * @param {string} seed The initial seed used to decrypt the encryption keys of the file.
     */

    /**
     * @public
     * @desc Uploads the specified buffer to Up1's format specifications and returns this data to the callback.
     * @param {Buffer} data The input buffer to encrypt.
     * @param {string} mime_type The MIME type of this file.
     * @param {string} file_name The name of this file.
     * @param {Object} sjcl The loaded Stanford Javascript Crypto Library.
     * @param {encryptedFileCallback} callback The callback function that will be called on error or completion.
     */
    static __up1EncryptBuffer( data, mime_type, file_name, sjcl, callback ) {
        const crypto = require( 'crypto' );

        /* Returns a parameter object from the input seed. */
        function getParams( /* string|Buffer|Array|Uint8Array */ seed ) {
            /* Convert the seed either from a string to Base64 or read it via raw bytes. */
            if ( typeof seed === 'string' )
                seed = sjcl.codec.base64url.toBits( seed );
            else
                seed = sjcl.codec.bytes.toBits( seed );

            /* Compute an SHA-512 hash. */
            let out = sjcl.hash.sha512.hash( seed );

            /* Calculate the output values based on Up1's specs. */
            return {
                seed: seed,
                key: sjcl.bitArray.bitSlice( out, 0, 256 ),
                iv: sjcl.bitArray.bitSlice( out, 256, 384 ),
                ident: sjcl.bitArray.bitSlice( out, 384, 512 )
            }
        }

        /* Converts a string to its UTF-16 equivalent in network byte order. */
        function str2ab( /* string */ str ) {
            /* UTF-16 requires 2 bytes per UTF-8 byte. */
            let buf = Buffer.alloc( str.length * 2 );

            /* Loop over each byte. */
            for ( let i = 0, strLen = str.length; i < strLen; i++ ) {
                /* Write the UTF-16 equivalent in Big Endian. */
                buf.writeUInt16BE( str.charCodeAt( i ), i * 2 );
            }

            return buf;
        }

        try {
            /* Make sure the file size is less than 50 MB. */
            if ( data.length > 50000000 ) {
                callback( 'Input size must be < 50 MB.' );
                return;
            }

            /* Calculate the upload header and append the file data to it prior to encryption. */
            data = Buffer.concat( [
                str2ab( JSON.stringify( { 'mime': mime_type, 'name': file_name } ) ),
                Buffer.from( [ 0, 0 ] ),
                data
            ] );

            /* Convert the file to a Uint8Array() then to SJCL's bit buffer. */
            data = sjcl.codec.bytes.toBits( new Uint8Array( data ) );

            /* Generate a random 128 bit seed and calculate the key and IV from this. */
            let params = getParams( crypto.randomBytes( 16 ) );

            /* Perform AES-256-CCM encryption on this buffer and return an ArrayBuffer() object. */
            data = sjcl.arrayBuffer.ccm.compat_encrypt( new sjcl.cipher.aes( params.key ), data, params.iv );

            /* Execute the callback. */
            callback(
                null,
                Buffer.from( sjcl.codec.bytes.fromBits( data ) ),
                sjcl.codec.base64url.fromBits( params.ident ),
                sjcl.codec.base64url.fromBits( params.seed )
            );
        }
        catch ( ex ) {
            callback( ex.toString() );
        }
    }

    /**
     * @private
     * @desc Performs AES-256 CCM encryption of the given file and converts it to the expected Up1 format.
     * @param {string} file_path The path to the file to encrypt.
     * @param {Object} sjcl The loaded SJCL library providing AES-256 CCM.
     * @param {encryptedFileCallback} callback The callback function for when the file has been encrypted.
     * @param {boolean} [randomize_file_name] Whether to randomize the name of the file in the metadata. Default: False.
     */
    static __up1EncryptFile( file_path, sjcl, callback, randomize_file_name = false ) {
        const crypto = require( 'crypto' );
        const path = require( 'path' );
        const fs = require( 'original-fs' );

        try {
            /* Make sure the file size is less than 50 MB. */
            if ( fs.statSync( file_path ).size > 50000000 ) {
                callback( 'File size must be < 50 MB.' );
                return;
            }

            /* Read the file in an async callback. */
            fs.readFile( file_path, ( error, file_data ) => {
                /* Check for any errors. */
                if ( error !== null ) {
                    callback( error.toString() );
                    return;
                }

                /* Encrypt the file data. */
                discordCrypt.__up1EncryptBuffer(
                    file_data,
                    discordCrypt.__getFileMimeType( file_path ),
                    randomize_file_name ?
                        crypto.pseudoRandomBytes( 8 ).toString( 'hex' ) + path.extname( file_path ) :
                        path.basename( file_path ),
                    sjcl,
                    callback
                )
            } );
        }
        catch ( ex ) {
            callback( ex.toString() );
        }
    }

    /**
     * @callback uploadedFileCallback
     * @param {string} error_string The error that occurred or null if no error occurred.
     * @param {string} file_url The URL of the uploaded file/
     * @param {string} deletion_link The link used to delete the file.
     * @param {string} encoded_seed The encoded encryption key used to decrypt the file.
     */

    /**
     * @public
     * @desc Uploads raw data to an Up1 service and returns the file URL and deletion key.
     * @param {string} up1_host The host URL for the Up1 service.
     * @param {string} [up1_api_key] The optional API key used for the service.
     * @param {Object} sjcl The loaded SJCL library providing AES-256 CCM.
     * @param {uploadedFileCallback} callback The callback function called on success or failure.
     * @param {{ mime_type: string, name: string|null, data: Buffer|null }} [clipboard_data] Optional clipboard data.
     */
    static __up1UploadClipboard( up1_host, up1_api_key, sjcl, callback, clipboard_data = undefined ) {
        /* Get the current clipboard data. */
        let clipboard = clipboard_data === undefined ? discordCrypt.__clipboardToBuffer() : clipboard_data;

        /* Perform sanity checks on the clipboard data. */
        if ( !clipboard.mime_type.length || clipboard.data === null ) {
            callback( 'Invalid clipboard data.' );
            return;
        }

        /* Get a real file name, whether it be random or actual. */
        let file_name = clipboard.name.length === 0 ?
            require( 'crypto' ).pseudoRandomBytes( 16 ).toString( 'hex' ) :
            clipboard.name;

        /* Encrypt the buffer. */
        this.__up1EncryptBuffer(
            clipboard.data,
            clipboard.mime_type,
            file_name,
            sjcl,
            ( error_string, encrypted_data, identity, encoded_seed ) => {
                /* Return if there's an error. */
                if ( error_string !== null ) {
                    callback( error_string );
                    return;
                }

                /* Create a new FormData() object. */
                let form = new ( require( 'form-data' ) )();

                /* Append the ID and the file data to it. */
                form.append( 'ident', identity );
                form.append( 'file', encrypted_data, { filename: 'file', contentType: 'text/plain' } );

                /* Append the API key if necessary. */
                if ( up1_api_key !== undefined && typeof up1_api_key === 'string' )
                    form.append( 'api_key', up1_api_key );

                /* Perform the post request. */
                require( 'request' ).post( {
                        headers: form.getHeaders(),
                        uri: up1_host + '/up',
                        body: form
                    },
                    ( err, res, body ) => {
                        try {
                            /* Execute the callback if no error has occurred. */
                            if ( err !== null )
                                callback( err );
                            else {
                                callback(
                                    null,
                                    up1_host + '/#' + encoded_seed,
                                    up1_host + `/del?ident=${identity}&delkey=${JSON.parse( body ).delkey}`,
                                    encoded_seed
                                );
                            }
                        }
                        catch ( ex ) {
                            callback( ex.toString() );
                        }
                    }
                );
            }
        );
    }

    /**
     * @public
     * @desc Uploads the given file path to an Up1 service and returns the file URL and deletion key.
     * @param {string} file_path The path to the file to encrypt.
     * @param {string} up1_host The host URL for the Up1 service.
     * @param {string} [up1_api_key] The optional API key used for the service.
     * @param {Object} sjcl The loaded SJCL library providing AES-256 CCM.
     * @param {uploadedFileCallback} callback The callback function called on success or failure.
     * @param {boolean} [randomize_file_name] Whether to randomize the name of the file in the metadata. Default: False.
     */
    static __up1UploadFile( file_path, up1_host, up1_api_key, sjcl, callback, randomize_file_name = false ) {
        /* Encrypt the file data first. */
        this.__up1EncryptFile(
            file_path,
            sjcl,
            ( error_string, encrypted_data, identity, encoded_seed ) => {
                /* Return if there's an error. */
                if ( error_string !== null ) {
                    callback( error_string );
                    return;
                }

                /* Create a new FormData() object. */
                let form = new ( require( 'form-data' ) )();

                /* Append the ID and the file data to it. */
                form.append( 'ident', identity );
                form.append( 'file', encrypted_data, { filename: 'file', contentType: 'text/plain' } );

                /* Append the API key if necessary. */
                if ( up1_api_key !== undefined && typeof up1_api_key === 'string' )
                    form.append( 'api_key', up1_api_key );

                /* Perform the post request. */
                require( 'request' ).post( {
                        headers: form.getHeaders(),
                        uri: up1_host + '/up',
                        body: form
                    },
                    ( err, res, body ) => {
                        try {
                            /* Execute the callback if no error has occurred. */
                            if ( err !== null )
                                callback( err );
                            else {
                                callback(
                                    null,
                                    up1_host + '/#' + encoded_seed,
                                    up1_host + `/del?ident=${identity}&delkey=${JSON.parse( body ).delkey}`,
                                    encoded_seed
                                );
                            }
                        }
                        catch ( ex ) {
                            callback( ex.toString() );
                        }
                    }
                );
            },
            randomize_file_name
        );
    }

    /* ========================================================= */

    /* ============== NODE CRYPTO HASH PRIMITIVES ============== */

    /**
     * @callback scryptCallback
     * @desc Callback must return false repeatedly upon each call to have Scrypt continue running.
     *      Once [progress] === 1.f AND [key] is defined, no further calls will be made.
     * @param {string} error The error message encountered or null.
     * @param {real} progress The percentage of the operation completed. This ranges from [ 0.00 - 1.00 ].
     * @param {Buffer} result The output result when completed or null if not completed.
     * @returns Returns false if the operation is to continue running or true if the cancel the running operation.
     */

    /**
     * @public
     * @desc Performs the Scrypt hash function on the given input.
     *      Original Implementation: https://github.com/ricmoo/scrypt-js
     * @param {string|Buffer|Array} input The input data to hash.
     * @param {string|Buffer|Array} salt The unique salt used for hashing.
     * @param {int} dkLen The desired length of the output in bytes.
     * @param {int} N The work factor variable. Memory and CPU usage scale linearly with this.
     * @param {int} r Increases the size of each hash produced by a factor of 2rK-bits.
     * @param {int} p Parallel factor. Indicates the number of mixing functions to be run simultaneously.
     * @param {scryptCallback} cb Callback function for progress updates.
     * @returns {boolean} Returns true if successful.
     */
    static scrypt( input, salt, dkLen, N = 16384, r = 8, p = 1, cb = null ) {
        let _in, _salt;

        /* PBKDF2-HMAC-SHA256 Helper. */
        function PBKDF2_SHA256( input, salt, size, iterations ) {
            try {
                return Buffer.from(
                    discordCrypt.pbkdf2_sha256( input, salt, true, undefined, undefined, size, iterations ),
                    'hex'
                );
            }
            catch ( e ) {
                discordCrypt.log( e.toString(), 'error' );
                return Buffer.alloc( 1 );
            }
        }

        /**
         * @private
         * @desc Mixes a block and performs SALSA20 on it.
         * @param {Uint32Array} BY
         * @param {int} Yi
         * @param {int} r
         * @param {Uint32Array} x
         * @param {Uint32Array} _X
         */
        function Salsa20_BlockMix( BY, Yi, r, x, _X ) {
            let i, j, k, l;

            for ( i = 0, j = ( 2 * r - 1 ) * 16; i < 16; i++ )
                _X[ i ] = BY[ j + i ];

            for ( i = 0; i < 2 * r; i++ ) {
                for ( j = 0, k = i * 16; j < 16; j++ )
                    _X[ j ] ^= BY[ k + j ];

                for ( j = 0; j < 16; j++ )
                    x[ j ] = _X[ j ];

                /**
                 * @desc Rotates [a] by [b] bits to the left.
                 * @param {int} a The base value.
                 * @param {int} b The number of bits to rotate [a] to the left by.
                 * @return {number}
                 */
                let R = ( a, b ) => {
                    return ( a << b ) | ( a >>> ( 32 - b ) );
                };

                for ( j = 8; j > 0; j -= 2 ) {
                    x[ 0x04 ] ^= R( x[ 0x00 ] + x[ 0x0C ], 0x07 );
                    x[ 0x08 ] ^= R( x[ 0x04 ] + x[ 0x00 ], 0x09 );
                    x[ 0x0C ] ^= R( x[ 0x08 ] + x[ 0x04 ], 0x0D );
                    x[ 0x00 ] ^= R( x[ 0x0C ] + x[ 0x08 ], 0x12 );
                    x[ 0x09 ] ^= R( x[ 0x05 ] + x[ 0x01 ], 0x07 );
                    x[ 0x0D ] ^= R( x[ 0x09 ] + x[ 0x05 ], 0x09 );
                    x[ 0x01 ] ^= R( x[ 0x0D ] + x[ 0x09 ], 0x0D );
                    x[ 0x05 ] ^= R( x[ 0x01 ] + x[ 0x0D ], 0x12 );
                    x[ 0x0E ] ^= R( x[ 0x0A ] + x[ 0x06 ], 0x07 );
                    x[ 0x02 ] ^= R( x[ 0x0E ] + x[ 0x0A ], 0x09 );
                    x[ 0x06 ] ^= R( x[ 0x02 ] + x[ 0x0E ], 0x0D );
                    x[ 0x0A ] ^= R( x[ 0x06 ] + x[ 0x02 ], 0x12 );
                    x[ 0x03 ] ^= R( x[ 0x0F ] + x[ 0x0B ], 0x07 );
                    x[ 0x07 ] ^= R( x[ 0x03 ] + x[ 0x0F ], 0x09 );
                    x[ 0x0B ] ^= R( x[ 0x07 ] + x[ 0x03 ], 0x0D );
                    x[ 0x0F ] ^= R( x[ 0x0B ] + x[ 0x07 ], 0x12 );
                    x[ 0x01 ] ^= R( x[ 0x00 ] + x[ 0x03 ], 0x07 );
                    x[ 0x02 ] ^= R( x[ 0x01 ] + x[ 0x00 ], 0x09 );
                    x[ 0x03 ] ^= R( x[ 0x02 ] + x[ 0x01 ], 0x0D );
                    x[ 0x00 ] ^= R( x[ 0x03 ] + x[ 0x02 ], 0x12 );
                    x[ 0x06 ] ^= R( x[ 0x05 ] + x[ 0x04 ], 0x07 );
                    x[ 0x07 ] ^= R( x[ 0x06 ] + x[ 0x05 ], 0x09 );
                    x[ 0x04 ] ^= R( x[ 0x07 ] + x[ 0x06 ], 0x0D );
                    x[ 0x05 ] ^= R( x[ 0x04 ] + x[ 0x07 ], 0x12 );
                    x[ 0x0B ] ^= R( x[ 0x0A ] + x[ 0x09 ], 0x07 );
                    x[ 0x08 ] ^= R( x[ 0x0B ] + x[ 0x0A ], 0x09 );
                    x[ 0x09 ] ^= R( x[ 0x08 ] + x[ 0x0B ], 0x0D );
                    x[ 0x0A ] ^= R( x[ 0x09 ] + x[ 0x08 ], 0x12 );
                    x[ 0x0C ] ^= R( x[ 0x0F ] + x[ 0x0E ], 0x07 );
                    x[ 0x0D ] ^= R( x[ 0x0C ] + x[ 0x0F ], 0x09 );
                    x[ 0x0E ] ^= R( x[ 0x0D ] + x[ 0x0C ], 0x0D );
                    x[ 0x0F ] ^= R( x[ 0x0E ] + x[ 0x0D ], 0x12 );
                }

                for ( j = 0; j < 16; ++j )
                    _X[ j ] += x[ j ];

                /* Copy back the result. */
                for ( j = 0, k = Yi + ( i * 16 ); j < 16; j++ )
                    BY[ j + k ] = _X[ j ];
            }

            for ( i = 0; i < r; i++ ) {
                for ( j = 0, k = Yi + ( i * 2 ) * 16, l = ( i * 16 ); j < 16; j++ )
                    BY[ l + j ] = BY[ k + j ];
            }

            for ( i = 0; i < r; i++ ) {
                for ( j = 0, k = Yi + ( i * 2 + 1 ) * 16, l = ( i + r ) * 16; j < 16; j++ )
                    BY[ l + j ] = BY[ k + j ];
            }
        }

        /**
         * @desc Perform the scrypt process in steps and call the callback on intervals.
         * @param {string|Buffer|Array} input The input data to hash.
         * @param {string|Buffer|Array} salt The unique salt used for hashing.
         * @param {int} N The work factor variable. Memory and CPU usage scale linearly with this.
         * @param {int} r Increases the size of each hash produced by a factor of 2rK-bits.
         * @param {int} p Parallel factor. Indicates the number of mixing functions to be run simultaneously.
         * @param {scryptCallback} cb Callback function for progress updates.
         * @private
         */
        function __perform( input, salt, N, r, p, cb ) {
            let totalOps, currentOps, lastPercentage;
            let b = PBKDF2_SHA256( input, salt, p * 128 * r, 1 );
            let B = new Uint32Array( p * 32 * r );

            /* Initialize the input. */
            for ( let i = 0; i < B.length; i++ ) {
                let j = i * 4;
                B[ i ] =
                    ( ( b[ j + 3 ] & 0xff ) << 24 ) |
                    ( ( b[ j + 2 ] & 0xff ) << 16 ) |
                    ( ( b[ j + 1 ] & 0xff ) << 8 ) |
                    ( ( b[ j ] & 0xff ) << 0 );
            }

            let XY = new Uint32Array( 64 * r );
            let V = new Uint32Array( 32 * r * N );

            let Yi = 32 * r;

            /* Salsa20 Scratchpad. */
            let x = new Uint32Array( 16 );
            /* Block-mix Salsa20 Scratchpad. */
            let _X = new Uint32Array( 16 );

            totalOps = p * N * 2;
            currentOps = 0;
            lastPercentage = null;

            /* Set this to true to abandon the scrypt on the next step. */
            let stop = false;

            /* State information. */
            let state = 0, stateCount = 0, i1;
            let Bi;

            /* How many block-mix salsa8 operations can we do per step? */
            let limit = parseInt( 1000 / r );

            /* Trick from scrypt-async; if there is a setImmediate shim in place, use it. */
            let nextTick = ( typeof( setImmediate ) !== 'undefined' ) ? setImmediate : setTimeout;

            const incrementalSMix = function () {
                if ( stop )
                    return cb( new Error( 'cancelled' ), currentOps / totalOps );

                let steps, i, y, z, currentPercentage;
                switch ( state ) {
                    case 0:
                        Bi = stateCount * 32 * r;
                        /* Row mix #1 */
                        for ( let z = 0; z < Yi; z++ )
                            XY[ z ] = B[ Bi + z ]

                        /* Move to second row mix. */
                        state = 1;
                        i1 = 0;
                    /* Fall through purposely. */
                    case 1:
                        /* Run up to 1000 steps of the first inner S-Mix loop. */
                        steps = N - i1;

                        if ( steps > limit )
                            steps = limit;

                        /* Row mix #2 */
                        for ( i = 0; i < steps; i++ ) {
                            /* Row mix #3 */
                            y = ( i1 + i ) * Yi;
                            z = Yi;
                            while ( z-- ) V[ z + y ] = XY[ z ];

                            /* Row mix #4 */
                            Salsa20_BlockMix( XY, Yi, r, x, _X );
                        }

                        i1 += steps;
                        currentOps += steps;

                        /* Call the callback with the progress. ( Optionally stopping us. ) */
                        currentPercentage = parseInt( 1000 * currentOps / totalOps );
                        if ( currentPercentage !== lastPercentage ) {
                            stop = cb( null, currentOps / totalOps );

                            if ( stop )
                                break;

                            lastPercentage = currentPercentage;
                        }

                        if ( i1 < N )
                            break;

                        /* Row mix #6 */
                        i1 = 0;
                        state = 2;
                    /* Fall through purposely. */
                    case 2:

                        /* Run up to 1000 steps of the second inner S-Mix loop. */
                        steps = N - i1;

                        if ( steps > limit )
                            steps = limit;

                        for ( i = 0; i < steps; i++ ) {
                            /* Row mix #8 ( inner ) */
                            for ( z = 0, y = ( XY[ ( 2 * r - 1 ) * 16 ] & ( N - 1 ) ) * Yi; z < Yi; z++ )
                                XY[ z ] ^= V[ y + z ];
                            /* Row mix #9 ( outer ) */
                            Salsa20_BlockMix( XY, Yi, r, x, _X );
                        }

                        i1 += steps;
                        currentOps += steps;

                        /* Call the callback with the progress. ( Optionally stopping us. ) */
                        currentPercentage = parseInt( 1000 * currentOps / totalOps );
                        if ( currentPercentage !== lastPercentage ) {
                            stop = cb( null, currentOps / totalOps );

                            if ( stop )
                                break;

                            lastPercentage = currentPercentage;
                        }

                        if ( i1 < N )
                            break;

                        /* Row mix #10 */
                        for ( z = 0; z < Yi; z++ )
                            B[ Bi + z ] = XY[ z ];

                        stateCount++;
                        if ( stateCount < p ) {
                            state = 0;
                            break;
                        }

                        b = [];
                        for ( i = 0; i < B.length; i++ ) {
                            b.push( ( B[ i ] >> 0 ) & 0xff );
                            b.push( ( B[ i ] >> 8 ) & 0xff );
                            b.push( ( B[ i ] >> 16 ) & 0xff );
                            b.push( ( B[ i ] >> 24 ) & 0xff );
                        }

                        /* Done. Don't break to avoid rescheduling. */
                        return cb( null, 1.0, Buffer.from( PBKDF2_SHA256( input, Buffer.from( b ), dkLen, 1 ) ) );
                    default:
                        return cb( new Error( 'invalid state' ), 0 );
                }

                /* Schedule the next steps. */
                nextTick( incrementalSMix );
            };

            incrementalSMix();
        }

        /* Validate input. */
        if ( typeof input === 'object' || typeof input === 'string' ) {
            if ( Array.isArray( input ) )
                _in = Buffer.from( input );
            else if ( Buffer.isBuffer( input ) )
                _in = input;
            else if ( typeof input === 'string' )
                _in = Buffer.from( input, 'utf8' );
            else {
                discordCrypt.log( 'Invalid input parameter type specified!', 'error' );
                return false;
            }
        }

        /* Validate salt. */
        if ( typeof salt === 'object' || typeof salt === 'string' ) {
            if ( Array.isArray( salt ) )
                _salt = Buffer.from( salt );
            else if ( Buffer.isBuffer( salt ) )
                _salt = salt;
            else if ( typeof salt === 'string' )
                _salt = Buffer.from( salt, 'utf8' );
            else {
                discordCrypt.log( 'Invalid salt parameter type specified!', 'error' );
                return false;
            }
        }

        /* Validate derived key length. */
        if ( typeof dkLen !== 'number' ) {
            discordCrypt.log( 'Invalid dkLen parameter specified. Must be a numeric value.', 'error' );
            return false;
        }
        else if ( dkLen <= 0 || dkLen >= 65536 ) {
            discordCrypt.log( 'Invalid dkLen parameter specified. Must be a numeric value.', 'error' );
            return false;
        }

        /* Validate N is a power of 2. */
        if ( !N || N & ( N - 1 ) !== 0 ) {
            discordCrypt.log( 'Parameter N must be a power of 2.', 'error' );
            return false;
        }

        /* Perform a non-blocking . */
        if ( cb !== undefined && cb !== null ) {
            setTimeout( () => {
                __perform( _in, _salt, N, r, p, cb );
            }, 1 );
            return true;
        }

        /* Signal an error. */
        discordCrypt.log( 'No callback specified.', 'error' );
        return false;
    }

    /**
     * @public
     * @desc Returns the first 64 bits of a Whirlpool digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static whirlpool64( message, to_hex ) {
        return Buffer.from( discordCrypt.whirlpool( message, true ), 'hex' )
            .slice( 0, 8 ).toString( to_hex ? 'hex' : 'base64' );
    }

    /**
     * @public
     * @desc Returns the first 128 bits of an SHA-512 digest of a message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static sha512_128( message, to_hex ) {
        return Buffer.from( discordCrypt.sha512( message, true ), 'hex' )
            .slice( 0, 16 ).toString( to_hex ? 'hex' : 'base64' );
    }

    /**
     * @public
     * @desc Returns the first 192 bits of a Whirlpool digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static whirlpool192( message, to_hex ) {
        return Buffer.from( discordCrypt.sha512( message, true ), 'hex' )
            .slice( 0, 24 ).toString( to_hex ? 'hex' : 'base64' );
    }

    /**
     * @public
     * @desc Returns an SHA-160 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static sha160( message, to_hex ) {
        return discordCrypt.__createHash( message, 'sha1', to_hex );
    }

    /**
     * @public
     * @desc Returns an SHA-256 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static sha256( message, to_hex ) {
        return discordCrypt.__createHash( message, 'sha256', to_hex );
    }

    /**
     * @public
     * @desc Returns an SHA-512 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static sha512( message, to_hex ) {
        return discordCrypt.__createHash( message, 'sha512', to_hex );
    }

    /**
     * @public
     * @desc Returns a Whirlpool-512 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static whirlpool( message, to_hex ) {
        return discordCrypt.__createHash( message, 'whirlpool', to_hex );
    }

    /**
     * @public
     * @desc Returns a HMAC-SHA-256 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} secret The secret input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static hmac_sha256( message, secret, to_hex ) {
        return discordCrypt.__createHash( message, 'sha256', to_hex, true, secret );
    }

    /*  */
    /**
     * @public
     * @desc Returns an HMAC-SHA-512 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} secret The secret input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static hmac_sha512( message, secret, to_hex ) {
        return discordCrypt.__createHash( message, 'sha512', to_hex, true, secret );
    }

    /**
     * @public
     * @desc Returns an HMAC-Whirlpool-512 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} secret The secret input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static hmac_whirlpool( message, secret, to_hex ) {
        return discordCrypt.__createHash( message, 'whirlpool', to_hex, true, secret );
    }

    /**
     * @callback hashCallback
     * @param {string} error The error that occurred or null.
     * @param {string} hash The hex or Base64 encoded result.
     */

    /**
     * @public
     * @desc Computes a derived digest using the PBKDF2 algorithm and SHA-160 as primitives.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} salt The random salting input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @param {boolean} [message_is_hex] Whether to treat the message as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {boolean} [salt_is_hex] Whether to treat the salt as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {int} [key_length] The desired key length size in bytes. Default: 32.
     * @param {int} [iterations] The number of iterations to perform. Default: 5000.
     * @param {hashCallback} [callback] If defined, an async call is made that the result is passed to this when
     *      completed. If undefined, a sync call is made instead.
     * @returns {string|null} If a callback is defined, this returns nothing else it returns either a Base64 or hex
     *      encoded result.
     */
    static pbkdf2_sha160(
        message,
        salt,
        to_hex,
        message_is_hex = undefined,
        salt_is_hex = undefined,
        key_length = 32,
        iterations = 5000,
        callback = undefined
    ) {
        return discordCrypt.__pbkdf2(
            message,
            salt,
            to_hex,
            message_is_hex,
            salt_is_hex,
            callback,
            'sha1',
            key_length,
            iterations
        );
    }

    /**
     * @public
     * @desc Computes a derived digest using the PBKDF2 algorithm and SHA-256 as primitives.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} salt The random salting input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @param {boolean} [message_is_hex] Whether to treat the message as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {boolean} [salt_is_hex] Whether to treat the salt as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {int} [key_length] The desired key length size in bytes. Default: 32.
     * @param {int} [iterations] The number of iterations to perform. Default: 5000.
     * @param {hashCallback} [callback] If defined, an async call is made that the result is passed to this when
     *      completed. If undefined, a sync call is made instead.
     * @returns {string|null} If a callback is defined, this returns nothing else it returns either a Base64 or hex
     *      encoded result.
     */
    static pbkdf2_sha256(
        message,
        salt,
        to_hex,
        message_is_hex = undefined,
        salt_is_hex = undefined,
        key_length = 32,
        iterations = 5000,
        callback = undefined
    ) {
        return discordCrypt.__pbkdf2(
            message,
            salt,
            to_hex,
            message_is_hex,
            salt_is_hex,
            callback,
            'sha256',
            key_length,
            iterations
        );
    }

    /**
     * @public
     * @desc Computes a derived digest using the PBKDF2 algorithm and SHA-512 as primitives.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} salt The random salting input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @param {boolean} [message_is_hex] Whether to treat the message as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {boolean} [salt_is_hex] Whether to treat the salt as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {int} [key_length] The desired key length size in bytes. Default: 32.
     * @param {int} [iterations] The number of iterations to perform. Default: 5000.
     * @param {hashCallback} [callback] If defined, an async call is made that the result is passed to this when
     *      completed. If undefined, a sync call is made instead.
     * @returns {string|null} If a callback is defined, this returns nothing else it returns either a Base64 or hex
     *      encoded result.
     */
    static pbkdf2_sha512(
        /* Buffer|Array|string */   message,
        /* Buffer|Array|string */   salt,
        /* boolean */               to_hex,
        /* boolean */               message_is_hex = undefined,
        /* boolean */               salt_is_hex = undefined,
        /* int */                   key_length = 32,
        /* int */                   iterations = 5000,
        /* function(err, hash) */   callback = undefined
    ) {
        return discordCrypt.__pbkdf2(
            message,
            salt,
            to_hex,
            message_is_hex,
            salt_is_hex,
            callback,
            'sha512',
            key_length,
            iterations
        );
    }

    /**
     * @public
     * @desc Computes a derived digest using the PBKDF2 algorithm and Whirlpool-512 as primitives.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} salt The random salting input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @param {boolean} [message_is_hex] Whether to treat the message as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {boolean} [salt_is_hex] Whether to treat the salt as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {int} [key_length] The desired key length size in bytes. Default: 32.
     * @param {int} [iterations] The number of iterations to perform. Default: 5000.
     * @param {hashCallback} [callback] If defined, an async call is made that the result is passed to this when
     *      completed. If undefined, a sync call is made instead.
     * @returns {string|null} If a callback is defined, this returns nothing else it returns either a Base64 or hex
     *      encoded result.
     */
    static pbkdf2_whirlpool(
        message,
        salt,
        to_hex,
        message_is_hex = undefined,
        salt_is_hex = undefined,
        key_length = 32,
        iterations = 5000,
        callback = undefined
    ) {
        return discordCrypt.__pbkdf2(
            message,
            salt,
            to_hex,
            message_is_hex,
            salt_is_hex,
            callback,
            'whirlpool',
            key_length,
            iterations
        );
    }

    /* ============ END NODE CRYPTO HASH PRIMITIVES ============ */

    /* ================ CRYPTO CIPHER FUNCTIONS ================ */

    /**
     * @public
     * @desc Encrypts the given plain-text message using the algorithm specified.
     * @param {string} symmetric_cipher The name of the symmetric cipher used to encrypt the message.
     *      This must be supported by NodeJS's crypto module.
     * @param {string} block_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_scheme The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {boolean} convert_to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [key_size_bits] The size of the input key required for the chosen cipher. Defaults to 256 bits.
     * @param {int} [block_cipher_size] The size block cipher in bits. Defaults to 128 bits.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer|null} Returns a Buffer() object containing the ciphertext or null if the chosen options are
     *      invalid.
     * @throws Exception indicating the error that occurred.
     */
    static __encrypt(
        symmetric_cipher,
        block_mode,
        padding_scheme,
        message,
        key,
        convert_to_hex,
        is_message_hex,
        key_size_bits = 256,
        block_cipher_size = 128,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        const cipher_name = symmetric_cipher + ( block_mode === undefined ? '' : '-' + block_mode );
        const crypto = require( 'crypto' );

        /* Buffered parameters. */
        let _message, _key, _iv, _salt, _derived, _encrypt;

        /* Make sure the cipher name and mode is valid first. */
        if (
            !discordCrypt.__isValidCipher( cipher_name ) || [ 'cbc', 'cfb', 'ofb' ]
                .indexOf( block_mode.toLowerCase() ) === -1
        )
            return null;

        /* Pad the message to the nearest block boundary. */
        _message = discordCrypt.__padMessage( message, padding_scheme, key_size_bits, is_message_hex );

        /* Get the key as a buffer. */
        _key = discordCrypt.__validateKeyIV( key, key_size_bits );

        /* Check if using a predefined salt. */
        if ( one_time_salt !== undefined ) {
            /* Convert the salt to a Buffer. */
            _salt = discordCrypt.__toBuffer( one_time_salt );

            /* Don't bother continuing if conversions have failed. */
            if ( !_salt || _salt.length === 0 )
                return null;

            /* Only 64 bits is used for a salt. If it's not that length, hash it and use the result. */
            if ( _salt.length !== 8 )
                _salt = Buffer.from( discordCrypt.whirlpool64( _salt, true ), 'hex' );
        }
        else
        /* Generate a random salt to derive the key and IV. */
            _salt = crypto.randomBytes( 8 );

        /* Derive the key length and IV length. */
        _derived = discordCrypt.pbkdf2_sha256( _key.toString( 'hex' ), _salt.toString( 'hex' ), true, true, true,
            ( block_cipher_size / 8 ) + ( key_size_bits / 8 ), kdf_iteration_rounds );

        /* Slice off the IV. */
        _iv = _derived.slice( 0, block_cipher_size / 8 );

        /* Slice off the key. */
        _key = _derived.slice( block_cipher_size / 8, ( block_cipher_size / 8 ) + ( key_size_bits / 8 ) );

        /* Create the cipher with derived IV and key. */
        _encrypt = crypto.createCipheriv( cipher_name, _key, _iv );

        /* Disable automatic PKCS #7 padding. We do this in-house. */
        _encrypt.setAutoPadding( false );

        /* Get the cipher text. */
        let _ct = _encrypt.update( _message, undefined, 'hex' );
        _ct += _encrypt.final( 'hex' );

        /* Return the result with the prepended salt. */
        return Buffer.from( _salt.toString( 'hex' ) + _ct, 'hex' ).toString( convert_to_hex ? 'hex' : 'base64' );
    }

    /**
     * @public
     * @desc Decrypts the given cipher-text message using the algorithm specified.
     * @param {string} symmetric_cipher The name of the symmetric cipher used to decrypt the message.
     *      This must be supported by NodeJS's crypto module.
     * @param {string} block_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_scheme The padding scheme used to unpad the message from the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string|Buffer|Array} message The input ciphertext message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {boolean} output_format The output format of the plaintext.
     *      Can be either [ 'utf8', 'latin1', 'hex', 'base64' ]
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [key_size_bits] The size of the input key required for the chosen cipher. Defaults to 256 bits.
     * @param {int} [block_cipher_size] The size block cipher in bits. Defaults to 128 bits.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     * options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static __decrypt(
        symmetric_cipher,
        block_mode,
        padding_scheme,
        message,
        key,
        output_format,
        is_message_hex,
        key_size_bits = 256,
        block_cipher_size = 128,
        kdf_iteration_rounds = 1000
    ) {
        const cipher_name = symmetric_cipher + ( block_mode === undefined ? '' : '-' + block_mode );
        const crypto = require( 'crypto' );

        /* Buffered parameters. */
        let _message, _key, _iv, _salt, _derived, _decrypt;

        /* Make sure the cipher name and mode is valid first. */
        if ( !discordCrypt.__isValidCipher( cipher_name ) || [ 'cbc', 'ofb', 'cfb' ]
            .indexOf( block_mode.toLowerCase() ) === -1 )
            return null;

        /* Get the message as a buffer. */
        _message = discordCrypt.__validateMessage( message, is_message_hex );

        /* Get the key as a buffer. */
        _key = discordCrypt.__validateKeyIV( key, key_size_bits );

        /* Retrieve the 64-bit salt. */
        _salt = _message.slice( 0, 8 );

        /* Derive the key length and IV length. */
        _derived = discordCrypt.pbkdf2_sha256( _key.toString( 'hex' ), _salt.toString( 'hex' ), true, true, true,
            ( block_cipher_size / 8 ) + ( key_size_bits / 8 ), kdf_iteration_rounds );

        /* Slice off the IV. */
        _iv = _derived.slice( 0, block_cipher_size / 8 );

        /* Slice off the key. */
        _key = _derived.slice( block_cipher_size / 8, ( block_cipher_size / 8 ) + ( key_size_bits / 8 ) );

        /* Splice the message. */
        _message = _message.slice( 8 );

        /* Create the cipher with IV. */
        _decrypt = crypto.createDecipheriv( cipher_name, _key, _iv );

        /* Disable automatic PKCS #7 padding. We do this in-house. */
        _decrypt.setAutoPadding( false );

        /* Decrypt the cipher text. */
        let _pt = _decrypt.update( _message, undefined, 'hex' );
        _pt += _decrypt.final( 'hex' );

        /* Unpad the message. */
        _pt = discordCrypt.__padMessage( _pt, padding_scheme, key_size_bits, true, true );

        /* Return the buffer. */
        return _pt.toString( output_format );
    }


    /**
     * @public
     * @desc Blowfish encrypts a message.
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
     * @throws An exception indicating the error that occurred.
     */
    static blowfish512_encrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        to_hex = false,
        is_message_hex = undefined,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for Blowfish. */
        const keySize = 512, blockSize = 64;

        /* Perform the encryption. */
        return discordCrypt.__encrypt(
            'bf',
            cipher_mode,
            padding_mode,
            message,
            key,
            to_hex,
            is_message_hex,
            keySize,
            blockSize,
            one_time_salt,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc Blowfish decrypts a message.
     * @param {string|Buffer|Array} message The input message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string} output_format The output format of the decrypted message.
     *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     *      options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static blowfish512_decrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        output_format = 'utf8',
        is_message_hex = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for Blowfish. */
        const keySize = 512, blockSize = 64;

        /* Return the unpadded message. */
        return discordCrypt.__decrypt(
            'bf',
            cipher_mode,
            padding_mode,
            message,
            key,
            output_format,
            is_message_hex,
            keySize,
            blockSize,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc AES-256 encrypts a message.
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
     * @throws An exception indicating the error that occurred.
     */
    static aes256_encrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        to_hex = false,
        is_message_hex = undefined,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for AES-256. */
        const keySize = 256, blockSize = 128;

        /* Perform the encryption. */
        return discordCrypt.__encrypt(
            'aes-256',
            cipher_mode,
            padding_mode,
            message,
            key,
            to_hex,
            is_message_hex,
            keySize,
            blockSize,
            one_time_salt,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc AES-256 decrypts a message.
     * @param {string|Buffer|Array} message The input message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string} output_format The output format of the decrypted message.
     *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     *      options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static aes256_decrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        output_format = 'utf8',
        is_message_hex = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for AES-256. */
        const keySize = 256, blockSize = 128;

        /* Return the unpadded message. */
        return discordCrypt.__decrypt(
            'aes-256',
            cipher_mode,
            padding_mode,
            message,
            key,
            output_format,
            is_message_hex,
            keySize,
            blockSize,
            kdf_iteration_rounds
        );
    }

    /*  */
    /**
     * @public
     * @desc AES-256 decrypts a message in GCM mode.
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [additional_data] If specified, this additional data is used during GCM
     *      authentication.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
     * @throws An exception indicating the error that occurred.
     */
    static aes256_encrypt_gcm(
        message,
        key,
        padding_mode,
        to_hex = false,
        is_message_hex = undefined,
        additional_data = undefined,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        const block_cipher_size = 128, key_size_bits = 256;
        const cipher_name = 'aes-256-gcm';
        const crypto = require( 'crypto' );

        let _message, _key, _iv, _salt, _derived, _encrypt;

        /* Pad the message to the nearest block boundary. */
        _message = discordCrypt.__padMessage( message, padding_mode, key_size_bits, is_message_hex );

        /* Get the key as a buffer. */
        _key = discordCrypt.__validateKeyIV( key, key_size_bits );

        /* Check if using a predefined salt. */
        if ( one_time_salt !== undefined ) {
            /* Convert the salt to a Buffer. */
            _salt = discordCrypt.__toBuffer( one_time_salt );

            /* Don't bother continuing if conversions have failed. */
            if ( !_salt || _salt.length === 0 )
                return null;

            /* Only 64 bits is used for a salt. If it's not that length, hash it and use the result. */
            if ( _salt.length !== 8 )
                _salt = Buffer.from( discordCrypt.whirlpool64( _salt, true ), 'hex' );
        }
        else
        /* Generate a random salt to derive the key and IV. */
            _salt = crypto.randomBytes( 8 );

        /* Derive the key length and IV length. */
        _derived = discordCrypt.pbkdf2_sha256( _key.toString( 'hex' ), _salt.toString( 'hex' ), true, true, true,
            ( block_cipher_size / 8 ) + ( key_size_bits / 8 ), kdf_iteration_rounds );

        /* Slice off the IV. */
        _iv = _derived.slice( 0, block_cipher_size / 8 );

        /* Slice off the key. */
        _key = _derived.slice( block_cipher_size / 8, ( block_cipher_size / 8 ) + ( key_size_bits / 8 ) );

        /* Create the cipher with derived IV and key. */
        _encrypt = crypto.createCipheriv( cipher_name, _key, _iv );

        /* Add the additional data if necessary. */
        if ( additional_data !== undefined )
            _encrypt.setAAD( discordCrypt.__toBuffer( additional_data ) );

        /* Disable automatic PKCS #7 padding. We do this in-house. */
        _encrypt.setAutoPadding( false );

        /* Get the cipher text. */
        let _ct = _encrypt.update( _message, undefined, 'hex' );
        _ct += _encrypt.final( 'hex' );

        /* Return the auth tag prepended with the salt to the message. */
        return Buffer.from(
            _encrypt.getAuthTag().toString( 'hex' ) + _salt.toString( 'hex' ) + _ct,
            'hex'
        ).toString( to_hex ? 'hex' : 'base64' );
    }

    /**
     * @public
     * @desc AES-256 decrypts a message in GCM mode.
     * @param {string|Buffer|Array} message The input message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string} output_format The output format of the decrypted message.
     *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [additional_data] If specified, this additional data is used during GCM
     *      authentication.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     *      options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static aes256_decrypt_gcm(
        message,
        key,
        padding_mode,
        output_format = 'utf8',
        is_message_hex = undefined,
        additional_data = undefined,
        kdf_iteration_rounds = 1000
    ) {
        const block_cipher_size = 128, key_size_bits = 256;
        const cipher_name = 'aes-256-gcm';
        const crypto = require( 'crypto' );

        /* Buffered parameters. */
        let _message, _key, _iv, _salt, _authTag, _derived, _decrypt;

        /* Get the message as a buffer. */
        _message = discordCrypt.__validateMessage( message, is_message_hex );

        /* Get the key as a buffer. */
        _key = discordCrypt.__validateKeyIV( key, key_size_bits );

        /* Retrieve the auth tag. */
        _authTag = _message.slice( 0, block_cipher_size / 8 );

        /* Splice the message. */
        _message = _message.slice( block_cipher_size / 8 );

        /* Retrieve the 64-bit salt. */
        _salt = _message.slice( 0, 8 );

        /* Splice the message. */
        _message = _message.slice( 8 );

        /* Derive the key length and IV length. */
        _derived = discordCrypt.pbkdf2_sha256( _key.toString( 'hex' ), _salt.toString( 'hex' ), true, true, true,
            ( block_cipher_size / 8 ) + ( key_size_bits / 8 ), kdf_iteration_rounds );

        /* Slice off the IV. */
        _iv = _derived.slice( 0, block_cipher_size / 8 );

        /* Slice off the key. */
        _key = _derived.slice( block_cipher_size / 8, ( block_cipher_size / 8 ) + ( key_size_bits / 8 ) );

        /* Create the cipher with IV. */
        _decrypt = crypto.createDecipheriv( cipher_name, _key, _iv );

        /* Set the authentication tag. */
        _decrypt.setAuthTag( _authTag );

        /* Set the additional data for verification if necessary. */
        if ( additional_data !== undefined )
            _decrypt.setAAD( discordCrypt.__toBuffer( additional_data ) );

        /* Disable automatic PKCS #7 padding. We do this in-house. */
        _decrypt.setAutoPadding( false );

        /* Decrypt the cipher text. */
        let _pt = _decrypt.update( _message, undefined, 'hex' );
        _pt += _decrypt.final( 'hex' );

        /* Unpad the message. */
        _pt = discordCrypt.__padMessage( _pt, padding_mode, key_size_bits, true, true );

        /* Return the buffer. */
        return _pt.toString( output_format );
    }

    /**
     * @public
     * @desc Camellia-256 encrypts a message.
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
     * @throws An exception indicating the error that occurred.
     */
    static camellia256_encrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        to_hex = false,
        is_message_hex = undefined,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for Camellia-256. */
        const keySize = 256, blockSize = 128;

        /* Perform the encryption. */
        return discordCrypt.__encrypt(
            'camellia-256',
            cipher_mode,
            padding_mode,
            message,
            key,
            to_hex,
            is_message_hex,
            keySize,
            blockSize,
            one_time_salt,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc Camellia-256 decrypts a message.
     * @param {string|Buffer|Array} message The input message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string} output_format The output format of the decrypted message.
     *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     *      options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static camellia256_decrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        output_format = 'utf8',
        is_message_hex = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for Camellia-256. */
        const keySize = 256, blockSize = 128;

        /* Return the unpadded message. */
        return discordCrypt.__decrypt(
            'camellia-256',
            cipher_mode,
            padding_mode,
            message,
            key,
            output_format,
            is_message_hex,
            keySize,
            blockSize,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc TripleDES-192 encrypts a message.
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
     * @throws An exception indicating the error that occurred.
     */
    static tripledes192_encrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        to_hex = false,
        is_message_hex = undefined,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for TripleDES-192. */
        const keySize = 192, blockSize = 64;

        /* Perform the encryption. */
        return discordCrypt.__encrypt(
            'des-ede3',
            cipher_mode,
            padding_mode,
            message,
            key,
            to_hex,
            is_message_hex,
            keySize,
            blockSize,
            one_time_salt,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc TripleDES-192 decrypts a message.
     * @param {string|Buffer|Array} message The input message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string} output_format The output format of the decrypted message.
     *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     *      options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static tripledes192_decrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        output_format = 'utf8',
        is_message_hex = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for TripleDES-192. */
        const keySize = 192, blockSize = 64;

        /* Return the unpadded message. */
        return discordCrypt.__decrypt(
            'des-ede3',
            cipher_mode,
            padding_mode,
            message,
            key,
            output_format,
            is_message_hex,
            keySize,
            blockSize,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc IDEA-128 encrypts a message.
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
     * @throws An exception indicating the error that occurred.
     */
    static idea128_encrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        to_hex = false,
        is_message_hex = undefined,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for IDEA-128. */
        const keySize = 128, blockSize = 64;

        /* Perform the encryption. */
        return discordCrypt.__encrypt(
            'idea',
            cipher_mode,
            padding_mode,
            message,
            key,
            to_hex,
            is_message_hex,
            keySize,
            blockSize,
            one_time_salt,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc IDEA-128 decrypts a message.
     * @param {string|Buffer|Array} message The input message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string} output_format The output format of the decrypted message.
     *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     *      options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static idea128_decrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        output_format = 'utf8',
        is_message_hex = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for IDEA-128. */
        const keySize = 128, blockSize = 64;

        /* Return the unpadded message. */
        return discordCrypt.__decrypt(
            'idea',
            cipher_mode,
            padding_mode,
            message,
            key,
            output_format,
            is_message_hex,
            keySize,
            blockSize,
            kdf_iteration_rounds
        );
    }

    /* ============== END CRYPTO CIPHER FUNCTIONS ============== */

    /**
     * @public
     * @desc Converts a cipher string to its appropriate index number.
     * @param {string} primary_cipher The primary cipher.
     *      This can be either [ 'bf', 'aes', 'camel', 'idea', 'tdes' ].
     * @param {string} [secondary_cipher] The secondary cipher.
     *      This can be either [ 'bf', 'aes', 'camel', 'idea', 'tdes' ].
     * @returns {int} Returns the index value of the algorithm.
     */
    static cipherStringToIndex( primary_cipher, secondary_cipher = undefined ) {
        let value = 0;

        /* Return if already a number. */
        if ( typeof primary_cipher === 'number' )
            return primary_cipher;

        /* Check if it's a joined string. */
        if ( typeof primary_cipher === 'string' && primary_cipher.search( '-' ) !== -1 &&
            secondary_cipher === undefined ) {
            primary_cipher = primary_cipher.split( '-' )[ 0 ];
            secondary_cipher = primary_cipher.split( '-' )[ 1 ];
        }

        /* Resolve the primary index. */
        switch ( primary_cipher ) {
            case 'bf':
                /* value = 0; */
                break;
            case 'aes':
                value = 1;
                break;
            case 'camel':
                value = 2;
                break;
            case 'idea':
                value = 3;
                break;
            case 'tdes':
                value = 4;
                break;
            default:
                return 0;
        }

        /* Make sure the secondary is valid. */
        if ( secondary_cipher !== undefined ) {
            switch ( secondary_cipher ) {
                case 'bf':
                    /* value = 0; */
                    break;
                case 'aes':
                    value += 5;
                    break;
                case 'camel':
                    value += 10;
                    break;
                case 'idea':
                    value += 15;
                    break;
                case 'tdes':
                    value += 20;
                    break;
                default:
                    break;
            }
        }

        /* Return the index. */
        return value;
    }

    /**
     * @public
     * @desc Converts an algorithm index to its appropriate string value.
     * @param {int} index The index of the cipher(s) used.
     * @param {boolean} get_secondary Whether to retrieve the secondary algorithm name.
     * @returns {string} Returns a shorthand representation of either the primary or secondary cipher.
     *      This can be either [ 'bf', 'aes', 'camel', 'idea', 'tdes' ].
     */
    static cipherIndexToString( index, get_secondary = undefined ) {

        /* Strip off the secondary. */
        if ( get_secondary !== undefined && get_secondary ) {
            if ( index >= 20 )
                return 'tdes';
            else if ( index >= 15 )
                return 'idea';
            else if ( index >= 10 )
                return 'camel';
            else if ( index >= 5 )
                return 'aes';
            else
                return 'bf';
        }
        /* Remove the secondary. */
        else if ( index >= 20 )
            index -= 20;
        else if ( index >= 15 && index <= 19 )
            index -= 15;
        else if ( index >= 10 && index <= 14 )
            index -= 10;
        else if ( index >= 5 && index <= 9 )
            index -= 5;

        /* Calculate the primary. */
        if ( index === 1 )
            return 'aes';
        else if ( index === 2 )
            return 'camel';
        else if ( index === 3 )
            return 'idea';
        else if ( index === 4 )
            return 'tdes';
        else
            return 'bf';
    }

    /**
     * @public
     * @desc Converts an input string to the approximate entropic bits using Shannon's algorithm.
     * @param {string} key The input key to check.
     * @returns {int} Returns the approximate number of bits of entropy contained in the key.
     */
    static entropicBitLength( key ) {
        let h = Object.create( null ), k;
        let sum = 0, len = key.length;

        key.split( '' ).forEach( c => {
            h[ c ] ? h[ c ]++ : h[ c ] = 1;
        } );

        for ( k in h ) {
            let p = h[ k ] / len;
            sum -= p * Math.log( p ) / Math.log( 2 );
        }

        return parseInt( sum * len );
    }

    /**
     * @public
     * @desc Retrieves UTF-16 charset as an Array Object.
     * @returns {Array} Returns an array containing 64 characters used for substitution.
     */
    static getUtf16() {
        return Array.from(
            "㐀㐁㐂㐃㐄㐅㐇㐒㐓㐔㐕㐖㐗㐜㐞㐡㐣㐥㐧㐨㐩㐫㐪㐭㐰㐱㐲㐳㐴㐶㐷㐹㐼㐽㐿㑁㑂㑃㑅㑇㑈㑉㑊㑏㑑" +
            "㑒㑓㑕㑣㑢㑡㑠㑟㑞㑝㑜㑤㑥㑦㑧㑨㑩㑪㑫㑵"
        );
    }

    /**
     * @public
     * @desc Determines if a string has all valid UTF-16 characters according to the result from getUtf16().
     * @param {string} message The message to validate.
     * @returns {boolean} Returns true if the message contains only the required character set.
     */
    static isValidUtf16( message ) {
        let c = discordCrypt.getUtf16();
        let m = message.split( '' ).join( '' );

        for ( let i = 0; i < m.length; i++ )
            if ( c.indexOf( m[ i ] ) === -1 )
                return false;

        return true;
    }

    /**
     * @public
     * @desc Retrieves Base64 charset as an Array Object.
     * @returns {Array} Returns an array of all 64 characters used in Base64 + encoding characters.
     */
    static getBase64() {
        return Array.from( "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" );
    }

    /**
     * @public
     * @desc Determines if a string has all valid Base64 characters including encoding characters.
     * @param {string} message The message to validate.
     * @returns {boolean} Returns true if the message contains only the required character set.
     */
    static isValidBase64( message ) {
        try {
            let b64 = discordCrypt.getBase64();

            for ( let c in message ) {
                if ( b64.indexOf( c ) === -1 )
                    return false;
            }

            return true;
        } catch ( e ) {
            return false;
        }
    }

    /**
     * @public
     * @desc Returns an array of valid Diffie-Hellman exchange key bit-sizes.
     * @returns {number[]} Returns the bit lengths of all supported DH keys.
     */
    static getDHBitSizes() {
        return [ 768, 1024, 1536, 2048, 3072, 4096, 6144, 8192 ];
    }

    /**
     * @public
     * @desc Returns an array of Elliptic-Curve Diffie-Hellman key bit-sizes.
     * @returns {number[]} Returns the bit lengths of all supported ECDH keys.
     */
    static getECDHBitSizes() {
        return [ 224, 256, 384, 409, 521, 571 ];
    }

    /**
     * @public
     * @desc Determines if a key exchange algorithm's index is valid.
     * @param {int} index The index to determine if valid.
     * @returns {boolean} Returns true if the desired index meets one of the ECDH or DH key sizes.
     */
    static isValidExchangeAlgorithm( index ) {
        return index >= 0 &&
            index <= ( discordCrypt.getDHBitSizes().length + discordCrypt.getECDHBitSizes().length - 1 );
    }

    /**
     * @public
     * @desc Converts an algorithm index to a string.
     * @param {int} index The input index of the exchange algorithm.
     * @returns {string} Returns a string containing the algorithm or "Invalid Algorithm".
     */
    static indexToExchangeAlgorithmString( index ) {
        let dh_bl = discordCrypt.getDHBitSizes(), ecdh_bl = discordCrypt.getECDHBitSizes();
        let base = [ 'DH-', 'ECDH-' ];

        if ( !discordCrypt.isValidExchangeAlgorithm( index ) )
            return 'Invalid Algorithm';

        return ( index <= ( dh_bl.length - 1 ) ?
            base[ 0 ] + dh_bl[ index ] :
            base[ 1 ] + ecdh_bl[ index - dh_bl.length ] );
    }

    /**
     * @public
     * @desc Converts an algorithm index to a bit size.
     * @param {int} index The index to convert to the bit length.
     * @returns {int} Returns 0 if the index is invalid or the bit length of the index.
     */
    static indexToAlgorithmBitLength( index ) {
        let dh_bl = discordCrypt.getDHBitSizes(), ecdh_bl = discordCrypt.getECDHBitSizes();

        if ( !discordCrypt.isValidExchangeAlgorithm( index ) )
            return 0;

        return ( index <= ( dh_bl.length - 1 ) ? dh_bl[ index ] : ecdh_bl[ index - dh_bl.length ] );
    }

    /**
     * @public
     * @desc Computes a secret key from two ECDH or DH keys. One private and one public.
     * @param {Object} private_key A private key DH or ECDH object from NodeJS's crypto module.
     * @param {string} public_key The public key as a string in Base64 or hex format.
     * @param {boolean} is_base_64 Whether the public key is a Base64 string. If false, it is assumed to be hex.
     * @param {boolean} to_base_64 Whether to convert the output secret to Base64.
     *      If false, it is converted to hex.
     * @returns {string|null} Returns a string encoded secret on success or null on failure.
     */
    static computeExchangeSharedSecret( private_key, public_key, is_base_64, to_base_64 ) {
        let in_form, out_form;

        /* Compute the formats. */
        in_form = is_base_64 ? 'base64' : 'hex';
        out_form = to_base_64 ? 'base64' : 'hex';

        /* Compute the derived key and return. */
        try {
            return private_key.computeSecret( public_key, in_form, out_form );
        }
        catch ( e ) {
            return null;
        }
    }

    /**
     * @public
     * @desc Generates a Diffie-Hellman key pair.
     * @param {int} size The bit length of the desired key pair.
     *      This must be one of the supported lengths retrieved from getDHBitSizes().
     * @param {Buffer} private_key The optional private key used to initialize the object.
     * @returns {Object|null} Returns a DiffieHellman object on success or null on failure.
     */
    static generateDH( size, private_key = undefined ) {
        let groupName, key;

        /* Calculate the appropriate group. */
        switch ( size ) {
            case 768:
                groupName = 'modp1';
                break;
            case 1024:
                groupName = 'modp2';
                break;
            case 1536:
                groupName = 'modp5';
                break;
            case 2048:
                groupName = 'modp14';
                break;
            case 3072:
                groupName = 'modp15';
                break;
            case 4096:
                groupName = 'modp16';
                break;
            case 6144:
                groupName = 'modp17';
                break;
            case 8192:
                groupName = 'modp18';
                break;
            default:
                return null;
        }

        /* Create the key object. */
        try {
            key = require( 'crypto' ).getDiffieHellman( groupName );
        }
        catch ( err ) {
            return null;
        }

        /* Generate the key if it's valid. */
        if ( key !== undefined && key !== null && typeof key.generateKeys !== 'undefined' ) {
            if ( private_key === undefined )
                key.generateKeys();
            else if ( typeof key.setPrivateKey !== 'undefined' )
                key.setPrivateKey( private_key );
        }

        /* Return the result. */
        return key;
    }

    /**
     * @public
     * @desc Generates a Elliptic-Curve Diffie-Hellman key pair.
     * @param {int} size The bit length of the desired key pair.
     *      This must be one of the supported lengths retrieved from getECDHBitSizes().
     * @param {Buffer} private_key The optional private key used to initialize the object.
     * @returns {Object|null} Returns a ECDH object on success or null on failure.
     */
    static generateECDH( size, private_key = undefined ) {
        let groupName, key;

        /* Calculate the appropriate group. */
        switch ( size ) {
            case 224:
                groupName = 'secp224r1';
                break;
            case 256:
                groupName = 'secp256k1';
                break;
            case 384:
                groupName = 'secp384r1';
                break;
            case 409:
                groupName = 'sect409r1';
                break;
            case 521:
                groupName = 'secp521r1';
                break;
            case 571:
                groupName = 'sect571r1';
                break;
            default:
                return null;
        }

        /* Create the key object. */
        try {
            key = require( 'crypto' ).createECDH( groupName );
        }
        catch ( err ) {
            return null;
        }

        /* Generate the key if it's valid. */
        if ( key !== undefined && key !== null && typeof key.generateKeys !== 'undefined' ) {
            /* Generate a new key if the private key is undefined else set the private key. */
            if ( private_key === undefined )
                key.generateKeys( 'hex', 'compressed' );
            else if ( typeof key.setPrivateKey !== 'undefined' )
                key.setPrivateKey( private_key );
        }

        /* Return the result. */
        return key;
    }

    /**
     * @public
     * @desc Substitutes an input Base64 message to the UTF-16 equivalent from getUtf16().
     * @param {string} message The input message to perform substitution on.
     * @param {boolean} convert Whether the message is to be converted from Base64 to UTF-16 or from UTF-16 to Base64.
     * @returns {string} Returns the substituted string encoded message.
     * @throws An exception indicating the message contains characters not in the character set.
     */
    static substituteMessage( /* string */ message, /* boolean */ convert ) {
        /* Target character set. */
        let subset = discordCrypt.getUtf16();

        /* Base64-Character set. */
        let original = discordCrypt.getBase64();

        let result = "", index = 0;

        if ( convert !== undefined ) {
            /* Calculate the target character. */
            for ( let i = 0; i < message.length; i++ ) {
                index = original.indexOf( message[ i ] );

                /* Sanity check. */
                if ( index === -1 )
                    throw 'Message contains invalid characters.';

                result += subset[ index ];
            }

            /* Strip the extra UTF16 character that might somehow be added. */
            result = result.split( '' ).join( '' );
        }
        else {
            /* Strip the extra UTF16 character then decode the message. */
            message = message.split( '' ).join( '' );

            /* Calculate the target character. */
            for ( let i = 0; i < message.length; i++ ) {
                index = subset.indexOf( message[ i ] );

                /* Sanity check. */
                if ( index === -1 )
                    throw 'Message contains invalid characters.';

                result += original[ subset.indexOf( message[ i ] ) ];
            }
        }

        return result;
    }

    /**
     * @public
     * @desc Encodes the given values as a Base64 encoded 32-bit word.
     * @param {int} cipherIndex The index of the cipher(s) used to encrypt the message
     * @param {int} cipherModeIndex The index of the cipher block mode used for the message.
     * @param {int} paddingIndex The index of the padding scheme for the message.
     * @param {int} pad The padding byte to use.
     * @returns {string} Returns a substituted UTF-16 string of a Base64 encoded 32-bit word containing these options.
     */
    static metaDataEncode( cipherIndex, cipherModeIndex, paddingIndex, pad ) {
        /* Buffered word. */
        let buf = Buffer.alloc( 4 );

        /* Target character set. */
        let subset = discordCrypt.getUtf16();

        /* Base64-Character set. */
        let original = discordCrypt.getBase64();

        let result = "", msg;

        /* Parse the first 8 bits. */
        if ( typeof cipherIndex === 'string' )
            cipherIndex = discordCrypt.cipherStringToIndex( cipherIndex );
        buf[ 0 ] = cipherIndex;

        /* Parse the next 8 bits. */
        if ( typeof cipherModeIndex === 'string' )
            cipherModeIndex = [ 'cbc', 'cfb', 'ofb' ].indexOf( cipherModeIndex.toLowerCase() );
        buf[ 1 ] = cipherModeIndex;

        /* Parse the next 8 bits. */
        if ( typeof paddingIndex === 'string' )
            paddingIndex = [ 'pkc7', 'ans2', 'iso1', 'iso9' ].indexOf( paddingIndex.toLowerCase() );
        buf[ 2 ] = paddingIndex;

        /* Add padding. */
        pad = parseInt( pad );
        buf[ 3 ] = pad;

        /* Convert to Base64. */
        msg = buf.toString( 'base64' );

        /* Calculate the target character. */
        for ( let i = 0; i < msg.length; i++ )
            result += subset[ original.indexOf( msg[ i ] ) ];

        return result;
    }

    /**
     * @public
     * @desc Decodes an input string and returns a byte array containing index number of options.
     * @param {string} message The substituted UTF-16 encoded metadata containing the metadata options.
     * @returns {int[]} Returns 4 integer indexes of each metadata value.
     */
    static metaDataDecode( message ) {
        /* Target character set. */
        let subset = discordCrypt.getUtf16();

        /* Base64-Character set. */
        let original = discordCrypt.getBase64();

        let result = "", msg, buf;

        /* Strip the extra UTF16 character then decode the message */
        msg = message.split( '' ).join( '' );

        /* Calculate the target character. */
        for ( let i = 0; i < msg.length; i++ )
            result += original[ subset.indexOf( msg[ i ] ) ];

        /* Convert from base64. */
        buf = Buffer.from( result, 'base64' );

        return [
            buf[ 0 ],
            buf[ 1 ],
            buf[ 2 ],
            buf[ 3 ]
        ];
    }

    /**
     * @public
     * @desc Dual-encrypts a message using symmetric keys and returns the substituted encoded equivalent.
     * @param {string|Buffer} message The input message to encrypt.
     * @param {Buffer} primary_key The primary key used for the first level of encryption.
     * @param {Buffer} secondary_key The secondary key used for the second level of encryption.
     * @param {int} cipher_index The cipher index containing the primary and secondary ciphers used for encryption.
     * @param {string} block_mode The block operation mode of the ciphers.
     *      These can be: [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} use_hmac Whether to enable HMAC authentication on the message.
     *      This prepends a 64 bit seed used to derive encryption keys from the initial key.
     * @returns {string|null} Returns the encrypted and substituted ciphertext of the message or null on failure.
     * @throws An exception indicating the error that occurred.
     */
    static symmetricEncrypt( message, primary_key, secondary_key, cipher_index, block_mode, padding_mode, use_hmac ) {

        /* Performs one of the 5 standard encryption algorithms on the plain text. */
        function handleEncodeSegment( message, key, cipher, mode, pad ) {
            switch ( cipher ) {
                case 0:
                    return discordCrypt.blowfish512_encrypt( message, key, mode, pad );
                case 1:
                    return discordCrypt.aes256_encrypt( message, key, mode, pad );
                case 2:
                    return discordCrypt.camellia256_encrypt( message, key, mode, pad );
                case 3:
                    return discordCrypt.idea128_encrypt( message, key, mode, pad );
                case 4:
                    return discordCrypt.tripledes192_encrypt( message, key, mode, pad );
                default:
                    return null;
            }
        }

        /* Convert the block mode. */
        let mode = block_mode.toLowerCase();

        /* Convert the padding. */
        let pad = padding_mode;

        /* Encode using the user-specified symmetric algorithm. */
        let msg = '';

        /* Dual-encrypt the segment. */
        if ( cipher_index >= 0 && cipher_index <= 4 )
            msg = discordCrypt.blowfish512_encrypt(
                handleEncodeSegment( message, primary_key, cipher_index, mode, pad ),
                secondary_key,
                mode,
                pad,
                use_hmac,
                false
            );
        else if ( cipher_index >= 5 && cipher_index <= 9 )
            msg = discordCrypt.aes256_encrypt(
                handleEncodeSegment( message, primary_key, cipher_index - 5, mode, pad ),
                secondary_key,
                mode,
                pad,
                use_hmac,
                false
            );
        else if ( cipher_index >= 10 && cipher_index <= 14 )
            msg = discordCrypt.camellia256_encrypt(
                handleEncodeSegment( message, primary_key, cipher_index - 10, mode, pad ),
                secondary_key,
                mode,
                pad,
                use_hmac,
                false
            );
        else if ( cipher_index >= 15 && cipher_index <= 19 )
            msg = discordCrypt.idea128_encrypt(
                handleEncodeSegment( message, primary_key, cipher_index - 15, mode, pad ),
                secondary_key,
                mode,
                pad,
                use_hmac,
                false
            );
        else if ( cipher_index >= 20 && cipher_index <= 24 )
            msg = discordCrypt.tripledes192_encrypt(
                handleEncodeSegment( message, primary_key, cipher_index - 20, mode, pad ),
                secondary_key,
                mode,
                pad,
                use_hmac,
                false
            );

        /* If using HMAC mode, compute the HMAC of the ciphertext and prepend it. */
        if ( use_hmac ) {
            /* Get MAC tag as a hex string. */
            let tag = discordCrypt.hmac_sha256( Buffer.from( msg, 'hex' ), primary_key, true );

            /* Prepend the authentication tag hex string & convert it to Base64. */
            msg = Buffer.from( tag + msg, 'hex' ).toString( 'base64' );
        }

        /* Return the message. */
        return discordCrypt.substituteMessage( msg, true );
    }

    /**
     * @public
     * @desc Dual-decrypts a message using symmetric keys and returns the substituted encoded equivalent.
     * @param {string|Buffer|Array} message The substituted and encoded input message to decrypt.
     * @param {Buffer} primary_key The primary key used for the **second** level of decryption.
     * @param {Buffer} secondary_key The secondary key used for the **first** level of decryption.
     * @param {int} cipher_index The cipher index containing the primary and secondary ciphers used for decryption.
     * @param {string} block_mode The block operation mode of the ciphers.
     *      These can be: [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to unpad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} use_hmac Whether to enable HMAC authentication on the message.
     *      If this is enabled and authentication fails, null is returned.
     *      This prepends a 64 bit seed used to derive encryption keys from the initial key.
     * @returns {string|null} Returns the encrypted and substituted ciphertext of the message or null on failure.
     * @throws An exception indicating the error that occurred.
     */
    static symmetricDecrypt( message, primary_key, secondary_key, cipher_index, block_mode, padding_mode, use_hmac ) {
        const crypto = require( 'crypto' );

        /* Performs one of the 5 standard decryption algorithms on the plain text. */
        function handleDecodeSegment(
            message,
            key,
            cipher,
            mode,
            pad,
            output_format = 'utf8',
            is_message_hex = undefined
        ) {
            switch ( cipher ) {
                case 0:
                    return discordCrypt.blowfish512_decrypt( message, key, mode, pad, output_format, is_message_hex );
                case 1:
                    return discordCrypt.aes256_decrypt( message, key, mode, pad, output_format, is_message_hex );
                case 2:
                    return discordCrypt.camellia256_decrypt( message, key, mode, pad, output_format, is_message_hex );
                case 3:
                    return discordCrypt.idea128_decrypt( message, key, mode, pad, output_format, is_message_hex );
                case 4:
                    return discordCrypt.tripledes192_decrypt( message, key, mode, pad, output_format, is_message_hex );
                default:
                    return null;
            }
        }

        let mode, pad;

        /* Convert the block mode. */
        if ( typeof block_mode !== 'string' ) {
            if ( block_mode === 0 )
                mode = 'cbc';
            else if ( block_mode === 1 )
                mode = 'cfb';
            else if ( block_mode === 2 )
                mode = 'ofb';
            else return '';
        }

        /* Convert the padding. */
        if ( typeof padding_mode !== 'string' ) {
            if ( padding_mode === 0 )
                pad = 'pkc7';
            else if ( padding_mode === 1 )
                pad = 'ans2';
            else if ( padding_mode === 2 )
                pad = 'iso1';
            else if ( padding_mode === 3 )
                pad = 'iso9';
            else return '';
        }

        try {
            /* Decode level-1 message. */
            message = discordCrypt.substituteMessage( message );

            /* If using HMAC, strip off the HMAC and compare it before proceeding. */
            if ( use_hmac ) {
                /* Convert to a Buffer. */
                message = Buffer.from( message, 'base64' );

                /* Pull off the first 32 bytes as a buffer. */
                let tag = Buffer.from( message.subarray( 0, 32 ) );

                /* Strip off the authentication tag. */
                message = Buffer.from( message.subarray( 32 ) );

                /* Compute the HMAC-SHA-256 of the cipher text as hex. */
                let computed_tag = Buffer.from( discordCrypt.hmac_sha256( message, primary_key, true ), 'hex' );

                /* Compare the tag for validity. */
                if ( !crypto.timingSafeEqual( computed_tag, tag ) )
                    return 1;
            }

            /* Dual decrypt the segment. */
            if ( cipher_index >= 0 && cipher_index <= 4 )
                return handleDecodeSegment(
                    discordCrypt.blowfish512_decrypt( message, secondary_key, mode, pad, 'base64' ),
                    primary_key,
                    cipher_index,
                    mode,
                    pad,
                    'utf8',
                    false
                );
            else if ( cipher_index >= 5 && cipher_index <= 9 )
                return handleDecodeSegment(
                    discordCrypt.aes256_decrypt( message, secondary_key, mode, pad, 'base64' ),
                    primary_key,
                    cipher_index - 5,
                    mode,
                    pad,
                    'utf8',
                    false
                );
            else if ( cipher_index >= 10 && cipher_index <= 14 )
                return handleDecodeSegment(
                    discordCrypt.camellia256_decrypt( message, secondary_key, mode, pad, 'base64' ),
                    primary_key,
                    cipher_index - 10,
                    mode,
                    pad,
                    'utf8',
                    false
                );
            else if ( cipher_index >= 15 && cipher_index <= 19 )
                return handleDecodeSegment(
                    discordCrypt.idea128_decrypt( message, secondary_key, mode, pad, 'base64' ),
                    primary_key,
                    cipher_index - 15,
                    mode,
                    pad,
                    'utf8',
                    false
                );
            else if ( cipher_index >= 20 && cipher_index <= 24 )
                return handleDecodeSegment(
                    discordCrypt.tripledes192_decrypt( message, secondary_key, mode, pad, 'base64' ),
                    primary_key,
                    cipher_index - 20,
                    mode,
                    pad,
                    'utf8',
                    false
                );
            return -3;
        }
        catch ( e ) {
            return 2;
        }
    }

    /* ================ END CRYPTO CALLBACKS =================== */
}

/* Required for code coverage reports. */
module.exports = { discordCrypt };

