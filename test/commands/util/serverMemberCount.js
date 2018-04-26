let {Command} = require('../../../src/index');

module.exports = class ServerMemberCountCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'servermembercount',
            group: 'util',
            aliases: [
                'servercount',
                'membercount'
            ],
            throttling: 3000
        })
    }

    run(msg, args) {
        let memberCount = msg.guild.memberCount;
        msg.reply(`There is ${memberCount} members in this server!`);
    }
};