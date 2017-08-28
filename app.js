require('dotenv-extended').load();

var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');
const path = require('path');
var util = require('util');

const model = process.env.LUIS_MODEL_URL;
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

const recognizer = new builder.LuisRecognizer(model);
const intents = new builder.IntentDialog({ recognizers: [recognizer] });

bot.dialog('/', intents);

intents.matches('addPerson', 'addPerson');
intents.matches('getBilling', 'getBilling');
intents.matches('getRequest', 'getRequest');
intents.matches('sendFeedback', 'sendFeedback');


bot.dialog('sendFeedback', [
  function (session, args, next) {
    var reply = new builder.Message(session)
           .text('Ok, what is your feedback?')
           .speak('Ok, what is your feedback?')
           .inputHint(builder.InputHint.expectingInput)
    builder.Prompts.text(session, reply);
    next();
  },
  function (session, results, next) {
    var hero = new builder.HeroCard(session)
          .title('Skype For Business Feedback Request')
          .subtitle('Click the button to see your request')
          .text('I just submitted your new feature request to the Skype for Business development team.')
          // .images([
          //     builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
          // ])
          .buttons([
              builder.CardAction.openUrl(session, 'https://www.skypefeedback.com/forums/299913-generally-available?query=add%20feature%20to%20drag%20and%20drop%20files%20into%20a%20chat%20window', 'Request')
          ]);
    var reply = new builder.Message(session)
          //  .text('I just submitted your new feature request to the Skype for Business development team.')
           .speak('I just submitted your new feature request to the Skype for Business development team.')
           .inputHint(builder.InputHint.expectingInput)
           .addAttachment(hero);

    session.send(reply);
  }
]);

bot.dialog('getBilling', [
  function (session, args, next) {
    var hero = new builder.HeroCard(session)
          .title('Chronos Codes')
          .subtitle('Click the button to find the executive summary for Pinnacle Financial')
          .text('Some text about the project here.')
          .images([
              builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
          ])
          .buttons([
              builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework', 'Summary')
          ]);

        if (args.entities[0].score >= .51) {
          var reply = new builder.Message(session)
                 .text('Your Kronos code is MSABC001 and your business development code is BDXYZ123.')
                 .speak('Your Kronos code is MSABC001 and your business development code is BDXYZ123.')
                 .inputHint(builder.InputHint.expectingInput)
                 .addAttachment(hero);
          session.dialogData.kronos = 'MSABC001';
          session.dialogData.development = 'BDXYZ123';
          session.send(reply);
       }
       else {
          session.endDialog("Something didnt work :D");
       }
       next();
  },
  function (session, results, next) {
    builder.Prompts.confirm(session, "Would you like this information sent to you in an email?");
    next();
  },
  function (session, results, next) {
    if(results.response) {
      session.send("Email sent with your code values.");
    }
  }
]);

bot.dialog('getRequest', function (session, args, next) {
  session.say('Derek, I’ve created a request for a new Chronos Code for Pinnacle Financial.',
              'Derek, I’ve created a request for a new Chronos Code for Pinnacle Financial',
               { inputHint: builder.InputHint.expectingInput });
  bot.dialog('/');
});

bot.dialog('addPerson', function (session, args, next) {
  session.say('I have assigned Albert Smith to the Pinnacle project with Chronos code: PIN00123.',
              'I have assigned Albert Smith to the Pinnacle project with Chronos code: PIN00123',
               { inputHint: builder.InputHint.expectingInput });
  bot.dialog('/');
});

bot.dialog('reset', function (session, args, next) {
    session.endDialog("You have been reset.");
}).triggerAction({
    matches: /^reset$/i,
});

// intents.matches('getBilling', (session, results) => {
//
//   var hero = new builder.HeroCard(session)
//         .title('BotFramework Hero Card')
//         .subtitle('Your bots — wherever your users are talking')
//         .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
//         .images([
//             builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
//         ])
//         .buttons([
//             builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework', 'Get Started')
//         ]);
//
//   fs.readFile('./banking.png', function (err, data) {
//       if (err) {
//           return session.send('Oops. Error reading file.');
//       }
//       if (results.entities[0].score >= .51) {
//         var contentType = 'image/png';
//         var base64 = Buffer.from(data).toString('base64');
//         var reply = new builder.Message(session)
//                .text('Your Kronos code is MSABC001 and your business development code is BDXYZ123.')
//                .speak('Your Kronos code is MSABC001 and your business development code is BDXYZ123.')
//                .inputHint(builder.InputHint.expectingInput)
//                .addAttachment(hero);
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
//
//    session.say('I have assigned Albert Smith to the Pinnacle project with Chronos code: PIN00123.',
//                'I have assigned Albert Smith to the Pinnacle project with Chronos code: PIN00123',
//                 { inputHint: builder.InputHint.expectingInput });
// })
// .onDefault((session) => {
//     session.send('no intents matched');
// });





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
