require('dotenv-extended').load();

var restify = require('restify');
var builder = require('botbuilder');
var calling = require('botbuilder-calling');
var fs = require('fs');
var path = require('path');
var util = require('util');
var prompts = require('./prompts');

const publicPath = path.join(__dirname, '../luis/public');
const model = process.env.LUIS_MODEL_URL;

// Setup Restify Server
var server = restify.createServer();
server.get('/', restify.plugins.serveStatic({
            directory: publicPath,
            default: '/index.html',
}));
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


// Create calling bot
var callConnector = new calling.CallConnector({
    callbackUrl: process.env.CALLBACK_URL,
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var callBot = new calling.UniversalCallBot(callConnector);
server.post('/api/calls', callConnector.listen());



// var bot = new builder.UniversalBot(connector, [
//     function (session) {
//         session.beginDialog('findUserCodes', session.userData.return);
//     },
//     function (session, results) {
//         session.userData.return = results.response;
//         // session.send('Your Kronos code is MSABC001 and your business development code is BDXYZ123', session.userData.return);
//     }
// ]);

const recognizer = new builder.LuisRecognizer(model);
const intents = new builder.IntentDialog({ recognizers: [recognizer] });

//=========================================================
// Chat Dialogs
//=========================================================

bot.dialog('/', function (session) {
    session.send(prompts.chatGreeting);
});

//=========================================================
// Calling Dialogs
//=========================================================

callBot.dialog('/', [
    function (session) {
        // Send a greeting and start the menu.
        if (!session.userData.welcomed) {
            session.userData.welcomed = true;
            session.send(prompts.welcome);
            session.beginDialog('/demoMenu', { full: true });
        } else {
            session.send(prompts.welcomeBack);
            session.beginDialog('/demoMenu', { full: false });
        }
    },
    function (session, results) {
        // Always say goodbye
        session.send(prompts.goodbye);
    }
]);

bot.dialog('/demoMenu', [
    function (session, args) {
        // Build up a stack of prompts to play
        var list = [];
        list.push(calling.Prompt.text(session, prompts.demoMenu.prompt));
        if (!args || args.full) {
            list.push(calling.Prompt.text(session, prompts.demoMenu.choices));
            list.push(calling.Prompt.text(session, prompts.demoMenu.help));
        }

        // Prompt user to select a menu option
        calling.Prompts.choice(session, new calling.PlayPromptAction(session).prompts(list), [
            { name: 'dtmf', speechVariation: ['dtmf'] },
            { name: 'digits', speechVariation: ['digits'] },
            { name: 'record', speechVariation: ['record', 'recordings'] },
            { name: 'chat', speechVariation: ['chat', 'chat message'] },
            { name: 'choices', speechVariation: ['choices', 'options', 'list'] },
            { name: 'help', speechVariation: ['help', 'repeat'] },
            { name: 'quit', speechVariation: ['quit', 'end call', 'hangup', 'goodbye'] }
        ]);
    },
    function (session, results) {
        if (results.response) {
            switch (results.response.entity) {
                case 'choices':
                    session.send(prompts.demoMenu.choices);
                    session.replaceDialog('/demoMenu', { full: false });
                    break;
                case 'help':
                    session.replaceDialog('/demoMenu', { full: true });
                    break;
                case 'quit':
                    session.endDialog();
                    break;
                default:
                    // Start demo
                    session.beginDialog('/' + results.response.entity);
                    break;
            }
        } else {
            // Exit the menu
            session.endDialog(prompts.canceled);
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/demoMenu', { full: false });
    }
]);

// bot.dialog('/', intents);
//
// intents.matches('getBilling', (session, results) => {
//
// //note 1: SFB does not handle images
//   //  session.say('Your Kronos code is MSABC001 and your business development code is BDXYZ123.',
//   //              'Your code is MSABC001 and your business development code is BDXYZ123.',
//   //               { inputHint: builder.InputHint.expectingInput });
//   fs.readFile('./thought_leaders_in_ai.png', function (err, data) {
//       if (err) {
//           return session.send('Oops. Error reading file.');
//       }
//       if (results.entities[0].score >= .51) {
//         var contentType = 'image/png';
//         var base64 = Buffer.from(data).toString('base64');
//         var reply = new builder.Message(session)
//                .text('Your Kronos code is MSABC001 and your business development code is BDXYZ123.')
//                .speak('Your Kronos code is MSABC001 and your business development code is BDXYZ123.', { inputHint: builder.InputHint.expectingInput })
//                .addAttachment({ contentUrl: util.format('data:%s;base64,%s', contentType, base64),
//                                 contentType: contentType,
//                                 name: 'AI.png'
//                               });
//
//         session.send(reply);
//     }
//     console.log("Codes : "+results.entities[0].entity);
//   })
// })
// .onDefault((session) => {
//     session.send('no intents matched');
// });
//
// intents.matches('getRequest', (session, results) => {
//   // session.userData.serverpath = 'http://26bb457d.ngrok.io';
//
//    session.say('Derek, I’ve create a request for a new Chronos Code for Pinnacle Financial.',
//                'Derek, I’ve create a request for a new Chronos Code for Pinnacle Financial',
//                 { inputHint: builder.InputHint.expectingInput });
// })
// .onDefault((session) => {
//     session.send('no intents matched');
// });
//
// intents.matches('addPerson', (session, results) => {
//   // session.userData.serverpath = 'http://26bb457d.ngrok.io';
//
//    session.say('I have assigned Albert Smith to the Pinnacle project with Chronos code: PIN00123.',
//                'I have assigned Albert Smith to the Pinnacle project with Chronos code: PIN00123',
//                 { inputHint: builder.InputHint.expectingInput });
// })
// .onDefault((session) => {
//     session.send('no intents matched');
// });
