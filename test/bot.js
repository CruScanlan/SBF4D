const sbf4d = require('../src/index');
const path = require('path');
const config = require('./config.json');

let bot = new sbf4d.Client({
    commandPrefix: '!',
    owner: '138424630850486272',
    commandGroups: [
        {id: 'test', name:'Test Commands'},
        {id: 'util', name:'Utility Commands'}
    ],
    commandsPath: path.join(__dirname, './commands')
});

bot.on('ready', ()=> {
    console.log('Bot Running!');
});

bot.login(config.token);