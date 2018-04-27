/**
 * Dispatches messages out to the appropriate command
 */
class CommandDispatcher {
    /**
     * @param {SBF4DClient} client
     */
    constructor(client) {

        /**
         * The client for the CommandDispatcher
         * @name CommandDispatcher#client
         * @type {client}
         * @readonly
         */
        Object.defineProperty(this, 'client', {value : client});

        /**
         * The commandRegistry for the CommandDispatcher
         * @name CommandDispatcher#client
         * @type {CommandRegistry}
         * @readonly
         */
        Object.defineProperty(this, 'commandRegistry', {value : client.registry});

        /**
         * On each message event, handle message
         */
        this.client.on('message', msg => {
            this.handleMessage(msg);
        })
    }

    /**
     * Handles new messages
     * @param {String} msg
     */
    handleMessage(msg) {
        if(!this.shouldHandleMessage(msg)) return;
        let msgParsed = this.parseMessage(msg);
        let command = this.getCommand(msgParsed.command);
        let msgAuthorID = msg.author.id;
        if(!command) return;
        let throttle = command.throttles.get(msgAuthorID);
        if(throttle) return msg.reply(`You cannot use this command for another ${((throttle.start+command.throttling-Date.now())/1000).toFixed(1)} seconds.`);
        command.run(msg, msgParsed.args);
        command.throttle(msgAuthorID);
    }

    /**
     * Should a message be handled?
     * @param {String} msg
     * @returns {boolean}
     */
    shouldHandleMessage(msg) {
        if(msg.author.bot) return false;
        if(!msg.content.startsWith(this.commandRegistry._commandPrefix)) return false;
        return true;
    }

    /**
     * Parses msg to command and args
     * @param {String} msg
     * @returns {Object<String, String>}
     */
    parseMessage(msg) {
        let command = msg.content.split(" ")[0];
        command = command.slice(this.commandRegistry._commandPrefix.length).toLowerCase();
        let args = msg.content.split(" ").slice(1);
        return {command, args};
    }

    /**
     * Gets a command object from text
     * @param {String} command
     * @returns {Command || null}
     */
    getCommand(command) {
        let commands = this.commandRegistry.commands.array();
        for(let i=0; i<commands.length; i++) {
            if(command === commands[i].name.toLowerCase()) return commands[i];
            let aliases = commands[i].aliases;
            for(let j=0; j<aliases.length; j++) {
                if(command === aliases[j].toLowerCase()) return commands[i];
            }
        }
        return;
    }
}

module.exports = CommandDispatcher;