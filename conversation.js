var builder = require('botbuilder');
const model = process.env.LUIS_MODEL_URL;

var recognizer = new builder.LuisRecognizer(model);



module.exports = [
    function (session, args, next) {
        session.send('Welcome to the Microsoft Agent!');
        builder.Prompts.text(session, 'Hi! Try asking me things like \'What are my Chronos codes?\', \'Add Bill to the account name.\' or \'Request a billing code.\'');
    },
    function (session, results, next) {
      console.log(results.response);
      //intents.matches('getBilling', (session, results) => {
      if(results.response.includes('codes')){
        console.log('in');
        var reply = new builder.Message(session)
               .text('Your Kronos code is MSABC001 and your business development code is BDXYZ123.')
               .speak('Your Kronos code is MSABC001 and your business development code is BDXYZ123.')
               .inputHint(builder.InputHint.expectingInput)
              //  .addAttachment(hero);
        session.send(reply);
      }
        // next();
    }
    // bot.dialog('Help', function (session) {
    //   session.endDialog('Hi! Try asking me things like \'What are my Chronos codes?\', \'Add Bill to the account name\' or \'Request a billing code\'');
    // }).triggerAction({
    //   matches: 'Help'
    // });
];
