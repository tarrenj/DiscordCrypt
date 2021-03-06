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
 * @typedef {Object} WebpackFinder
 * @property {Object} module The module object.
 */

/**
 * @typedef {Object} WebpackPrototypeFinder
 * @property {string[]} prototypes All prototypes to search for.
 */

/**
 * @typedef {Object} WebpackPropertyFinder
 * @property {string[]} properties All properties to search for.
 */

/**
 * @typedef {Object} WebpackDisplayNameFinder
 * @property {string} displayName The display name to search for.
 */

/**
 * @typedef {Object} WebpackModuleIdFinder
 * @property {int} id The ID to locate.
 */

/**
 * @typedef {Object} WebpackDispatchFinder
 * @property {string[]} dispatchNames All dispatch names to search for.
 */

/**
 * @typedef {Object} WebpackModuleSearcher
 * @desc Returns various functions that can scan for webpack modules.
 * @property {WebpackFinder} find Recursively iterates all webpack modules to
 *      the callback function.
 * @property {WebpackPrototypeFinder} findByUniquePrototypes Iterates all modules looking for the
 *      defined prototypes.
 * @property {WebpackPropertyFinder} findByUniqueProperties Iterates all modules look for the
 *      defined properties.
 * @property {WebpackDisplayNameFinder} findByDisplayName Iterates all modules looking for the specified
 *      display name.
 * @property {WebpackModuleIdFinder} findByDispatchToken Iterates all modules looking for the specified dispatch
 *      token by its ID.
 * @property {WebpackDispatchFinder} findByDispatchNames Iterates all modules looking for the specified
 *      dispatch names.
 */

/**
 * @typedef {Object} CachedModules
 * @desc Cached Webpack modules for internal access.
 * @property {Object} NonceGenerator Internal nonce generator used for generating unique IDs from the current time.
 * @property {Object} ChannelStore Internal channel resolver for retrieving a list of all channels available.
 * @property {Object} EmojiStore Internal emoji parser that's used to translate emojis sent in messages.
 * @property {Object} GlobalTypes Internal message action types and constants for events.
 * @property {Object} GuildStore Internal Guild resolver for retrieving a list of all guilds currently in.
 * @property {Object} HighlightJS Internal code based library responsible for highlighting code blocks.
 * @property {Object} MessageCreator Internal message parser that's used to translate tags to Discord symbols.
 * @property {Object} MessageController Internal message controller used to receive, send and delete messages.
 * @property {Object} MessageDispatcher Internal message dispatcher for pending queued messages.
 * @property {Object} MessageQueue Internal message Queue store for pending parsing.
 * @property {Object} UserStore Internal user resolver for retrieving all users known.
 */

/**
 * @typedef {Object} TimedMessage
 * @desc Contains a timed message pending deletion.
 * @property {string} messageId The identification tag of the timed message.
 * @property {string} channelId The channel's identifier that this message was sent to.
 * @property {Date} expireTime The time to purge the message from the channel.
 */

/**
 * @typedef {Object} ChannelPassword
 * @desc Contains the primary and secondary keys used to encrypt or decrypt messages in a channel.
 * @property {string} primary The primary key used for the inner cipher.
 * @property {string} secondary The secondary key used for the outer cipher.
 */

/**
 * @typedef {Object} PublicKeyInfo
 * @desc Contains information given an input public key.
 * @property {string} fingerprint The SHA-256 sum of the public key.
 * @property {string} algorithm The public key's type ( DH | ECDH ) extracted from the metadata.
 * @property {int} bit_length The length, in bits, of the public key's security.
 */

/**
 * @typedef {Object} UpdateInfo
 * @desc Contains information regarding a blacklisted update.
 * @property {string} version Reported version of the blacklisted update.
 * @property {string} payload The raw update payload.
 * @property {boolean} valid The signature was marked as valid.
 * @property {string} hash Checksum of the update data.
 * @property {string} signature The signed PGP signature for the update payload.
 * @property {string} changelog Reported changes that occurred during this update.
 */

/**
 * @typedef {Object} LocalChannelState
 * @desc Contains per-channel specific information.
 * @property {boolean} autoEncrypt Whether automatic encryption is enabled for this channel.
 */

/**
 * @typedef {Object} Config
 * @desc Contains the configuration data used for the plugin.
 * @property {string} version The version of the configuration.
 * @property {boolean} useEmbeds Whether to use embeds for dispatching encrypted messages.
 * @property {Array<{channelId: string, LocalChannelState}>} channelSettings Settings local to a channel.
 * @property {string} defaultPassword The default key to encrypt or decrypt message with,
 *      if not specifically defined.
 * @property {string} decryptedPrefix This denotes the string that should be prepended to messages
 *      that have been successfully decrypted.
 * @property {string} decryptedColor This denotes the color of a decrypted message's text.
 *      This only applies to messages that have been successfully decrypted.
 * @property {string} encodeMessageTrigger The suffix trigger which, once appended to the message,
 *      forces encryption even if a key is not specifically defined for this channel.
 * @property {number} encryptScanDelay If using timed scanning events in case hooked events fail,
 *      this denotes how often, in milliseconds, to scan the window for new messages and decrypt them.
 * @property {number} encryptMode The index of the ciphers to use for message encryption.
 * @property {string} encryptBlockMode The block operation mode of the ciphers used to encrypt message.
 * @property {boolean} encodeAll If enabled, automatically forces all messages sent to be encrypted if a
 *      ChannelPassword object is defined for the current channel..
 * @property {boolean} localStates Localizes settings to the local channel.
 * @property {string} paddingMode The short-hand padding scheme to used to align all messages to the cipher's
 *      block length.
 * @property {{channelId: string, password: ChannelPassword}} passList Storage containing all channels with
 *      passwords defined for encryption of new messages and decryption of currently encrypted messages.
 * @property {string} up1Host The full URI host of the Up1 service to use for encrypted file uploads.
 * @property {string} up1ApiKey If specified, contains the API key used for authentication with the up1Host.
 * @property {Array<TimedMessage>} timedMessages Contains all logged timed messages pending deletion.
 * @property {number} timedMessageExpires How long after a message is sent should it be deleted in seconds.
 * @property {boolean} automaticUpdates Whether to automatically check for updates.
 * @property {Array<UpdateInfo>} blacklistedUpdates Updates to ignore due to being blacklisted.
 */

/**
 * @typedef {Object} UpdateCallback
 * @desc The function to execute after an update has been retrieved or if an error occurs.
 * @property {UpdateInfo} [info] The update's information if valid.
 */

/**
 * @typedef {Object} ModulePredicate
 * @desc Predicate for searching module.
 * @property {*} module Module to test.
 * @return {boolean} Returns `true` if `module` matches predicate.
 */

/**
 * @typedef {Object} GetResultCallback
 * @desc The function to execute at the end of a GET request containing the result or error that occurred.
 * @property {int} statusCode The HTTP static code of the operation.
 * @property {string|null} The HTTP error string if an error occurred.
 * @property {string} data The returned data from the request.
 * @return {boolean} Returns true if the data was parsed successfully.
 */

/**
 * @typedef {Object} CodeBlockDescriptor
 * @desc Indicates the values present in a markdown-styled code block.
 * @property {int} start_pos The starting position of the code block.
 * @property {int} end_pos The ending position of the code block.
 * @property {string} language The language identifier of the code within this block.
 * @property {string} raw_code The raw code within the code block.
 * @property {string} captured_block The entire markdown formatted code block.
 */

/**
 * @typedef {Object} EmojiDescriptor
 * @desc Indicates an emoji's name and snowflake ID.
 * @property {boolean} animated Whether this emoji is animated.
 * @property {string} formatted The full formatted string for the emoji. ( <:# NAME #:# SNOWFLAKE #> )
 * @property {string} name The actual name of the emoji. Example: "thonk"
 * @property {string} snowflake The integer snowflake ID for this emoji.
 */

/**
 * @typedef {Object} PBKDF2Callback
 * @desc The function to execute after an async request for PBKDF2 is completed containing the result or error.
 * @property {string} error The error that occurred during processing or null on success.
 * @property {string} hash The hash either as a hex or Base64 encoded string ( or null on failure ).
 */

/**
 * @typedef {Object} EncryptedFileCallback
 * @desc The function to execute when a file has finished being encrypted.
 * @property {string} error_string The error that occurred during operation or null if no error occurred.
 * @property {Buffer} encrypted_data The resulting encrypted buffer as a Buffer() object.
 * @property {string} identity The encoded identity of the encrypted file.
 * @property {string} seed The initial seed used to decrypt the encryption keys of the file.
 */

/**
 * @typedef {Object} UploadedFileCallback
 * @desc The function to execute after a file has been uploaded to an Up1 service.
 * @property {string} error_string The error that occurred or null if no error occurred.
 * @property {string} file_url The URL of the uploaded file/
 * @property {string} deletion_link The link used to delete the file.
 * @property {string} encoded_seed The encoded encryption key used to decrypt the file.
 */

/**
 * @typedef {Object} ScryptCallback
 * @desc The function to execute for Scrypt based status updates.
 *      The function must return false repeatedly upon each call to have Scrypt continue running.
 *      Once [progress] === 1.f AND [key] is defined, no further calls will be made.
 * @property {string} error The error message encountered or null.
 * @property {real} progress The percentage of the operation completed. This ranges from [ 0.00 - 1.00 ].
 * @property {Buffer} result The output result when completed or null if not completed.
 * @returns {boolean} Returns false if the operation is to continue running or true if the cancel the running
 *      operation.
 */

/**
 * @typedef {Object} HashCallback
 * @desc The function to execute once the hash is calculated or an error has occurred.
 * @property {string} error The error that occurred or null.
 * @property {string} hash The hex or Base64 encoded result.
 */

/**
 * @typedef {Object} ClipboardInfo
 * @desc Contains extracted data from the current clipboard.
 * @property {string} mime_type The MIME type of the extracted data.
 * @property {string|null} name The name of the file, if a file was contained in the clipboard.
 * @property {Buffer|null} data The raw data contained in the clipboard as a Buffer.
 */

/**
 * @typedef {Object} ProcessedMessage
 * @desc Contains a processed message with additional data.
 * @property {boolean} url Whether the message has any parsed URLs within it.
 * @property {boolean} code Whether the message has any parsed code blocks within it.
 * @property {boolean} emoji Whether the message has any parsed emojis within it.
 * @property {string} html The raw message's HTML.
 */

/**
 * @typedef {Object} UserTags
 * @desc Extracted user tagging information from an input message.
 * @property {string} processed_message The processed message containing user tags with the discriminator removed.
 * @property {Array<string>} user_tags All extracted user tags from the message.
 */

/**
 * @typedef {Object} URLInfo
 * @desc Contains information of a message containing any URLs.
 * @property {boolean} url Whether the input message contained any parsed URLs.
 * @property {string} html The raw formatted HTML containing any parsed URLs.
 */

/**
 * @typedef {Object} CodeBlockInfo
 * @desc Contains information of a message containing code blocks.
 * @property {boolean} code Whether the input message contained any parsed code blocks.
 * @property {string} html The raw formatted HTML containing any parsed code blocks.
 */

/**
 * @typedef {Object} EmojiInfo
 * @desc Contains information of a message containing emojis.
 * @property {boolean} emoji Whether the input message contained any parsed emojis.
 * @property {string} html The raw formatted HTML containing any parsed emoji images.
 */

/**
 * @typedef {Object} LibraryInfo
 * @desc Contains the library and necessary information.
 * @property {boolean} requiresNode Whether this library relies on NodeJS internal support.
 * @property {boolean} requiresBrowser Whether this library is meant to be run in a browser.
 * @property {string} code The raw code for execution defined in the library.
 */

/**
 * @typedef {Object} LibraryDefinition
 * @desc Contains a definition of a raw library executed upon plugin startup.
 * @property {string} name The name of the library file.
 * @property {LibraryInfo} info The library info.
 */

/**
 * @interface
 * @name PatchData
 * @desc Contains local patch data and state of the function.
 * @property {object} thisObject Original `this` value in current call of patched method.
 * @property {Arguments} methodArguments Original `arguments` object in current call of patched
 *      method.
 *      Please, never change function signatures, as it may cause a lot of problems in future.
 * @property {cancelPatch} cancelPatch Function with no arguments and no return value that may be
 *      called to reverse patching of current method. Calling this function prevents running of this
 *      callback on further original method calls.
 * @property {function} originalMethod Reference to the original method that is patched. You can use
 *      it if you need some special usage. You should explicitly provide a value for `this` and any
 *      method arguments when you call this function.
 * @property {function} callOriginalMethod This is a shortcut for calling original method using
 *      `this` and `arguments` from original call.
 * @property {*} returnValue This is a value returned from original function call. This property is
 *      available only in `after` callback or in `instead` callback after calling
 *      `callOriginalMethod` function.
 */

/**
 * @callback PatchCallback
 * @desc A callback that modifies method logic. This callback is called on each call of the original method and is
 *      provided all data about original call. Any of the data can be modified if necessary, but do so wisely.
 * @param {PatchData} data Data object with information about current call and original method that you may need in
 *      your patching callback.
 * @return {*} Makes sense only when used as `instead` parameter in _monkeyPatch. If something other than
 *      `undefined` is returned, the returned value replaces the value of `data.returnValue`.
 *      If used as `before` or `after` parameters, return value is ignored.
 */

/**
 * @module discordCrypt
 * @desc Use a scoped variable to protect the internal state of the plugin.
 * @type {_discordCrypt}
 */
const discordCrypt = ( () => {

    /**
     * @private
     * @desc Master database password. This is a Buffer() containing a 256-bit key.
     * @type {Buffer|null}
     */
    let _masterPassword = null;

    /**
     * @private
     * @desc Message scanning interval handler's index. Used to stop any running handler.
     *      Defined only if hooking of modules failed.
     * @type {int}
     */
    let _scanInterval;

    /**
     * @private
     * @desc The index of the handler used to reload the toolbar.
     *      Defined only if hooking of modules failed.
     * @type {int}
     */
    let _toolbarReloadInterval;

    /**
     * @private
     * @desc The index of the handler used for automatic update checking.
     * @type {int}
     */
    let _updateHandlerInterval;

    /**
     * @private
     * @desc The index of the handler used for timed message deletion.
     * @type {int}
     */
    let _timedMessageInterval;

    /**
     * @private
     * @desc The configuration file currently in use. Only valid after decryption of the configuration database.
     * @type {Config|null}
     */
    let _configFile = null;

    /**
     * @private
     * @desc Used to cache webpack modules.
     * @type {CachedModules}
     */
    let _cachedModules = {};

    /**
     * @private
     * @desc Stores the private key object used in key exchanges.
     * @type {Object}
     */
    let _privateExchangeKey;

    /**
     * @private
     * @desc Stores the compressed PGP public key used for update verification.
     * @type {string}
     */
    let _signingKey = '/* KEY USED FOR UPDATE VERIFICATION GOES HERE. DO NOT REMOVE. */';

    /**
     * @private
     * @desc Stores the update data for applying later on.
     * @type {UpdateInfo}
     */
    let _updateData = {};

    /**
     * @private
     * @desc Oddly enough, you're allowed to perform a prototype attack to override the freeze() function.
     *      So just backup the function code here in case it gets attacked in the future.
     * @type {function}
     */
    let _freeze = Object.freeze;

    /**
     * @private
     * @desc Array containing function callbacks to execute when stopping the plugin.
     * @type {Array<function>}
     */
    let _stopCallbacks = [];

    /**
     * @protected
     * @class
     * @desc Main plugin prototype.
     */
    class _discordCrypt
    {

        /* ========================================================= */

        /**
         * @public
         * @desc Initializes an instance of _discordCrypt.
         * @example
         * let instance = new _discordCrypt();
         */
        constructor() {

            /* ============================================ */

            /**
             * Discord class names that changes ever so often because they're douches.
             * These will usually be the culprit if the plugin breaks.
             */

            /**
             * @desc Used to scan each message for an encrypted message.
             * @type {string}
             */
            this._messageMarkupClass = '.markup-2BOw-j .inline';

            /**
             * @desc Used to scan each message for an embedded encrypted message.
             * @type {string}
             */
            this._embedDescriptionClass = '.embedDescription-1Cuq9a';

            /**
             * @desc Used to find the search toolbar to inject all option buttons.
             * @type {string}
             */
            this._searchUiClass = '.search .search-bar';
            /**
             * @desc Used to hook messages being sent.
             * @type {string}
             */
            this._channelTextAreaClass = '.content-yTz4x3 textarea';

            /**
             * @desc Used to assign the correct image class to parsed emojis.
             * @type {string}
             */
            this._emojisClass = 'emoji jumboable da-emoji da-jumboable';

            /**
             * @desc Used to detect if the autocomplete dialog is opened.
             * @type {string}
             */
            this._autoCompleteClass = '.autocomplete-1vrmpx';

            /* ============================================ */

            /**
             * @desc Defines what an encrypted message starts with. Must be 4x UTF-16 bytes.
             * @type {string}
             */
            this._encodedMessageHeader = "⢷⢸⢹⢺";

            /**
             * @desc Defines what a public key message starts with. Must be 4x UTF-16 bytes.
             * @type {string}
             */
            this._encodedKeyHeader = "⢻⢼⢽⢾";

            /**
             * @desc Defines what the header of an encrypted message says.
             * @type {string}
             */
            this._messageHeader = '-----ENCRYPTED MESSAGE-----';

            /**
             * @desc Indexes of each dual-symmetric encryption mode.
             * @type {int[]}
             */
            this._encryptModes = [
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
            this._encryptBlockModes = [
                'CBC', /* Cipher Block-Chaining */
                'CFB', /* Cipher Feedback Mode */
                'OFB', /* Output Feedback Mode */
            ];

            /**
             * @desc Shorthand padding modes for block ciphers referred to in the code.
             * @type {string[]}
             */
            this._paddingModes = [
                'PKC7', /* PKCS #7 */
                'ANS2', /* ANSI X.923 */
                'ISO1', /* ISO-10126 */
                'ISO9', /* ISO-97972 */
            ];

            /**
             * @desc Defines the CSS for the application overlays.
             * @type {string}
             */
            this._appCss =
                `/* ----- APPLICATION CSS GOES HERE DURING COMPILATION. DO NOT REMOVE. ------ */`;

            /**
             * @desc Contains the raw HTML used to inject into the search descriptor providing menu icons.
             * @type {string}
             */
            this._toolbarHtml =
                `/* ----- APPLICATION TOOLBAR GOES HERE DURING COMPILATION. DO NOT REMOVE. ------ */`;

            /**
             * @desc Contains the raw HTML injected into the overlay to prompt for the master password for database
             *      unlocking.
             * @type {string}
             */
            this._masterPasswordHtml =
                `/* ----- APPLICATION UNLOCKING GOES HERE DURING COMPILATION. DO NOT REMOVE. ------ */`;

            /**
             * @desc Defines the raw HTML used describing each option menu.
             * @type {string}
             */
            this._settingsMenuHtml =
                `/* ----- SETTINGS GOES HERE DURING COMPILATION. DO NOT REMOVE. ------ */`;

            /**
             * @desc The Base64 encoded SVG containing the unlocked status icon.
             * @type {string}
             */
            this._unlockIcon = "PHN2ZyBjbGFzcz0iZGMtc3ZnIiBmaWxsPSJsaWdodGdyZXkiIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAwI" +
                "DI0IDI0IiB3aWR0aD0iMjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTdjMS4xI" +
                "DAgMi0uOSAyLTJzLS45LTItMi0yLTIgLjktMiAyIC45IDIgMiAyem02LTloLTFWNmMwLTIuNzYtMi4yNC01LTUtNVM3IDMuMjQgN" +
                "yA2aDEuOWMwLTEuNzEgMS4zOS0zLjEgMy4xLTMuMSAxLjcxIDAgMy4xIDEuMzkgMy4xIDMuMXYySDZjLTEuMSAwLTIgLjktMiAyd" +
                "jEwYzAgMS4xLjkgMiAyIDJoMTJjMS4xIDAgMi0uOSAyLTJWMTBjMC0xLjEtLjktMi0yLTJ6bTAgMTJINlYxMGgxMnYxMHoiPjwvc" +
                "GF0aD48L3N2Zz4=";

            /**
             * @desc The Base64 encoded SVG containing the locked status icon.
             * @type {string}
             */
            this._lockIcon = "PHN2ZyBjbGFzcz0iZGMtc3ZnIiBmaWxsPSJsaWdodGdyZXkiIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAwIDI" +
                "0IDI0IiB3aWR0aD0iMjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0aCBkPSJNMCAwaDI" +
                "0djI0SDBWMHoiIGlkPSJhIi8+PC9kZWZzPjxjbGlwUGF0aCBpZD0iYiI+PHVzZSBvdmVyZmxvdz0idmlzaWJsZSIgeGxpbms6aHJ" +
                "lZj0iI2EiLz48L2NsaXBQYXRoPjxwYXRoIGNsaXAtcGF0aD0idXJsKCNiKSIgZD0iTTEyIDE3YzEuMSAwIDItLjkgMi0ycy0uOS0" +
                "yLTItMi0yIC45LTIgMiAuOSAyIDIgMnptNi05aC0xVjZjMC0yLjc2LTIuMjQtNS01LTVTNyAzLjI0IDcgNnYySDZjLTEuMSAwLTI" +
                "gLjktMiAydjEwYzAgMS4xLjkgMiAyIDJoMTJjMS4xIDAgMi0uOSAyLTJWMTBjMC0xLjEtLjktMi0yLTJ6TTguOSA2YzAtMS43MSA" +
                "xLjM5LTMuMSAzLjEtMy4xczMuMSAxLjM5IDMuMSAzLjF2Mkg4LjlWNnpNMTggMjBINlYxMGgxMnYxMHoiLz48L3N2Zz4=";

            /**
             * @desc These contain all _libraries that will be loaded dynamically in the current JS VM.
             * @type {LibraryDefinition}
             */
            this._libraries = {
                /* ----- LIBRARY DEFINITIONS GO HERE DURING COMPILATION. DO NOT REMOVE. ------ */
            };
        }

        /* ==================== STANDARD CALLBACKS ================= */

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
            return 'leogx9r';
        }

        /**
         * @public
         * @desc Returns the current version of the plugin.
         * @returns {string}
         */
        getVersion() {
            return '1.5.11';
        }

        /**
         * @public
         * @desc Starts the script execution. This is called by BetterDiscord if the plugin is enabled.
         */
        start() {
            /* Backup class instance. */
            const self = this;

            /* Perform idiot-proof check to make sure the user named the plugin `_discordCrypt.plugin.js` */
            if ( !_discordCrypt._validPluginName() ) {
                global.smalltalk.alert(
                    'Hi There! - DiscordCrypt',
                    "Oops!\r\n\r\n" +
                    "It seems you didn't read DiscordCrypt's usage guide. :(\r\n" +
                    "You need to name this plugin exactly as follows to allow it to function correctly.\r\n\r\n" +
                    `\t${_discordCrypt._getPluginName()}\r\n\r\n\r\n` +
                    "You should probably check the usage guide again just in case you missed anything else. :)"
                );
                return;
            }

            /* Perform startup and load the config file if not already loaded. */
            if ( !_configFile ) {
                /* Load the master password. */
                this._loadMasterPassword();

                /* Don't do anything further till we have a configuration file. */
                return;
            }

            /* Don't check for updates if running a debug version. */
            if ( !_discordCrypt._shouldIgnoreUpdates( this.getVersion() ) && _configFile.automaticUpdates ) {
                /* Check for any new updates. */
                this._checkForUpdates();

                /* Add an update handler to check for updates every 60 minutes. */
                _updateHandlerInterval = setInterval( () => {
                    self._checkForUpdates();
                }, 3600000 );
            }

            /* Get module searcher for caching. */
            const searcher = _discordCrypt._getWebpackModuleSearcher();

            /* Resolve and cache all modules needed. */
            _cachedModules = {
                NonceGenerator: searcher
                    .findByUniqueProperties( [ "extractTimestamp", "fromTimestamp" ] ),
                EmojiStore: searcher
                    .findByUniqueProperties( [ 'translateSurrogatesToInlineEmoji', 'getCategories' ] ),
                MessageCreator: searcher
                    .findByUniqueProperties( [ "createMessage", "parse", "unparse" ] ),
                MessageController: searcher
                    .findByUniqueProperties( [ "sendClydeError", "sendBotMessage" ] ),
                MarkdownParser: searcher
                    .findByUniqueProperties( [ "parseInline", "defaultParseBlock" ] ),
                GlobalTypes: searcher
                    .findByUniqueProperties( [ "ActionTypes", "ActivityTypes" ] ),
                MessageDispatcher: searcher
                    .findByUniqueProperties( [ "dispatch", "maybeDispatch", "dirtyDispatch" ] ),
                MessageQueue: searcher
                    .findByUniqueProperties( [ "enqueue", "handleSend", "handleResponse" ] ),
                UserStore: searcher
                    .findByUniqueProperties( [ "getUser", "getUsers", "findByTag" ] ),
                GuildStore: searcher
                    .findByUniqueProperties( [ "getGuild", "getGuilds" ] ),
                ChannelStore: searcher
                    .findByUniqueProperties( [ "getChannel", "getChannels", "getDMFromUserId", 'getDMUserIds' ] ),
                HighlightJS: searcher
                    .findByUniqueProperties( [ "initHighlighting", "highlightBlock", "highlightAuto" ] ),
            };

            /* Throw an error if a cached module can't be found. */
            for ( let prop in _cachedModules ) {
                if ( typeof _cachedModules[ prop ] !== 'object' ) {
                    global.smalltalk.alert( 'Error Loading DiscordCrypt', `Could not find requisite module: ${prop}` );
                    return;
                }
            }

            /* Hook the necessary functions required for functionality. */
            this._hookSetup();

            /* Block tracking and analytics. */
            this._blockTracking();

            /* Process any blocks on an interval since Discord loves to throttle messages. */
            _scanInterval = setInterval( () => {
                self._decodeMessages();
            }, _configFile.encryptScanDelay );

            /* Setup the timed message handler to trigger every 5 seconds. */
            _timedMessageInterval = setInterval( () => {
                /* Get the current time. */
                let n = Date.now();

                /* Loop over each message. */
                _configFile.timedMessages.forEach( ( e, i ) => {
                    /* Skip invalid elements. */
                    if ( !e || !e.expireTime ) {
                        /* Delete the index. */
                        _configFile.timedMessages.splice( i, 1 );

                        /* Update the configuration to the disk. */
                        self._saveConfig();
                    }

                    /* Only continue if the message has been expired. */
                    if ( e.expireTime < n ) {
                        /* Quickly log. */
                        _discordCrypt.log( `Deleting timed message "${_configFile.timedMessages[ i ].messageId}"` );

                        try {
                            /* Delete the message. This will be queued if a rate limit is in effect. */
                            _discordCrypt._deleteMessage( e.channelId, e.messageId, _cachedModules );
                        }
                        catch ( e ) {
                            /* Log the error that occurred. */
                            _discordCrypt.log( `${e.messageId}: ${e.toString()}`, 'error' );
                        }

                        /* Delete the index. */
                        _configFile.timedMessages.splice( i, 1 );

                        /* Update the configuration to the disk. */
                        self._saveConfig();
                    }
                } );

            }, 5000 );

            setImmediate( () => {
                /* Decode all messages immediately. */
                self._decodeMessages();
            } );
        }

        /**
         * @public
         * @desc Stops the script execution.
         *      This is called by BetterDiscord if the plugin is disabled or during shutdown.
         */
        stop() {
            /* Nothing needs to be done since start() wouldn't have triggered. */
            if ( !_discordCrypt._validPluginName() )
                return;

            /* Remove onMessage event handler hook. */
            $( this._channelTextAreaClass ).off( "keydown.dcrypt" );

            /* Unload the decryption interval. */
            clearInterval( _scanInterval );

            /* Unload the timed message handler. */
            clearInterval( _timedMessageInterval );

            /* Unload the update handler. */
            clearInterval( _updateHandlerInterval );

            /* Unload the toolbar reload interval if necessary. */
            if( _toolbarReloadInterval )
                clearInterval( _toolbarReloadInterval );

            /* Unload elements. */
            $( "#dc-overlay" ).remove();
            $( '#dc-file-btn' ).remove();
            $( '#dc-lock-btn' ).remove();
            $( '#dc-passwd-btn' ).remove();
            $( '#dc-exchange-btn' ).remove();
            $( '#dc-settings-btn' ).remove();
            $( '#dc-quick-exchange-btn' ).remove();
            $( '#dc-clipboard-upload-btn' ).remove();

            /* Remove all hooks & clear the storage. */
            for( let i = 0; i < _stopCallbacks.length; i++ )
                _stopCallbacks[ i ]();
            _stopCallbacks = [];

            /* Clear the configuration file. */
            _configFile = null;
        }

        /**
         * @public
         * @desc Triggered when the script has to load resources. This is called once upon Discord startup.
         */
        load() {

            /* Freeze the plugin instance if required. */
            if(
                global.bdplugins &&
                global.bdplugins[ this.getName() ] &&
                global.bdplugins[ this.getName() ].plugin
            ) {
                Object.freeze( bdplugins[ this.getName() ] );
                Object.freeze( bdplugins[ this.getName() ].plugin );
            }

            /* Inject application CSS. */
            _discordCrypt._injectCSS( 'dc-css', _discordCrypt.__zlibDecompress( this._appCss ) );

            /* Reapply the native code for Object.freeze() right before calling these as they freeze themselves. */
            Object.freeze = _freeze;

            /* Load necessary _libraries. */
            _discordCrypt.__loadLibraries( this._libraries );
        }

        /**
         * @public
         * @desc Triggered when the script needs to unload its resources. This is called during Discord shutdown.
         */
        unload() {
            /* Clear the injected CSS. */
            _discordCrypt._clearCSS( 'dc-css' );
        }

        /* ========================================================= */

        /* ================= CONFIGURATION DATA CBS ================ */

        /**
         * @private
         * @desc Returns the default settings for the plugin.
         * @returns {Config}
         */
        _getDefaultConfig() {
            return {
                /* Automatically check for updates. */
                automaticUpdates: true,
                /* Blacklisted updates. */
                blacklistedUpdates: [],
                /* Storage of channel settings */
                channelSettings: {},
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
                /* Default password for servers not set. */
                defaultPassword: "⠓⣭⡫⣮⢹⢮⠖⣦⠬⢬⣸⠳⠜⣍⢫⠳⣂⠙⣵⡘⡕⠐⢫⢗⠙⡱⠁⡷⠺⡗⠟⠡⢴⢖⢃⡙⢺⣄⣑⣗⢬⡱⣴⠮⡃⢏⢚⢣⣾⢎⢩⣙⠁⣶⢁⠷⣎⠇⠦⢃⠦⠇⣩⡅",
                /* Decrypted messages have this string prefixed to it. */
                decryptedPrefix: "🔐 ",
                /* Decrypted messages have this color. */
                decryptedColor: "green",
                /* Use local channel settings */
                localStates: false,
                /* Default padding mode for blocks. */
                paddingMode: 'PKC7',
                /* Password array of objects for users or channels. */
                passList: {},
                /* Internal message list for time expiration. */
                timedMessages: [],
                /* How long after a message is sent to remove it. */
                timedMessageExpires: 0,
                /* Whether to send messages using embedded objects. */
                useEmbeds: false,
                /* Contains the URL of the Up1 client. */
                up1Host: 'https://share.riseup.net',
                /* Contains the API key used for transactions with the Up1 host. */
                up1ApiKey: '59Mnk5nY6eCn4bi9GvfOXhMH54E7Bh6EMJXtyJfs',
                /* Current Version. */
                version: this.getVersion(),
            };
        }

        /**
         * @private
         * @desc Checks if the configuration file exists.
         * @returns {boolean} Returns true if the configuration file exists.
         */
        _configExists() {
            /* Attempt to parse the configuration file. */
            let data = bdPluginStorage.get( this.getName(), 'config' );

            /* The returned data must be defined and non-empty. */
            return data && data !== null && data !== '';
        }

        /**
         * @private
         * @desc Loads the configuration file from `DiscordCrypt.config.json` and
         *      adds or removes any properties required.
         * @returns {boolean}
         */
        _loadConfig() {
            _discordCrypt.log( 'Loading configuration file ...' );

            /* Attempt to parse the configuration file. */
            let config = bdPluginStorage.get( this.getName(), 'config' );

            /* Check if the config file exists. */
            if ( !config || config === null || config === '' ) {
                /* File doesn't exist, create a new one. */
                _configFile = this._getDefaultConfig();

                /* Save the config. */
                this._saveConfig();

                /* Nothing further to do. */
                return true;
            }

            try {
                /* Try parsing the decrypted data. */
                _configFile = JSON.parse(
                    _discordCrypt.__zlibDecompress(
                        _discordCrypt.__aes256_decrypt_gcm( config.data, _masterPassword, 'PKC7', 'base64', false ),
                        'base64',
                        'utf8'
                    )
                );
            }
            catch ( err ) {
                _discordCrypt.log( `Decryption of configuration file failed - ${err}`, 'error' );
                return false;
            }

            /* If it fails, return an error. */
            if ( !_configFile || !_configFile.version ) {
                _discordCrypt.log( 'Decryption of configuration file failed.', 'error' );
                return false;
            }

            /* Try checking for each property within the config file and make sure it exists. */
            let defaultConfig = this._getDefaultConfig(), needs_save = false;

            /* Iterate all defined properties in the default configuration file. */
            for ( let prop in defaultConfig ) {
                /* If the defined property doesn't exist in the current configuration file ... */
                if (
                    !_configFile.hasOwnProperty( prop ) ||
                    (
                        typeof _configFile[ prop ] !== typeof defaultConfig[ prop ] &&
                        !Array.isArray( defaultConfig[ prop ] )
                    )
                ) {
                    /* Use the default. */
                    _configFile[ prop ] = defaultConfig[ prop ];

                    /* Show a simple log. */
                    _discordCrypt.log(
                        `Default value added for missing property '${prop}' in the configuration file.`
                    );

                    /* Set the flag for saving. */
                    needs_save = true;
                }
            }

            /* Iterate all defined properties in the current configuration file and remove any undefined ones. */
            for ( let prop in _configFile ) {
                /* If the default configuration doesn't contain this property, delete it as it's unnecessary. */
                if ( !defaultConfig.hasOwnProperty( prop ) ) {
                    /* Delete the property. */
                    delete _configFile[ prop ];

                    /* Show a simple log. */
                    _discordCrypt.log( `Removing unknown property '${prop}' from the configuration file.` );

                    /* Set the flag for saving. */
                    needs_save = true;
                }
            }

            /* Check for version mismatch. */
            if ( _configFile.version !== this.getVersion() ) {
                /* Preserve the old version for logging. */
                let oldVersion = _configFile.version;

                /* Preserve the old password list before updating. */
                let oldCache = _configFile.passList;

                /* Get the most recent default configuration. */
                _configFile = this._getDefaultConfig();

                /* Now restore the password list. */
                _configFile.passList = oldCache;

                /* Set the flag for saving. */
                needs_save = true;

                /* Alert. */
                _discordCrypt.log( `Updated plugin version from v${oldVersion} to v${this.getVersion()}.` );
            }

            /* Save the configuration file if necessary. */
            if ( needs_save )
                this._saveConfig();

            _discordCrypt.log( `Loaded configuration file! - v${_configFile.version}` );

            return true;
        }

        /**
         * @private
         * @desc Saves the configuration file with the current password using AES-256 in GCM mode.
         */
        _saveConfig() {
            /* Encrypt the message using the master password and save the encrypted data. */
            bdPluginStorage.set( this.getName(), 'config', {
                data:
                    _discordCrypt.__aes256_encrypt_gcm(
                        _discordCrypt.__zlibCompress(
                            JSON.stringify( _configFile ),
                            'utf8'
                        ),
                        _masterPassword,
                        'PKC7',
                        false
                    )
            } );
        }

        /**
         * @private
         * @desc Updates and saves the configuration data used and updates a given button's text.
         * @param {Object} [btn] The jQuery button to set the update text for.
         */
        _saveSettings( btn ) {
            /* Save the configuration file. */
            this._saveConfig();

            /* Force decode messages. */
            this._decodeMessages( true );

            if( btn ) {
                /* Tell the user that their settings were applied. */
                btn.text( 'Saved & Applied!' );

                /* Reset the original text after a second. */
                setTimeout( ( function () {
                    btn.text( 'Save & Apply' );
                } ), 1000 );
            }
        }

        /**
         * @private
         * @desc Resets the default configuration data used and updates a given button's text.
         * @param {Object} [btn] The jQuery button to set the update text for.
         */
        _resetSettings( btn ) {
            /* Preserve the old password list before resetting. */
            let oldCache = _configFile.passList;

            /* Retrieve the default configuration. */
            _configFile = this._getDefaultConfig();

            /* Restore the old passwords. */
            _configFile.passList = oldCache;

            /* Save the configuration file to update any settings. */
            this._saveConfig();

            /* Force decode messages. */
            this._decodeMessages( true );

            if( btn ) {
                /* Tell the user that their settings were reset. */
                btn.text( 'Restored Default Settings!' );

                /* Reset the original text after a second. */
                setTimeout( ( function () {
                    btn.text( 'Reset Settings' );
                } ), 1000 );
            }
        }

        /**
         * @private
         * @desc Update the current password field and save the config file.
         */
        _updatePasswords() {
            /* Don't save if the password overlay is not open. */
            if ( $( '#dc-overlay-password' ).css( 'display' ) !== 'block' )
                return;

            let prim = $( "#dc-password-primary" );
            let sec = $( "#dc-password-secondary" );

            /* Check if a primary password has actually been entered. */
            if ( !( prim.val() !== '' && prim.val().length > 1 ) ) {
                delete _configFile.passList[ _discordCrypt._getChannelId() ];

                /* Disable auto-encrypt for that channel */
                this._setAutoEncrypt( false );
            }
            else {
                /* Update the password field for this id. */
                _configFile.passList[ _discordCrypt._getChannelId() ] =
                    _discordCrypt._createPassword( prim.val(), '' );

                /* Only check for a secondary password if the primary password has been entered. */
                if ( sec.val() !== '' && sec.val().length > 1 )
                    _configFile.passList[ _discordCrypt._getChannelId() ].secondary = sec.val();

                /* Update the password toolbar. */
                prim.val( '' );
                sec.val( '' );

                /* Enable auto-encrypt for the channel */
                this._setAutoEncrypt( true );
            }

            /* Save the configuration file and decode any messages. */
            this._saveConfig();

            /* Decode any messages with the new password(s). */
            this._decodeMessages( true );
        }

        /* ========================================================= */

        /* ==================== MAIN CALLBACKS ==================== */

        /**
         * @private
         * @desc Hook Discord's internal event handlers for message decryption.
         * @return {boolean} Returns true if handler events have been hooked.
         */
        _hookMessageCallbacks() {
            /* Find the main switch event dispatcher. */
            let _messageUpdateDispatcher = _discordCrypt._getWebpackModuleSearcher().findByDispatchNames( [
                'LOAD_MESSAGES',
                'LOAD_MESSAGES_SUCCESS',
                'LOAD_MESSAGES_FAILURE',
                'TRUNCATE_MESSAGES',
                'MESSAGE_CREATE',
                'MESSAGE_UPDATE',
                'MESSAGE_DELETE',
                'MESSAGE_DELETE_BULK',
                'MESSAGE_REVEAL',
                'CHANNEL_SELECT',
                'CHANNEL_CREATE',
                'CHANNEL_PRELOAD',
                'GUILD_CREATE',
                'GUILD_SELECT',
                'GUILD_DELETE'
            ] );

            /* Don't proceed if it failed. */
            if ( !_messageUpdateDispatcher ) {
                _discordCrypt.log( `Failed to locate the switch event dispatcher!`, 'error' );
                return false;
            }

            /* Hook the switch event dispatcher. */
            _discordCrypt._hookDispatcher(
                _messageUpdateDispatcher,
                'CHANNEL_SELECT',
                {
                    after: ( e ) => {
                        /* Skip channels not currently selected. */
                        if ( _discordCrypt._getChannelId() !== e.methodArguments[ 0 ].channelId )
                            return;

                        /* Delays are required due to windows being loaded async. */
                        setTimeout(
                            () => {
                                _discordCrypt.log( 'Detected chat switch.', 'debug' );

                                /* Make sure localStates is enabled */
                                if( _configFile.localStates ) {

                                    /* Checks if channel is in channel settings storage and enables it if it isn't. */
                                    if( !_configFile.channelSettings[ _discordCrypt._getChannelId() ] )
                                        _configFile.channelSettings[ _discordCrypt._getChannelId() ] =
                                            { autoEncrypt: true };

                                    /* Update the lock icon since it is local to the channel */
                                    _discordCrypt._updateLockIcon( this );
                                }

                                /* Add the toolbar. */
                                this._loadToolbar();

                                /* Attach the message handler. */
                                this._attachHandler();

                                /* Decrypt any messages. */
                                this._decodeMessages();
                            },
                            1
                        );
                    }
                }
            );

            let messageUpdateEvent = {
                after: ( e ) => {
                    /* Skip channels not currently selected. */
                    if ( _discordCrypt._getChannelId() !== e.methodArguments[ 0 ].channelId )
                        return;

                    /* Delays are required due to windows being loaded async. */
                    setTimeout(
                        () => {
                            /* Decrypt any messages. */
                            this._decodeMessages();
                        },
                        1
                    );
                }
            };

            /* Hook incoming message creation dispatcher. */
            _discordCrypt._hookDispatcher( _messageUpdateDispatcher, 'MESSAGE_CREATE', messageUpdateEvent );
            _discordCrypt._hookDispatcher( _messageUpdateDispatcher, 'MESSAGE_UPDATE', messageUpdateEvent );

            return true;
        }

        /**
         * @private
         * @desc Sets up the hooking methods required for proper plugin functionality.
         */
        _hookSetup() {
            const moduleSearcher = discordCrypt._getWebpackModuleSearcher();

            /* Hook switch events as the main event processor. */
            if ( !this._hookMessageCallbacks() ) {
                /* The toolbar fails to properly load on switches to the friends list. Create an interval to do this. */
                _toolbarReloadInterval = setInterval( () => {
                    self._loadToolbar();
                    self._attachHandler();
                }, 5000 );
            }
            else {
                setImmediate( () => {
                    /* Add the toolbar. */
                    this._loadToolbar();

                    /* Attach the message handler. */
                    this._attachHandler();
                } );
            }

            /* Patch emoji selection to force it to be enabled for full-encryption messages. */
            _discordCrypt._monkeyPatch(
                moduleSearcher.findByUniqueProperties( [ 'isEmojiDisabled' ] ),
                'isEmojiDisabled',
                {
                    instead: ( patchData ) => {
                        if(
                            _discordCrypt._getChannelId() === patchData.methodArguments[ 1 ].id &&
                            this._hasCustomPassword( patchData.methodArguments[ 1 ].id ) &&
                            this._getAutoEncrypt()
                        )
                            return false;

                        return patchData.callOriginalMethod(
                            patchData.methodArguments[ 0 ],
                            patchData.methodArguments[ 1 ]
                        );
                    }
                }
            )
        }

        /**
         * @private
         * @desc Loads the master-password unlocking prompt.
         */
        _loadMasterPassword() {
            const self = this;

            if ( $( '#dc-master-overlay' ).length !== 0 )
                return;

            /* Check if the database exists. */
            const cfg_exists = self._configExists();

            const action_msg = cfg_exists ? 'Unlock Database' : 'Create Database';

            /* Construct the password updating field. */
            $( document.body ).prepend( _discordCrypt.__zlibDecompress( this._masterPasswordHtml ) );

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
            unlock_btn.click(
                _discordCrypt._onMasterUnlockButtonClicked(
                    self,
                    unlock_btn,
                    cfg_exists,
                    pwd_field,
                    action_msg,
                    master_status
                )
            );

            /* Handle cancel button presses. */
            cancel_btn.click( _discordCrypt._onMasterCancelButtonClicked( self ) );
        }

        /**
         * @private
         * @desc Performs an async update checking and handles actually updating the current version if necessary.
         */
        _checkForUpdates() {
            const self = this;
            const update_check_btn = $( '#dc-update-check-btn' );

            try {

                /* Sanity check in case this isn't defined yet. */
                if( update_check_btn.length ) {
                    /* Update the checking button. */
                    update_check_btn.attr( 'disabled', true );
                    update_check_btn.text( 'Checking For Updates ...' );
                }

                /* Perform the update check. */
                _discordCrypt._checkForUpdate(
                    ( info ) => {

                        /* Sanity check in case this isn't defined yet. */
                        if( update_check_btn.length ) {
                            /* Reset the update check button if necessary. */
                            update_check_btn.attr( 'disabled', false );
                            update_check_btn.text( 'Check For Updates' );
                        }

                        /* Make sure an update was received. */
                        if( !info )
                            return;

                        /* Alert the user of the update and changelog. */
                        $( '#dc-overlay' ).css( 'display', 'block' );
                        $( '#dc-update-overlay' ).css( 'display', 'block' );

                        /* Update the version info. */
                        $( '#dc-new-version' ).text(
                            `New Version: ${info.version === '' ? 'N/A' : info.version} ` +
                            `( #${info.hash.slice( 0, 16 )} - ` +
                            `Update ${info.valid ? 'Verified' : 'Contains Invalid Signature. BE CAREFUL'}! )`
                        );
                        $( '#dc-old-version' ).text( `Current Version: ${self.getVersion()} ` );

                        /* Update the changelog. */
                        let dc_changelog = $( '#dc-changelog' );
                        dc_changelog.val(
                            typeof info.changelog === "string" && info.changelog.length > 0 ?
                                _discordCrypt.__tryParseChangelog( info.changelog, self.getVersion() ) :
                                'N/A'
                        );

                        /* Scroll to the top of the changelog. */
                        dc_changelog.scrollTop( 0 );

                        /* Store the update information in the upper scope. */
                        _updateData = info;
                    },
                    _configFile.blacklistedUpdates
                );
            }
            catch ( ex ) {
                _discordCrypt.log( ex, 'warn' );
            }
        }

        /**
         * @private
         * @desc Updates the auto-encrypt toggle
         * @param {boolean} enable
         */
        _setAutoEncrypt( enable ) {
            if( _configFile.localStates )
                _configFile.channelSettings[ _discordCrypt._getChannelId() ].autoEncrypt = enable;
            else
                _configFile.encodeAll = enable;
        }

        /**
         * @private
         * @desc Returns whether or not auto-encrypt is enabled
         * @returns {boolean}
         */
        _getAutoEncrypt() {
            /* Quick sanity check. */
            if( !_configFile )
                return false;

            /* Fetch the current value depending on if local states are enabled. */
            if( _configFile.localStates )
                return _configFile.channelSettings[ _discordCrypt._getChannelId() ].autoEncrypt;
            else
                return _configFile.encodeAll;
        }

        /**
         * @private
         * @desc Inserts the plugin's option toolbar to the current toolbar and handles all triggers.
         */
        _loadToolbar() {

            /* Skip if the configuration hasn't been loaded. */
            if ( !_configFile )
                return;

            /* Skip if we're not in an active channel. */
            if ( _discordCrypt._getChannelId() === '@me' )
                return;

            /* Add toolbar buttons and their icons if it doesn't exist. */
            if ( $( '#dc-toolbar' ).length !== 0 )
                return;

            /* Inject the toolbar. */
            $( this._searchUiClass )
                .parent()
                .parent()
                .parent()
                .prepend( _discordCrypt.__zlibDecompress( this._toolbarHtml ) );

            /* Cache jQuery results. */
            let dc_passwd_btn = $( '#dc-passwd-btn' ),
                dc_lock_btn = $( '#dc-lock-btn' ),
                dc_svg = $( '.dc-svg' ),
                lock_tooltip = $( '<span>' ).addClass( 'dc-tooltip-text' );

            /* Set the SVG button class. */
            dc_svg.attr( 'class', 'dc-svg' );

            /* Set the initial status icon. */
            if ( dc_lock_btn.length > 0 ) {
                if ( this._getAutoEncrypt() ) {
                    dc_lock_btn.html( Buffer.from( this._lockIcon, 'base64' ).toString( 'utf8' ) );
                    dc_lock_btn.append( lock_tooltip.text( 'Disable Message Encryption' ) );
                }
                else {
                    dc_lock_btn.html( Buffer.from( this._unlockIcon, 'base64' ).toString( 'utf8' ) );
                    dc_lock_btn.append( lock_tooltip.text( 'Enable Message Encryption' ) );
                }

                /* Set the button class. */
                dc_svg.attr( 'class', 'dc-svg' );
            }

            /* Inject the settings. */
            $( document.body ).prepend( _discordCrypt.__zlibDecompress( this._settingsMenuHtml ) );

            /* Also by default, set the about tab to be shown. */
            _discordCrypt._setActiveSettingsTab( 0 );
            _discordCrypt._setActiveExchangeTab( 0 );

            /* Update all settings from the settings panel. */
            $( '#dc-secondary-cipher' ).val( _discordCrypt.__cipherIndexToString( _configFile.encryptMode, true ) );
            $( '#dc-primary-cipher' ).val( _discordCrypt.__cipherIndexToString( _configFile.encryptMode, false ) );
            $( '#dc-settings-cipher-mode' ).val( _configFile.encryptBlockMode.toLowerCase() );
            $( '#dc-settings-padding-mode' ).val( _configFile.paddingMode.toLowerCase() );
            $( '#dc-settings-encrypt-trigger' ).val( _configFile.encodeMessageTrigger );
            $( '#dc-settings-timed-expire' ).val( _configFile.timedMessageExpires );
            $( '#dc-settings-decrypted-prefix' ).val( _configFile.decryptedPrefix );
            $( '#dc-settings-decrypted-color' ).val( _configFile.decryptedColor );
            $( '#dc-settings-default-pwd' ).val( _configFile.defaultPassword );
            $( '#dc-settings-scan-delay' ).val( _configFile.encryptScanDelay );
            $( '#dc-local-states' ).prop( 'checked', _configFile.localStates );
            $( '#dc-embed-enabled' ).prop( 'checked', _configFile.useEmbeds );

            /* Handle clipboard upload button. */
            $( '#dc-clipboard-upload-btn' ).click( _discordCrypt._onUploadEncryptedClipboardButtonClicked( this ) );

            /* Handle file button clicked. */
            $( '#dc-file-btn' ).click( _discordCrypt._onFileMenuButtonClicked );

            /* Handle alter file path button. */
            $( '#dc-select-file-path-btn' ).click( _discordCrypt._onChangeFileButtonClicked );

            /* Handle file upload button. */
            $( '#dc-file-upload-btn' ).click( _discordCrypt._onUploadFileButtonClicked( this ) );

            /* Handle file button cancelled. */
            $( '#dc-file-cancel-btn' ).click( _discordCrypt._onCloseFileMenuButtonClicked );

            /* Handle Settings tab opening. */
            $( '#dc-settings-btn' ).click( _discordCrypt._onSettingsButtonClicked );

            /* Handle Plugin Settings tab selected. */
            $( '#dc-plugin-settings-btn' ).click( _discordCrypt._onSettingsTabButtonClicked );

            /* Handle Database Settings tab selected. */
            $( '#dc-database-settings-btn' ).click( _discordCrypt._onDatabaseTabButtonClicked( this ) );

            /* Handle Security Settings tab selected. */
            $( '#dc-security-settings-btn' ).click( _discordCrypt._onSecurityTabButtonClicked( this ) );

            /* Handle Automatic Updates button clicked. */
            $( '#dc-automatic-updates-enabled' ).change( _discordCrypt._onAutomaticUpdateCheckboxChanged( this ) );

            /* Handle checking for updates. */
            $( '#dc-update-check-btn' ).click( _discordCrypt._onCheckForUpdatesButtonClicked( this ) );

            /* Handle Database Import button. */
            $( '#dc-import-database-btn' ).click( _discordCrypt._onImportDatabaseButtonClicked( this ) );

            /* Handle Database Export button. */
            $( '#dc-export-database-btn' ).click( _discordCrypt._onExportDatabaseButtonClicked );

            /* Handle Clear Database Entries button. */
            $( '#dc-erase-entries-btn' ).click( _discordCrypt._onClearDatabaseEntriesButtonClicked( this ) );

            /* Handle Settings tab closing. */
            $( '#dc-exit-settings-btn' ).click( _discordCrypt._onSettingsCloseButtonClicked );

            /* Handle Save settings. */
            $( '#dc-settings-save-btn' ).click( _discordCrypt._onSaveSettingsButtonClicked( this ) );

            /* Handle Reset settings. */
            $( '#dc-settings-reset-btn' ).click( _discordCrypt._onResetSettingsButtonClicked( this ) );

            /* Handle Restart-Now button clicking. */
            $( '#dc-restart-now-btn' ).click( _discordCrypt._onUpdateRestartNowButtonClicked );

            /* Handle Restart-Later button clicking. */
            $( '#dc-restart-later-btn' ).click( _discordCrypt._onUpdateRestartLaterButtonClicked );

            /* Handle Ignore-Update button clicking. */
            $( '#dc-ignore-update-btn' ).click( _discordCrypt._onUpdateIgnoreButtonClicked( this ) );

            /* Handle Info tab switch. */
            $( '#dc-tab-info-btn' ).click( _discordCrypt._onExchangeInfoTabButtonClicked );

            /* Handle Keygen tab switch. */
            $( '#dc-tab-keygen-btn' ).click( _discordCrypt._onExchangeKeygenTabButtonClicked );

            /* Handle Handshake tab switch. */
            $( '#dc-tab-handshake-btn' ).click( _discordCrypt._onExchangeHandshakeButtonClicked );

            /* Handle exit tab button. */
            $( '#dc-exit-exchange-btn' ).click( _discordCrypt._onExchangeCloseButtonClicked );

            /* Open exchange menu. */
            $( '#dc-exchange-btn' ).click( _discordCrypt._onOpenExchangeMenuButtonClicked );

            /* Quickly generate and send a public key. */
            $( '#dc-quick-exchange-btn' ).click( _discordCrypt._onQuickHandshakeButtonClicked );

            /* Repopulate the bit length options for the generator when switching handshake algorithms. */
            $( '#dc-keygen-method' ).change( _discordCrypt._onExchangeAlgorithmChanged );

            /* Generate a new key-pair on clicking. */
            $( '#dc-keygen-gen-btn' ).click( _discordCrypt._onExchangeGenerateKeyPairButtonClicked );

            /* Clear the public & private key fields. */
            $( '#dc-keygen-clear-btn' ).click( _discordCrypt._onExchangeClearKeyButtonClicked );

            /* Send the public key to the current channel. */
            $( '#dc-keygen-send-pub-btn' ).click( _discordCrypt._onExchangeSendPublicKeyButtonClicked( this ) );

            /* Paste the data from the clipboard to the public key field. */
            $( '#dc-handshake-paste-btn' ).click( _discordCrypt._onHandshakePastePublicKeyButtonClicked );

            /* Compute the primary and secondary keys. */
            $( '#dc-handshake-compute-btn' ).click( _discordCrypt._onHandshakeComputeButtonClicked( this ) );

            /* Copy the primary and secondary key to the clipboard. */
            $( '#dc-handshake-cpy-keys-btn' ).click( _discordCrypt._onHandshakeCopyKeysButtonClicked );

            /* Apply generated keys to the current channel. */
            $( '#dc-handshake-apply-keys-btn' ).click( _discordCrypt._onHandshakeApplyKeysButtonClicked( this ) );

            /* Show the overlay when clicking the password button. */
            dc_passwd_btn.click( _discordCrypt._onOpenPasswordMenuButtonClicked );

            /* Update the password for the user once clicked. */
            $( '#dc-save-pwd' ).click( _discordCrypt._onSavePasswordsButtonClicked( this ) );

            /* Reset the password for the user to the default. */
            $( '#dc-reset-pwd' ).click( _discordCrypt._onResetPasswordsButtonClicked( this ) );

            /* Hide the overlay when clicking cancel. */
            $( '#dc-cancel-btn' ).click( _discordCrypt._onClosePasswordMenuButtonClicked );

            /* Copy the current passwords to the clipboard. */
            $( '#dc-cpy-pwds-btn' ).click( _discordCrypt._onCopyCurrentPasswordsButtonClicked );

            /* Set whether auto-encryption is enabled or disabled. */
            dc_lock_btn.click( _discordCrypt._onForceEncryptButtonClicked( this ) );
        }

        /**
         * @private
         * @desc Attached a handler to the message area and dispatches encrypted messages if necessary.
         */
        _attachHandler() {
            const self = this;

            /* Get the text area. */
            let textarea = $( this._channelTextAreaClass );

            /* Make sure we got one element. */
            if ( textarea.length !== 1 )
                return;

            /* Replace any old handlers before adding the new one. */
            textarea.off( "keydown.dcrypt" ).on( "keydown.dcrypt", ( function ( e ) {
                let code = e.keyCode || e.which;

                /* Skip if we don't have a valid configuration. */
                if ( !_configFile )
                    return;

                /* Execute on ENTER/RETURN only. */
                if ( code !== 13 )
                    return;

                /* Skip if shift key is down indicating going to a new line. */
                if ( e.shiftKey )
                    return;

                /* Skip if autocomplete dialog is opened. */
                if ( $( self._autoCompleteClass )[ 0 ] )
                    return;

                /* Encrypt the parsed message and send it. */
                if ( !self._sendEncryptedMessage(
                    _cachedModules
                        .MessageCreator
                        .parse( _discordCrypt._getChannelProps(), $( this ).val() ).content
                ) )
                    return;

                /* Clear text field. */
                _discordCrypt._getElementReactOwner( $( 'form' )[ 0 ] ).setState( { textValue: '' } );

                /* Cancel the default sending action. */
                e.preventDefault();
                e.stopPropagation();
            } ) );
        }

        /**
         * @private
         * @desc Determines if a custom password exists for the specified channel.
         * @param {string} channel_id The target channel's ID.
         * @return {boolean} Returns true if a custom password is set.
         */
        _hasCustomPassword( channel_id ) {
            return _configFile.passList[ channel_id ] &&
                _configFile.passList[ channel_id ].primary &&
                _configFile.passList[ channel_id ].secondary;
        }

        /**
         * @private
         * @desc Parses a public key message and adds the exchange button to it if necessary.
         * @param {Object} obj The jQuery object of the current message being examined.
         * @returns {boolean} Returns true.
         */
        _parseKeyMessage( obj ) {
            /* Extract the algorithm info from the message's metadata. */
            let metadata = _discordCrypt.__extractKeyInfo( obj.text().replace( /\r?\n|\r/g, '' ), true );

            /* Sanity check for invalid key messages. */
            if ( metadata === null )
                return true;

            /* Compute the fingerprint of our currently known public key if any to determine if to proceed. */
            let local_fingerprint = _discordCrypt.__sha256( Buffer.from( $( '#dc-pub-key-ta' ).val(), 'hex' ), 'hex' );

            /* Skip if this is our current public key. */
            if ( metadata[ 'fingerprint' ] === local_fingerprint )
                return true;

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

                /* Cache jQuery results. */
                let dc_keygen_method = $( '#dc-keygen-method' ),
                    dc_keygen_algorithm = $( '#dc-keygen-algorithm' );

                /* Simulate pressing the exchange key button. */
                $( '#dc-exchange-btn' ).click();

                /* If the current algorithm differs, change it and generate then send a new key. */
                if (
                    dc_keygen_method.val() !== metadata[ 'algorithm' ] ||
                    parseInt( dc_keygen_algorithm.val() ) !== metadata[ 'bit_length' ]
                ) {
                    /* Switch. */
                    dc_keygen_method.val( metadata[ 'algorithm' ] );

                    /* Fire the change event so the second list updates. */
                    dc_keygen_method.change();

                    /* Update the key size. */
                    dc_keygen_algorithm.val( metadata[ 'bit_length' ] );

                    /* Generate a new key pair. */
                    $( '#dc-keygen-gen-btn' ).click();

                    /* Send the public key. */
                    $( '#dc-keygen-send-pub-btn' ).click();
                }
                /* If we don't have a key yet, generate and send one. */
                else if ( $( '#dc-pub-key-ta' ).val() === '' ) {
                    /* Generate a new key pair. */
                    $( '#dc-keygen-gen-btn' ).click();

                    /* Send the public key. */
                    $( '#dc-keygen-send-pub-btn' ).click();
                }

                /* Open the handshake menu. */
                $( '#dc-tab-handshake-btn' ).click();

                /* Apply the key to the field. */
                $( '#dc-handshake-ppk' ).val( obj.text() );

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
         * @param {string} primary_key The primary key used to decrypt the message.
         * @param {string} secondary_key The secondary key used to decrypt the message.
         * @param {boolean} as_embed Whether to consider this message object as an embed.
         * @param {string} [prefix] Messages that are successfully decrypted should have this prefix prepended.
         * @param {string} [color] Messages that get successfully decrypted should have this color.
         * @returns {boolean} Returns true if the message has been decrypted.
         */
        _parseSymmetric( obj, primary_key, secondary_key, as_embed, prefix, color ) {
            let message = $( obj );
            let dataMsg;

            /**********************************************************************************************************
             *  MESSAGE FORMAT:
             *
             *  + 0x0000 [ 4        Chars ] - Message Magic | Key Magic
             *  + 0x0004 [ 4 ( #4 ) Chars ] - Message Metadata ( #1 ) | Key Data ( #3 )
             *  + 0x000C [ ?        Chars ] - Cipher Text
             *
             *  * 0x0004 - Options - Substituted Base64 encoding of a single word stored in Little Endian.
             *      [ 31 ... 24 ] - Algorithm ( 0-24 = Dual )
             *      [ 23 ... 16 ] - Block Mode ( 0 = CBC | 1 = CFB | 2 = OFB )
             *      [ 15 ... 08 ] - Padding Mode ( #2 )
             *      [ 07 ... 00 ] - Random Padding Byte
             *
             *  #1 - Encode( Base64( Encryption Algorithm << 24 | Padding Mode << 16 | Block Mode << 8 | Reserved ) )
             *  #2 - ( 0 - PKCS #7 | 1 = ANSI X9.23 | 2 = ISO 10126 | 3 = ISO97971 )
             *  #3 - Substitute( Base64( ( Key Algorithm Type & 0xff ) + Public Key ) )
             *  #4 - 8 Byte Metadata For Messages Only
             *
             **********************************************************************************************************/

            /* Skip if the message is <= size of the total header. */
            if ( message.text().length <= 12 )
                return false;

            /* Split off the magic. */
            let magic = message.text().slice( 0, 4 );

            /* If this is a public key, just add a button and continue. */
            if ( magic === this._encodedKeyHeader )
                return this._parseKeyMessage( message );

            /* Make sure it has the correct header. */
            if ( magic !== this._encodedMessageHeader )
                return false;

            /* Try to deserialize the metadata. */
            let metadata = _discordCrypt.__metaDataDecode( message.text().slice( 4, 8 ) );

            /* Try looking for an algorithm, mode and padding type. */
            /* Algorithm first. */
            if ( metadata[ 0 ] >= this._encryptModes.length )
                return false;

            /* Cipher mode next. */
            if ( metadata[ 1 ] >= this._encryptBlockModes.length )
                return false;

            /* Padding after. */
            if ( metadata[ 2 ] >= this._paddingModes.length )
                return false;

            /* Decrypt the message. */
            dataMsg = _discordCrypt.__symmetricDecrypt( message.text().replace( /\r?\n|\r/g, '' )
                .substr( 8 ), primary_key, secondary_key, metadata[ 0 ], metadata[ 1 ], metadata[ 2 ], true );

            /* If decryption didn't fail, set the decoded text along with a green foreground. */
            if ( ( typeof dataMsg === 'string' || dataMsg instanceof String ) && dataMsg !== "" ) {
                /* If this is an embed, increase the maximum width of it. */
                if ( as_embed ) {
                    /* Expand the message to the maximum width. */
                    message.parent().parent().parent().parent().css( 'max-width', '100%' );
                }

                /* Process the message and apply all necessary element modifications. */
                dataMsg = this._postProcessMessage( dataMsg, _configFile.up1Host );

                /* Handle embeds and inline blocks differently. */
                if ( as_embed ) {
                    /* Set the new HTML. */
                    message.html( dataMsg.html );
                }
                else {
                    /* For inline code blocks, we set the HTML to the parent element. */
                    let tmp = message.parent();
                    message.parent().html( dataMsg.html );

                    /* And update the message object with the parent element. */
                    message = $( tmp );
                }

                /* Decrypted messages get set to the predefined color. */
                if( color && typeof color === 'string' && color.length > 0 )
                    message.css( 'color', color );

                /* If a prefix is being used, add it now. */
                if( prefix && typeof prefix === 'string' && prefix.length > 0 )
                    message.prepend( prefix );
            }
            else {
                /* If it failed, set a red foreground and set a failure message to prevent further retries. */
                if ( dataMsg === 1 )
                    message.text( '🚫 [ ERROR ] AUTHENTICATION OF CIPHER TEXT FAILED !!!' );
                else if ( dataMsg === 2 )
                    message.text( '🚫 [ ERROR ] FAILED TO DECRYPT CIPHER TEXT !!!' );
                else
                    message.text( '🚫 [ ERROR ] DECRYPTION FAILURE. INVALID KEY OR MALFORMED MESSAGE !!!' );
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
         * @returns {ProcessedMessage}
         */
        _postProcessMessage( message, embed_link_prefix ) {

            /* Quick jQuery trick to encode special html characters to prevent XSS */
            message = $( '<div/>' ).text( message ).html();

            /* Extract any code blocks from the message. */
            let processed = _discordCrypt.__buildCodeBlockMessage( message );
            let hasCode = processed.code;

            /* Extract any URLs. */
            processed = _discordCrypt.__buildUrlMessage( processed.html, embed_link_prefix );
            let hasUrl = processed.url;

            /* Extract any Emojis. */
            processed = _discordCrypt.__buildEmojiMessage(
                processed.html,
                this._emojisClass,
                _cachedModules.EmojiStore
            );
            let hasEmojis = processed.emoji;

            /* Return the raw HTML. */
            return {
                url: hasUrl,
                code: hasCode,
                emoji: hasEmojis,
                html: processed.html,
            };
        }

        /**
         * @private
         * @desc Iterates all messages in the current channel and tries to decrypt each, skipping cached results.
         */
        _decodeMessages() {
            /* Skip if a valid configuration file has not been loaded. */
            if ( !_configFile || !_configFile.version )
                return;

            /* Save self. */
            const self = this;

            /* Get the current channel ID. */
            let id = _discordCrypt._getChannelId();

            /* Use the default password for decryption if one hasn't been defined for this channel. */
            let primary = Buffer.from(
                _configFile.passList[ id ] && _configFile.passList[ id ].primary ?
                    _configFile.passList[ id ].primary :
                    _configFile.defaultPassword
            );
            let secondary = Buffer.from(
                _configFile.passList[ id ] && _configFile.passList[ id ].secondary ?
                    _configFile.passList[ id ].secondary :
                    _configFile.defaultPassword
            );

            /* Look through each markup element to find an embedDescription. */
            $( this._embedDescriptionClass ).each( ( function () {
                /* Skip parsed messages. */
                if ( $( this ).data( 'dc-parsed' ) !== undefined )
                    return;

                /* Try parsing a symmetric message. */
                self._parseSymmetric(
                    this,
                    primary,
                    secondary,
                    true,
                    _configFile.decryptedPrefix,
                    _configFile.decryptedColor
                );

                /* Set the flag. */
                $( this ).data( 'dc-parsed', true );
            } ) );

            /* Look through markup classes for inline code blocks. */
            $( this._messageMarkupClass ).each( ( function () {
                /* Skip parsed messages. */
                if ( $( this ).data( 'dc-parsed' ) !== undefined )
                    return;

                /* Try parsing a symmetric message. */
                self._parseSymmetric(
                    this,
                    primary,
                    secondary,
                    false,
                    _configFile.decryptedPrefix,
                    _configFile.decryptedColor
                );

                /* Set the flag. */
                $( this ).data( 'dc-parsed', true );
            } ) );
        }

        /**
         * @private
         * @desc Sends an encrypted message to the current channel.
         * @param {string} message The unencrypted message to send.
         * @param {boolean} [force_send] Whether to ignore checking for the encryption trigger and
         *      always encrypt and send.
         * @param {int} [channel_id] If specified, sends the embedded message to this channel instead of the current
         *      channel.
         * @returns {boolean} Returns false if the message failed to be parsed correctly and 0 on success.
         */
        _sendEncryptedMessage( message, force_send = false, channel_id = undefined ) {
            /* Let's use a maximum message size of 1820 instead of 2000 to account for encoding, new line feeds & packet
         header. */
            const maximum_encoded_data = 1820;

            /* Add the message signal handler. */
            const escapeCharacters = [ "/" ];
            const crypto = require( 'crypto' );

            let cleaned;

            /* Skip messages starting with pre-defined escape characters. */
            if ( message.substr( 0, 2 ) === "##" || escapeCharacters.indexOf( message[ 0 ] ) !== -1 )
                return false;

            /* If we're not encoding all messages or we don't have a password, strip off the magic string. */
            if ( force_send === false &&
                ( !_configFile.passList[ _discordCrypt._getChannelId() ] ||
                    !_configFile.passList[ _discordCrypt._getChannelId() ].primary ||
                    !this._getAutoEncrypt() )
            ) {
                /* Try splitting via the defined split-arg. */
                message = message.split( '|' );

                /* Check if the message actually has the split arg. */
                if ( message.length <= 0 )
                    return false;

                /* Check if it has the trigger. */
                if ( message[ message.length - 1 ] !== _configFile.encodeMessageTrigger )
                    return false;

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
                return false;

            /* Try parsing any user-tags. */
            let parsed = _discordCrypt.__extractTags( cleaned, _discordCrypt._getChannelProps() );

            /* Sanity check for messages with just spaces or new line feeds in it. */
            if ( parsed[ 0 ].length !== 0 ) {
                /* Extract the message to be encrypted. */
                cleaned = parsed[ 0 ];
            }

            /* Add content tags. */
            let user_tags = parsed[ 1 ].length > 0 ? parsed[ 1 ] : '';

            /* Get the passwords. */
            let primaryPassword = Buffer.from(
                _configFile.passList[ _discordCrypt._getChannelId() ] ?
                    _configFile.passList[ _discordCrypt._getChannelId() ].primary :
                    _configFile.defaultPassword
            );

            let secondaryPassword = Buffer.from(
                _configFile.passList[ _discordCrypt._getChannelId() ] ?
                    _configFile.passList[ _discordCrypt._getChannelId() ].secondary :
                    _configFile.defaultPassword
            );

            /* If the message length is less than the threshold, we can send it without splitting. */
            if ( ( cleaned.length + 16 ) < maximum_encoded_data ) {
                /* Encrypt the message. */
                let msg = _discordCrypt.__symmetricEncrypt(
                    cleaned,
                    primaryPassword,
                    secondaryPassword,
                    _configFile.encryptMode,
                    _configFile.encryptBlockMode,
                    _configFile.paddingMode,
                    true
                );

                /* Append the header to the message normally. */
                msg = this._encodedMessageHeader + _discordCrypt.__metaDataEncode
                (
                    _configFile.encryptMode,
                    _configFile.encryptBlockMode,
                    _configFile.paddingMode,
                    parseInt( crypto.pseudoRandomBytes( 1 )[ 0 ] )
                ) + msg;

                /* Break up the message into lines. */
                msg = msg.replace( /(.{32})/g, ( e ) => {
                    return `${e}\n`
                } );

                /* Send the message. */
                _discordCrypt._dispatchMessage(
                    _configFile.useEmbeds,
                    msg,
                    this._messageHeader,
                    `v${this.getVersion().replace( '-debug', '' )}`,
                    0x551A8B,
                    user_tags,
                    channel_id,
                    _configFile.timedMessages,
                    _configFile.timedMessageExpires
                );
            }
            else {
                /* Determine how many packets we need to split this into. */
                let packets = _discordCrypt.__splitStringChunks( cleaned, maximum_encoded_data );
                for ( let i = 0; i < packets.length; i++ ) {
                    /* Encrypt the message. */
                    let msg = _discordCrypt.__symmetricEncrypt(
                        packets[ i ],
                        primaryPassword,
                        secondaryPassword,
                        _configFile.encryptMode,
                        _configFile.encryptBlockMode,
                        _configFile.paddingMode,
                        true
                    );

                    /* Append the header to the message normally. */
                    msg = this._encodedMessageHeader + _discordCrypt.__metaDataEncode
                    (
                        _configFile.encryptMode,
                        _configFile.encryptBlockMode,
                        _configFile.paddingMode,
                        parseInt( crypto.pseudoRandomBytes( 1 )[ 0 ] )
                    ) + msg;

                    /* Break up the message into lines. */
                    msg = msg.replace( /(.{32})/g, ( e ) => {
                        return `${e}\n`
                    } );

                    /* Send the message. */
                    _discordCrypt._dispatchMessage(
                        _configFile.useEmbeds,
                        msg,
                        this._messageHeader,
                        `v${this.getVersion().replace( '-debug', '' )}`,
                        0x551A8B,
                        i === 0 ? user_tags : '',
                        channel_id,
                        _configFile.timedMessages,
                        _configFile.timedMessageExpires
                    );
                }
            }

            /* Save the configuration file and store the new message(s). */
            this._saveConfig();

            return true;
        }

        /**
         * @private
         * @desc Block all forms of tracking.
         */
        _blockTracking() {
            /**
             * @protected
             * @desc Patches a specific prototype with the new function.
             * @param {Array<string>|string} name The name or names of prototypes to search for.
             *      The first name will be patched if this is an array.
             * @param {function} fn The function to override the call with.
             * @param scanner
             */
            const patchPrototype = ( name, fn, scanner ) => {
                try {
                    let obj = scanner( Array.isArray( name ) ? name : [ name ] );

                    if( Array.isArray( name ) )
                        obj.prototype[ name[ 0 ] ] = fn;
                    else
                        obj.prototype[ name ] = fn;

                    _freeze( obj.prototype );
                }
                catch( e ) {
                    _discordCrypt.log(
                        `Failed to patch prototype: ${Array.isArray( name ) ? name[ 0 ] : name}\n${e}`,
                        'error'
                    );
                }
            };
            /**
             * @protected
             * @desc Patches a specific property with the new function.
             * @param {Array<string>|string} name The name or names of properties to search for.
             *      The first name will be patched if this is an array.
             * @param {function} fn The function to override the call with.
             * @param scanner
             */
            const patchProperty = ( name, fn, scanner ) => {
                try {
                    let obj = scanner( Array.isArray( name ) ? name : [ name ] );

                    if( Array.isArray( name ) )
                        obj[ name[ 0 ] ] = fn;
                    else
                        obj[ name ] = fn;

                    _freeze( obj );
                }
                catch( e ) {
                    _discordCrypt.log(
                        `Failed to patch property: ${Array.isArray( name ) ? name[ 0 ] : name}\n${e}`,
                        'error'
                    );
                }
            };

            /* Retrieve the scanner. */
            let searcher = _discordCrypt._getWebpackModuleSearcher();

            /**
             * @desc Patches a prototype to replace it then seals the object.
             * @param {string} name The name of the prototype to patch.
             * @param {string} message The message to log when the patched method is called.
             */
            const blockPrototype = ( name, message ) => {
                /* Remove quality reports. */
                patchPrototype(
                    name,
                    () => _discordCrypt.log( message, 'info' ),
                    searcher.findByUniquePrototypes
                );
            };

            /**
             * @desc Patches a property to replace it then seals the object.
             * @param {string} name The name of the property to patch.
             * @param {string} message The message to log when the patched method is called.
             * @param {function} fn The optional function to replace with.
             */
            const blockProperty = ( name, message, fn ) => {
                /* Remove quality reports. */
                patchProperty(
                    name,
                    fn ? fn : () => _discordCrypt.log( message, 'info' ),
                    searcher.findByUniqueProperties
                );
            };

            /* Remove quality reports. */
            blockPrototype( '_sendQualityReports', 'Blocked a voice quality report.' );

            /* Remove Raven/Sentry tracking. */
            blockPrototype( '_sendProcessedPayload', 'Blocked a Sentry tracking report.' );

            /* Remove various metadata tracking. */
            blockPrototype( 'trackWithMetadata', 'Blocked metadata tracking.' );
            blockPrototype( 'trackWithGroupMetadata', 'Blocked metadata tracking.' );
            blockPrototype( 'trackWithOverlayMetadata', 'Blocked metadata tracking.' );

            /* Block retrieval of analytics token. */
            blockProperty( 'getAnalyticsToken', '', () => {
                _discordCrypt.log( 'Blocked retrieval of analytics token.', 'info' );
                return '';
            } );

            /* Block sending of BrainTree's analytics. */
            blockProperty( 'sendEvent', '', () => {
                _discordCrypt.log( 'Blocked BrainTree from sending analytics.', 'info' );
                return '';
            } );

            /* Block reporting of suspicious code. */
            blockProperty( 'hasSuspiciousCode', 'Disabling suspicious code reporting', () => false );
        }

        /* ========================================================= */

        /* ================== UI HANDLE CALLBACKS ================== */

        /**
         * @private
         * @desc Attempts to unlock the database upon startup.
         * @param {_discordCrypt} self
         * @param {Object} unlock_btn
         * @param {boolean} cfg_exists
         * @param {Object} pwd_field
         * @param {string} action_msg
         * @param {Object} master_status
         * @return {Function}
         */
        static _onMasterUnlockButtonClicked( self, unlock_btn, cfg_exists, pwd_field, action_msg, master_status ) {
            return () => {
                /* Disable the button before clicking. */
                unlock_btn.attr( 'disabled', true );

                /* Update the text. */
                if ( cfg_exists )
                    unlock_btn.text( 'Unlocking Database ...' );
                else
                    unlock_btn.text( 'Creating Database ...' );

                /* Get the password entered. */
                let password = pwd_field.val();

                /* Validate the field entered contains some value and meets the requirements. */
                if ( password && !_discordCrypt.__validatePasswordRequisites( password ) ) {
                    unlock_btn.text( action_msg );
                    unlock_btn.attr( 'disabled', false );
                    return;
                }

                /* Hash the password. */
                _discordCrypt.__scrypt
                (
                    Buffer.from( password ),
                    Buffer.from( _discordCrypt.__whirlpool( password, true ), 'hex' ),
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
                                unlock_btn.text( `Error: ${error}` );

                            /* Clear the text field. */
                            pwd_field.val( '' );

                            /* Reset the progress bar. */
                            master_status.css( 'width', '0%' );

                            /* Reset the text of the button after 1 second. */
                            setTimeout( ( function () {
                                unlock_btn.text( action_msg );
                            } ), 1000 );

                            _discordCrypt.log( error.toString(), 'error' );
                            return true;
                        }

                        if ( progress )
                            master_status.css( 'width', `${parseInt( progress * 100 )}%` );

                        if ( pwd ) {
                            /* To test whether this is the correct password or not, we have to attempt to use it. */
                            _masterPassword = Buffer.from( pwd, 'hex' );

                            /* Attempt to load the database with this password. */
                            if ( !self._loadConfig() ) {
                                _configFile = null;

                                /* Update the button's text. */
                                if ( cfg_exists )
                                    unlock_btn.text( 'Invalid Password!' );
                                else
                                    unlock_btn.text( 'Failed to create the database!' );

                                /* Clear the text field. */
                                pwd_field.val( '' );

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
            }
        }

        /**
         * @private
         * @desc Cancels loading the plugin when the unlocking cancel button is pressed.
         * @param {_discordCrypt} self
         * @return {Function}
         */
        static _onMasterCancelButtonClicked( self ) {
            return () => {
                /* Basically we remove the prompt overlay and load the toolbar but set every element to hidden except
                    the button to reopen the menu. */

                /* These are all buttons we'll be targeting for hiding. */
                let target_btns = [
                    '#dc-clipboard-upload-btn',
                    '#dc-file-btn',
                    '#dc-settings-btn',
                    '#dc-lock-btn',
                    '#dc-passwd-btn',
                    '#dc-exchange-btn',
                    '#dc-quick-exchange-btn'
                ];

                /* Handles reloading of the injected toolbar on switching channels. */
                let injectedInterval;

                /* Remove the prompt overlay. */
                $( '#dc-master-overlay' ).remove();

                /* Do some quick cleanup. */
                _masterPassword = null;
                _configFile = null;

                /* Handle this on an interval for switching channels. */
                injectedInterval = setInterval( () => {
                    /* Skip if the toolbar has already been injected. */
                    if( $( '#dc-toolbar' ).length )
                        return;

                    /* Inject the toolbar. */
                    $( self._searchUiClass )
                        .parent()
                        .parent()
                        .parent()
                        .prepend( _discordCrypt.__zlibDecompress( self._toolbarHtml ) );

                    let dc_db_prompt_btn = $( '#dc-db-prompt-btn' );

                    /* Set the Unlock DB Prompt button to visible. */
                    dc_db_prompt_btn.css( 'display', 'inline' );

                    /* Hide every other button. */
                    target_btns.forEach( id => $( id ).css( 'display', 'none' ) );

                    /* Add the button click event to reopen the menu. */
                    dc_db_prompt_btn.click( function() {
                        /* Clear the interval. */
                        clearInterval( injectedInterval );

                        /* Remove the toolbar. */
                        $( '#dc-toolbar' ).remove();

                        /* Reopen the prompt. */
                        self._loadMasterPassword();
                    } );
                }, 1000 );
            };
        }

        /**
         * @private
         * @desc Opens the file uploading menu.
         */
        static _onFileMenuButtonClicked() {
            /* Show main background. */
            $( '#dc-overlay' ).css( 'display', 'block' );

            /* Show the upload overlay. */
            $( '#dc-overlay-upload' ).css( 'display', 'block' );
        }

        /**
         * @private
         * @desc Opens the file menu selection.
         */
        static _onChangeFileButtonClicked() {
            /* Create an input element. */
            let file = require( 'electron' ).remote.dialog.showOpenDialog( {
                title: 'Select a file to encrypt and upload',
                buttonLabel: 'Select',
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
         * @param {_discordCrypt} self
         * @returns {Function}
         */
        static _onUploadEncryptedClipboardButtonClicked( self ) {
            return () => {
                /* Since this is an async operation, we need to backup the channel ID before doing this. */
                let channel_id = _discordCrypt._getChannelId();

                /* Upload the clipboard. */
                _discordCrypt.__up1UploadClipboard(
                    _configFile.up1Host,
                    _configFile.up1ApiKey,
                    global.sjcl,
                    ( error_string, file_url, deletion_link ) => {
                        /* Do some sanity checking. */
                        if (
                            error_string !== null ||
                            typeof file_url !== 'string' ||
                            typeof deletion_link !== 'string'
                        ) {
                            global.smalltalk.alert( 'Failed to upload the clipboard!', error_string );
                            return;
                        }

                        /* Format and send the message. */
                        self._sendEncryptedMessage( `${file_url}`, true, channel_id );

                        /* Copy the deletion link to the clipboard. */
                        require( 'electron' ).clipboard.writeText( `Delete URL: ${deletion_link}` );
                    }
                );
            };
        }

        /**
         * @private
         * @desc  Uploads the selected file and sends the encrypted link.
         * @param {_discordCrypt} self
         * @returns {Function}
         */
        static _onUploadFileButtonClicked( self ) {
            return () => {
                const fs = require( 'original-fs' );

                let file_path_field = $( '#dc-file-path' );
                let file_upload_btn = $( '#dc-file-upload-btn' );
                let message_textarea = $( '#dc-file-message-textarea' );
                let send_deletion_link = $( '#dc-file-deletion-checkbox' ).is( ':checked' );
                let randomize_file_name = $( '#dc-file-name-random-checkbox' ).is( ':checked' );

                /* Send the additional text first if it's valid. */
                if ( message_textarea.val().length > 0 )
                    self._sendEncryptedMessage( message_textarea.val(), true );

                /* Since this is an async operation, we need to backup the channel ID before doing this. */
                let channel_id = _discordCrypt._getChannelId();

                /* Clear the message field. */
                message_textarea.val( '' );

                /* Sanity check the file. */
                if ( !fs.existsSync( file_path_field.val() ) ) {
                    file_path_field.val( '' );
                    return;
                }

                /* Set the status text. */
                file_upload_btn.text( 'Uploading ...' );
                file_upload_btn.addClass( 'dc-button-inverse' );

                /* Upload the file. */
                _discordCrypt.__up1UploadFile(
                    file_path_field.val(),
                    _configFile.up1Host,
                    _configFile.up1ApiKey,
                    global.sjcl,
                    ( error_string, file_url, deletion_link ) => {
                        /* Do some sanity checking. */
                        if (
                            error_string !== null ||
                            typeof file_url !== 'string' ||
                            typeof deletion_link !== 'string'
                        ) {
                            /* Set the status text. */
                            file_upload_btn.text( 'Failed to upload the file!' );
                            _discordCrypt.log( error_string, 'error' );

                            /* Clear the file path. */
                            file_path_field.val( '' );

                            /* Reset the status text after 1 second. */
                            setTimeout( () => {
                                file_upload_btn.text( 'Upload' );
                                file_upload_btn.removeClass( 'dc-button-inverse' );
                            }, 1000 );

                            return;
                        }

                        /* Format and send the message. */
                        self._sendEncryptedMessage(
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
                            file_upload_btn.removeClass( 'dc-button-inverse' );

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
        static _onCloseFileMenuButtonClicked() {
            /* Clear old file name. */
            $( '#dc-file-path' ).val( '' );

            /* Show main background. */
            $( '#dc-overlay' ).css( 'display', 'none' );

            /* Show the upload overlay. */
            $( '#dc-overlay-upload' ).css( 'display', 'none' );
        }

        /**
         * @private
         * @desc Opens the settings menu.
         */
        static _onSettingsButtonClicked() {
            /* Show main background. */
            $( '#dc-overlay' ).css( 'display', 'block' );

            /* Show the main settings menu. */
            $( '#dc-overlay-settings' ).css( 'display', 'block' );
        }

        /**
         * @private
         * @desc Selects the Plugin Settings tab.
         */
        static _onSettingsTabButtonClicked() {
            /* Select the plugin settings. */
            _discordCrypt._setActiveSettingsTab( 0 );
        }

        /**
         * @private
         * @desc Selects the Database Settings tab and loads key info.
         * @param {_discordCrypt} self
         * @return {Function}
         */
        static _onDatabaseTabButtonClicked( self ) {
            return () => {
                let users, guilds, channels, table;

                /* Cache the table. */
                table = $( '#dc-database-entries' );

                /* Clear all entries. */
                table.html( '' );

                /* Resolve all users, guilds and channels the current user is a part of. */
                users = _cachedModules.UserStore.getUsers();
                guilds = _cachedModules.GuildStore.getGuilds();
                channels = _cachedModules.ChannelStore.getChannels();

                /* Iterate over each password in the configuration. */
                for ( let prop in _configFile.passList ) {
                    let name, id = prop;

                    /* Skip channels that don't have an ID. */
                    if ( !channels[ id ] )
                        continue;

                    /* Check for the correct channel type. */
                    if ( channels[ id ].type === 0 ) {
                        /* Guild Channel */
                        let guild = guilds[ channels[ id ].guild_id ];

                        /* Resolve the name as a "Guild @ #Channel" format. */
                        name = `${guild.name} @ #${channels[ id ].name}`;
                    }
                    else if ( channels[ id ].type === 1 ) {
                        /* DM */
                        let user = users[ channels[ id ].recipients[ 0 ] ];

                        /* Indicate this is a DM and give the full user name. */
                        name = `DM @${user.username}#${user.discriminator}`;
                    }
                    else
                        continue;

                    /* Create the elements needed for building the row. */
                    let element =
                            $( `<tr><td>${id}</td><td>${name}</td><td><div style="display:flex;"></div></td></tr>` ),
                        delete_btn = $( '<button>' )
                            .addClass( 'dc-button dc-button-small dc-button-inverse' )
                            .text( 'Delete' ),
                        copy_btn = $( '<button>' )
                            .addClass( 'dc-button dc-button-small dc-button-inverse' )
                            .text( 'Copy' ),
                        show_fingerprint_btn = $( '<button>' )
                            .addClass( 'dc-button dc-button-small dc-button-inverse' )
                            .text( 'Show Fingerprint' );

                    /* Handle deletion clicks. */
                    delete_btn.click( function () {
                        /* Delete the entry. */
                        delete _configFile.passList[ id ];

                        /* Disable auto-encryption for the channel if present. */
                        if( _configFile.channelSettings[ id ] )
                            _configFile.channelSettings[ id ].autoEncrypt = false;

                        /* Save the configuration. */
                        self._saveConfig();

                        /* Remove the entire row. */
                        delete_btn.parent().parent().parent().remove();
                    } );

                    /* Handle copy clicks. */
                    copy_btn.click( function() {
                        /* Resolve the entry. */
                        let current_keys = _configFile.passList[ id ];

                        /* Write to the clipboard. */
                        require( 'electron' ).clipboard.writeText(
                            `Primary Key: ${current_keys.primary}\n\nSecondary Key: ${current_keys.secondary}`
                        );

                        copy_btn.text( 'Copied Keys' );

                        setTimeout( () => {
                            copy_btn.text( 'Copy' );
                        }, 1000 );
                    } );

                    /* Handle fingerprint calculation. */

                    /* Handle copy clicks. */
                    show_fingerprint_btn.click( function() {
                        /* Resolve the entry. */
                        let currentKeys = _configFile.passList[ id ];

                        /* Calculate the fingerprint using either the Guild ID & Channel or Channel & UserID. */
                        let fingerprint = _discordCrypt.__generateFingerprint(
                            id,
                            currentKeys.primary,
                            id,
                            currentKeys.secondary,
                            5000
                        );

                        global.smalltalk.prompt(
                            'Fingerprint',
                            "<b>N.B. VERIFY THESE OVER A NON-TEXT COMMUNICATION METHOD!</b><br/><br/><br/>" +
                            `Your Fingerprint: [ \`${name}\` ]:\n\n`,
                            fingerprint,
                            { button: [ 'OK' ] }
                        );
                    } );

                    /* Append the button to the Options column. */
                    $( $( element.children()[ 2 ] ).children()[ 0 ] ).append( copy_btn );

                    /* Append the button to the Options column. */
                    $( $( element.children()[ 2 ] ).children()[ 0 ] ).append( delete_btn );

                    /* Append the button to the Options column. */
                    $( $( element.children()[ 2 ] ).children()[ 0 ] ).append( show_fingerprint_btn );

                    /* Append the entire entry to the table. */
                    table.append( element );
                }

                /* Select the database settings. */
                _discordCrypt._setActiveSettingsTab( 1 );
            };
        }

        /**
         * @private
         * @desc Selects the Security Settings tab and loads all blacklisted updates.
         * @param {_discordCrypt} self
         * @return {Function}
         */
        static _onSecurityTabButtonClicked( self ) {
            return () => {
                /* Get the table to show blacklisted updates. */
                let table = $( '#dc-update-blacklist-entries' );

                /* Iterate over all entries. */
                for ( let i = 0; i < _configFile.blacklistedUpdates.length; i++ ) {
                    /* Get the update info. */
                    let updateInfo = _configFile.blacklistedUpdates[ i ];

                    /* Skip empty values.*/
                    if( !updateInfo )
                        continue;

                    /* Create the elements needed for building the row. */
                    let element =
                            $( `<tr><td>${updateInfo.version}</td><td><div style="display:flex;"></div></td></tr>` ),
                        remove_btn = $( '<button>' )
                            .addClass( 'dc-button dc-button-small dc-button-inverse' )
                            .text( 'Remove' ),
                        changelog_btn = $( '<button>' )
                            .addClass( 'dc-button dc-button-small dc-button-inverse' )
                            .text( 'View Changelog' ),
                        info_btn = $( '<button>' )
                            .addClass( 'dc-button dc-button-small dc-button-inverse' )
                            .text( 'Info' );

                    /* Handle the remove entry button clicked. */
                    remove_btn.click( function () {
                        /* Delete the entry. */
                        delete _configFile.blacklistedUpdates[ i ];
                        _configFile.blacklistedUpdates = _configFile.blacklistedUpdates.filter( e => e );

                        /* Save the configuration. */
                        self._saveConfig();

                        /* Remove the entire row. */
                        remove_btn.parent().parent().parent().remove();
                    } );

                    /* Handle the changelog button clicked. */
                    changelog_btn.click( function() {
                        global.smalltalk.alert(
                            `Changes`,
                            _discordCrypt.__tryParseChangelog( updateInfo.changelog, self.getVersion() )
                        );
                    } );

                    /* Handle the signatures button clicked. */
                    info_btn.click( async function() {
                        let key_id = Buffer.from(
                            (
                                await global
                                    .openpgp
                                    .key
                                    .readArmored( _discordCrypt.__zlibDecompress( _signingKey ) )
                            )
                                .keys[ 0 ]
                                .primaryKey
                                .fingerprint
                        )
                            .toString( 'hex' )
                            .toUpperCase();

                        global.smalltalk.alert(
                            'Update Info',
                            `<strong>Version</strong>: ${updateInfo.version}\n\n` +
                            `<strong>Verified</strong>: ${updateInfo.valid ? 'Yes' : 'No'}\n\n` +
                            `<strong>Key ID</strong>: ${key_id}\n\n` +
                            `<strong>Hash</strong>: ${updateInfo.hash}\n\n` +
                            '<code class="hljs dc-code-block" style="background: none !important;">' +
                            `${updateInfo.signature}</code>`
                        );
                    } );

                    /* Add all option buttons to the Options column. */
                    $( $( element.children()[ 1 ] ).children()[ 0 ] ).append( changelog_btn );
                    $( $( element.children()[ 1 ] ).children()[ 0 ] ).append( info_btn );
                    $( $( element.children()[ 1 ] ).children()[ 0 ] ).append( remove_btn );

                    /* Add the row to the table. */
                    table.append( element );
                }

                /* Set the current state of automatic updates. */
                $( '#dc-automatic-updates-enabled' ).prop( 'checked', _configFile.automaticUpdates );

                /* Select the security settings. */
                _discordCrypt._setActiveSettingsTab( 2 );
            };
        }

        /**
         * @private
         * @desc Toggles the automatic update checking function.
         * @param self
         * @return {Function}
         */
        static _onAutomaticUpdateCheckboxChanged( self ) {
            return () => {
                /* Set the state. */
                _configFile.automaticUpdates = $( '#dc-automatic-updates-enabled' )
                    .is( ':checked' );

                /* Save the configuration. */
                self._saveConfig();

                /* Log. */
                _discordCrypt.log( `${_configFile.automaticUpdates ? 'En' : 'Dis'}abled automatic updates.`, 'debug' );

                /* Skip if we don't need to update. */
                if( !_discordCrypt._shouldIgnoreUpdates( self.getVersion() ) ) {
                    /* If we're doing automatic updates, make sure an interval is set. */
                    if( _configFile.automaticUpdates ) {
                        /* Only do this if none is defined. */
                        if( !_updateHandlerInterval ) {
                            /* Add an update handler to check for updates every 60 minutes. */
                            _updateHandlerInterval = setInterval( () => {
                                self._checkForUpdates();
                            }, 3600000 );
                        }
                    }
                    /* Make sure no interval is defined. */
                    else if( _updateHandlerInterval ) {
                        /* Make sure to clear all intervals. */
                        clearInterval( _updateHandlerInterval );
                        _updateHandlerInterval = null;
                    }
                }
            }
        }

        /**
         * @private
         * @desc Checks for updates immediately.
         * @param self
         * @return {Function}
         */
        static _onCheckForUpdatesButtonClicked( self ) {
            return () => {
                /* Simply call the wrapper, everything else will be handled by this. */
                self._checkForUpdates();
            }
        }

        /**
         * @private
         * @desc Opens a file dialog to import a JSON encoded entries file.
         * @param self
         * @return {Function}
         */
        static _onImportDatabaseButtonClicked( self ) {
            return () => {
                /* Get the FS module. */
                const fs = require( 'fs' );

                /* Create an input element. */
                let files = require( 'electron' ).remote.dialog.showOpenDialog( {
                    title: 'Import Database',
                    message: 'Select the configuration file(s) to import',
                    buttonLabel: 'Import',
                    filters: [ {
                        name: 'Database Entries ( *.json )',
                        extensions: [ 'json' ]
                    } ],
                    properties: [ 'openFile', 'multiSelections', 'showHiddenFiles', 'treatPackageAsDirectory' ]
                } );

                /* Ignore if no files was selected. */
                if ( !files.length )
                    return;

                /* Cache the button. */
                let import_btn = $( '#dc-import-database-btn' );

                /* For reference. */
                let imported = 0;

                /* Update the status. */
                import_btn.text( `Importing ( ${files.length} ) File(s)` );

                /* Loop over every file.  */
                for ( let i = 0; i < files.length; i++ ) {
                    let file = files[ i ],
                        data;

                    /* Sanity check. */
                    if ( !fs.statSync( file ).isFile() )
                        continue;

                    /* Read the file. */
                    try {
                        data = JSON.parse( fs.readFileSync( file ).toString() );
                    }
                    catch ( e ) {
                        _discordCrypt.log( `Error reading JSON file '${file} ...`, 'warn' );
                        continue;
                    }

                    /* Make sure the root element of entries exists. */
                    if ( !data._discordCrypt_entries || !data._discordCrypt_entries.length )
                        continue;

                    /* Iterate all entries. */
                    for ( let j = 0; j < data._discordCrypt_entries.length; j++ ) {
                        let e = data._discordCrypt_entries[ j ];

                        /* Skip invalid entries. */
                        if ( !e.id || !e.primary || !e.secondary )
                            continue;

                        /* Determine if to count this as an import or an update which aren't counted. */
                        if ( !_configFile.passList.hasOwnProperty( e.id ) ) {
                            /* Update the number imported. */
                            imported++;
                        }

                        /* Add it to the configuration file. */
                        _configFile.passList[ e.id ] = _discordCrypt._createPassword( e.primary, e.secondary );
                    }
                }

                /* Update the button's text. */
                setTimeout( () => {
                    import_btn.text( `Imported (${imported}) ${imported === 1 ? 'Entry' : 'Entries'}` );

                    /* Reset the button's text. */
                    setTimeout( () => {
                        import_btn.text( 'Import Database(s)' );
                    }, 1000 );

                }, 500 );

                /* Determine if to save the database. */
                if ( imported !== 0 ) {
                    /* Trigger updating the database entries field. */
                    _discordCrypt._onDatabaseTabButtonClicked( self )();

                    /* Save the configuration. */
                    self._saveConfig();
                }
            };
        }

        /**
         * @private
         * @desc Opens a file dialog to import a JSON encoded entries file.
         */
        static _onExportDatabaseButtonClicked() {
            /* Create an input element. */
            let file = require( 'electron' ).remote.dialog.showSaveDialog( {
                title: 'Export Database',
                message: 'Select the destination file',
                buttonLabel: 'Export',
                filters: [ {
                    name: 'Database Entries ( *.json )',
                    extensions: [ 'json' ]
                } ]
            } );

            /* Ignore if no files was selected. */
            if ( !file.length )
                return;

            /* Get the FS module. */
            const fs = require( 'fs' );

            /* Cache the button. */
            let export_btn = $( '#dc-export-database-btn' );

            /* Create the main object for exporting. */
            let data = { _discordCrypt_entries: [] },
                entries;

            /* Iterate each entry in the configuration file. */
            for ( let prop in _configFile.passList ) {
                let e = _configFile.passList[ prop ];

                /* Insert the entry to the list. */
                data._discordCrypt_entries.push( {
                    id: prop,
                    primary: e.primary,
                    secondary: e.secondary
                } );
            }

            /* Update the entry count. */
            entries = data._discordCrypt_entries.length;

            try {
                /* Try writing the file. */
                fs.writeFileSync( file, JSON.stringify( data, null, '    ' ) );

                /* Update the button's text. */
                export_btn.text( `Exported (${entries}) ${entries === 1 ? 'Entry' : 'Entries'}` );
            }
            catch ( e ) {
                /* Log an error. */
                _discordCrypt.log( `Error exporting entries: ${e.toString()}`, 'error' );

                /* Update the button's text. */
                export_btn.text( 'Error: See Console' );
            }

            /* Reset the button's text. */
            setTimeout( () => {
                export_btn.text( 'Export Database' );
            }, 1000 );
        }

        /**
         * @private
         * @desc Clears all entries in the database.
         * @param self
         * @return {Function}
         */
        static _onClearDatabaseEntriesButtonClicked( self ) {
            return () => {
                /* Cache the button. */
                let erase_entries_btn = $( '#dc-erase-entries-btn' );

                /* Remove all entries. */
                _configFile.passList = {};

                /* Clear the table. */
                $( '#dc-database-entries' ).html( '' );

                /* Save the database. */
                self._saveConfig();

                /* Update the button's text. */
                erase_entries_btn.text( 'Cleared Entries' );

                /* Reset the button's text. */
                setTimeout( () => {
                    erase_entries_btn.text( 'Erase Entries' );
                }, 1000 );
            };
        }

        /**
         * @private
         * @desc Closes the settings menu.
         */
        static _onSettingsCloseButtonClicked() {
            /* Select the plugin settings. */
            _discordCrypt._setActiveSettingsTab( 0 );

            /* Hide main background. */
            $( '#dc-overlay' ).css( 'display', 'none' );

            /* Hide the main settings menu. */
            $( '#dc-overlay-settings' ).css( 'display', 'none' );
        }

        /**
         * @private
         * @desc Saves all settings.
         * @param {_discordCrypt} self
         * @returns {Function}
         */
        static _onSaveSettingsButtonClicked( self ) {
            return () => {

                /* Cache jQuery results. */
                let dc_primary_cipher = $( '#dc-primary-cipher' ),
                    dc_secondary_cipher = $( '#dc-secondary-cipher' ),
                    dc_master_password = $( '#dc-master-password' ),
                    dc_save_settings_btn = $( '#dc-settings-save-btn' );

                /* Update all settings from the settings panel. */
                _configFile.timedMessageExpires = parseInt( $( '#dc-settings-timed-expire' ).val() );
                _configFile.encryptScanDelay = parseInt( $( '#dc-settings-scan-delay' ).val() );
                _configFile.encodeMessageTrigger = $( '#dc-settings-encrypt-trigger' ).val();
                _configFile.decryptedPrefix = $( '#dc-settings-decrypted-prefix' ).val();
                _configFile.decryptedColor = $( '#dc-settings-decrypted-color' ).val();
                _configFile.encryptBlockMode = $( '#dc-settings-cipher-mode' ).val();
                _configFile.defaultPassword = $( '#dc-settings-default-pwd' ).val();
                _configFile.paddingMode = $( '#dc-settings-padding-mode' ).val();
                _configFile.useEmbeds = $( '#dc-embed-enabled' ).is( ':checked' );
                _configFile.localStates = $( '#dc-local-states' ).is( ':checked' );
                _configFile.encryptMode = _discordCrypt
                    .__cipherStringToIndex( dc_primary_cipher.val(), dc_secondary_cipher.val() );

                dc_primary_cipher.val( _discordCrypt.__cipherIndexToString( _configFile.encryptMode, false ) );
                dc_secondary_cipher.val( _discordCrypt.__cipherIndexToString( _configFile.encryptMode, true ) );

                /* Remove all channel settings if disabled */
                if( !_configFile.localStates )
                    _configFile.channelSettings = {};

                /* Checks if channel is in channel settings storage and adds it*/
                else if( !_configFile.channelSettings[ _discordCrypt._getChannelId() ] )
                    _configFile.channelSettings[ _discordCrypt._getChannelId() ] =
                        { autoEncrypt: true };

                /* Update icon */
                _discordCrypt._updateLockIcon( self );

                /* Handle master password updates if necessary. */
                if ( dc_master_password.val() !== '' ) {
                    let password = dc_master_password.val();

                    /* Ensure the password meets the requirements. */
                    if( !_discordCrypt.__validatePasswordRequisites( password ) )
                        return;

                    /* Reset the password field. */
                    dc_master_password.val( '' );

                    /* Disable the button since this takes a while. */
                    dc_save_settings_btn.attr( 'disabled', true );

                    /* Hash the password. */
                    _discordCrypt.__scrypt
                    (
                        Buffer.from( password ),
                        Buffer.from( _discordCrypt.__whirlpool( password, true ), 'hex' ),
                        32,
                        4096,
                        8,
                        1,
                        ( error, progress, pwd ) => {
                            /* Enable the button. */
                            dc_save_settings_btn.attr( 'disabled', false );

                            if ( error ) {
                                /* Alert the user. */
                                global.smalltalk.alert(
                                    'DiscordCrypt Error',
                                    'Error setting the new database password. Check the console for more info.'
                                );

                                _discordCrypt.log( error.toString(), 'error' );

                                return true;
                            }

                            if ( pwd ) {
                                /* Now update the password. */
                                _masterPassword = Buffer.from( pwd, 'hex' );

                                /* Save the configuration file and update the button text. */
                                self._saveSettings( dc_save_settings_btn );
                            }

                            return false;
                        }
                    );
                }
                else {
                    /* Save the configuration file and update the button text. */
                    self._saveSettings( dc_save_settings_btn );
                }
            };
        }

        /**
         * @private
         * @desc Resets the user settings to their default values.
         * @param {_discordCrypt} self
         * @returns {Function}
         */
        static _onResetSettingsButtonClicked( self ) {
            return () => {
                /* Resets the configuration file and update the button text. */
                self._resetSettings( $( '#dc-settings-reset-btn' ) );

                /* Update all settings from the settings panel. */
                $( '#dc-secondary-cipher' ).val( _discordCrypt.__cipherIndexToString( _configFile.encryptMode, true ) );
                $( '#dc-primary-cipher' ).val( _discordCrypt.__cipherIndexToString( _configFile.encryptMode, false ) );
                $( '#dc-settings-cipher-mode' ).val( _configFile.encryptBlockMode.toLowerCase() );
                $( '#dc-settings-padding-mode' ).val( _configFile.paddingMode.toLowerCase() );
                $( '#dc-settings-encrypt-trigger' ).val( _configFile.encodeMessageTrigger );
                $( '#dc-settings-timed-expire' ).val( _configFile.timedMessageExpires );
                $( '#dc-settings-decrypted-prefix' ).val( _configFile.decryptedPrefix );
                $( '#dc-settings-decrypted-color' ).val( _configFile.decryptedColor );
                $( '#dc-settings-default-pwd' ).val( _configFile.defaultPassword );
                $( '#dc-settings-scan-delay' ).val( _configFile.encryptScanDelay );
                $( '#dc-embed-enabled' ).prop( 'checked', _configFile.useEmbeds );
                $( '#dc-local-states' ).prop( 'checked', _configFile.localStates );
                $( '#dc-master-password' ).val( '' );
            };
        }

        /**
         * @private
         * @desc Applies the update & restarts the app by performing a window.location.reload()
         */
        static _onUpdateRestartNowButtonClicked() {
            const replacePath = require( 'path' )
                .join( _discordCrypt._getPluginsPath(), _discordCrypt._getPluginName() );
            const fs = require( 'fs' );

            /* Replace the file. */
            fs.writeFile( replacePath, _updateData.payload, ( err ) => {
                if ( err ) {
                    _discordCrypt.log(
                        "Unable to replace the target plugin. " +
                        `( ${err} )\nDestination: ${replacePath}`,
                        'error'
                    );
                    global.smalltalk.alert( 'Error During Update', 'Failed to apply the update!' );
                }
            } );

            /* Window reload is simple enough. */
            location.reload();
        }

        /**
         * @private
         * @desc Applies the update & closes the upload available panel.
         */
        static _onUpdateRestartLaterButtonClicked() {
            const replacePath = require( 'path' )
                .join( _discordCrypt._getPluginsPath(), _discordCrypt._getPluginName() );
            const fs = require( 'fs' );

            /* Replace the file. */
            fs.writeFile( replacePath, _updateData.payload, ( err ) => {
                if ( err ) {
                    _discordCrypt.log(
                        "Unable to replace the target plugin. " +
                        `( ${err} )\nDestination: ${replacePath}`,
                        'error'
                    );
                    global.smalltalk.alert( 'Error During Update', 'Failed to apply the update!' );
                }
            } );

            /* Also reset any opened tabs. */
            _discordCrypt._setActiveSettingsTab( 0 );
            _discordCrypt._setActiveExchangeTab( 0 );

            /* Hide the update and changelog. */
            $( '#dc-overlay' ).css( 'display', 'none' );
            $( '#dc-update-overlay' ).css( 'display', 'none' );
        }

        /**
         * @private
         * @desc Adds the upper scoped update info to the blacklist, saves the configuration file and
         *      closes the update window.
         * @param self
         * @return {Function}
         */
        static _onUpdateIgnoreButtonClicked( self ) {
            return () => {
                /* Clear out the needless data which isn't actually needed to validate a blacklisted update. */
                _updateData.payload = '';

                /* Add the blacklist to the configuration file. */
                _configFile.blacklistedUpdates.push( _updateData );

                /* Save the configuration. */
                self._saveConfig();

                /* Also reset any opened tabs. */
                _discordCrypt._setActiveSettingsTab( 0 );
                _discordCrypt._setActiveExchangeTab( 0 );

                /* Hide the update and changelog. */
                $( '#dc-overlay' ).css( 'display', 'none' );
                $( '#dc-update-overlay' ).css( 'display', 'none' );
            };
        }

        /**
         * @private
         * @desc Switches assets to the Info tab.
         */
        static _onExchangeInfoTabButtonClicked() {
            /* Switch to tab 0. */
            _discordCrypt._setActiveExchangeTab( 0 );
        }

        /**
         * @private
         * @desc Switches assets to the Key Exchange tab.
         */
        static _onExchangeKeygenTabButtonClicked() {
            /* Switch to tab 1. */
            _discordCrypt._setActiveExchangeTab( 1 );
        }

        /**
         * @private
         * @desc Switches assets to the Handshake tab.
         */
        static _onExchangeHandshakeButtonClicked() {
            /* Switch to tab 2. */
            _discordCrypt._setActiveExchangeTab( 2 );
        }

        /**
         * @private
         * @desc Closes the key exchange menu.
         */
        static _onExchangeCloseButtonClicked() {
            /* Hide main background. */
            $( '#dc-overlay' ).css( 'display', 'none' );

            /* Hide the entire exchange key menu. */
            $( '#dc-overlay-exchange' ).css( 'display', 'none' );
        }

        /**
         * @private
         * @desc Opens the key exchange menu.
         */
        static _onOpenExchangeMenuButtonClicked() {
            /* Show background. */
            $( '#dc-overlay' ).css( 'display', 'block' );

            /* Show main menu. */
            $( '#dc-overlay-exchange' ).css( 'display', 'block' );
        }

        /**
         * @private
         * @desc Generates and sends a new public key.
         */
        static _onQuickHandshakeButtonClicked() {
            /* Don't bother opening a menu. Just generate the key. */
            $( '#dc-keygen-gen-btn' ).click();

            /* Now send it. */
            $( '#dc-keygen-send-pub-btn' ).click();
        }

        /**
         * @private
         * @desc Switches the key lengths to their correct values.
         */
        static _onExchangeAlgorithmChanged() {
            /* Variable bit lengths. */
            let dh_bl = _discordCrypt.__getDHBitSizes(), ecdh_bl = _discordCrypt.__getECDHBitSizes();

            /* Cache jQuery results. */
            let dc_keygen_method = $( '#dc-keygen-method' ),
                dc_keygen_algorithm = $( '#dc-keygen-algorithm' );

            /* Clear the old select list. */
            $( '#dc-keygen-algorithm option' ).each( ( function () {
                $( this ).remove();
            } ) );

            /* Repopulate the entries. */
            switch ( dc_keygen_method.val() )
            {
            case 'dh':
                for ( let i = 0; i < dh_bl.length; i++ ) {
                    let v = dh_bl[ i ];
                    dc_keygen_algorithm.append( new Option( v, v, i === ( dh_bl.length - 1 ) ) );
                }
                break;
            case 'ecdh':
                for ( let i = 0; i < ecdh_bl.length; i++ ) {
                    let v = ecdh_bl[ i ];
                    dc_keygen_algorithm.append( new Option( v, v, i === ( ecdh_bl.length - 1 ) ) );
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
        static _onExchangeGenerateKeyPairButtonClicked() {
            let dh_bl = _discordCrypt.__getDHBitSizes(), ecdh_bl = _discordCrypt.__getECDHBitSizes();
            let max_salt_len = 32, min_salt_len = 16, salt_len;
            let index, raw_buffer, pub_buffer;
            let key, crypto = require( 'crypto' );

            let dc_keygen_method = $( '#dc-keygen-method' ),
                dc_keygen_algorithm = $( '#dc-keygen-algorithm' );

            /* Get the current algorithm. */
            switch ( dc_keygen_method.val() ) {
            case 'dh':
                /* Generate a new Diffie-Hellman RSA key from the bit size specified. */
                key = _discordCrypt.__generateDH( parseInt( dc_keygen_algorithm.val() ) );

                /* Calculate the index number starting from 0. */
                index = dh_bl.indexOf( parseInt( dc_keygen_algorithm.val() ) );
                break;
            case 'ecdh':
                /* Generate a new Elliptic-Curve Diffie-Hellman key from the bit size specified. */
                key = _discordCrypt.__generateECDH( parseInt( dc_keygen_algorithm.val() ) );

                /* Calculate the index number starting from dh_bl.length. */
                index = ( ecdh_bl.indexOf( parseInt( dc_keygen_algorithm.val() ) ) + dh_bl.length );
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
            _privateExchangeKey = key;

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
                key.getPublicKey( 'hex', dc_keygen_method.val() === 'ecdh' ?
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
            $( '#dc-pub-key-ta' ).val( raw_buffer.toString( 'hex' ) );

            /* Get the private key then display it. */
            $( '#dc-priv-key-ta' ).val( key.getPrivateKey( 'hex' ) );
        }

        /**
         * @private
         * @desc Clears any public and private keys generated.
         */
        static _onExchangeClearKeyButtonClicked() {
            /* Clear the key textareas. */
            $( '#dc-pub-key-ta' ).val( '' );
            $( '#dc-priv-key-ta' ).val( '' );
        }

        /**
         * @private
         * @desc Sends the currently generate public key in the correct format.
         * @param {_discordCrypt} self
         * @returns {Function}
         */
        static _onExchangeSendPublicKeyButtonClicked( self ) {
            return () => {

                /* Cache jQuery results. */
                let dc_pub_key_ta = $( '#dc-pub-key-ta' );

                /* Don't bother if it's empty. */
                if ( dc_pub_key_ta.val() === '' )
                    return;

                /* The text area stores a hex encoded binary. Convert it to a buffer prior to encoding. */
                let message = Buffer.from( dc_pub_key_ta.val(), 'hex' );

                /* Add the header to the message and encode it. */
                message = self._encodedKeyHeader + _discordCrypt.__substituteMessage( message, true );

                /* Split the message by adding a new line every 32 characters like a standard PGP message. */
                let formatted_message = message.replace( /(.{32})/g, e => `${e}\n` );

                /* Calculate the algorithm string. */
                let algo_str = `${$( '#dc-keygen-method' ).val() !== 'ecdh' ? 'DH-' : 'ECDH-'}` +
                    `${$( '#dc-keygen-algorithm' ).val()}`;

                /* Construct header & footer elements. */
                let header = `-----BEGIN ${algo_str} PUBLIC KEY-----`,
                    footer = `-----END ${algo_str} PUBLIC KEY----- | v${self.getVersion().replace( '-debug', '' )}`;

                /* Send the message. */
                _discordCrypt._dispatchMessage(
                    _configFile.useEmbeds,
                    formatted_message,
                    header,
                    footer,
                    0x720000,
                    '',
                    undefined,
                    _cachedModules,
                    _configFile.timedMessages,
                    _configFile.timedMessageExpires
                );

                /* Save the configuration file and store the new message. */
                self._saveConfig();

                /* Update the button text & reset after 1 second.. */
                $( '#dc-keygen-send-pub-btn' ).text( 'Sent The Public Key!' );

                setTimeout( ( function () {
                    $( '#dc-keygen-send-pub-btn' ).text( 'Send Public Key' );
                } ), 1000 );
            };
        }

        /**
         * @private
         * @desc Pastes what is stored in the clipboard to the handshake public key field.
         */
        static _onHandshakePastePublicKeyButtonClicked() {
            $( '#dc-handshake-ppk' ).val( require( 'electron' ).clipboard.readText() );
        }

        /**
         * @private
         * @desc Computes a shared secret and generates passwords based on a DH/ECDH key exchange.
         * @param {_discordCrypt} self
         * @returns {Function}
         */
        static _onHandshakeComputeButtonClicked( self ) {
            return () => {
                let value, algorithm, payload, salt_len, salt, user_salt_len, user_salt;
                let isUserSaltPrimary;

                /* Cache jQuery results. */
                let dc_pub_key_ta = $( '#dc-pub-key-ta' ),
                    dc_priv_key_ta = $( '#dc-priv-key-ta' ),
                    dc_handshake_ppk = $( '#dc-handshake-ppk' ),
                    dc_handshake_compute_btn = $( '#dc-handshake-compute-btn' );

                /* Provide some way of showing the user the result without actually giving it away. */
                function displaySecret( input_hex ) {
                    const charset = _discordCrypt.__getBraille().splice( 16, 64 );
                    let output = '';

                    for ( let i = 0; i < parseInt( input_hex.length / 2 ); i++ )
                        output += charset[ parseInt( input_hex.substr( i * 2, 2 ) ) & ( charset.length - 1 ) ];

                    return output;
                }

                /* Skip if no public key was entered. */
                if ( !dc_handshake_ppk.val() || !dc_handshake_ppk.val().length )
                    return;

                /* Skip if the user hasn't generated a key of their own. */
                if ( !dc_pub_key_ta.val() || !dc_pub_key_ta.val().length ) {
                    /* Update the text. */
                    dc_handshake_compute_btn.text( 'You Didn\'t Generate A Key!' );
                    setTimeout( ( function () {
                        dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                    } ), 1000 );
                    return;
                }

                /* Check if the message header is valid. */
                if (
                    dc_handshake_ppk.val().replace( /\r?\n|\r/g, "" )
                        .slice( 0, 4 ) !== self._encodedKeyHeader
                )
                    return;

                /* Snip off the header. */
                let blob = dc_handshake_ppk.val().replace( /\r?\n|\r/g, "" ).slice( 4 );

                /* Skip if invalid braille encoded message. */
                if ( !_discordCrypt.__isValidBraille( blob ) )
                    return;

                try {
                    /* Decode the message. */
                    value = Buffer.from( _discordCrypt.__substituteMessage( blob ), 'hex' );
                }
                catch ( e ) {
                    /* Update the text. */
                    dc_handshake_compute_btn.text( 'Invalid Public Key!' );
                    setTimeout( ( function () {
                        dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                    } ), 1000 );
                    return;
                }

                /* Check the algorithm they're using is the same as ours. */
                algorithm = value.readInt8( 0 );

                /* Check the algorithm is valid. */
                if ( !_discordCrypt.__isValidExchangeAlgorithm( algorithm ) ) {
                    /* Update the text. */
                    dc_handshake_compute_btn.text( 'Invalid Algorithm!' );
                    setTimeout( ( function () {
                        dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                    } ), 1000 );
                    return;
                }

                /* Read the user's generated public key. */
                let user_pub_key = Buffer.from( dc_pub_key_ta.val(), 'hex' );

                /* Check the algorithm used is the same as ours. */
                if ( user_pub_key.readInt8( 0 ) !== algorithm ) {
                    /* Update the text. */
                    dc_handshake_compute_btn.text( 'Mismatched Algorithm!' );
                    setTimeout( ( function () {
                        dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                    } ), 1000 );
                    return;
                }

                /* Update the algorithm text. */
                $( '#dc-handshake-algorithm' ).text(
                    `Exchange Algorithm: ${_discordCrypt.__indexToExchangeAlgorithmString( algorithm )}`
                );

                /* Get the salt length. */
                salt_len = value.readInt8( 1 );

                /* Make sure the salt length is valid. */
                if ( salt_len < 16 || salt_len > 32 ) {
                    /* Update the text. */
                    dc_handshake_compute_btn.text( 'Invalid Salt Length!' );
                    setTimeout( ( function () {
                        dc_handshake_compute_btn.text( 'Compute Secret Keys' );
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
                $( '#dc-handshake-salts' ).text(
                    `Salts: [ ${displaySecret( salt.toString( 'hex' ) )}, ` +
                    `${displaySecret( user_salt.toString( 'hex' ) )} ]`
                );

                /* Read the public key and convert it to a hex string. */
                payload = Buffer.from( value.subarray( 2 + salt_len ) ).toString( 'hex' );

                /* Return if invalid. */
                if ( !_privateExchangeKey || _privateExchangeKey === undefined ||
                    typeof _privateExchangeKey.computeSecret === 'undefined' ) {
                    /* Update the text. */
                    dc_handshake_compute_btn.text( 'Failed To Calculate Private Key!' );
                    setTimeout( ( function () {
                        dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                    } ), 1000 );
                    return;
                }

                /* Compute the local secret as a hex string. */
                let derived_secret = _discordCrypt.__computeExchangeSharedSecret(
                    _privateExchangeKey,
                    payload,
                    false,
                    false
                );

                /* Show error and quit if derivation fails. */
                if ( !derived_secret || !derived_secret.length ) {
                    /* Update the text. */
                    dc_handshake_compute_btn.text( 'Failed To Derive Key!' );
                    setTimeout( ( function () {
                        dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                    } ), 1000 );
                    return;
                }

                /* Display the first 64 characters of it. */
                $( '#dc-handshake-secret' ).text(
                    `Derived Secret: [ ${displaySecret( derived_secret.length > 64 ?
                        derived_secret.substring( 0, 64 ) :
                        derived_secret )
                    } ]`
                );

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
                        dc_handshake_compute_btn.text( 'Both Salts Are Equal ?!' );
                        setTimeout(
                            ( function () {
                                dc_handshake_compute_btn.text( 'Compute Secret Keys' );
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
                    global.sha3.sha3_256( isUserSaltPrimary ? user_salt : salt, true ),
                    'hex'
                );
                let secondary_hash = Buffer.from(
                    global.sha3.sha3_512( isUserSaltPrimary ? salt : user_salt, true ),
                    'hex'
                );

                /* Global progress for async callbacks. */
                let primary_progress = 0, secondary_progress = 0;

                /* Calculate the primary key. */
                _discordCrypt.__scrypt(
                    Buffer.from( derived_secret + secondary_hash.toString( 'hex' ), 'hex' ),
                    primary_hash,
                    256,
                    3072,
                    16,
                    2,
                    ( error, progress, key ) => {
                        if ( error ) {
                            /* Update the text. */
                            dc_handshake_compute_btn.text( 'Failed Generating Primary Key!' );
                            setTimeout(
                                ( function () {
                                    dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                                } ),
                                1000
                            );
                            return true;
                        }

                        /* Update progress. */
                        if ( progress ) {
                            primary_progress = progress * 50;

                            $( '#dc-exchange-status' )
                                .css( 'width', `${parseInt( primary_progress + secondary_progress )}%` );
                        }

                        if ( key ) {
                            /* Generate a quality report and apply the password. */
                            $( '#dc-handshake-prim-lbl' ).text( `Primary Key: ( Quality - ${
                                _discordCrypt.__entropicBitLength( key.toString( 'base64' ) )
                            } Bits )` );
                            $( '#dc-handshake-primary-key' ).val( key.toString( 'base64' ) );

                            /* Since more iterations are done for the primary key, this takes 4x as long thus will
                           always finish second. We can thus restore the original Generate text for the button once
                           this is done. */
                            dc_handshake_compute_btn.text( 'Compute Secret Keys' );

                            /* Now we clear the additional information. */
                            $( '#dc-handshake-algorithm' ).text( '...' );
                            $( '#dc-handshake-secret' ).text( '...' );
                            $( '#dc-handshake-salts' ).text( '...' );
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
                _discordCrypt.__scrypt(
                    secondary_password,
                    secondary_hash,
                    256,
                    3072,
                    8,
                    1,
                    ( error, progress, key ) => {
                        if ( error ) {
                            /* Update the text. */
                            dc_handshake_compute_btn.text( 'Failed Generating Secondary Key!' );
                            setTimeout(
                                ( function () {
                                    dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                                } ),
                                1000
                            );
                            return true;
                        }

                        if ( progress ) {
                            secondary_progress = progress * 50;
                            $( '#dc-exchange-status' )
                                .css( 'width', `${parseInt( primary_progress + secondary_progress )}%` );
                        }

                        if ( key ) {
                            /* Generate a quality report and apply the password. */
                            $( '#dc-handshake-sec-lbl' ).text( `Secondary Key: ( Quality - ${
                                _discordCrypt.__entropicBitLength( key.toString( 'base64' ) )
                            } Bits )` );
                            $( '#dc-handshake-secondary-key' ).val( key.toString( 'base64' ) );
                        }

                        return false;
                    }
                );

                /* Update the text. */
                dc_handshake_compute_btn.text( 'Generating Keys ...' );

                /* Finally clear all volatile information. */
                _privateExchangeKey = undefined;
                dc_handshake_ppk.val( '' );
                dc_priv_key_ta.val( '' );
                dc_pub_key_ta.val( '' );
            };
        }

        /**
         * @private
         * @desc Copies the currently generated passwords from a key exchange to the clipboard then erases them.
         */
        static _onHandshakeCopyKeysButtonClicked() {
            /* Cache jQuery results. */
            let dc_handshake_primary_key = $( '#dc-handshake-primary-key' ),
                dc_handshake_secondary_key = $( '#dc-handshake-secondary-key' );

            /* Don't bother if it's empty. */
            if ( dc_handshake_primary_key.val() === '' ||
                dc_handshake_secondary_key.val() === '' )
                return;

            /* Format the text and copy it to the clipboard. */
            require( 'electron' ).clipboard.writeText(
                `Primary Key: ${dc_handshake_primary_key.val()}\r\n\r\n` +
                `Secondary Key: ${dc_handshake_secondary_key.val()}`
            );

            /* Nuke. */
            dc_handshake_primary_key.val( '' );
            dc_handshake_secondary_key.val( '' );

            /* Update the button text & reset after 1 second. */
            $( '#dc-handshake-cpy-keys-btn' ).text( 'Coped Keys To Clipboard!' );

            setTimeout( ( function () {
                $( '#dc-handshake-cpy-keys-btn' ).text( 'Copy Keys & Nuke' );
                $( '#dc-handshake-prim-lbl' ).text( 'Primary Key: ' );
                $( '#dc-handshake-sec-lbl' ).text( 'Secondary Key: ' );
            } ), 1000 );
        }

        /**
         * @private
         * @desc Applies the generate passwords to the current channel or DM.
         * @param {_discordCrypt} self
         * @returns {Function}
         */
        static _onHandshakeApplyKeysButtonClicked( self ) {
            return () => {

                /* Cache jQuery results. */
                let dc_handshake_primary_key = $( '#dc-handshake-primary-key' ),
                    dc_handshake_secondary_key = $( '#dc-handshake-secondary-key' );

                /* Skip if no primary key was generated. */
                if ( !dc_handshake_primary_key.val() || !dc_handshake_primary_key.val().length )
                    return;

                /* Skip if no secondary key was generated. */
                if ( !dc_handshake_secondary_key.val() ||
                    !dc_handshake_secondary_key.val().length )
                    return;

                /* Create the password object and nuke. */
                let pwd = _discordCrypt._createPassword(
                    dc_handshake_primary_key.val(),
                    dc_handshake_secondary_key.val()
                );
                dc_handshake_primary_key.val( '' );
                dc_handshake_secondary_key.val( '' );

                /* Enable auto-encryption on the channel */
                self._setAutoEncrypt( true );

                /* Apply the passwords and save the config. */
                _configFile.passList[ _discordCrypt._getChannelId() ] = pwd;
                self._saveConfig();

                /* Update the text and reset it after 1 second. */
                $( '#dc-handshake-apply-keys-btn' ).text( 'Applied & Saved!' );
                setTimeout( ( function () {
                    $( '#dc-handshake-apply-keys-btn' ).text( 'Apply Generated Passwords' );

                    /* Reset quality bit length fields. */
                    $( '#dc-handshake-prim-lbl' ).text( 'Primary Key: ' );
                    $( '#dc-handshake-sec-lbl' ).text( 'Secondary Key: ' );

                    /* Hide main background. */
                    $( '#dc-overlay' ).css( 'display', 'none' );

                    /* Hide the entire exchange key menu. */
                    $( '#dc-overlay-exchange' ).css( 'display', 'none' );

                    /* Reset the index to the info tab. */
                    _discordCrypt._setActiveExchangeTab( 0 );
                } ), 1000 );
            }
        }

        /**
         * @private
         * @desc Opens the password editor menu.
         */
        static _onOpenPasswordMenuButtonClicked() {
            $( '#dc-overlay' ).css( 'display', 'block' );
            $( '#dc-overlay-password' ).css( 'display', 'block' );
        }

        /**
         * @private
         * @desc Saves the entered passwords for the current channel or DM.
         * @param {_discordCrypt} self
         * @returns {Function}
         */
        static _onSavePasswordsButtonClicked( self ) {
            return () => {
                let btn = $( '#dc-save-pwd' );

                /* Update the password and save it. */
                self._updatePasswords();

                /* Update the text for the button. */
                btn.text( "Saved!" );

                /* Reset the text for the password button after a 1 second delay. */
                setTimeout( ( function () {
                    /* Reset text. */
                    btn.text( "Save Password" );

                    /* Clear the fields. */
                    $( "#dc-password-primary" ).val( '' );
                    $( "#dc-password-secondary" ).val( '' );

                    /* Close. */
                    $( '#dc-overlay' ).css( 'display', 'none' );
                    $( '#dc-overlay-password' ).css( 'display', 'none' );
                } ), 1000 );
            };
        }

        /**
         * @private
         * @desc Resets passwords for the current channel or DM to their defaults.
         * @param {_discordCrypt} self
         * @returns {Function}
         */
        static _onResetPasswordsButtonClicked( self ) {
            return () => {
                let btn = $( '#dc-reset-pwd' );

                /* Disable auto-encrypt for the channel */
                self._setAutoEncrypt( false );

                /* Reset the configuration for this user and save the file. */
                delete _configFile.passList[ _discordCrypt._getChannelId() ];
                self._saveConfig();

                /* Update the text for the button. */
                btn.text( "Password Reset!" );

                setTimeout( ( function () {
                    /* Reset text. */
                    btn.text( "Reset Password" );

                    /* Clear the fields. */
                    $( "#dc-password-primary" ).val( '' );
                    $( "#dc-password-secondary" ).val( '' );

                    /* Close. */
                    $( '#dc-overlay' ).css( 'display', 'none' );
                    $( '#dc-overlay-password' ).css( 'display', 'none' );
                } ), 1000 );
            };
        }

        /**
         * @private
         * @desc Closes the password editor menu.
         */
        static _onClosePasswordMenuButtonClicked() {
            /* Clear the fields. */
            $( "#dc-password-primary" ).val( '' );
            $( "#dc-password-secondary" ).val( '' );

            /* Close after a .25 second delay. */
            setTimeout( ( function () {
                /* Close. */
                $( '#dc-overlay' ).css( 'display', 'none' );
                $( '#dc-overlay-password' ).css( 'display', 'none' );
            } ), 250 );
        }

        /**
         * @private
         * @desc Copies the passwords from the current channel or DM to the clipboard.
         * @returns {Function}
         */
        static _onCopyCurrentPasswordsButtonClicked() {
            let currentKeys = _configFile.passList[ _discordCrypt._getChannelId() ];

            /* If no password is currently generated, write the default key. */
            if ( !currentKeys ) {
                require( 'electron' ).clipboard.writeText( `Default Password: ${_configFile.defaultPassword}` );
                return;
            }

            /* Write to the clipboard. */
            require( 'electron' ).clipboard.writeText(
                `Primary Key: ${currentKeys.primary}\r\n\r\nSecondary Key: ${currentKeys.secondary}`
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
        }

        /**
         * @private
         * @desc Enables or disables automatic message encryption.
         * @param {_discordCrypt} self
         * @returns {Function}
         */
        static _onForceEncryptButtonClicked( self ) {
            return () => {
                /* Cache jQuery results. */
                let dc_lock_btn = $( '#dc-lock-btn' ), new_tooltip = $( '<span>' ).addClass( 'dc-tooltip-text' );

                /* Update the icon and toggle. */
                if ( !self._getAutoEncrypt() ) {
                    dc_lock_btn.html( Buffer.from( self._lockIcon, 'base64' ).toString( 'utf8' ) );
                    dc_lock_btn.append( new_tooltip.text( 'Disable Message Encryption' ) );
                    self._setAutoEncrypt( true );
                }
                else {
                    dc_lock_btn.html( Buffer.from( self._unlockIcon, 'base64' ).toString( 'utf8' ) );
                    dc_lock_btn.append( new_tooltip.text( 'Enable Message Encryption' ) );
                    self._setAutoEncrypt( false );
                }

                /* Save config. */
                self._saveConfig();
            };
        }

        /**
         * @private
         * @desc Updates the lock icon
         */
        static _updateLockIcon( self ) {
            /* Cache jQuery results. */
            let dc_lock_btn = $( '#dc-lock-btn' ), tooltip = $( '<span>' ).addClass( 'dc-tooltip-text' );

            /* Update the icon based on the channel */
            if ( self._getAutoEncrypt() ) {
                dc_lock_btn.html( Buffer.from( self._lockIcon, 'base64' ).toString( 'utf8' ) );
                dc_lock_btn.append( tooltip.text( 'Disable Message Encryption' ) );
            }
            else {
                dc_lock_btn.html( Buffer.from( self._unlockIcon, 'base64' ).toString( 'utf8' ) );
                dc_lock_btn.append( tooltip.text( 'Enable Message Encryption' ) );
            }

            /* Set the button class. */
            $( '.dc-svg' ).attr( 'class', 'dc-svg' );
        }

        /**
         * @private
         * @desc Sets the active tab index in the settings menu.
         * @param {int} index The index ( 0-1 ) of the page to activate.
         * @example
         * setActiveTab( 1 );
         */
        static _setActiveSettingsTab( index ) {
            let tab_names = [ 'dc-plugin-settings-tab', 'dc-database-settings-tab', 'dc-security-settings-tab' ];
            let tabs = $( '#dc-settings-tab .dc-tab-link' );

            /* Hide all tabs. */
            for ( let i = 0; i < tab_names.length; i++ )
                $( `#${tab_names[ i ]}` ).css( 'display', 'none' );

            /* Deactivate all links. */
            tabs.removeClass( 'active' );

            switch ( index ) {
            case 0:
                $( '#dc-plugin-settings-btn' ).addClass( 'active' );
                $( '#dc-plugin-settings-tab' ).css( 'display', 'block' );
                break;
            case 1:
                $( '#dc-database-settings-btn' ).addClass( 'active' );
                $( '#dc-database-settings-tab' ).css( 'display', 'block' );
                break;
            case 2:
                $( '#dc-security-settings-btn' ).addClass( 'active' );
                $( '#dc-security-settings-tab' ).css( 'display', 'block' );
                break;
            default:
                break;
            }
        }

        /**
         * @private
         * @desc Sets the active tab index in the exchange key menu.
         * @param {int} index The index ( 0-2 ) of the page to activate.
         * @example
         * setActiveTab( 1 );
         */
        static _setActiveExchangeTab( index ) {
            let tab_names = [ 'dc-about-tab', 'dc-keygen-tab', 'dc-handshake-tab' ];
            let tabs = $( '#dc-exchange-tab .dc-tab-link' );

            /* Hide all tabs. */
            for ( let i = 0; i < tab_names.length; i++ )
                $( `#${tab_names[ i ]}` ).css( 'display', 'none' );

            /* Deactivate all links. */
            tabs.removeClass( 'active' );

            switch ( index ) {
            case 0:
                $( '#dc-tab-info-btn' ).addClass( 'active' );
                $( '#dc-about-tab' ).css( 'display', 'block' );
                break;
            case 1:
                $( '#dc-tab-keygen-btn' ).addClass( 'active' );
                $( '#dc-keygen-tab' ).css( 'display', 'block' );
                break;
            case 2:
                $( '#dc-tab-handshake-btn' ).addClass( 'active' );
                $( '#dc-handshake-tab' ).css( 'display', 'block' );
                break;
            default:
                break;
            }
        }

        /* ========================================================= */

        /* ====================== APP UTILITIES ==================== */

        /**
         * @private
         * @desc Generates a nonce according to Discord's internal EPOCH. ( 14200704e5 )
         * @return {string} The string representation of the integer nonce.
         */
        static _getNonce() {
            return _cachedModules.NonceGenerator.fromTimestamp( Date.now() );
        }

        /**
         * @private
         * @desc Returns the name of the plugin file expected on the disk.
         * @returns {string}
         * @example
         * console.log( discordCrypt._getPluginName() );
         * // "discordCrypt.plugin.js"
         */
        static _getPluginName() {
            return 'discordCrypt.plugin.js';
        }

        /**
         * @private
         * @desc Check if the plugin is named correctly by attempting to open the plugin file in the BetterDiscord
         *      plugin path.
         * @returns {boolean}
         * @example
         * console.log( _discordCrypt._validPluginName() );
         * // False
         */
        static _validPluginName() {
            return require( 'fs' )
                .existsSync( require( 'path' )
                    .join( _discordCrypt._getPluginsPath(), _discordCrypt._getPluginName() ) );
        }

        /**
         * @private
         * @desc Returns the platform-specific path to BetterDiscord's plugin directory.
         * @returns {string} The expected path ( which may not exist ) to BetterDiscord's plugin directory.
         * @example
         * console.log( _discordCrypt._getPluginsPath() );
         * // "C:\Users\John Doe\AppData\Local/BetterDiscord/plugins"
         */
        static _getPluginsPath() {
            const process = require( 'process' );
            return `${process.platform === 'win32' ?
                process.env.APPDATA :
                process.platform === 'darwin' ?
                    process.env.HOME + '/Library/Preferences' :
                    process.env.HOME + '/.config'}/BetterDiscord/plugins/`;
        }

        /**
         * @private
         * @desc Checks if the plugin should ignore auto-updates.
         *      Usually in a developer environment, a simple symlink is ( or should be ) used to link the current build
         *      file to the plugin path allowing faster deployment.
         * @param {string} version Version string of the plugin to include in the check.
         * @return {boolean} Returns false if the plugin should auto-update.
         */
        static _shouldIgnoreUpdates( version ) {
            const fs = require( 'fs' );
            const path = require( 'path' );
            const plugin_file = path.join( _discordCrypt._getPluginsPath(), _discordCrypt._getPluginName() );

            return fs.existsSync( plugin_file ) &&
            ( fs.lstatSync( plugin_file ).isSymbolicLink() || version.indexOf( '-debug' ) !== -1 );
        }

        /**
         * @private
         * @desc Checks the update server for an encrypted update.
         * @param {UpdateCallback} on_update_callback Callback to execute when an update is found.
         * @param {Array<UpdateInfo>} [blacklisted_updates] Optional list of blacklisted updates to ignore.
         * @returns {boolean}
         * @example
         * _checkForUpdate( ( info ) => {
         *      if( !info ) {
         *          console.log( 'No update available.' );
         *          return;
         *      }
         *      console.log( `New Update Available: #${info.hash} - v${info.version}` );
         *      console.log( `Signature is: ${info.valid ? valid' : 'invalid'}!` );
         *      console.log( `Changelog:\n${info.changelog}` );
         * } );
         */
        static _checkForUpdate( on_update_callback, blacklisted_updates ) {
            /* Update URL and request method. */
            const base_url = 'https://gitlab.com/leogx9r/discordCrypt/raw/master';
            const update_url = `${base_url}/build/${_discordCrypt._getPluginName()}`;
            const changelog_url = `${base_url}/src/CHANGELOG`;
            const signature_url = `${update_url}.sig`;

            /**
             * @desc Local update information.
             * @type {UpdateInfo}
             */
            let updateInfo = {
                version: '',
                payload: '',
                valid: false,
                hash: '',
                signature: '',
                changelog: ''
            };

            /* Make sure the callback is a function. */
            if ( typeof on_update_callback !== 'function' )
                return false;

            /* Perform the request. */
            try {
                /* Download the update. */
                _discordCrypt.__getRequest( update_url, ( statusCode, errorString, data ) => {
                    /* Make sure no error occurred. */
                    if ( statusCode !== 200 ) {
                        /* Log the error accordingly. */
                        switch ( statusCode ) {
                        case 404:
                            _discordCrypt.log( 'Update URL is broken.', 'error' );
                            break;
                        case 403:
                            _discordCrypt.log( 'Forbidden request when checking for updates.', 'error' );
                            break;
                        default:
                            _discordCrypt.log( `Error while fetching update: ${statusCode}:${errorString}`, 'error' );
                            break;
                        }

                        on_update_callback( null );
                        return false;
                    }

                    /* Get the local file. */
                    let localFile = '//META{"name":"discordCrypt"}*//\n';
                    try {
                        localFile = require( 'fs' ).readFileSync(
                            require( 'path' ).join(
                                _discordCrypt._getPluginsPath(),
                                _discordCrypt._getPluginName()
                            )
                        ).toString().replace( '\r', '' );
                    }
                    catch ( e ) {
                        _discordCrypt.log(
                            'Plugin file could not be locally read. Assuming testing version ...',
                            'warn'
                        );
                    }

                    /* Check the first line which contains the metadata to make sure that they're equal. */
                    if ( data.split( '\n' )[ 0 ] !== localFile.split( '\n' )[ 0 ] ) {
                        _discordCrypt.log(
                            'Plugin metadata is missing from either the local or update file.',
                            'error'
                        );

                        on_update_callback( null );
                        return false;
                    }

                    /* Read the current hash of the plugin and compare them.. */
                    let currentHash = _discordCrypt.__sha256( localFile.replace( '\r', '' ), true );
                    updateInfo.hash = _discordCrypt.__sha256( data.replace( '\r', '' ), true );

                    /* If the hash equals the retrieved one, no update is needed. */
                    if ( updateInfo.hash === currentHash ) {
                        _discordCrypt.log( `No Update Needed - #${updateInfo.hash.slice( 0, 16 )}` );

                        on_update_callback( null );
                        return true;
                    }

                    /* Check if the hash matches a blacklisted update. */
                    if(
                        blacklisted_updates &&
                        blacklisted_updates.length &&
                        blacklisted_updates.filter( e => e && e.hash === updateInfo.hash ).length !== 0
                    ) {
                        _discordCrypt.log( `Ignoring update - #${updateInfo.hash.slice( 0, 16 )}` );

                        on_update_callback( null );
                        return true;
                    }

                    /* Try parsing a version number. */
                    try {
                        updateInfo.version = data
                            .match( /((["'])(\d+\.)(\d+\.)(\*|\d+)(["']))/gi )
                            .toString()
                            .replace( /(['|"]*['|"])/g, '' );
                    }
                    catch ( e ) {
                        updateInfo.version = '?.?.?';
                        _discordCrypt.log( 'Failed to locate the version number in the update ...', 'warn' );
                    }

                    /* Basically the finally step - resolve the changelog & call the callback function. */
                    let tryResolveChangelog = ( valid_signature ) => {
                        /* Store the validity. */
                        updateInfo.valid = valid_signature;

                        /* Now get the changelog. */
                        try {
                            /* Fetch the changelog from the URL. */
                            _discordCrypt.__getRequest(
                                changelog_url,
                                ( statusCode, errorString, changelog ) => {
                                    updateInfo.changelog = statusCode == 200 ? changelog : '';

                                    /* Perform the callback. */
                                    on_update_callback( updateInfo );
                                }
                            );
                        }
                        catch ( e ) {
                            _discordCrypt.log( 'Error fetching the changelog.', 'warn' );

                            /* Perform the callback without a changelog. */
                            updateInfo.changelog = '';
                            on_update_callback( updateInfo );
                        }
                    };

                    /* Store the update. */
                    updateInfo.payload = data;

                    /* Try validating the signature. */
                    try {
                        /* Fetch the detached signature. */
                        _discordCrypt.__getRequest( signature_url, ( statusCode, errorString, detached_sig ) => {
                            /* Store the signature. */
                            updateInfo.signature = detached_sig;

                            /* Validate the signature then continue. */
                            let r = _discordCrypt.__validatePGPSignature(
                                updateInfo.payload,
                                updateInfo.signature,
                                _discordCrypt.__zlibDecompress( _signingKey )
                            );

                            /* This returns a Promise if valid or false if invalid. */
                            if( r )
                                r.then( ( valid_signature ) => tryResolveChangelog( valid_signature ) );
                            else
                                tryResolveChangelog( false );
                        } );
                    }
                    catch( e ) {
                        _discordCrypt.log( `Unable to validate the update signature: ${e}`, 'warn' );

                        /* Resolve the changelog anyway even without a valid signature. */
                        tryResolveChangelog( false );
                    }

                    return true;
                } );
            }
            catch ( ex ) {
                /* Handle failure. */
                _discordCrypt.log( `Error while retrieving update: ${ex.toString()}`, 'warn' );
                return false;
            }

            return true;
        }

        /**
         * @private
         * @description Returns the current message ID used by Discord.
         * @returns {string | undefined}
         * @example
         * console.log( _discordCrypt._getChannelId() );
         * // "414714693498014617"
         */
        static _getChannelId() {
            return window.location.pathname.split( '/' ).pop();
        }

        /**
         * @private
         * @desc Creates a password object using a primary and secondary password.
         * @param {string} primary_password The primary password.
         * @param {string} secondary_password The secondary password.
         * @returns {ChannelPassword} Object containing the two passwords.
         * console.log( _discordCrypt._createPassword( 'Hello', 'World' ) );
         * // Object {primary: "Hello", secondary: "World"}
         */
        static _createPassword( primary_password, secondary_password ) {
            return { primary: primary_password, secondary: secondary_password };
        }

        /**
         * @private
         * @desc Returns functions to locate exported webpack modules.
         * @returns {WebpackModuleSearcher}
         */
        static _getWebpackModuleSearcher() {
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
             * @param {ModulePredicate} filter Predicate to match module
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
                    _discordCrypt.log( "Couldn't find module in existing cache. Loading all modules.", 'warn' );

                    for ( let i = 0; i < req.m.length; ++i ) {
                        try {
                            let m = req( i );
                            if ( m && m.__esModule && m.default && filter( m.default ) )
                                return m.default;
                            if ( m && filter( m ) )
                                return m;
                        }
                        catch ( e ) {
                            _discordCrypt.log( `Could not load module index ${i} ...`, 'warn' );
                        }
                    }

                    _discordCrypt.log( 'Cannot find Webpack module.', 'warn' );
                }

                return null;
            };

            /**
             * @desc Look through all modules of internal Discord's Webpack and return first object that has all of
             *      the following prototypes.
             * @param {string[]} protoNames Array of all prototypes to search for.
             * @param {boolean} [force_load] Whether to force load all modules if cached modules don't work.
             * @return {object} First module that matches `protoNames` or `null` if none match.
             */
            const findByUniquePrototypes = ( protoNames, force_load = false ) =>
                find(
                    module => protoNames.every( proto => module.prototype && module.prototype[ proto ] ),
                    force_load
                );

            /**
             * @desc Look through all modules of internal Discord's Webpack and return first object that has all of the
             *      following properties. You should be ready that in any moment, after Discord update,
             *      this function may start returning `null` (if no such object exists anymore) or even some
             *      different object with the same properties. So you should provide all property names that
             *      you use, and often even some extra properties to make sure you'll get exactly what you want.
             * @param {string[]} propNames Array of property names to look for.
             * @param {boolean} [force_load] Whether to force load all modules if cached modules don't work.
             * @returns {object} First module that matches `propNames` or `null` if none match.
             */
            const findByUniqueProperties = ( propNames, force_load = false ) =>
                find( module => propNames.every( prop => module[ prop ] !== undefined ), force_load );

            /**
             * @desc Look through all modules of internal Discord's Webpack and return first object that has the
             *      `displayName` property with following value. This is useful for searching for React components by
             *      name. Take into account that not all components are exported as modules. Also, there might be
             *      several components with the same name.
             * @param {string} displayName Display name property value to look for.
             * @param {boolean} [force_load] Whether to force load all modules if cached modules don't work.
             * @return {object} First module that matches `displayName` or `null` if none match.
             */
            const findByDisplayName = ( displayName, force_load = false ) =>
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
                find(
                    module =>
                        module[ '_dispatchToken' ] &&
                        typeof module[ '_dispatchToken' ] === 'string' &&
                        module[ '_dispatchToken' ] === `ID_${token}` &&
                        module[ '_actionHandlers' ],
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

            return {
                find,
                findByUniqueProperties,
                findByUniquePrototypes,
                findByDisplayName,
                findByDispatchToken,
                findByDispatchNames
            };
        }

        /**
         * @experimental
         * @private
         * @desc Dumps all function callback handlers with their names, IDs and function prototypes. [ Debug Function ]
         * @param {boolean} [dump_actions] Whether to dump action handlers.
         * @returns {Array} Returns an array of all IDs and identifier callbacks.
         */
        static _dumpWebpackModuleCallbacks( dump_actions = true ) {
            const ignored = [
                '_dependencies',
                '_isInitialized',
                'initialize',
                'initializeIfNeeded',
                'syncWith',
                'waitFor',
                'hasChangeCallbacks',
                'emitChange',
                'addChangeListener',
                'addConditionalChangeListener',
                'removeChangeListener',
                'getDispatchToken',
                'mustEmitChanges'
            ];

            /* Create the dumping array. */
            let dump = [], i = 0;

            /* Iterate over let's say 1000 possible modules ? */
            _discordCrypt._getWebpackModuleSearcher().find( ( module ) => {
                if( !module[ '__esModule' ] )
                    return false;

                /* Create an entry in the array. */
                dump[ i ] = {};

                /* Loop over every property in the module. */
                for( let prop in module ) {
                    /* Skip ignored. */
                    if( ignored.indexOf( prop ) !== -1 )
                        continue;

                    /* Dump action handlers. */
                    if( [ '_actionHandlers', '_dispatchHandlers', '_changeCallbacks' ].indexOf( prop ) !== -1 ) {
                        /* Skip if not required. */
                        if( !dump_actions )
                            continue;

                        dump[ i ][ prop ] = {};

                        /* Loop over every property name in the action handler. */
                        for ( let action in module[ prop ] ) {

                            /* Quick sanity check. */
                            if ( !action.length || !module._actionHandlers.hasOwnProperty( action ) )
                                continue;

                            try{
                                /* Assign the module property name and it's basic prototype. */
                                dump[ i ][ prop ][ action ] =
                                    module[ prop ][ action ].prototype.constructor.toString().split( '{' )[ 0 ];
                            }
                            catch( e ) {
                                dump[ i ][ prop ] = 'N/A';
                            }
                        }
                    }
                    else {
                        try{
                            /* Add the actual property name and its prototype. */
                            dump[ i ][ prop ] = module[ prop ].toString().split( '{' )[ 0 ];
                        }
                        catch( e ) {
                            dump[ i ][ prop ] = 'N/A';
                        }
                    }
                }

                i++;
                return false;
            } );

            /* Return any found module handlers. */
            return dump;
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
        static _getElementReactOwner(
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
            const getOwnerReactInstance = e => e[ Object.keys( e )
                .find( k => k.startsWith( "__reactInternalInstance" ) ) ];
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
         * @private
         * @desc Returns the channel properties for the currently viewed channel or null.
         * @return {object}
         */
        static _getChannelProps() {
            /* Blacklisted IDs that don't have actual properties. */
            const blacklisted_channel_props = [
                '@me',
                'activity'
            ];

            /* Skip blacklisted channels. */
            if( blacklisted_channel_props.indexOf( _discordCrypt._getChannelId() ) === -1 ) {
                let elementOwner = _discordCrypt._getElementReactOwner( $( 'form' )[ 0 ] );

                /* Ensure the properties exist. */
                if ( elementOwner[ 'props' ] && elementOwner.props[ 'channel' ] )
                    /* Return the result. */
                    return elementOwner.props.channel;
            }

            /* Return nothing for invalid channels. */
            return null;
        }

        /**
         * @private
         * @desc Edits the message's content from the channel indicated.
         *      N.B. This does not edit embeds due to the internal code Discord uses.
         * @param {string} channel_id The channel's identifier that the message is located in.
         * @param {string} message_id The message's identifier to delete.
         * @param {string} content The message's new content.
         * @param {CachedModules} cached_modules The internally cached module objects.
         */
        static _editMessage( channel_id, message_id, content, cached_modules ) {
            /* Edit the message internally. */
            cached_modules.MessageController._editMessage( channel_id, message_id, { content: content } );
        }

        /**
         * @private
         * @desc Delete the message from the channel indicated.
         * @param {string} channel_id The channel's identifier that the message is located in.
         * @param {string} message_id The message's identifier to delete.
         * @param {CachedModules} cached_modules The internally cached module objects.
         */
        static _deleteMessage( channel_id, message_id, cached_modules ) {
            /* Delete the message internally. */
            cached_modules.MessageController.deleteMessage( channel_id, message_id );
        }

        /**
         * @private
         * @desc Sends either an embedded message or an inline message to Discord.
         * @param {boolean} as_embed Whether to dispatch this message as an embed or not.
         * @param {string} main_message The main content to send.
         * @param {string} [message_header] The text to display at the top of an embed.
         * @param {string} [message_footer] The text to display at the bottom of an embed.
         * @param {int} [embedded_color] A hex color used to outline the left side of the embed if applicable.
         * @param {string} [message_content] Message content to be attached above the main message.
         * @param {int} [channel_id] If specified, sends the embedded message to this channel instead of the
         *      current channel.
         * @param {Array<TimedMessage>} [timed_messages] Array containing timed messages to add this sent message to.
         * @param {int} [expire_time_minutes] The amount of minutes till this message is to be deleted.
         */
        static _dispatchMessage(
            as_embed,
            main_message,
            message_header,
            message_footer,
            embedded_color = 0x551A8B,
            message_content = '',
            channel_id = undefined,
            timed_messages = undefined,
            expire_time_minutes = 0
        ) {
            let mention_everyone = false;

            /* Parse the message content to the required format if applicable.. */
            if ( typeof message_content === 'string' && message_content.length ) {
                /* Sanity check. */
                if ( _cachedModules.MessageCreator === null ) {
                    _discordCrypt.log( 'Could not locate the MessageCreator module!', 'error' );
                    return;
                }

                try {
                    /* Parse the message. */
                    message_content = _cachedModules
                        .MessageCreator
                        .parse( _discordCrypt._getChannelProps(), message_content ).content;

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

            /* Save the Channel ID. */
            let _channel = channel_id !== undefined ? channel_id : _discordCrypt._getChannelId();

            /* Handles returns for messages. */
            const onDispatchResponse = ( r ) => {
                /* Check if an error occurred and inform Clyde bot about it. */
                if ( !r.ok ) {
                    /* Perform Clyde dispatch if necessary. */
                    if (
                        r.status >= 400 &&
                        r.status < 500 &&
                        r.body &&
                        !_cachedModules.MessageController.sendClydeError( _channel, r.body.code )
                    ) {
                        /* Log the error in case we can't manually dispatch the error. */
                        _discordCrypt.log( `Error sending message: ${r.status}`, 'error' );

                        /* Sanity check. */
                        if ( _cachedModules.MessageDispatcher === null || _cachedModules.GlobalTypes === null ) {
                            _discordCrypt.log( 'Could not locate the MessageDispatcher module!', 'error' );
                            return;
                        }

                        _cachedModules.MessageDispatcher.dispatch( {
                            type: _cachedModules.GlobalTypes.ActionTypes.MESSAGE_SEND_FAILED,
                            messageId: r.body.id,
                            channelId: _channel
                        } );
                    }
                }
                else {
                    /* Receive the message normally. */
                    _cachedModules.MessageController.receiveMessage( _channel, r.body );

                    /* Add the message to the TimedMessage array. */
                    if ( timed_messages && expire_time_minutes > 0 ) {
                        timed_messages.push( {
                            messageId: r.body.id,
                            channelId: _channel,
                            expireTime: Date.now() + ( expire_time_minutes * 60000 )
                        } );
                    }
                }
            };

            /* Send this message as an embed. */
            if ( as_embed ) {
                /* Create the message embed object and add it to the queue. */
                _cachedModules.MessageQueue.enqueue(
                    {
                        type: 'send',
                        message: {
                            channelId: _channel,
                            nonce: _discordCrypt._getNonce(),
                            content: message_content,
                            mention_everyone: mention_everyone,
                            tts: false,
                            embed: {
                                type: "rich",
                                url: "https://gitlab.com/leogx9r/DiscordCrypt",
                                color: embedded_color || 0x551A8B,
                                output_mime_type: "text/x-html",
                                timestamp: ( new Date() ).toISOString(),
                                encoding: "utf-16",
                                author: {
                                    name: message_header || '-----MESSAGE-----',
                                    icon_url:
                                        'https://gitlab.com/leogx9r/DiscordCrypt/raw/master/images/encode-logo.png',
                                    url: 'https://discord.me/discordCrypt'
                                },
                                footer: {
                                    text: message_footer || 'discordCrypt',
                                    icon_url: 'https://gitlab.com/leogx9r/DiscordCrypt/raw/master/images/app-logo.png',
                                },
                                description: main_message,
                            }
                        }
                    },
                    onDispatchResponse
                );

                return;
            }

            /* Dispatch the message as normal content. */
            [
                main_message,
                message_content
            ].forEach(
                ( ( value ) => {
                    /* Skip empty values. */
                    if ( !value.length )
                        return;

                    /* Create the message object and dispatch it to the queue. */
                    _cachedModules.MessageQueue.enqueue(
                        {
                            type: 'send',
                            message: {
                                channelId: _channel,
                                nonce: _discordCrypt._getNonce(),
                                content: value === message_content ? value : `\`${value}\``,
                                mention_everyone: value === message_content ? mention_everyone : false,
                                tts: false
                            }
                        },
                        onDispatchResponse
                    );
                } )
            );
        }

        /**
         * @private
         * @desc Injects a CSS style element into the header tag.
         * @param {string} id The HTML ID string used to identify this CSS style segment.
         * @param {string} css The actual CSS style excluding the <style> tags.
         * @example
         * _injectCSS( 'my-css', 'p { font-size: 32px; }' );
         */
        static _injectCSS( id, css ) {
            /* Inject into the header tag. */
            $( "head" )
                .append( $( "<style>", { id: id.replace( /^[^a-z]+|[^\w-]+/gi, "" ), html: css } ) )
        }

        /**
         * @private
         * @desc Clears an injected element via its ID tag.
         * @param {string} id The HTML ID string used to identify this CSS style segment.
         * @example
         * _clearCSS( 'my-css' );
         */
        static _clearCSS( id ) {
            /* Make sure the ID is a valid string. */
            if ( !id || typeof id !== 'string' || !id.length )
                return;

            /* Remove the element. */
            $( `#${id.replace( /^[^a-z]+|[^\w-]+/gi, "" )}` ).remove();
        }

        /**
         * @private
         * @author samogot
         * @desc This function monkey-patches a method on an object.
         *      The patching callback may be run before, after or instead of target method.
         *      Be careful when monkey-patching. Think not only about original functionality of target method and your
         *      changes, but also about developers of other plugins, who may also patch this method before or after you.
         *      Try to change target method behaviour as little as possible, and avoid changing method signatures.
         *
         *      By default, this function logs to the console whenever a method is patched or unpatched in order to aid
         *      debugging by you and other developers, but these messages may be suppressed with the `silent` option.
         *
         *      Display name of patched method is changed, so you can see if a function has been patched
         *      ( and how many times ) while debugging or in the stack trace. Also, patched methods have property
         *      `__monkeyPatched` set to `true`, in case you want to check something programmatically.
         *
         * @param {object} what Object to be patched.
         *      You can can also pass class prototypes to patch all class instances.
         *      If you are patching prototype of react component you may also need.
         * @param {string} methodName The name of the target message to be patched.
         * @param {object} options Options object. You should provide at least one of `before`, `after` or `instead`
         *      parameters. Other parameters are optional.
         * @param {PatchCallback} options.before Callback that will be called before original target
         *      method call. You can modify arguments here, so it will be passed to original method.
         *      Can be combined with `after`.
         * @param {PatchCallback} options.after Callback that will be called after original
         *      target method call. You can modify return value here, so it will be passed to external code which calls
         *      target method. Can be combined with `before`.
         * @param {PatchCallback} options.instead Callback that will be called instead of original target method call.
         *      You can get access to original method using `originalMethod` parameter if you want to call it,
         *      but you do not have to. Can't be combined with `before` and `after`.
         * @param {boolean} [options.once=false] Set to `true` if you want to automatically unpatch method after
         *      first call.
         * @param {boolean} [options.silent=false] Set to `true` if you want to suppress log messages about
         *      patching and unpatching. Useful to avoid clogging the console in case of frequent conditional
         *      patching/unpatching, for example from another monkeyPatch callback.
         * @param {string} [options.displayName] You can provide meaningful name for class/object provided in
         *      `what` param for logging purposes. By default, this function will try to determine name automatically.
         * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesn't exist.
         *      ( Adds noop function in place. )
         * @return {function()} Function with no arguments and no return value that should be
         *      called to cancel this patch. You should save and run it when your plugin is stopped.
         */
        static _monkeyPatch( what, methodName, options ) {
            /**
             * Wraps the method in a `try..catch` block.
             * @param {function} method - method to wrap
             * @param {string} description - description of method
             * @returns {function} wrapped version of method
             */
            const suppressErrors = ( method, description ) => ( ... params ) => {
                try {
                    return method( ... params );
                }
                catch ( e ) {
                    _discordCrypt.log( `Error while '${description}'`, 'error' );
                }
                return undefined;
            };

            /* Grab options. */
            const { before, after, instead, once = false, silent = true, forcePatch = true } = options;

            /* Determine the display name for logging. */
            const displayName = options.displayName || what.displayName || what.name ||
                what.constructor.displayName || what.constructor.name;

            /* Log if required. */
            if ( !silent )
                _discordCrypt.log( `Patching ${methodName} ...` );

            /* Backup the original method for unpatching or restoring. */
            let origMethod = what[ methodName ];

            /* If a method can't be found, handle appropriately based on if forcing patches. */
            if ( !origMethod ) {
                if ( !forcePatch ) {
                    /* Log and bail out. */
                    _discordCrypt.log(
                        `Can't find non-existent method '${displayName}.${methodName}' to patch.`,
                        'error'
                    );
                    return () => {
                        /* Ignore. */
                    };
                }
                else {
                    /* Assign empty functions. */
                    what[ methodName ] = function() {
                        /* Ignore. */
                    };
                    origMethod = function() {
                        /* Ignore. */
                    };
                }
            }

            /* Create a callback that can cancel the patch. */
            const cancel = () => {
                /* Log if appropriate. */
                if ( !silent )
                    _discordCrypt.log( `Removing patched method: '${displayName}.${methodName}' ...` );

                /* Restore the original method thus removing the patch. */
                what[ methodName ] = origMethod;
            };

            /* Apply a wrapper function that calls the callbacks based on the options. */
            what[ methodName ] = function() {
                /**
                 * @desc Contains the local patch state for this function.
                 * @type {PatchData}
                 */
                const data = {
                    thisObject: this,
                    methodArguments: arguments,
                    cancelPatch: cancel,
                    originalMethod: origMethod,
                    callOriginalMethod: () =>
                        data.returnValue = data.originalMethod.apply( data.thisObject, data.methodArguments )
                };

                /* Call the callback instead of the method with the defined return value if any. */
                if ( instead ) {
                    const tempRet = suppressErrors(
                        instead,
                        `calling override instead of original for '${what[ methodName ].displayName}'`
                    )( data );

                    if ( tempRet !== undefined )
                        data.returnValue = tempRet;
                }
                else {
                    /* Handle execution before the method call. */
                    if ( before )
                        suppressErrors(
                            before,
                            `calling override before '${what[ methodName ].displayName}'`
                        )( data );

                    /* Actually call the original method. */
                    data.callOriginalMethod();

                    /* Handle execution after the method call. */
                    if ( after )
                        suppressErrors(
                            after,
                            `calling override after '${what[ methodName ].displayName}'`
                        )( data );
                }

                /* If this function hook is just being executed once, unhook it now. */
                if ( once )
                    cancel();

                return data.returnValue;
            };

            /* Make sure the method is marked as patched. */
            what[ methodName ].__monkeyPatched = true;
            what[ methodName ].displayName = `patched ${what[ methodName ].displayName || methodName}`;

            /* Save the unhook method to the object. */
            what[ methodName ].unpatch = cancel;

            /* Return the callback necessary for cancelling. */
            return cancel;
        }

        /**
         * @private
         * @desc Hooks a dispatcher from Discord's internals.
         * @param {object} dispatcher The action dispatcher containing an array of _actionHandlers.
         * @param {string} method_name The name of the method to hook.
         * @param {string} options The type of hook to apply. [ 'before', 'after', 'instead', 'revert' ]
         * @param {boolean} [options.once=false] Set to `true` if you want to automatically unhook
         *      method after first call.
         * @param {boolean} [options.silent=false] Set to `true` if you want to suppress log messages about patching and
         *      unhooking. Useful to avoid clogging the console in case of frequent conditional hooking/unhooking, for
         *      example from another monkeyPatch callback.
         */
        static _hookDispatcher( dispatcher, method_name, options ) {
            /* Hook the dispatcher. */
            let fn = _discordCrypt._monkeyPatch( dispatcher._actionHandlers, method_name, options );

            /* Add it to the existing list of cancel-callbacks. */
            _stopCallbacks.push( fn );

            /* Return the callback. */
            return fn;
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
         * log( 'This is printed green.', 'trace' );
         *
         * @example
         * log( 'This is printed green.', 'debug' );
         *
         */
        static log( message, method = "info" ) {
            try {
                console[ method ](
                    `%c[DiscordCrypt]%c - ${message}`,
                    "color: #7f007f; font-weight: bold; text-shadow: 0 0 1px #f00, 0 0 2px #f0f, 0 0 3px #00f;",
                    ""
                );
            }
            catch ( ex ) {
                console.error( '[DiscordCrypt] - Error logging message ...' );
            }
        }

        /* ========================================================= */

        /* ======================= UTILITIES ======================= */

        /**
         * @private
         * @desc Checks if the input password is at least 8 characters long,
         *      is alpha-numeric with both upper and lowercase as well as contains at least one symbol.
         *      Alternatively checks if the input is at least 64 characters to bypass the above check.
         *      Alerts the user if both conditions do not pass.
         * @param {string} input The input password to validate.
         * @return {boolean} Returns true if the password is valid.
         */
        static __validatePasswordRequisites( input ) {
            if(
                input.length < 64 &&
                !( new RegExp( /^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\W).*$/g ) ).test( input )
            ) {
                global.smalltalk.alert(
                    'Invalid Password Input',
                    'Your password <b>must be at least 8 characters</b> long and <u>must</u> contain ' +
                    'a combination of alpha-numeric characters both uppercase and lowercase ( A-Z, a-z, 0-9 ) ' +
                    'as well as at least one symbol <b>OR</b> be greater than 64 characters for the best security.' +
                    '<br/><br/><br/>' +
                    'Please enter a password meeting these requirements.<br/>' +
                    'We recommend you use a password manager like KeePassX or KeePassXC to easily store these.'
                );
                return false;
            }

            return true;
        }

        /**
         * @public
         * @see https://github.com/signalapp/libsignal-protocol-javascript/blob/master/src/NumericFingerprint.js
         * @desc Generates a 60-character numeric fingerprint for the identity of two pairs.
         * @param {Buffer|Array|string} local_id The local ID.
         * @param {Buffer|Array|string} local_pub_key The key linked to the local ID.
         * @param {Buffer|Array|string} remote_id The remote ID.
         * @param {Buffer|Array|string} remote_pub_key The key linked to the remote ID.
         * @param {number} iterations The number of iterations to perform on each ID pair.
         * @return {string} Returns a 60 character numeric representation of a fingerprint.
         * @example
         *      local_id = Buffer.from( "3d478a260e5d497441f1b61d321b138a", 'hex' );
         *      local_pub_key = Buffer.from(
         *          "e77ef936546d73dc5a1c25c8267df649c935168f24827267b1328fd22789eca9", 'hex'
         *      );
         *
         *      remote_id = Buffer.from( "2c08a0666e937d115f8b05c82db8a6d0", 'hex' );
         *      remote_pub_key = Buffer.from(
         *          "f2f10dc9d0770e3be28298c2d4ab7a856c92bafa99ff7377ec8cd538bd9481ae", 'hex'
         *      );
         *
         *      __generateFingerprint( local_id, local_pub_key, remote_id, remote_pub_key, 10000 )
         *      > "22162 70964 05613 66992 07314 11169 62962 97838 72198 67786 04039 39461"
         *
         *      __generateFingerprint( local_id, local_pub_key, remote_id, remote_pub_key, 50000 )
         *      > "30312 92326 56131 09531 10046 93930 82882 61321 64148 11774 32632 62322"
         */
        static __generateFingerprint( local_id, local_pub_key, remote_id, remote_pub_key, iterations = 2000 ) {
            /* Ensures the input variable is a Buffer or can be converted to one else it throws an error. */
            function ensure_buffer( name, variable ) {
                /* Do a type check and throw if it isn't supported. */
                if ( typeof( variable ) !== 'string' && !Buffer.isBuffer( variable ) && !Array.isArray( variable ) )
                    throw new Error( `Error for ${name}. Must be a string or buffer.` );

                /* Convert to a buffer. */
                return Buffer.from( variable );
            }

            /* Performs normal iterative hashing by joining an input and a key. */
            function iterate_hash( input, key, count ) {
                /* Loop while iteration count isn't 0. */
                while ( count !== 0 ) {
                    /* Update the input with the concatenated hash of the old input + key. */
                    input = Buffer.from( _discordCrypt.__sha256( Buffer.concat( [ input, key ] ), true ), 'hex' );
                    count -= 1;
                }

                /* Return the result as a buffer. */
                return input;
            }

            /* Converts a hash input into a 5-character numeric segment. */
            function encode_chunk( hash, offset ) {
                /* Converts 40 bits at once. */
                let chunk = hash[ offset ] * Math.pow( 2, 32 );
                chunk += hash[ offset + 1 ] * Math.pow( 2, 24 );
                chunk += hash[ offset + 2 ] * Math.pow( 2, 16 );
                chunk += hash[ offset + 3 ] * Math.pow( 2, 8 );
                chunk += hash[ offset + 4 ];

                /* Limit to a maximum of 99,999. */
                chunk %= 100000;

                /* Convert this to a string. */
                let s = chunk.toString();

                /* Left-pad with zeros if less than 5 characters. */
                while ( s.length < 5 )
                    s = `0${s}`;

                return s;
            }

            /* Converts a 256-bit input hash to a fingerprint identifier. Ignores the last 16 bits. */
            function hash_to_fingerprint( hash ) {
                return `${encode_chunk( hash, 0 )} ${encode_chunk( hash, 5 )} ${encode_chunk( hash, 10 )} ` +
                    `${encode_chunk( hash, 15 )} ${encode_chunk( hash, 20 )} ${encode_chunk( hash, 25 )} `;
            }

            /* Resolve both local and remote vars as buffers. */
            local_id = ensure_buffer( 'local_id', local_id );
            local_pub_key = ensure_buffer( 'local_pub_key', local_pub_key );
            remote_id = ensure_buffer( 'remote_id', remote_id );
            remote_pub_key = ensure_buffer( 'remote_pub_key', remote_pub_key );

            /* Ensure the iteration count is valid. */
            if ( typeof iterations !== 'number' )
                throw new Error( 'Invalid value for iteration count.' );

            /* Get the fingerprints for both pairs, sort them and join them all. */
            return [
                hash_to_fingerprint( iterate_hash( local_id, local_pub_key, iterations ) ),
                hash_to_fingerprint( iterate_hash( remote_id, remote_pub_key, iterations ) )
            ]
                .sort()
                .join( '' )
                .trimRight();
        }

        /**
         * @private
         * @desc Verifies an OpenPGP signed message using the public key provided.
         * @param {string} message The raw message.
         * @param {string} signature The ASCII-armored signature in a detached form.
         * @param {string} public_key The ASCII-armored public key.
         * @return {boolean} Returns true if the message is valid.
         */
        static async __validatePGPSignature( message, signature, public_key ) {
            if( typeof global === 'undefined' || !global.openpgp )
                return false;

            let options = {
                message: global.openpgp.message.fromText( message ),
                signature: await global.openpgp.signature.readArmored( signature ),
                publicKeys: ( await global.openpgp.key.readArmored( public_key ) ).keys
            };

            return global.openpgp.verify( options ).then( ( validity ) => validity.signatures[ 0 ].valid );
        }

        /**
         * @public
         * @desc Compresses the input data using ZLIB.
         * @param {string|Buffer} data The input data to compress.
         * @param {string} [format] The format of the input data.
         * @param {string} [outForm] If specified, returns the compressed
         *      data in this format otherwise it returns a Buffer.
         *      Can be either hex, base64, latin1, utf8 or undefined.
         * @return {string|Buffer} The compressed data.
         */
        static __zlibCompress( data, format = 'base64', outForm ) {
            let v = require( 'zlib' ).deflateSync(
                Buffer.isBuffer( data ) ? data : Buffer.from( data, format ),
                { windowBits: 15 }
            );

            return outForm ? v.toString( outForm ) : v;
        }

        /**
         * @public
         * @desc Decompresses an encoded ZLIB package.
         * @param {string|Buffer} data The input data to decompress.
         * @param {string} [format] The format of the input data.
         *      Can be either hex, base64, latin1, utf8 or undefined.
         *      Defaults to Base64.
         * @param {string} [outForm] If specified, returns the decompressed
         *      data in this format otherwise it returns a Buffer.
         *      Can be either hex, base64, latin1, utf8 or undefined.
         * @return {string|Buffer} The original data.
         */
        static __zlibDecompress( data, format = 'base64', outForm = 'utf8' ) {
            let v = require( 'zlib' ).inflateSync(
                Buffer.isBuffer( data ) ? data : Buffer.from( data, format ),
                { windowBits: 15 }
            );

            return outForm ? v.toString( outForm ) : v;
        }

        /**
         * @public
         * @desc Loads all compiled _libraries as needed.
         * @param {LibraryDefinition} libraries A list of all _libraries to load.
         */
        static __loadLibraries( libraries ) {
            const vm = require( 'vm' );

            /* Inject all compiled _libraries based on if they're needed */
            for ( let name in libraries ) {
                let libInfo = libraries[ name ];

                /* Browser code requires a window object to be defined. */
                if ( libInfo.requiresBrowser && typeof window === 'undefined' ) {
                    _discordCrypt.log( `Skipping loading of browser-required plugin: ${name} ...`, 'warn' );
                    continue;
                }

                /* Decompress the Base64 code. */
                let code = _discordCrypt.__zlibDecompress( libInfo.code );

                /* Determine how to run this. */
                if ( libInfo.requiresBrowser || libInfo.requiresNode ) {
                    /* Run in the current context as it operates on currently defined objects. */
                    vm.runInThisContext(
                        code,
                        {
                            filename: name,
                            displayErrors: false
                        }
                    );
                }
                else {
                    /* Run in a new sandbox and store the result in a global object. */
                    global[ name.replace( '.js', '' ) ] =
                        vm.runInNewContext(
                            code,
                            {
                                filename: name,
                                displayErrors: false
                            }
                        );
                }
            }
        }

        /**
         * @public
         * @desc Performs an HTTP request returns the result to the callback.
         * @param {string} url The URL of the request.
         * @param {GetResultCallback} callback The callback triggered when the request is complete or an error occurs.
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
         * @public
         * @desc Returns the exchange algorithm and bit size for the given metadata as well as a fingerprint.
         * @param {string} key_message The encoded metadata to extract the information from.
         * @param {boolean} [header_present] Whether the message's magic string is attached to the input.
         * @returns {PublicKeyInfo|null} Returns the algorithm's bit length and name or null.
         * @example
         * __extractKeyInfo( public_key, true );
         * @example
         * __extractKeyInfo( public_key, false );
         */
        static __extractKeyInfo( key_message, header_present = false ) {
            try {
                let output = [];
                let msg = key_message;

                /* Strip the header if necessary. */
                if ( header_present )
                    msg = msg.slice( 4 );

                /* Decode the message to hex. */
                msg = _discordCrypt.__substituteMessage( msg );

                /* Decode the message to raw bytes. */
                msg = Buffer.from( msg, 'hex' );

                /* Sanity check. */
                if ( !_discordCrypt.__isValidExchangeAlgorithm( msg[ 0 ] ) )
                    return null;

                /* Create a fingerprint for the blob. */
                output[ 'fingerprint' ] = _discordCrypt.__sha256( msg, true );

                /* Buffer[0] contains the algorithm type. Reverse it. */
                output[ 'bit_length' ] = _discordCrypt.__indexToAlgorithmBitLength( msg[ 0 ] );
                output[ 'algorithm' ] = _discordCrypt.__indexToExchangeAlgorithmString( msg[ 0 ] )
                    .split( '-' )[ 0 ].toLowerCase();

                return output;
            }
            catch ( e ) {
                return null;
            }
        }

        /**
         * @public
         * @desc Smartly splits the input text into chunks according to the specified length while
         *      attempting to preserve word spaces unless they exceed the limit.
         * @param {string} input_string The input string.
         * @param {int} max_length The maximum length of the string before splitting.
         * @returns {Array} An array of split strings.
         * @private
         */
        static __splitStringChunks( input_string, max_length ) {
            /* Sanity check. */
            if ( !max_length || max_length <= 1 )
                return input_string;

            /* Split the string into words. */
            const words = input_string.split( ' ' );

            /* Create vars for storing the result, current string and first-word flag. */
            let ret = [], current = '', first = true;

            /* Iterate over all words. */
            words.forEach( word => {
                /* Check if the current string would overflow if the word was added. */
                if( ( current.length + word.length ) > max_length && current.length ) {
                    /* Insert the string into the array and reset it. */
                    ret.push( current );

                    /* Reset the sentence. */
                    current = '';
                }

                /* Add the current word to the sentence without a space only if it's the first word. */
                if( first ) {
                    current += word;
                    first = false;
                }
                else
                    current += ` ${word}`;

                /* If the current sentence is longer than the maximum, split it and add to the result repeatedly. */
                while( current.length > max_length ) {
                    /* Add it to the array. */
                    ret.push( current.substr( 0, max_length ) );

                    /* Get the remaining. */
                    current = current.substr( max_length );
                }
            } );

            /* If the current sentence has something, add it to the array. */
            if( current.length )
                ret.push( current );

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
                        catch ( e ) {
                            /* If parsing or slicing somehow fails, this isn't valid. */
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
         * @desc Extracts all tags from the given message and optionally removes any tagged discriminators.
         * @param {string} message The input message to extract all tags from.
         * @param {object} channelProps The properties of the current channel used for parsing.
         * @returns {UserTags}
         */
        static __extractTags( message, channelProps ) {
            let split_msg = message.split( ' ' );
            let cleaned_tags = '', cleaned_msg = '', tmp_tag;
            let user_tags = [];

            /* Iterate over each segment and check for usernames. */
            for ( let i = 0, k = 0; i < split_msg.length; i++ ) {
                /* Check for normal user names. */
                if ( this.__isValidUserName( split_msg[ i ] ) ) {
                    user_tags[ k++ ] = split_msg[ i ];
                    cleaned_msg += `${split_msg[ i ].split( '#' )[ 0 ]} `;
                }
                /* Check for parsed user IDs. */
                else if ( ( /(<@[!]*[0-9]{14,22}>)/gm ).test( split_msg[ i ] ) ) {
                    user_tags[ k++ ] = split_msg[ i ];

                    /* Convert the tag back to human-readable form if a valid channel props was passed. */
                    tmp_tag = channelProps ?
                        _cachedModules.MessageCreator.unparse( split_msg[ i ], channelProps ) :
                        split_msg[ i ];
                    cleaned_msg += `${tmp_tag.split( '#' )[ 0 ]} `;
                }
                /* Check for @here or @everyone. */
                else if ( [ '@everyone', '@here', '@me' ].indexOf( split_msg[ i ] ) !== -1 ) {
                    user_tags[ k++ ] = split_msg[ i ];
                    cleaned_msg += `${split_msg[ i ]} `;
                }
                /* Check for parsed channel tags. */
                else if ( ( /(<#[0-9]{14,22}>)/gm ).test( split_msg[ i ] ) ) {
                    user_tags[ k++ ] = split_msg[ i ];

                    /* Convert the channel tag back to human-readable form if a valid channel props was passed. */
                    cleaned_msg += `${channelProps ?
                        _cachedModules.MessageCreator.unparse( split_msg[ i ], channelProps ) :
                        split_msg[ i ]} `;
                }
                else
                    cleaned_msg += `${split_msg[ i ]} `;
            }

            /* Join all tags to a single string. */
            for ( let i = 0; i < user_tags.length; i++ )
                cleaned_tags += `${user_tags[ i ]} `;

            /* Return the parsed message and user tags. */
            return [ cleaned_msg.trim(), cleaned_tags.trim() ];
        }

        /**
         * @public
         * @desc Extracts raw code blocks from a message and returns a descriptive array.
         *      N.B. This does not remove the code blocks from the message.
         * @param {string} message The message to extract all code blocks from.
         * @returns {Array<CodeBlockDescriptor>} Returns an array of CodeBlockDescriptor objects.
         */
        static __extractCodeBlocks( message ) {
            /* This regex only extracts code blocks. */
            let code_block_expr = new RegExp( /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm ),
                inline_block_expr = new RegExp( /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/g ),
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
         * @desc Detects and extracts all formatted emojis in a message.
         *      Basically, all emojis are formatted as follows:
         *          <:##EMOJI NAME##:##SNOWFLAKE##>
         *
         *      Animated emojis have the format:
         *          <a:##EMOJI NAME##:##SNOWFLAKE##>
         *
         *      This translates to a valid URI always:
         *          https://cdn.discordapp.com/emojis/##SNOWFLAKE##.png
         *      Or:
         *          https://cdn.discordapp.com/emojis/##SNOWFLAKE##.gif
         *
         *      This means it's a simple matter of extracting these from a message and building an image embed.
         *          <img src="##URI##" class="##EMOJI CLASS##" alt=":#EMOJI NAME##:">
         * @param {string} message The message to extract all emojis from.
         * @param {boolean} as_html Whether to interpret anchor brackets as HTML.
         * @return {Array<EmojiDescriptor>} Returns an array of EmojiDescriptor objects.
         */
        static __extractEmojis( message, as_html = false ) {
            let _emojis = [], _matched;

            /* Execute the regex for finding emojis on the message. */
            let emoji_expr = new RegExp(
                as_html ?
                    /((&lt;[a]*)(:(?![\n])[-\w]+:)([0-9]{14,22})(&gt;))/gm :
                    /((<[a]*)(:(?![\n])[-\w]+:)([0-9]{14,22})(>))/gm
            );

            /* Iterate over each matched emoji. */
            while ( ( _matched = emoji_expr.exec( message ) ) ) {
                /* Insert the emoji's snowflake and name. */
                _emojis.push( {
                    animated: _matched[ 2 ].indexOf( 'a' ) !== -1,
                    formatted: _matched[ 0 ],
                    name: _matched[ 3 ],
                    snowflake: _matched[ 4 ]
                } );
            }

            /* Return the results. */
            return _emojis;
        }

        /**
         * @public
         * @desc Extracts code blocks from a message and formats them in HTML to the proper format.
         * @param {string} message The message to format code blocks from.
         * @returns {CodeBlockInfo} Returns whether the message contains code blocks and the formatted HTML.
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
                let _extracted = _discordCrypt.__extractCodeBlocks( message );

                /* Wrap the message normally. */
                if ( !_extracted.length )
                    return {
                        code: false,
                        html: message
                    };

                /* Loop over each expanded code block. */
                for ( let i = 0; i < _extracted.length; i++ ) {
                    let lang = _extracted[ i ].language,
                        raw = _extracted[ i ].raw_code;

                    /* Inline code blocks get styled differently. */
                    if ( lang !== 'inline' ) {
                        /* For multiple line blocks, new lines are also captured from above. Remove them. */
                        if( raw[ 0 ] === '\n' )
                            raw = raw.substr( 1 );
                        if( raw[ raw.length - 1 ] === '\n' )
                            raw = raw.substr( 0, raw.length - 1 );

                        /* Build a <pre><code></code></pre> element for HLJS to work on. */
                        let code_block = $( '<pre>' ).addClass( lang ).append( $( '<code>' ).html( raw ) );

                        /* Highlight this block. */
                        _cachedModules.HighlightJS.highlightBlock( code_block[ 0 ] );

                        /* Replace the code with an HTML formatted code block. */
                        message = message.split( _extracted[ i ].captured_block ).join( code_block[ 0 ].outerHTML );
                    }
                    else {
                        /* Split the HTML message according to the inline markdown code block. */
                        message = message.split( _extracted[ i ].captured_block );

                        /* Replace the data with a inline code class. */
                        message = message.join( `<code class="inline">${raw}</code>` );
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
         * @returns {URLInfo} Returns whether the message contains URLs and the formatted HTML.
         */
        static __buildUrlMessage( message, embed_link_prefix ) {
            try {
                /* Split message into array for easier parsing */
                message = message.split( ' ' );

                let containsURL = false;

                /* Simple detection and replacement */
                for ( let i = 0; i < message.length; i++ ) {
                    try {

                        /* Creates URL object of every chunk in the message */
                        let url = new URL( message[ i ] );

                        /* Only allows https and http protocols */
                        if( url.protocol === 'https:' || url.protocol === 'http:' ) {
                            containsURL = true;

                            /* If this is an Up1 host, we can directly embed it. Obviously don't embed deletion links.*/
                            if (
                                embed_link_prefix !== undefined &&
                                message[ i ].startsWith( `${embed_link_prefix}/#` ) &&
                                message[ i ].indexOf( 'del?ident=' ) === -1
                            )
                                message[ i ] =
                                    `<a target="_blank" rel="noopener noreferrer" href="${url.href}">${url.href}</a>
                                    <iframe src=${url.href} width="100%" height="400px"></iframe><br/><br/>`;

                            else
                                /* Replaces the inputted URL with a formatted one */
                                message[ i ] =
                                    `<a target="_blank" rel="noopener noreferrer" href="${url.href}">${url.href}</a>`;
                        }

                    }
                    /* If the object creation fails, message chunk wasn't a valid URL */
                    catch( e ) {
                        /* Ignore. */
                    }
                }

                /* Rejoin the message array back to normal */
                message = message.join( ' ' );

                /* Wrap the message in span tags. */
                if( containsURL )
                    return {
                        url: true,
                        html: `<span>${message}</span>`
                    };

                /* If the message didn't contain a URL return normal message */
                else return {
                    url: false,
                    html: message
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
         * @desc Extracts emojis from a message and formats them as IMG embeds.
         * @param {string} message The message to format.
         * @param {string} emoji_class The class used for constructing the emoji image.
         * @param {Object} emoji_ctx The internal context for parsing emoji surrogates.
         * @return {EmojiInfo} Returns whether the message contains Emojis and the formatted HTML.
         */
        static __buildEmojiMessage( message, emoji_class, emoji_ctx ) {
            /* Get all emojis in the message. */
            let emojis = _discordCrypt.__extractEmojis( message, true );

            /* Parse any default-emojis. */
            typeof emoji_ctx !== 'undefined' && emoji_ctx.forEach( ( item ) => {
                if( !item.surrogates.length )
                    return;

                message = message
                    .split( item.surrogates )
                    .join(
                        '<span class="dc-tooltip dc-tooltip-delayed">' +
                        `<img src="${item.defaultUrl}" class="${emoji_class}" alt=":${item.names[ 0 ]}:">` +
                        `<span class="dc-tooltip-text" style="font-size: 12px">:${item.names[ 0 ]}:</span>` +
                        '</span>'
                    );
            } );

            /* Return the default if no emojis are defined. */
            if( !emojis.length ) {
                return {
                    emoji: false,
                    html: message
                }
            }

            /* Loop over every emoji and format them in the message.. */
            for( let i = 0; i < emojis.length; i++ ) {
                let e = emojis[ i ];

                /* Get the URI for this. */
                let URI = `https://cdn.discordapp.com/emojis/${e.snowflake}.${e.animated ? 'gif' : 'png'}`;

                /* Replace the message with a link. */
                message = message
                    .split( emojis[ i ].formatted )
                    .join(
                        '<span class="dc-tooltip dc-tooltip-delayed">' +
                        `<img src="${URI}" class="${emoji_class}" alt="${e.name}">` +
                        `<span class="dc-tooltip-text" style="font-size: 12px">${e.name}</span>` +
                        '</span>'
                    );
            }

            /* Return the result. */
            return {
                emoji: true,
                html: message
            }
        }

        /**
         * @public
         * @desc Returns a string, Buffer() or Array() as a buffered object.
         * @param {string|Buffer|Array} input The input variable.
         * @param {boolean|undefined} [is_input_hex] If set to true, the input is parsed as a hex string. If false, it
         *      is parsed as a Base64 string. If this value is undefined, it is parsed as a UTF-8 string.
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
         * @returns {ClipboardInfo} Contains clipboard data. May be null.
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
                    /* Resolve what's in the clipboard. */
                    tmp = clipboard.readText();

                    try {
                        /* Check if this is a valid file path. */
                        let stat = fs.statSync( tmp );

                        /* Check if this is a file. */
                        if ( stat.isFile() ) {
                            /* Read the file and store the file name. */
                            data = fs.readFileSync( tmp );
                            name = path.basename( tmp );
                            is_file = true;
                        }
                        else {
                            /* This isn't a file. Assume we want to upload the path itself as text. */
                            data = Buffer.from( tmp, 'utf8' );
                        }
                    }
                    catch ( e ) {
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
                        mime_type[ i ] = _discordCrypt.__getFileMimeType( tmp );

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
         * @private
         * @desc Converts a seed to the encryption keys used in the Up1 protocol.
         * @param {string|Buffer|Uint8Array} seed
         * @param {Object} sjcl The loaded Stanford Javascript Crypto Library.
         * @return {{seed: *, key: *, iv: *, ident: *}}
         */
        static __up1SeedToKey( seed, sjcl ) {
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

        /**
         * @public
         * @desc Encrypts the specified buffer to Up1's format specifications and returns this data to the callback.
         * @param {Buffer} data The input buffer to encrypt.
         * @param {string} mime_type The MIME type of this file.
         * @param {string} file_name The name of this file.
         * @param {Object} sjcl The loaded Stanford Javascript Crypto Library.
         * @param {EncryptedFileCallback} callback The callback function that will be called on error or completion.
         * @param {Buffer} [seed] Optional seed to use for the generation of keys.
         */
        static __up1EncryptBuffer( data, mime_type, file_name, sjcl, callback, seed ) {
            const crypto = require( 'crypto' );

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

                /* Generate a random 512 bit seed and calculate the key and IV from this. */
                let params = _discordCrypt.__up1SeedToKey( seed || crypto.randomBytes( 64 ), sjcl );

                /* Perform AES-256-CCM encryption on this buffer and return an ArrayBuffer() object. */
                data = sjcl.mode.ccm.encrypt( new sjcl.cipher.aes( params.key ), data, params.iv );

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
         * @desc Decrypts the specified data as per Up1's spec.
         * @param {Buffer} data The encrypted buffer.
         * @param {string} seed A base64-URL encoded string.
         * @param {Object} sjcl The Stanford Javascript Library object.
         * @return {{header: Object, data: Blob}}
         * @private
         */
        static __up1DecryptBuffer( data, seed, sjcl ) {
            /* Constant as per the Up1 protocol. Every file contains these four bytes: "Up1\0". */
            const file_header = [ 85, 80, 49, 0 ];

            let has_header = true, idx = 0, header = '', view;

            /* Retrieve the AES key and IV. */
            let params = _discordCrypt.__up1SeedToKey( seed, sjcl );

            /* Convert the buffer to a Uint8Array. */
            let _file = new Uint8Array( data );

            /* Scan for the file header. */
            for ( let i = 0; i < file_header.length; i++ ) {
                if ( _file[ i ] != file_header[ i ] ) {
                    has_header = false;
                    break
                }
            }

            /* Remove the header if it exists. */
            if ( has_header )
                _file = _file.subarray( file_header.length );

            /* Decrypt the blob. */
            let decrypted = sjcl.mode.ccm.decrypt(
                new sjcl.cipher.aes( params.key ),
                sjcl.codec.bytes.toBits( _file ),
                params.iv
            );

            /* The header is a JSON encoded UTF-16 string at the top. */
            view = new DataView( ( new Uint8Array( sjcl.codec.bytes.fromBits( decrypted ) ) ).buffer );
            for ( ; ; idx++ ) {
                /* Get the UTF-16 byte at the position. */
                let num = view.getUint16( idx * 2, false );

                /* Break on null terminators. */
                if ( num === 0 )
                    break;

                /* Add to the JSON string. */
                header += String.fromCharCode( num );
            }

            /* Return the header object and the decrypted data. */
            header = JSON.parse( header );
            return {
                header: header,
                data: Buffer.from( sjcl.codec.bytes.fromBits( decrypted ) )
                    .slice( ( idx * 2 ) + 2, data.length ),
                blob: ( new Blob( [ decrypted ], { type: header.mime } ) )
                    .slice( ( idx * 2 ) + 2, data.length, header.mime )
            };
        }

        /**
         * @private
         * @desc Performs AES-256 CCM encryption of the given file and converts it to the expected Up1 format.
         * @param {string} file_path The path to the file to encrypt.
         * @param {Object} sjcl The loaded SJCL library providing AES-256 CCM.
         * @param {EncryptedFileCallback} callback The callback function for when the file has been encrypted.
         * @param {boolean} [randomize_file_name] Whether to randomize the name of the file in the metadata.
         *      Default: False.
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
                    _discordCrypt.__up1EncryptBuffer(
                        file_data,
                        _discordCrypt.__getFileMimeType( file_path ),
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
         * @public
         * @desc Uploads raw data to an Up1 service and returns the file URL and deletion key.
         * @param {string} up1_host The host URL for the Up1 service.
         * @param {string} [up1_api_key] The optional API key used for the service.
         * @param {Object} sjcl The loaded SJCL library providing AES-256 CCM.
         * @param {UploadedFileCallback} callback The callback function called on success or failure.
         * @param {ClipboardInfo} [clipboard_data] Optional clipboard data.
         */
        static __up1UploadClipboard( up1_host, up1_api_key, sjcl, callback, clipboard_data = undefined ) {
            /* Get the current clipboard data. */
            let clipboard = clipboard_data === undefined ? _discordCrypt.__clipboardToBuffer() : clipboard_data;

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
                    require( 'request' ).post(
                        {
                            headers: form.getHeaders(),
                            uri: `${up1_host}/up`,
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
                                        `${up1_host}/#${encoded_seed}`,
                                        `${up1_host}/del?ident=${identity}&delkey=${JSON.parse( body ).delkey}`,
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
         * @param {UploadedFileCallback} callback The callback function called on success or failure.
         * @param {boolean} [randomize_file_name] Whether to randomize the name of the file in the metadata.
         *      Default: False.
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
                    require( 'request' ).post(
                        {
                            headers: form.getHeaders(),
                            uri: `${up1_host}/up`,
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
                                        `${up1_host}/#${encoded_seed}`,
                                        `${up1_host}/del?ident=${identity}&delkey=${JSON.parse( body ).delkey}`,
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

        /**
         * @private
         * @desc Attempts to parse an input changelog and returns only the differences between
         *      the current version and the latest version.
         * @param {string} changelog_data The full changelog data.
         * @param {string} current_version The current version currently installed.
         * @return {string} Returns the differences or the full changelog on failure.
         */
        static __tryParseChangelog( changelog_data, current_version ) {
            /**
             * @protected
             * @desc Compares two version numbers in the format x.y.z.
             * @param {string} first The first version string to compare.
             * @param {string} second The second version string to compare against.
             * @return {number} Returns 0 if equal, > 0 if [first > second] and < 0 if [second > first].
             */
            const VersionCompare = ( first, second ) => {
                /* Split the versions into segments. */
                let _first = first.replace( /(\.0+)+$/, '' ).split( '.' );
                let _second = second.replace( /(\.0+)+$/, '' ).split( '.' );

                /* Iterate over the smallest version component lengths. */
                for ( let i = 0; i < Math.min( _first.length, _second.length ); i++ ) {
                    /* Compare the first component to the second and check if it's larger. */
                    let delta = parseInt( _first[ i ], 10 ) - parseInt( _second[ i ], 10 );

                    /* Return a positive number indicating the length. */
                    if ( delta )
                        return delta;
                }

                /* Return either 0 or negative indicating the second is equal or greater than the first. */
                return _first.length - _second.length;
            };

            try {
                let result = '';

                /* Capture all versions and sort them from lowest to highest. */
                let versions = changelog_data
                    .split( "\r" )
                    .join( "" )
                    .match( /((Version )(\d+\.)(\d+\.)(\*|\d+))/gm )
                    .sort( VersionCompare );

                /* Iterate all versions from the most recent to the lowest. */
                for ( let i = versions.length - 1; i > 0; i-- ) {
                    /* Compare the current version against this one. */
                    let r = VersionCompare( current_version, versions[ i ] );

                    /* Ignore if the current version is greater or equal to the one being checked. */
                    if( r > 0 || r === 0 )
                        continue;

                    /* Get the full version changes block. */
                    let changes = changelog_data.slice(
                        changelog_data.indexOf( versions[ i ] ),
                        changelog_data.indexOf( versions[ i - 1 ] )
                    );

                    /* Insert the current version info into the changelog result. */
                    result += `${versions[ i ]}\n\n`;
                    result += changes
                        .replace( versions[ i ], '' )
                        .replace( "\n\n", '' );
                }

                /* Return the result. */
                return result;
            }
            catch ( e ) {
                _discordCrypt.log( `Failed to parse the changelog: ${e}`, 'warn' );
            }

            /* Return the full changelog. */
            return changelog_data;
        }

        /* ========================================================= */

        /* =================== CRYPTO PRIMITIVES =================== */

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
         * @public
         * @desc Computes a key-derivation based on the PBKDF2 standard and returns a hex or base64 encoded digest.
         * @param {string|Buffer|Array} input The input value to hash.
         * @param {string|Buffer|Array} salt The secret value used to derive the hash.
         * @param {boolean} [to_hex] Whether to conver the result to a hex string or a Base64 string.
         * @param {boolean} [is_input_hex] Whether to treat the input as a hex or Base64 string.
         *      If undefined, it is interpreted as a UTF-8 string.
         * @param {boolean} [is_salt_hex] Whether to treat the salt as a hex or Base64 string.
         *      If undefined, it is interpreted as a UTF-8 string.
         * @param {PBKDF2Callback} [callback] The callback function if performing an async request.
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
                    _input = Buffer
                        .from( input, is_input_hex === undefined ? 'utf8' : is_input_hex ? 'hex' : 'base64' );
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

            return '';
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
            _message = _discordCrypt.__toBuffer( message, is_hex );

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
         * @desc Converts a given key or iv into a buffer object. Performs a hash of the key it doesn't match the
         *      blockSize.
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

                /* Get the appropriate hash algorithm for the key size. */
                switch ( keyBytes ) {
                case 8:
                    hash = _discordCrypt.__whirlpool64;
                    break;
                case 16:
                    hash = _discordCrypt.__sha512_128;
                    break;
                case 20:
                    hash = _discordCrypt.__sha160;
                    break;
                case 24:
                    hash = _discordCrypt.__whirlpool192;
                    break;
                case 32:
                    hash = _discordCrypt.__sha256;
                    break;
                case 64:
                    hash = use_whirlpool !== undefined ? _discordCrypt.__sha512 : _discordCrypt.__whirlpool;
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
                return _discordCrypt.__toBuffer( message, is_message_hex );
            }
            catch ( e ) {
                throw 'exception - Invalid message type.';
            }
        }

        /**
         * @public
         * @desc Converts a cipher string to its appropriate index number.
         * @param {string} primary_cipher The primary cipher.
         *      This can be either [ 'bf', 'aes', 'camel', 'idea', 'tdes' ].
         * @param {string} [secondary_cipher] The secondary cipher.
         *      This can be either [ 'bf', 'aes', 'camel', 'idea', 'tdes' ].
         * @returns {int} Returns the index value of the algorithm.
         */
        static __cipherStringToIndex( primary_cipher, secondary_cipher = undefined ) {
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
        static __cipherIndexToString( index, get_secondary = undefined ) {

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
        static __entropicBitLength( key ) {
            let h = Object.create( null ), k;
            let sum = 0, len = key.length;

            key.split( '' ).forEach( c => {
                h[ c ] ? h[ c ]++ : h[ c ] = 1;
            } );

            for ( k in h ) {
                let p = h[ k ] / len;
                sum -= p * Math.log2( p );
            }

            return parseInt( sum * len );
        }

        /**
         * @public
         * @desc Returns 256-characters of Braille.
         * @return {string}
         */
        static __getBraille() {
            return Array.from(
                "⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖" +
                "⡗⡘⡙⡚⡛⡜⡝⡞⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿⢀⢁⢂⢃⢄⢅⢆⢇⢈⢉⢊⢋⢌⢍⢎⢏⢐⢑⢒⢓⢔⢕⢖⢗⢘⢙⢚⢛⢜⢝⢞⢟⢠⢡⢢⢣⢤⢥⢦⢧⢨⢩⢪⢫⢬⢭" +
                "⢮⢯⢰⢱⢲⢳⢴⢵⢶⢷⢸⢹⢺⢻⢼⢽⢾⢿⣀⣁⣂⣃⣄⣅⣆⣇⣈⣉⣊⣋⣌⣍⣎⣏⣐⣑⣒⣓⣔⣕⣖⣗⣘⣙⣚⣛⣜⣝⣞⣟⣠⣡⣢⣣⣤⣥⣦⣧⣨⣩⣪⣫⣬⣭⣮⣯⣰⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼⣽⣾⣿"
            );
        }

        /**
         * @public
         * @desc Determines if a string has all valid Braille characters according to the result from __getBraille()
         * @param {string} message The message to validate.
         * @returns {boolean} Returns true if the message contains only the required character set.
         */
        static __isValidBraille( message ) {
            let c = _discordCrypt.__getBraille();

            for ( let i = 0; i < message.length; i++ )
                if ( c.indexOf( message[ i ] ) === -1 )
                    return false;

            return true;
        }

        /**
         * @public
         * @desc Returns an array of valid Diffie-Hellman exchange key bit-sizes.
         * @returns {number[]} Returns the bit lengths of all supported DH keys.
         */
        static __getDHBitSizes() {
            return [ 768, 1024, 1536, 2048, 3072, 4096, 6144, 8192 ];
        }

        /**
         * @public
         * @desc Returns an array of Elliptic-Curve Diffie-Hellman key bit-sizes.
         * @returns {number[]} Returns the bit lengths of all supported ECDH keys.
         */
        static __getECDHBitSizes() {
            return [ 224, 256, 384, 409, 521, 571 ];
        }

        /**
         * @public
         * @desc Determines if a key exchange algorithm's index is valid.
         * @param {int} index The index to determine if valid.
         * @returns {boolean} Returns true if the desired index meets one of the ECDH or DH key sizes.
         */
        static __isValidExchangeAlgorithm( index ) {
            return index >= 0 &&
                index <= ( _discordCrypt.__getDHBitSizes().length + _discordCrypt.__getECDHBitSizes().length - 1 );
        }

        /**
         * @public
         * @desc Converts an algorithm index to a string.
         * @param {int} index The input index of the exchange algorithm.
         * @returns {string} Returns a string containing the algorithm or "Invalid Algorithm".
         */
        static __indexToExchangeAlgorithmString( index ) {
            let dh_bl = _discordCrypt.__getDHBitSizes(), ecdh_bl = _discordCrypt.__getECDHBitSizes();
            let base = [ 'DH-', 'ECDH-' ];

            if ( !_discordCrypt.__isValidExchangeAlgorithm( index ) )
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
        static __indexToAlgorithmBitLength( index ) {
            let dh_bl = _discordCrypt.__getDHBitSizes(), ecdh_bl = _discordCrypt.__getECDHBitSizes();

            if ( !_discordCrypt.__isValidExchangeAlgorithm( index ) )
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
        static __computeExchangeSharedSecret( private_key, public_key, is_base_64, to_base_64 ) {
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
         *      This must be one of the supported lengths retrieved from __getDHBitSizes().
         * @param {Buffer} private_key The optional private key used to initialize the object.
         * @returns {Object|null} Returns a DiffieHellman object on success or null on failure.
         */
        static __generateDH( size, private_key = undefined ) {
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
         * @see http://www.secg.org/sec2-v2.pdf
         * @desc Generates a Elliptic-Curve Diffie-Hellman key pair.
         * @param {int} size The bit length of the desired key pair.
         *      This must be one of the supported lengths retrieved from __getECDHBitSizes().
         * @param {Buffer} private_key The optional private key used to initialize the object.
         * @returns {Object|null} Returns a ECDH object on success or null on failure.
         */
        static __generateECDH( size, private_key = undefined ) {
            let groupName, key;

            /* Calculate the appropriate group. */
            switch ( size ) {
            case 224:
                groupName = 'secp224k1';
                break;
            case 384:
                groupName = 'secp384r1';
                break;
            case 409:
                groupName = 'sect409k1';
                break;
            case 521:
                groupName = 'secp521r1';
                break;
            case 571:
                groupName = 'sect571k1';
                break;
            case 256:
                break;
            default:
                return null;
            }

            /* Create the key object. */
            try {
                if ( size !== 256 )
                    key = require( 'crypto' ).createECDH( groupName );
                else {
                    key = new global.Curve25519();
                    key.generateKeys( undefined, require( 'crypto' ).randomBytes( 32 ) );
                }
            }
            catch ( err ) {
                return null;
            }

            /* Generate the key if it's valid. */
            if ( key !== undefined && key !== null && typeof key.generateKeys !== 'undefined' && size !== 256 ) {
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
         * @desc Substitutes an input Buffer() object to the Braille equivalent from __getBraille().
         * @param {string} message The input message to perform substitution on.
         * @param {boolean} convert Whether the message is to be converted from hex to Braille or from Braille to hex.
         * @returns {string} Returns the substituted string encoded message.
         * @throws An exception indicating the message contains characters not in the character set.
         */
        static __substituteMessage( message, convert ) {
            /* Target character set. */
            let subset = _discordCrypt.__getBraille();

            let result = "", index = 0;

            if ( convert !== undefined ) {
                /* Sanity check. */
                if ( !Buffer.isBuffer( message ) )
                    throw 'Message input is not a buffer.';

                /* Calculate the target character. */
                for ( let i = 0; i < message.length; i++ )
                    result += subset[ message[ i ] ];
            }
            else {
                /* Calculate the target character. */
                for ( let i = 0; i < message.length; i++ ) {
                    index = subset.indexOf( message[ i ] );

                    /* Sanity check. */
                    if ( index === -1 )
                        throw 'Message contains invalid characters.';

                    result += `0${index.toString( 16 )}`.slice( -2 );
                }
            }

            return result;
        }

        /**
         * @public
         * @desc Encodes the given values as a braille encoded 32-bit word.
         * @param {int} cipher_index The index of the cipher(s) used to encrypt the message
         * @param {int} cipher_mode_index The index of the cipher block mode used for the message.
         * @param {int} padding_scheme_index The index of the padding scheme for the message.
         * @param {int} pad_byte The padding byte to use.
         * @returns {string} Returns a substituted UTF-16 string of a braille encoded 32-bit word containing these
         *      options.
         */
        static __metaDataEncode( cipher_index, cipher_mode_index, padding_scheme_index, pad_byte ) {

            /* Parse the first 8 bits. */
            if ( typeof cipher_index === 'string' )
                cipher_index = _discordCrypt.__cipherStringToIndex( cipher_index );

            /* Parse the next 8 bits. */
            if ( typeof cipher_mode_index === 'string' )
                cipher_mode_index = [ 'cbc', 'cfb', 'ofb' ].indexOf( cipher_mode_index.toLowerCase() );

            /* Parse the next 8 bits. */
            if ( typeof padding_scheme_index === 'string' )
                padding_scheme_index = [ 'pkc7', 'ans2', 'iso1', 'iso9' ].indexOf( padding_scheme_index.toLowerCase() );

            /* Buffered word. */
            let buf = Buffer.from( [ cipher_index, cipher_mode_index, padding_scheme_index, parseInt( pad_byte ) ] );

            /* Convert it and return. */
            return _discordCrypt.__substituteMessage( buf, true );
        }

        /**
         * @public
         * @desc Decodes an input string and returns a byte array containing index number of options.
         * @param {string} message The substituted UTF-16 encoded metadata containing the metadata options.
         * @returns {int[]} Returns 4 integer indexes of each metadata value.
         */
        static __metaDataDecode( message ) {
            /* Decode the result and convert the hex to a Buffer. */
            return Buffer.from( _discordCrypt.__substituteMessage( message ), 'hex' );
        }

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
            const cipher_name = `${symmetric_cipher}${block_mode === undefined ? '' : '-' + block_mode}`;
            const crypto = require( 'crypto' );

            /* Buffered parameters. */
            let _message, _key, _iv, _salt, _derived, _encrypt;

            /* Make sure the cipher name and mode is valid first. */
            if (
                !_discordCrypt.__isValidCipher( cipher_name ) || [ 'cbc', 'cfb', 'ofb' ]
                    .indexOf( block_mode.toLowerCase() ) === -1
            )
                return null;

            /* Pad the message to the nearest block boundary. */
            _message = _discordCrypt.__padMessage( message, padding_scheme, key_size_bits, is_message_hex );

            /* Get the key as a buffer. */
            _key = _discordCrypt.__validateKeyIV( key, key_size_bits );

            /* Check if using a predefined salt. */
            if ( one_time_salt !== undefined ) {
                /* Convert the salt to a Buffer. */
                _salt = _discordCrypt.__toBuffer( one_time_salt );

                /* Don't bother continuing if conversions have failed. */
                if ( !_salt || _salt.length === 0 )
                    return null;

                /* Only 64 bits is used for a salt. If it's not that length, hash it and use the result. */
                if ( _salt.length !== 8 )
                    _salt = Buffer.from( _discordCrypt.__whirlpool64( _salt, true ), 'hex' );
            }
            else {
                /* Generate a random salt to derive the key and IV. */
                _salt = crypto.randomBytes( 8 );
            }

            /* Derive the key length and IV length. */
            _derived = _discordCrypt.__pbkdf2_sha256( _key.toString( 'hex' ), _salt.toString( 'hex' ), true, true, true,
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
         * @param {string} padding_scheme The padding scheme used to unpad the message from the block length of the
         *      cipher.
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
            const cipher_name = `${symmetric_cipher}${block_mode === undefined ? '' : '-' + block_mode}`;
            const crypto = require( 'crypto' );

            /* Buffered parameters. */
            let _message, _key, _iv, _salt, _derived, _decrypt;

            /* Make sure the cipher name and mode is valid first. */
            if ( !_discordCrypt.__isValidCipher( cipher_name ) || [ 'cbc', 'ofb', 'cfb' ]
                .indexOf( block_mode.toLowerCase() ) === -1 )
                return null;

            /* Get the message as a buffer. */
            _message = _discordCrypt.__validateMessage( message, is_message_hex );

            /* Get the key as a buffer. */
            _key = _discordCrypt.__validateKeyIV( key, key_size_bits );

            /* Retrieve the 64-bit salt. */
            _salt = _message.slice( 0, 8 );

            /* Derive the key length and IV length. */
            _derived = _discordCrypt.__pbkdf2_sha256( _key.toString( 'hex' ), _salt.toString( 'hex' ), true, true, true,
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
            _pt = _discordCrypt.__padMessage( _pt, padding_scheme, key_size_bits, true, true );

            /* Return the buffer. */
            return _pt.toString( output_format );
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
         *      This prepends a 64 bit seed used to derive encryption keys from the initial key.
         * @returns {string|null} Returns the encrypted and substituted ciphertext of the message or null on failure.
         * @throws An exception indicating the error that occurred.
         */
        static __symmetricEncrypt( message, primary_key, secondary_key, cipher_index, block_mode, padding_mode ) {
            const customizationParameter = new Uint8Array( Buffer.from( 'discordCrypt MAC' ) );

            /* Performs one of the 5 standard encryption algorithms on the plain text. */
            function handleEncodeSegment( message, key, cipher, mode, pad ) {
                switch ( cipher ) {
                case 0:
                    return _discordCrypt.__blowfish512_encrypt( message, key, mode, pad );
                case 1:
                    return _discordCrypt.__aes256_encrypt( message, key, mode, pad );
                case 2:
                    return _discordCrypt.__camellia256_encrypt( message, key, mode, pad );
                case 3:
                    return _discordCrypt.__idea128_encrypt( message, key, mode, pad );
                case 4:
                    return _discordCrypt.__tripledes192_encrypt( message, key, mode, pad );
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
                msg = _discordCrypt.__blowfish512_encrypt(
                    handleEncodeSegment( message, primary_key, cipher_index, mode, pad ),
                    secondary_key,
                    mode,
                    pad,
                    true,
                    false
                );
            else if ( cipher_index >= 5 && cipher_index <= 9 )
                msg = _discordCrypt.__aes256_encrypt(
                    handleEncodeSegment( message, primary_key, cipher_index - 5, mode, pad ),
                    secondary_key,
                    mode,
                    pad,
                    true,
                    false
                );
            else if ( cipher_index >= 10 && cipher_index <= 14 )
                msg = _discordCrypt.__camellia256_encrypt(
                    handleEncodeSegment( message, primary_key, cipher_index - 10, mode, pad ),
                    secondary_key,
                    mode,
                    pad,
                    true,
                    false
                );
            else if ( cipher_index >= 15 && cipher_index <= 19 )
                msg = _discordCrypt.__idea128_encrypt(
                    handleEncodeSegment( message, primary_key, cipher_index - 15, mode, pad ),
                    secondary_key,
                    mode,
                    pad,
                    true,
                    false
                );
            else if ( cipher_index >= 20 && cipher_index <= 24 )
                msg = _discordCrypt.__tripledes192_encrypt(
                    handleEncodeSegment( message, primary_key, cipher_index - 20, mode, pad ),
                    secondary_key,
                    mode,
                    pad,
                    true,
                    false
                );
            else
                throw `Unknown cipher selected: ${cipher_index}`;

            /* Get MAC tag as a hex string. */
            let tag = sha3.kmac256(
                new Uint8Array( Buffer.concat( [ primary_key, secondary_key ] ) ),
                new Uint8Array( Buffer.from( msg, 'hex' ) ),
                256,
                customizationParameter
            );

            /* Prepend the authentication tag hex string & convert it to Base64. */
            msg = Buffer.from( tag + msg, 'hex' );

            /* Return the message. */
            return _discordCrypt.__substituteMessage( msg, true );
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
         *      If this is enabled and authentication fails, null is returned.
         *      This prepends a 64 bit seed used to derive encryption keys from the initial key.
         * @returns {string|null} Returns the encrypted and substituted ciphertext of the message or null on failure.
         * @throws An exception indicating the error that occurred.
         */
        static __symmetricDecrypt( message, primary_key, secondary_key, cipher_index, block_mode, padding_mode ) {
            const customizationParameter = new Uint8Array( Buffer.from( 'discordCrypt MAC' ) );
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
                    return _discordCrypt.__blowfish512_decrypt(
                        message,
                        key,
                        mode,
                        pad,
                        output_format,
                        is_message_hex
                    );
                case 1:
                    return _discordCrypt.__aes256_decrypt( message, key, mode, pad, output_format, is_message_hex );
                case 2:
                    return _discordCrypt.__camellia256_decrypt(
                        message,
                        key,
                        mode,
                        pad,
                        output_format,
                        is_message_hex
                    );
                case 3:
                    return _discordCrypt.__idea128_decrypt( message, key, mode, pad, output_format, is_message_hex );
                case 4:
                    return _discordCrypt.__tripledes192_decrypt( message,
                        key,
                        mode,
                        pad,
                        output_format,
                        is_message_hex
                    );
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
                /* Decode level-1 message to a buffer. */
                message = Buffer.from( _discordCrypt.__substituteMessage( message ), 'hex' );

                /* Pull off the first 32 bytes as a buffer. */
                let tag = Buffer.from( message.subarray( 0, 32 ) );

                /* Strip off the authentication tag. */
                message = Buffer.from( message.subarray( 32 ) );

                /* Compute the HMAC-SHA3-256 of the cipher text as hex. */
                let computed_tag = Buffer.from(
                    sha3.kmac256(
                        new Uint8Array( Buffer.concat( [ primary_key, secondary_key ] ) ),
                        new Uint8Array( message ),
                        256,
                        customizationParameter
                    ),
                    'hex'
                );

                /* Compare the tag for validity. */
                if ( !crypto.timingSafeEqual( computed_tag, tag ) )
                    return 1;

                /* Dual decrypt the segment. */
                if ( cipher_index >= 0 && cipher_index <= 4 )
                    return handleDecodeSegment(
                        _discordCrypt.__blowfish512_decrypt( message, secondary_key, mode, pad, 'base64' ),
                        primary_key,
                        cipher_index,
                        mode,
                        pad,
                        'utf8',
                        false
                    );
                else if ( cipher_index >= 5 && cipher_index <= 9 )
                    return handleDecodeSegment(
                        _discordCrypt.__aes256_decrypt( message, secondary_key, mode, pad, 'base64' ),
                        primary_key,
                        cipher_index - 5,
                        mode,
                        pad,
                        'utf8',
                        false
                    );
                else if ( cipher_index >= 10 && cipher_index <= 14 )
                    return handleDecodeSegment(
                        _discordCrypt.__camellia256_decrypt( message, secondary_key, mode, pad, 'base64' ),
                        primary_key,
                        cipher_index - 10,
                        mode,
                        pad,
                        'utf8',
                        false
                    );
                else if ( cipher_index >= 15 && cipher_index <= 19 )
                    return handleDecodeSegment(
                        _discordCrypt.__idea128_decrypt( message, secondary_key, mode, pad, 'base64' ),
                        primary_key,
                        cipher_index - 15,
                        mode,
                        pad,
                        'utf8',
                        false
                    );
                else if ( cipher_index >= 20 && cipher_index <= 24 )
                    return handleDecodeSegment(
                        _discordCrypt.__tripledes192_decrypt( message, secondary_key, mode, pad, 'base64' ),
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

        /**
         * @public
         * @see https://github.com/ricmoo/scrypt-js
         * @desc Performs the Scrypt hash function on the given input.
         * @param {string|Buffer|Array} input The input data to hash.
         * @param {string|Buffer|Array} salt The unique salt used for hashing.
         * @param {int} output_length The desired length of the output in bytes.
         * @param {int} N The work factor variable. Memory and CPU usage scale linearly with this.
         * @param {int} r Increases the size of each hash produced by a factor of 2rK-bits.
         * @param {int} p Parallel factor. Indicates the number of mixing functions to be run simultaneously.
         * @param {ScryptCallback} cb Callback function for progress updates.
         * @returns {boolean} Returns true if successful.
         */
        static __scrypt( input, salt, output_length, N = 16384, r = 8, p = 1, cb = null ) {
            let crypto = require( 'crypto' );
            let _in, _salt;

            /* PBKDF2-HMAC-SHA256 Helper. */
            function PBKDF2_SHA256( input, salt, size, iterations ) {
                return crypto.pbkdf2Sync( input, salt, iterations, size, 'sha256' );
            }

            /**
             * @private
             * @desc Mixes rows and blocks via Salsa20/8..
             * @param {Uint32Array} BY Input/output array.
             * @param {int} Yi Size of r * 32.
             * @param {int} r Block size parameter.
             * @param {Uint32Array} x Salsa20 scratchpad for row mixing.
             * @param {Uint32Array} _X Salsa20 scratchpad for block mixing.
             */
            function ScryptRowMix( BY, Yi, r, x, _X ) {
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
             * @param {ScryptCallback} cb Callback function for progress updates.
             * @private
             */
            function __perform( input, salt, N, r, p, cb ) {
                let totalOps, currentOps, lastPercentage;
                let b = PBKDF2_SHA256( input, salt, p * 128 * r, 1 );

                let B = new Uint32Array( p * 32 * r );

                let XY = new Uint32Array( 64 * r );
                let V = new Uint32Array( 32 * r * N );

                /* Salsa20 Scratchpad. */
                let x = new Uint32Array( 16 );
                /* Block-mix Salsa20 Scratchpad. */
                let _X = new Uint32Array( 16 );

                /* Initialize the input. */
                for ( let i = 0; i < B.length; i++ ) {
                    let j = i * 4;
                    B[ i ] =
                        ( ( b[ j + 3 ] & 0xff ) << 24 ) |
                        ( ( b[ j + 2 ] & 0xff ) << 16 ) |
                        ( ( b[ j + 1 ] & 0xff ) << 8 ) |
                        ( ( b[ j ] & 0xff ) << 0 );
                }

                let Yi = 32 * r;

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
                    if ( stop ) {
                        cb( new Error( 'cancelled' ), currentOps / totalOps );
                        return;
                    }

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
                            ScryptRowMix( XY, Yi, r, x, _X );
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
                            ScryptRowMix( XY, Yi, r, x, _X );
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
                        cb(
                            null,
                            1.0,
                            Buffer.from( PBKDF2_SHA256( input, Buffer.from( b ), output_length, 1 ) )
                        );
                        return;
                    default:
                        cb( new Error( 'invalid state' ), 0 );
                        return;
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
                    _discordCrypt.log( 'Invalid input parameter type specified!', 'error' );
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
                    _discordCrypt.log( 'Invalid salt parameter type specified!', 'error' );
                    return false;
                }
            }

            /* Validate derived key length. */
            if ( typeof output_length !== 'number' ) {
                _discordCrypt.log( 'Invalid output_length parameter specified. Must be a numeric value.', 'error' );
                return false;
            }
            else if ( output_length <= 0 || output_length >= 65536 ) {
                _discordCrypt.log( 'Invalid output_length parameter specified. Must be a numeric value.', 'error' );
                return false;
            }

            /* Validate N is a power of 2. */
            if ( !N || N & ( N - 1 ) !== 0 ) {
                _discordCrypt.log( 'Parameter N must be a power of 2.', 'error' );
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
            _discordCrypt.log( 'No callback specified.', 'error' );
            return false;
        }

        /**
         * @public
         * @desc Returns the first 64 bits of a Whirlpool digest of the message.
         * @param {Buffer|Array|string} message The input message to hash.
         * @param {boolean} to_hex Whether to convert the result to hex or Base64.
         * @returns {string} Returns the hex or Base64 encoded result.
         */
        static __whirlpool64( message, to_hex ) {
            return Buffer.from( _discordCrypt.__whirlpool( message, true ), 'hex' )
                .slice( 0, 8 ).toString( to_hex ? 'hex' : 'base64' );
        }

        /**
         * @public
         * @desc Returns the first 128 bits of an SHA-512 digest of a message.
         * @param {Buffer|Array|string} message The input message to hash.
         * @param {boolean} to_hex Whether to convert the result to hex or Base64.
         * @returns {string} Returns the hex or Base64 encoded result.
         */
        static __sha512_128( message, to_hex ) {
            return Buffer.from( _discordCrypt.__sha512( message, true ), 'hex' )
                .slice( 0, 16 ).toString( to_hex ? 'hex' : 'base64' );
        }

        /**
         * @public
         * @desc Returns the first 192 bits of a Whirlpool digest of the message.
         * @param {Buffer|Array|string} message The input message to hash.
         * @param {boolean} to_hex Whether to convert the result to hex or Base64.
         * @returns {string} Returns the hex or Base64 encoded result.
         */
        static __whirlpool192( message, to_hex ) {
            return Buffer.from( _discordCrypt.__sha512( message, true ), 'hex' )
                .slice( 0, 24 ).toString( to_hex ? 'hex' : 'base64' );
        }

        /**
         * @public
         * @desc Returns an SHA-160 digest of the message.
         * @param {Buffer|Array|string} message The input message to hash.
         * @param {boolean} to_hex Whether to convert the result to hex or Base64.
         * @returns {string} Returns the hex or Base64 encoded result.
         */
        static __sha160( message, to_hex ) {
            return _discordCrypt.__createHash( message, 'sha1', to_hex );
        }

        /**
         * @public
         * @desc Returns an SHA-256 digest of the message.
         * @param {Buffer|Array|string} message The input message to hash.
         * @param {boolean} to_hex Whether to convert the result to hex or Base64.
         * @returns {string} Returns the hex or Base64 encoded result.
         */
        static __sha256( message, to_hex ) {
            return _discordCrypt.__createHash( message, 'sha256', to_hex );
        }

        /**
         * @public
         * @desc Returns an SHA-512 digest of the message.
         * @param {Buffer|Array|string} message The input message to hash.
         * @param {boolean} to_hex Whether to convert the result to hex or Base64.
         * @returns {string} Returns the hex or Base64 encoded result.
         */
        static __sha512( message, to_hex ) {
            return _discordCrypt.__createHash( message, 'sha512', to_hex );
        }

        /**
         * @public
         * @desc Returns a Whirlpool-512 digest of the message.
         * @param {Buffer|Array|string} message The input message to hash.
         * @param {boolean} to_hex Whether to convert the result to hex or Base64.
         * @returns {string} Returns the hex or Base64 encoded result.
         */
        static __whirlpool( message, to_hex ) {
            return _discordCrypt.__createHash( message, 'whirlpool', to_hex );
        }

        /**
         * @public
         * @desc Returns a HMAC-SHA-256 digest of the message.
         * @param {Buffer|Array|string} message The input message to hash.
         * @param {Buffer|Array|string} secret The secret input used with the message.
         * @param {boolean} to_hex Whether to convert the result to hex or Base64.
         * @returns {string} Returns the hex or Base64 encoded result.
         */
        static __hmac_sha256( message, secret, to_hex ) {
            return _discordCrypt.__createHash( message, 'sha256', to_hex, true, secret );
        }

        /**
         * @public
         * @desc Returns an HMAC-SHA-512 digest of the message.
         * @param {Buffer|Array|string} message The input message to hash.
         * @param {Buffer|Array|string} secret The secret input used with the message.
         * @param {boolean} to_hex Whether to convert the result to hex or Base64.
         * @returns {string} Returns the hex or Base64 encoded result.
         */
        static __hmac_sha512( message, secret, to_hex ) {
            return _discordCrypt.__createHash( message, 'sha512', to_hex, true, secret );
        }

        /**
         * @public
         * @desc Returns an HMAC-Whirlpool-512 digest of the message.
         * @param {Buffer|Array|string} message The input message to hash.
         * @param {Buffer|Array|string} secret The secret input used with the message.
         * @param {boolean} to_hex Whether to convert the result to hex or Base64.
         * @returns {string} Returns the hex or Base64 encoded result.
         */
        static __hmac_whirlpool( message, secret, to_hex ) {
            return _discordCrypt.__createHash( message, 'whirlpool', to_hex, true, secret );
        }

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
         * @param {HashCallback} [callback] If defined, an async call is made that the result is passed to this when
         *      completed. If undefined, a sync call is made instead.
         * @returns {string|null} If a callback is defined, this returns nothing else it returns either a Base64 or hex
         *      encoded result.
         */
        static __pbkdf2_sha160(
            message,
            salt,
            to_hex,
            message_is_hex = undefined,
            salt_is_hex = undefined,
            key_length = 32,
            iterations = 5000,
            callback = undefined
        ) {
            return _discordCrypt.__pbkdf2(
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
         * @param {HashCallback} [callback] If defined, an async call is made that the result is passed to this when
         *      completed. If undefined, a sync call is made instead.
         * @returns {string|null} If a callback is defined, this returns nothing else it returns either a Base64 or hex
         *      encoded result.
         */
        static __pbkdf2_sha256(
            message,
            salt,
            to_hex,
            message_is_hex = undefined,
            salt_is_hex = undefined,
            key_length = 32,
            iterations = 5000,
            callback = undefined
        ) {
            return _discordCrypt.__pbkdf2(
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
         * @param {HashCallback} [callback] If defined, an async call is made that the result is passed to this when
         *      completed. If undefined, a sync call is made instead.
         * @returns {string|null} If a callback is defined, this returns nothing else it returns either a Base64 or hex
         *      encoded result.
         */
        static __pbkdf2_sha512(
            message,
            salt,
            to_hex,
            message_is_hex = undefined,
            salt_is_hex = undefined,
            key_length = 32,
            iterations = 5000,
            callback = undefined
        ) {
            return _discordCrypt.__pbkdf2(
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
         * @param {HashCallback} [callback] If defined, an async call is made that the result is passed to this when
         *      completed. If undefined, a sync call is made instead.
         * @returns {string|null} If a callback is defined, this returns nothing else it returns either a Base64 or hex
         *      encoded result.
         */
        static __pbkdf2_whirlpool(
            message,
            salt,
            to_hex,
            message_is_hex = undefined,
            salt_is_hex = undefined,
            key_length = 32,
            iterations = 5000,
            callback = undefined
        ) {
            return _discordCrypt.__pbkdf2(
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
        static __blowfish512_encrypt(
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
            return _discordCrypt.__encrypt(
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
        static __blowfish512_decrypt(
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
            return _discordCrypt.__decrypt(
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
        static __aes256_encrypt(
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
            return _discordCrypt.__encrypt(
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
        static __aes256_decrypt(
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
            return _discordCrypt.__decrypt(
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
        static __aes256_encrypt_gcm(
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
            _message = _discordCrypt.__padMessage( message, padding_mode, key_size_bits, is_message_hex );

            /* Get the key as a buffer. */
            _key = _discordCrypt.__validateKeyIV( key, key_size_bits );

            /* Check if using a predefined salt. */
            if ( one_time_salt !== undefined ) {
                /* Convert the salt to a Buffer. */
                _salt = _discordCrypt.__toBuffer( one_time_salt );

                /* Don't bother continuing if conversions have failed. */
                if ( !_salt || _salt.length === 0 )
                    return null;

                /* Only 64 bits is used for a salt. If it's not that length, hash it and use the result. */
                if ( _salt.length !== 8 )
                    _salt = Buffer.from( _discordCrypt.__whirlpool64( _salt, true ), 'hex' );
            }
            else {
                /* Generate a random salt to derive the key and IV. */
                _salt = crypto.randomBytes( 8 );
            }

            /* Derive the key length and IV length. */
            _derived = _discordCrypt.__pbkdf2_sha256( _key.toString( 'hex' ), _salt.toString( 'hex' ), true, true, true,
                ( block_cipher_size / 8 ) + ( key_size_bits / 8 ), kdf_iteration_rounds );

            /* Slice off the IV. */
            _iv = _derived.slice( 0, block_cipher_size / 8 );

            /* Slice off the key. */
            _key = _derived.slice( block_cipher_size / 8, ( block_cipher_size / 8 ) + ( key_size_bits / 8 ) );

            /* Create the cipher with derived IV and key. */
            _encrypt = crypto.createCipheriv( cipher_name, _key, _iv );

            /* Add the additional data if necessary. */
            if ( additional_data !== undefined )
                _encrypt.setAAD( _discordCrypt.__toBuffer( additional_data ) );

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
        static __aes256_decrypt_gcm(
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
            _message = _discordCrypt.__validateMessage( message, is_message_hex );

            /* Get the key as a buffer. */
            _key = _discordCrypt.__validateKeyIV( key, key_size_bits );

            /* Retrieve the auth tag. */
            _authTag = _message.slice( 0, block_cipher_size / 8 );

            /* Splice the message. */
            _message = _message.slice( block_cipher_size / 8 );

            /* Retrieve the 64-bit salt. */
            _salt = _message.slice( 0, 8 );

            /* Splice the message. */
            _message = _message.slice( 8 );

            /* Derive the key length and IV length. */
            _derived = _discordCrypt.__pbkdf2_sha256( _key.toString( 'hex' ), _salt.toString( 'hex' ), true, true, true,
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
                _decrypt.setAAD( _discordCrypt.__toBuffer( additional_data ) );

            /* Disable automatic PKCS #7 padding. We do this in-house. */
            _decrypt.setAutoPadding( false );

            /* Decrypt the cipher text. */
            let _pt = _decrypt.update( _message, undefined, 'hex' );
            _pt += _decrypt.final( 'hex' );

            /* Unpad the message. */
            _pt = _discordCrypt.__padMessage( _pt, padding_mode, key_size_bits, true, true );

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
        static __camellia256_encrypt(
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
            return _discordCrypt.__encrypt(
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
        static __camellia256_decrypt(
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
            return _discordCrypt.__decrypt(
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
        static __tripledes192_encrypt(
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
            return _discordCrypt.__encrypt(
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
        static __tripledes192_decrypt(
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
            return _discordCrypt.__decrypt(
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
        static __idea128_encrypt(
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
            return _discordCrypt.__encrypt(
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
        static __idea128_decrypt(
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
            return _discordCrypt.__decrypt(
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

        /* ========================================================= */
    }

    /* Freeze the prototype. */
    _freeze( _discordCrypt.prototype );

    /* Freeze the class definition. */
    _freeze( _discordCrypt );

    return _discordCrypt;
} )();

/* Also freeze the method. */
Object.freeze( discordCrypt );

/* Required for code coverage reports. */
module.exports = { discordCrypt };
