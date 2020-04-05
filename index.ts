import {
  ErrorHandler,
  HandlerInput,
  RequestHandler,
  SkillBuilders,
  DefaultApiClient,
  getSlotValue,
  getDeviceId,
} from "ask-sdk-core";
import { Response, SessionEndedRequest } from "ask-sdk-model";
import { PrivateKeyInput } from "crypto";

const persistenceAdapter = require("ask-sdk-s3-persistence-adapter");

const LaunchRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput: HandlerInput): Response {
    const speechText = "Welcome to cakewalk. When is your birthday?";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const HasBirthdayLaunchRequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes() || {};

    const year = sessionAttributes.hasOwnProperty("year")
      ? sessionAttributes.year
      : 0;
    const month = sessionAttributes.hasOwnProperty("month")
      ? sessionAttributes.month
      : 0;
    const day = sessionAttributes.hasOwnProperty("day")
      ? sessionAttributes.day
      : 0;

    return (
      handlerInput.requestEnvelope.request.type === "LaunchRequest" &&
      year &&
      month &&
      day
    );
  },
  async handle(handlerInput: HandlerInput): Promise<Response> {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes() || {};

    const serviceClientFactory = handlerInput.serviceClientFactory;
    const deviceId = getDeviceId(handlerInput.requestEnvelope);
    let userTimeZone;

    try {
      const upsServiceClient = serviceClientFactory.getUpsServiceClient();
      userTimeZone = await upsServiceClient.getSystemTimeZone(deviceId);
    } catch (error) {
      if (error.name !== "ServiceError") {
        return handlerInput.responseBuilder
          .speak("There was a problem connecting to the service.")
          .getResponse();
      }
      console.log("error", error.message);
    }

    const year = sessionAttributes.hasOwnProperty("year")
      ? sessionAttributes.year
      : 0;
    const month = sessionAttributes.hasOwnProperty("month")
      ? sessionAttributes.month
      : 0;
    const day = sessionAttributes.hasOwnProperty("day")
      ? sessionAttributes.day
      : 0;

    const currentDateTime = new Date(
      new Date().toLocaleString("en-US", { timeZone: userTimeZone })
    );
    const currentDate = new Date(
      currentDateTime.getFullYear(),
      currentDateTime.getMonth(),
      currentDateTime.getDate()
    );
    const currentYear = currentDate.getFullYear();
    // getting the next birthday
    let nextBirthday = Date.parse(`${month} ${day}, ${currentYear}`);

    // adjust the nextBirthday by one year if the current date is after their birthday
    if (currentDate.getTime() > nextBirthday) {
      nextBirthday = Date.parse(`${month} ${day}, ${currentYear + 1}`);
    }

    const oneDay = 24 * 60 * 60 * 1000;

    // setting the default speakOutput to Happy xth Birthday!
    // Don't worry about when to use st, th, rd--Alexa will automatically correct the ordinal for you.
    let speakOutput = `Happy ${currentYear - year}th birthday!`;
    if (currentDate.getTime() !== nextBirthday) {
      const diffDays = Math.round(
        Math.abs((currentDate.getTime() - nextBirthday) / oneDay)
      );
      speakOutput = `Welcome back. It looks like there are ${diffDays} days until your ${
        currentYear - year
      }th birthday.`;
    }

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

const GetBirthdayHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetBirthdayIntent"
    );
  },
  async handle(handlerInput: HandlerInput): Promise<Response> {
    const day = getSlotValue(handlerInput.requestEnvelope, "day");
    const month = getSlotValue(handlerInput.requestEnvelope, "month");
    const year = getSlotValue(handlerInput.requestEnvelope, "year");

    const attributesManager = handlerInput.attributesManager;

    const birthdayAttributes = {
      year: year,
      month: month,
      day: day,
    };

    attributesManager.setPersistentAttributes(birthdayAttributes);
    await attributesManager.savePersistentAttributes();

    const speakOutput = `Thanks, I'll remember that you were born on ${month} ${day} of ${year}.`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const HelpIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput: HandlerInput): Response {
    const speechText = "You can say hello to me!";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput: HandlerInput): Response {
    const speechText = "Goodbye!";

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const SessionEndedRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput: HandlerInput): Response {
    console.log(
      `Session ended with reason: ${
        (handlerInput.requestEnvelope.request as SessionEndedRequest).reason
      }`
    );

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler: ErrorHandler = {
  canHandle(handlerInput: HandlerInput, error: Error): boolean {
    return true;
  },
  handle(handlerInput: HandlerInput, error: Error): Response {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
      .getResponse();
  },
};

const LoadBirthdayInterceptor = {
  async process(handlerInput: HandlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes =
      (await attributesManager.getPersistentAttributes()) || {};

    const year = sessionAttributes.hasOwnProperty("year")
      ? sessionAttributes.year
      : 0;
    const month = sessionAttributes.hasOwnProperty("month")
      ? sessionAttributes.month
      : 0;
    const day = sessionAttributes.hasOwnProperty("day")
      ? sessionAttributes.day
      : 0;

    if (year && month && day) {
      attributesManager.setSessionAttributes(sessionAttributes);
    }
  },
};

export const handler = SkillBuilders.custom()
  .withApiClient(new DefaultApiClient())
  .withPersistenceAdapter(
    new persistenceAdapter.S3PersistenceAdapter({
      bucketName: process.env.S3_PERSISTENCE_BUCKET,
    })
  )
  .addRequestHandlers(
    HasBirthdayLaunchRequestHandler,
    LaunchRequestHandler,
    GetBirthdayHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(LoadBirthdayInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();
