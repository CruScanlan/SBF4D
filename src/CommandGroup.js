const discord = require('discord.js');

class CommandGroup {
    constructor(client, id, name) {
        if(!client) throw new Error('client is not defined');
        if(!id) throw new Error('id is not defined');
        if(typeof id !== 'string') throw new TypeError('id is not of type string');
        if(!name) throw new Error('name is not defined');
        if(typeof name !== 'string') throw new TypeError('name is not of type string');

        /**
         * The client for the group
         * @name CommandGroup#client
         * @type {client}
         * @readonly
         */
        Object.defineProperty(this, 'client', {value : client});

        /**
         * The id of the command group
         * @type {string}
         */
        this.id = id;

        /**
         * The name of the command group
         * @type {string}
         */
        this.name = name;

        /**
         * A collection of commands in the group
         * @type {Collection<String, Command>}
         */
        this.commands = new discord.Collection();
    }

    /**
     * Reloads all the groups commands
     */
    reloadCommands() {
        for(let i=0; i<this.commands.length; i++) {
            this.commands[i].reload();
        }
    }

    /**
     * Renames the group
     * @param name
     * @returns {CommandGroup}
     */
    rename(name) {
        if(!name) throw new Error('name is not defined');
        if(typeof name !== 'string') throw new TypeError('name is not of type string');
        this.name = name;
        return this;
    }
}

module.exports = CommandGroup;