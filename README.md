# SBF4D
Simple Bot Framework For Discord

# Installation
```bash
$ npm install sbf4d --save
```

# Usage

This module extends the [discord.js module](https://github.com/discordjs/discord.js) so all discord.js methods found [here](https://discord.js.org/#/docs/main/stable/general/welcome) can be used.

### Start Bot

**./bot.js**
```javascript
const sbf4d = require('sbf4d');
const path = require('path');

let bot = new sbf4d.Client({
    commandPrefix: '!',
    owner: 'Y O U R   D I S C O R D   I D',
    commandGroups: [
        {id: 'test', name:'Test Commands'}
    ],
    commandsPath: path.join(__dirname, './commands')
});

bot.on('ready', ()=> {
    console.log('Bot Running!');
});

bot.login('Y O U R   T O K E N');
```

### Example Command

All commands are placed inside the root commands folder and then under the name of their group.

**./commands/test/foo.js**
```javascript
let {Command} = require('sbf4d');

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
```
