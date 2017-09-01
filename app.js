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
var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send("Hi... I'm the Microsoft Assistant, how may I help you?");
});


var luisAppUrl = process.env.LUIS_MODEL_URL;
bot.recognizer(new builder.LuisRecognizer(luisAppUrl));

bot.dialog('getBilling', [
  function (session, args, next) {
    console.log(args);
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

        if (args.intent.entities[0].score >= .51) {
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
      builder.Prompts.text(session, "What email address?");
      next();
    }
    else {
      session.send("Okay, I won't send an email.");
      session.endDialog();
    }
  },
  function (session, results, next) {
    session.dialogData.email = results.response;
    session.send(`Email sent to ${session.dialogData.email} with project code information.`);
    session.endDialog();
  }
]).triggerAction({
    matches: 'getBilling'
});

bot.dialog('sendFeedback', [
  function (session, args, next) {
    var reply = new builder.Message(session)
           .text('Ok, what is your feedback?')
           .speak('Ok, what is your feedback?')
           .inputHint(builder.InputHint.expectingInput)
    builder.Prompts.text(session, reply);
    session.endDialog();
}
  // function (session, results, next) {
  //    session.endDialog();
  //    session.beginDialog('getFeature');
  // }
]).triggerAction({
    matches: 'sendFeedback'
});

bot.dialog('showFeature', function (session, args, next) {
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
  session.endDialog();
}).triggerAction({
    matches: 'showFeature'
});


bot.dialog('getRequest', function (session, args, next) {
  session.say('Derek, I’ve created a request for a new Chronos Code for Pinnacle Financial.',
              'Derek, I’ve created a request for a new Chronos Code for Pinnacle Financial',
               { inputHint: builder.InputHint.expectingInput });
  session.endDialog();
}).triggerAction({
    matches: 'getRequest'
});

bot.dialog('addPerson', function (session, args, next) {
  session.say('I have assigned Albert Smith to the Pinnacle project with Chronos code: PIN00123.',
              'I have assigned Albert Smith to the Pinnacle project with Chronos code: PIN00123',
               { inputHint: builder.InputHint.expectingInput });
  session.endDialog();
}).triggerAction({
    matches: 'addPerson'
});

bot.dialog('reset', function (session, args, next) {
    session.endDialog("You have been reset.");
}).triggerAction({
    matches: /^reset$/i,
});
