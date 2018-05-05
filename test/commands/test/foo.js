const {Command} = require('../../../src/index');

module.exports = class FooCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'Foo',
            group: 'test',
            aliases: [
                'f'
            ],
            throttling: 2000
        })
    }

    run(msg, args) {
        msg.reply('bar');
    }
};