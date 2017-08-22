require('dotenv-extended').load();

var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');
const path = require('path');
var util = require('util');

const publicPath = path.join(__dirname, '../luis/public');

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

// Listen for messages from users
server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector);

// var bot = new builder.UniversalBot(connector, [
//     function (session) {
//         session.beginDialog('findUserCodes', session.userData.return);
//     },
//     function (session, results) {
//         session.userData.return = results.response;
//         // session.send('Your Kronos code is MSABC001 and your business development code is BDXYZ123', session.userData.return);
//     }
// ]);

const model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/cea9975e-843b-416e-b23f-4fa5c7fb823f?subscription-key=81ca0da9998c4ab6a023ea7348fdea61&timezoneOffset=0&verbose=true';
const recognizer = new builder.LuisRecognizer(model);
const intents = new builder.IntentDialog({ recognizers: [recognizer] });

bot.dialog('/', intents);

intents.matches('getBilling', (session, results) => {
  // session.userData.serverpath = 'http://26bb457d.ngrok.io';

   session.say('Your Kronos code is MSABC001 and your business development code is BDXYZ123.',
               'Your code is MSABC001 and your business development code is BDXYZ123.',
                { inputHint: builder.InputHint.expectingInput });
  // fs.readFile('./thought_leaders_in_ai.png', function (err, data) {
  //     if (err) {
  //         return session.send('Oops. Error reading file.');
  //     }
  //     if (results.entities[0].score >= .51) {
  //       var contentType = 'image/png';
  //       var base64 = Buffer.from(data).toString('base64');
  //       var reply = new builder.Message(session)
  //              .text('Your Kronos code is MSABC001 and your business development code is BDXYZ123.')
  //              .addAttachment({ contentUrl: util.format('data:%s;base64,%s', contentType, base64),
  //                               contentType: contentType,
  //                               name: 'AI.png'
  //                             });
  //       session.send(reply);
  //   }
  //   console.log("Codes : "+results.entities[0].entity);
  // })
})
.onDefault((session) => {
    session.send('no intents matched');
});



// bot.dialog('findUserCodes', [
//     function (session, args, next) {
//         session.dialogData.profile = args || {}; // Set the profile or create the object.
//         if (!session.dialogData.profile.name) {
//             builder.Prompts.text(session, "What's your name?");
//         } else {
//             next(); // Skip if we already have this info.
//         }
//     },
//     function (session, results, next) {
//         if (results.response) {
//             // Save user's name if we asked for it.
//             session.dialogData.profile.name = results.response;
//         }
//         if (!session.dialogData.profile.company) {
//             builder.Prompts.text(session, "What company do you work for?");
//         } else {
//             next(); // Skip if we already have this info.
//         }
//     },
//     function (session, results) {
//         if (results.response) {
//             // Save company name if we asked for it.
//             session.dialogData.profile.company = results.response;
//         }
//         session.endDialogWithResult({ response: session.dialogData.profile });
//     }
// ]);

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
// var bot = new builder.UniversalBot(connector);

// bot.dialog('/', [
//     // Step 1
//     function (session) {
//         builder.Prompts.text(session, 'Hi! What is your name?');
//     },
//     // Step 2
//     function (session, results) {
//         session.endDialog('Hello %s!', results.response);
//     }
// ]);
