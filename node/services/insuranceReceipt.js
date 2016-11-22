/* jshint node: true, devel: true */
'use strict';

const uuid = require('node-uuid');
const callSendAPI = require('./sendMessage');
const insurances = require('../data/insurances.json');
const proposalStore = require('./proposalStore');

const sendReceipt = (recipientId, activity, insurance) => {
    const insuranceTax = insurance.price * 0.19;
    const messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                "payload":{
                    "template_type":"receipt",
                    "recipient_name":"Lukas Welte",
                    "order_number":uuid.v4(),
                    "currency":"EUR",
                    "payment_method":"Visa 2345",
                    "elements":[
                        {
                            "title": insurance.title,
                            "price": insurance.price,
                            "currency":"EUR",
                            "image_url": activity.image_url
                        }
                    ],
                    "summary":{
                        "subtotal": (insurance.price - insuranceTax).toFixed(2),
                        "total_tax": insuranceTax.toFixed(2),
                        "total_cost": insurance.price.toFixed(2)
                    }
                }
            }
        }
    };

    callSendAPI(messageData);

    sendCongratulations(recipientId, activity);
};

const sendCongratulations = (recipientId, activity) => {
    const messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: `All done, have fun at ${activity.title}`,
                        buttons: [ {
                                type: "postback",
                                title: "Nice, I want more!",
                                payload: `city ${activity.city}`
                            },
                            {
                                type: "postback",
                                title: "I'm done",
                                payload: "done"
                            }
                        ],
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
};

const sendBye = (recipientId) => {
    const messageData = {
        recipient: {
            id: recipientId
        },
        "message":{
            "text": "Alright, till next time."
        }
    };

    callSendAPI(messageData);
};

const subscribeMessages = (eventEmitter) => {
    eventEmitter.on(eventEmitter.events.postbackReceived, (event) => {
        // event
        const senderID = event.sender.id;
        const payload = event.postback.payload;

        if (payload.startsWith('bought')) {
            const ids = payload.replace('bought ', '').split(',');
            const insuranceID = ids[0];
            const activityID = ids[1];
            const activity = proposalStore.get(activityID);
            const insurance = insurances[insuranceID];
            sendReceipt(senderID, activity, insurance);
        }

        if (payload.startsWith('done')) {
            sendBye(senderID);
        }
    });
};

module.exports = subscribeMessages;