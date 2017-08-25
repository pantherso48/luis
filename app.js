require('dotenv-extended').load();

var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');
const path = require('path');
var util = require('util');

const model = process.env.LUIS_MODEL_URL;
const publicPath = path.join(__dirname, '../luis/public');
var herocard = 'HeroCard(Cortana Only)';
var conversation = 'Conversation';
var luis = 'Luis';
var options = [herocard, conversation, luis];

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

var bot = new builder.UniversalBot(connector, [
    function (session) {
        builder.Prompts.choice(session, 'Please enter a demo option in the text box.', options, {
            maxRetries: 3,
            retryPrompt: 'Ooops, what you wrote is not a valid option, please try again'
        });
    },
    function (session, results) {
      // create the card based on selection

      var selectedOptionName = results.response.entity;
      // call the function for the option selected
      callOption(selectedOptionName, session);
    }
]);

function callOption (selectedOptionName, session) {
  var recognizer = new builder.LuisRecognizer(model);
  // bot.recognizer(recognizer);
  var intents = new builder.IntentDialog({ recognizers: [recognizer] });

  switch (selectedOptionName) {
     case herocard:
       return createHeroCard(session);
     case conversation:
       return session.beginDialog('conversation');
        //  return createConversation(session, intents);
     case luis:
      session.send('How may I help you?');
      // bot.dialog('/', intents);
      // intents.matches('getBilling', 'luis'){
      //   bot.dialog('luis', require('./intents'))
      //     .triggerAction({
      //       matches:/^help$/i
      //     });
      // }
  }
}

bot.dialog('conversation', require('./conversation'))
  .triggerAction({
    matches:/^help$/i
  });

function createHeroCard(session) {

  // intents.matches('getBilling', (session, results) => {

    var hero = new builder.HeroCard(session)
          .title('BotFramework Hero Card')
          .subtitle('Your bots — wherever your users are talking')
          .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
          .images([
              builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
          ])
          .buttons([
              builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework', 'Get Started')
          ]);

        // if (results.entities[0].score >= .51) {
          var reply = new builder.Message(session)
                 .text('Your Kronos code is MSABC001 and your business development code is BDXYZ123.')
                 .speak('Your Kronos code is MSABC001 and your business development code is BDXYZ123.')
                 .inputHint(builder.InputHint.expectingInput)
                 .addAttachment(hero);
          session.send(reply);
      // }
      console.log("Codes : "+results.entities[0].entity);
  // })
  // .onDefault((session) => {
  //     session.send('no intents matched');
  // });
}

function createConversation (session, intents) {

  console.log(intents);
  session.say('Please ask me a question.',
              'Please ask me a question.',
              { inputHint: builder.InputHint.expectingInput });

  // bot.dialog('/', intents);
  // intents.matches('getRequest', (session, results) => {
  //
  //
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
}
