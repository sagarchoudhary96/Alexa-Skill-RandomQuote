'use strict';
var Alexa = require('alexa-sdk');
var request = require('request');
//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: var APP_ID = "amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1";
var APP_ID = "amzn1.ask.skill.c61a5a06-feb1-41a9-9678-a86191f8e2f0";

var SKILL_NAME = "Random Quote";
var GET_QUOTE_MESSAGE = "Here's your quote: ";
var HELP_MESSAGE = "You can say tell me a quote, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Goodbye!";

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetQuoteIntent');
    },
    'GetQuoteIntent': function () {
      var speechOutput;
      var self = this;
      getQuote(function(quote) {
        if(quote != "ERROR") {
            speechOutput = GET_QUOTE_MESSAGE + quote;
        }
        else {
          speechOutput = "Sorry, Cannot find quote at the moment!";
        }
        self.emit(':tellWithCard', speechOutput, SKILL_NAME, quote);
      })

      function getQuote(callback) {
        var url ="https://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1";
        request.get(url, function(error, response, body) {
          var data = JSON.parse(body);
          var result = "ERROR";
          var escapeChars = { lt: '<', gt: '>', quot: '"', apos: "'", amp: '&' };

          //to format string
          function unescapeHTML(str) {//modified from underscore.string and string.js
              return str.replace(/\&([^;]+);/g, function(entity, entityCode) {
                  var match;

                  if ( entityCode in escapeChars) {
                      return escapeChars[entityCode];
                  } else if ( match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
                      return String.fromCharCode(parseInt(match[1], 16));
                  } else if ( match = entityCode.match(/^#(\d+)$/)) {
                      return String.fromCharCode(~~match[1]);
                  } else {
                      return entity;
                  }
              });
          }

          if (data[0].hasOwnProperty('content')) {
              result = data[0].content;
              if (data[0].title != ""){
                  result += " by " + data[0].title;
              }
              result = result.replace(/<p>/g, '');
              result = result.replace(/<\/p>/g, '');
              result = result.replace(/\n/g, '');
              result = unescapeHTML(result);
          }
          callback(result);
        })
      }
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'Unhandled': function () {
        this.emit(':ask', HELP_MESSAGE, HELP_MESSAGE);
    }
};
