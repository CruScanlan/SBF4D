const discord = require('discord.js');
const CommandRegistry = require('./CommandRegistry');
const CommandDispatcher = require('./CommandDispatcher');

/**
 * The bot client
 */
class SBF4DClient extends discord.Client {
    /**
     * @param {Object} options
     */
    constructor(options) {
        /**
         * Error checking
         */
        if(!options) throw new Error(`No options were passed to the client`);
        if(!options.commandPrefix) throw new Error(`options.commandPrefix was not defined`);
        if(typeof options.commandPrefix !== 'string') throw new TypeError(`options.command prefix is not of type string`);
        if(!options.owner) throw new Error(`options.owner was not defined`);
        if(typeof options.owner !== 'string') throw new TypeError(`options.owner was not if type string`);

        super(options);

        /**
         * The command prefix
         */
        this._commandPrefix = options.commandPrefix;

        /**
         * The command registry
         * @type {CommandRegistry}
         */
        this.registry = new CommandRegistry(this, options);

        /**
         * The command dispatcher
         * @type {CommandDispatcher}
         */
        this.dispatcher = new CommandDispatcher(this);

        /**
         * The bot owner's ID
         * @type {String}
         */
        this.owner = options.owner;
    }

    get commandPrefix() {
        return this._commandPrefix;
    }
}

module.exports = SBF4DClient;