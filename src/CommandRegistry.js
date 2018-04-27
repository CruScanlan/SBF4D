const discord = require('discord.js');
let fs = require('fs');
let path = require('path');

const CommandGroup = require('./CommandGroup');

/**
 * Registers all commands and makes them available to the command dispatcher
 */
class CommandRegistry {
    /**
     * @constructor
     * @param {SBF4DClient} client
     * @param {Object} options
     */
    constructor(client, options) {
        /**
         * Error checking
         */
        if(!options) throw new Error(`No options were passed to the registry`);
        if(!options.commandsPath) throw new Error(`options.commandsPath was not defined`);
        if(typeof options.commandsPath !== 'string') throw new TypeError(`options.commandsPath must be a string`);

        /**
         * The client for the registry
         * @name CommandRegistry#client
         * @type {SBF4DClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', {value : client});

        /**
         * Registered commands
         * @type {Collection<String, Command>}
         */
        this.commands = new discord.Collection();

        /**
         * Registered groups
         * @type {Collection<String, Command>}
         */
        this.commandGroups = new discord.Collection();

        /**
         * Resolved path to the bot's command directory
         * @type {String}
         */
        this.commandsPath = options.commandsPath;

        /**
         * The command prefix
         * @type {String}
         */
        this._commandPrefix = client._commandPrefix;

        /**
         * Error checking
         */
        if(!options.commandGroups) throw new Error(`options.groups was not defined`);
        if(!Array.isArray(options.commandGroups)) throw new TypeError(`options.groups must be an array`);
        if(options.commandGroups.length < 1) throw new Error(`options.groups array is empty`);
        for(let i=0; i<options.commandGroups.length; i++) {
            if(typeof options.commandGroups[i] !== 'object') throw new TypeError(`group at element ${i+1} is not of type object`);
            if(!options.commandGroups[i].id) throw new Error(`groups.id does not exist at element ${i+1}`);
            if(!options.commandGroups[i].name) throw new Error(`groups.name does not exist at element ${i+1}`);
            if(!fs.existsSync(this._getGroupDirectoryPath(options.commandGroups[i].id))) throw new Error(`no command path exists for group ${i+1}`);
        }

        /**
         * Register the command groups and command path
         */
        this._register(options)
    }

    /**
     * Registers all the groups and command path
     * @param options
     * @returns {CommandRegistry}
     */
    _register(options) {
        this._registerCommandPath(options.commandsPath);
        this._registerCommandGroups(options.commandGroups);
        this._registerCommands();
        return this;
    }

    /**
     * Reloads a command in the registry and module memory
     * @param {Command} command
     */
    reloadCommand(command) {
        let oldCommand = Object.assign({}, command);
        this.unloadCommand(command);
        this._registerCommand(oldCommand.groupID, oldCommand.commandPath);
    }

    /**
     * Unloads a command from the registry and module memory
     * @param {Command} command
     */
    unloadCommand(command) {
        if(!command.commandPath) throw new Error(`command.commandPath is not defined`);
        let module = require.resolve(command.commandPath);
        delete require.cache[module];
        this._unregisterCommand(command);
    }

    /**
     * Removes a command from the registry
     * @param command
     * @private
     */
    _unregisterCommand(command) {
        if(!command.name) throw new Error(`command name is not defined`);
        if(!this.commands.find(cnd => cnd.name === command.name)) throw new Error(`Command is not loaded`);
        this.commands.delete(command.name);
    }

    /**
     * Register the commands folder file path
     * @param path
     * @returns {path}
     * @private
     */
    _registerCommandPath(path) {
        if(!fs.existsSync(path)) throw new Error(`${path} | file path does not exist!`);
        this.commandsPath = path;
        return path;
    }

    /**
     * Registers all commands in the command path
     * @returns {CommandRegistry}
     */
    _registerCommands() {
        let commandGroups = this.commandGroups.array();
        for(let i=0; i<commandGroups.length; i++) { //iterate through groups
            let groupDirectoryPath = this._getGroupDirectoryPath(commandGroups[i].id);
            let groupDirectoryFiles = fs.readdirSync(groupDirectoryPath);
            for(let j=0; j<groupDirectoryFiles.length; j++) { //iterate through files in a groups directory
                let fileSplit = groupDirectoryFiles[j].split('.');
                let fileExt = fileSplit[fileSplit.length-1];
                if(fileExt !== 'js') continue; //exclude any file without a .js extension
                this._registerCommand(commandGroups[i].id, `${groupDirectoryPath}\\${groupDirectoryFiles[j]}`); //register file as a command
            }
        }
        return this;
    }

    /**
     * Registers a single command
     * @param {String} groupID
     * @param {String} filePath
     * @private
     */
    _registerCommand(groupID, filePath) {
        let commandModule;
        try {
            commandModule = require(filePath);
        } catch(e) {
            throw new Error(`Error when loading command at ${filePath} | ${e.stack}\n\n |`);
        }
        let command = new commandModule(this.client);
        if(this.commands.find(cnd => cnd.name === command.name)) throw new Error(`Command ${command.name} is already registered`);
        let group = this.commandGroups.find(group => group.id === groupID);
        if(!group) throw new Error(`Group ${command.groupID} is not registered`);

        let allExistingAliases = this.commands.map(cmd => {return cmd.aliases});
        for(let i=0; i<allExistingAliases.length; i++) {
            for(let j=0; j<allExistingAliases[i].length; j++) {
                let isDuplicate = command.aliases.find(cmd => {
                    return cmd === allExistingAliases[i][j];
                });
                if(isDuplicate) throw new Error(`command alias ${allExistingAliases[i][j]} from ${command.name} already exists`);
            }
        }

        command.group = group;
        command.commandPath = filePath;
        this.commands.set(command.name, command);
        group.commands.set(command.name, command);
    }

    /**
     * Registers multiple command groups
     * @param groups
     * @private
     */
    _registerCommandGroups(groups) {
        for(let i=0; i<groups.length; i++) {
            this._registerCommandGroup(groups[i].id, groups[i].name); //iterate through groups and add them
        }
    }

    /**
     * Registers a single command group
     * @param id
     * @param name
     * @returns {CommandGroup}
     * @private
     */
    _registerCommandGroup(id, name) {
        let exists = this.commandGroups.get(id);
        if(exists) return this.commandGroups.get(id).rename(name); //if group already exists, rename it
        let group = new CommandGroup(this.client, id, name); //create new group
        this.commandGroups.set(id, group); //add the new group
        return group;
    }

    /**
     * Gets the directory for a command group
     * @param groupID
     * @returns {String}
     * @private
     */
    _getGroupDirectoryPath(groupID) {
        if(typeof groupID !== 'string') throw new TypeError(`groupID is not of type string`);
        if(!this.commandsPath) throw new Error(`commandsPath has not been defined`);
        return path.join(this.commandsPath, `./${groupID}`);
    }
}

module.exports = CommandRegistry;