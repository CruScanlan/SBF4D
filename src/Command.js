/**
 * The base command class
 */
class Command {
    /**
     * @param {SBF4DClient} client
     * @param {Object} options
     */
    constructor(client, options) {
        /**
         * Validate that the options passed in are correct
         */
        this.validateCommandOptions(options);

        /**
         * The client for the command
         * @name Command#client
         * @type {client}
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * The name for the command
         */
        this.name =  options.name;

        /**
         * The aliases for the command
         * @type {Array<String>}
         */
        this.aliases = options.aliases || [];

        /**
         * The id for the group
         * @type {String}
         */
        this.groupID = options.group;

        /**
         * The group the command belongs to
         * @type {CommandGroup}
         */
        this.group = null;

        /**
         * The file path for the command, added on command register
         * @type {String}
         */
        this.commandPath = null;

        /**
         * The time to throttle the command for in miliseconds
         * @type {Number}
         */
        this.throttling = options.throttling || -1;

        /**
         * All the throttle objects for the Command
         * @type {Map<String, Object>}
         */
        this.throttles = new Map();
    }

    /**
     * Method is called when a command is executed
     * @param {Object} msg
     * @param {Array<String>} args
     */
    run(msg, args) {
        throw new Error(`Command does not have a run method`);
    }

    /**
     * Reloads the command
     */
    reload() {
        this.client.registry.reloadCommand(this);
    }

    /**
     * Unloads the command
     */
    unload() {
        this.client.registry.unloadCommand(this);
    }

    /**
     * Returns an existing throttle object for a userID or creates a new one and returns it
     * @param {String} userID
     * @returns {Object}
     */
    throttle(userID) {
        let throttle = this.throttles.get(userID);
        if(throttle) return throttle;
        if(this.throttling < 1) return null;
        throttle = {
            start: Date.now(),
            timeout: setTimeout(()=> {
                this.throttles.delete(userID);
            }, this.throttling)
        };
        this.throttles.set(userID, throttle);
    }

    /**
     * Validates options passed in from a sub class command
     * @param {Object} options
     */
    validateCommandOptions(options) {
        if(!options) throw new Error(`options were not defined`);
        if(typeof options !== 'object') throw new TypeError(`options is not of type object`);
        if(!options.name) throw new Error(`options.name was not defined`);
        if(typeof options.name !== 'string') throw new TypeError(`options.name is not of type string`);
        if(!options.group) throw new Error(`options.group was not defined`);
        if(typeof options.group !== 'string') throw new TypeError(`options.group is not of type string`);
        if(options.aliases) {
            if(!Array.isArray(options.aliases)) throw new TypeError(`options.aliases is not of type array`);
            for(let i=0; i<options.aliases.length; i++) {
                if(typeof options.aliases[i] !== 'string') throw new TypeError(`options.aliases, element ${i+1} is not of type string`);
            }
        }
        if(options.throttling) {
            if(typeof options.throttling !== 'number') throw new TypeError(`options.throttling is not of type number`);
        }
    }
}

module.exports = Command;