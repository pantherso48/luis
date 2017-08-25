var builder = require('botbuilder');
const model = process.env.LUIS_MODEL_URL;

var recognizer = new builder.LuisRecognizer(model);

function (session, args, next) {
    session.send('Welcome to the Microsoft Agent!');
}
