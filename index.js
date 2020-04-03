"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ask_sdk_core_1 = require("ask-sdk-core");
var persistenceAdapter = require("ask-sdk-s3-persistence-adapter");
var LaunchRequestHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === "LaunchRequest";
    },
    handle: function (handlerInput) {
        var speechText = "Welcome to cakewalk. When is your birthday?";
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
var HasBirthdayLaunchRequestHandler = {
    canHandle: function (handlerInput) {
        var attributesManager = handlerInput.attributesManager;
        var sessionAttributes = attributesManager.getSessionAttributes() || {};
        var year = sessionAttributes.hasOwnProperty("year")
            ? sessionAttributes.year
            : 0;
        var month = sessionAttributes.hasOwnProperty("month")
            ? sessionAttributes.month
            : 0;
        var day = sessionAttributes.hasOwnProperty("day")
            ? sessionAttributes.day
            : 0;
        return (handlerInput.requestEnvelope.request.type === "LaunchRequest" &&
            year &&
            month &&
            day);
    },
    handle: function (handlerInput) {
        var attributesManager = handlerInput.attributesManager;
        var sessionAttributes = attributesManager.getSessionAttributes() || {};
        var year = sessionAttributes.hasOwnProperty("year")
            ? sessionAttributes.year
            : 0;
        var month = sessionAttributes.hasOwnProperty("month")
            ? sessionAttributes.month
            : 0;
        var day = sessionAttributes.hasOwnProperty("day")
            ? sessionAttributes.day
            : 0;
        var speakOutput = "Welcome back. It looks like there are X more days until your y-th birthday.";
        return handlerInput.responseBuilder.speak(speakOutput).getResponse();
    }
};
var GetBirthdayHandler = {
    canHandle: function (handlerInput) {
        return (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "GetBirthdayIntent");
    },
    handle: function (handlerInput) {
        return __awaiter(this, void 0, void 0, function () {
            var day, month, year, attributesManager, birthdayAttributes, speakOutput;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        day = ask_sdk_core_1.getSlotValue(handlerInput.requestEnvelope, "day");
                        month = ask_sdk_core_1.getSlotValue(handlerInput.requestEnvelope, "month");
                        year = ask_sdk_core_1.getSlotValue(handlerInput.requestEnvelope, "year");
                        attributesManager = handlerInput.attributesManager;
                        birthdayAttributes = {
                            year: year,
                            month: month,
                            day: day
                        };
                        attributesManager.setPersistentAttributes(birthdayAttributes);
                        return [4 /*yield*/, attributesManager.savePersistentAttributes()];
                    case 1:
                        _a.sent();
                        speakOutput = "Thanks, I'll remember that you were born on " + month + " " + day + " of " + year + ".";
                        return [2 /*return*/, (handlerInput.responseBuilder
                                .speak(speakOutput)
                                .getResponse())];
                }
            });
        });
    }
};
var HelpIntentHandler = {
    canHandle: function (handlerInput) {
        return (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent");
    },
    handle: function (handlerInput) {
        var speechText = "You can say hello to me!";
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
var CancelAndStopIntentHandler = {
    canHandle: function (handlerInput) {
        return (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            (handlerInput.requestEnvelope.request.intent.name ===
                "AMAZON.CancelIntent" ||
                handlerInput.requestEnvelope.request.intent.name ===
                    "AMAZON.StopIntent"));
    },
    handle: function (handlerInput) {
        var speechText = "Goodbye!";
        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(true)
            .getResponse();
    }
};
var SessionEndedRequestHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
    },
    handle: function (handlerInput) {
        console.log("Session ended with reason: " + handlerInput.requestEnvelope.request.reason);
        return handlerInput.responseBuilder.getResponse();
    }
};
var ErrorHandler = {
    canHandle: function (handlerInput, error) {
        return true;
    },
    handle: function (handlerInput, error) {
        console.log("Error handled: " + error.message);
        return handlerInput.responseBuilder
            .speak("Sorry, I can't understand the command. Please say again.")
            .reprompt("Sorry, I can't understand the command. Please say again.")
            .getResponse();
    }
};
var LoadBirthdayInterceptor = {
    process: function (handlerInput) {
        return __awaiter(this, void 0, void 0, function () {
            var attributesManager, sessionAttributes, year, month, day;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attributesManager = handlerInput.attributesManager;
                        return [4 /*yield*/, attributesManager.getPersistentAttributes()];
                    case 1:
                        sessionAttributes = (_a.sent()) || {};
                        year = sessionAttributes.hasOwnProperty("year")
                            ? sessionAttributes.year
                            : 0;
                        month = sessionAttributes.hasOwnProperty("month")
                            ? sessionAttributes.month
                            : 0;
                        day = sessionAttributes.hasOwnProperty("day")
                            ? sessionAttributes.day
                            : 0;
                        if (year && month && day) {
                            attributesManager.setSessionAttributes(sessionAttributes);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
};
exports.handler = ask_sdk_core_1.SkillBuilders.custom()
    .withPersistenceAdapter(new persistenceAdapter.S3PersistenceAdapter({
    bucketName: process.env.S3_PERSISTENCE_BUCKET
}))
    .addRequestHandlers(LaunchRequestHandler, GetBirthdayHandler, HelpIntentHandler, CancelAndStopIntentHandler, SessionEndedRequestHandler)
    .addRequestInterceptors(LoadBirthdayInterceptor)
    .addErrorHandlers(ErrorHandler)
    .lambda();
