/* jshint node: true, devel: true */
'use strict';


const callSendAPI = require('./sendMessage');
const proposalStore = require('./proposalStore');
const insurances = require('../data/insurances.json');

const proposeInsurance = (recipientId, activity) => {
    let proposals = [];
    switch(activity.category) {
        case "Action":
            proposals.push(insurances[0]);
            break;

        case "Concert":
            proposals.push(insurances[2]);
            break;

        default:
            proposals.push(insurances[3]); // Vacation insurance
    }

    const elements = proposals.map((insurance) => {
        return {
            title: `Cover yourself when you ${activity.title}`,
            subtitle: `${insurance.title} Insurance`,
            buttons: [ {
                    type: "postback",
                    title: `Insure for ${insurance.price}€`,
                    payload: `bought ${insurance.id},${activity.id}`,
                },
                {
                    type: "postback",
                    title: `More details`,
                    payload: `details ${insurance.id},${activity.id}`,
                },
                {
                    type: "postback",
                    title: `No thank you`,
                    payload: `done`,
                }
            ]
        }
    });

    const messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: elements
                }
            }
        }
    };

    callSendAPI(messageData);
};

const sendDetails = (recipientId, activity, insurance) => {
    console.log('details of insurance', insurance);

    const insuranceDetails = {
        recipient: {
            id: recipientId
        },
        "message":{
            "text": insurance.details
        }
    };

    callSendAPI(insuranceDetails);

    const messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [
                        {
                            title: `Cover yourself when you ${activity.title}`,
                            subtitle: `${insurance.title} Insurance`,
                            buttons: [ {
                                    type: "postback",
                                    title: `Insure for ${insurance.price}€`,
                                    payload: `bought ${insurance.id},${activity.id}`,
                                },
                                {
                                    type: "postback",
                                    title: `No thank you`,
                                    payload: `done`,
                                }
                            ]
                        }
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);
};

const subscribeMessages = (eventEmitter) => {
    eventEmitter.on(eventEmitter.events.postbackReceived, (event) => {
        // event
        const senderID = event.sender.id;
        const payload = event.postback.payload;

        if (payload.startsWith("activity")) {
            const id = payload.replace('activity ', '');
            const activity = proposalStore.get(id);
            proposeInsurance(senderID, activity);
        }

        if (payload.startsWith("details")) {
            const ids = payload.replace('details ', '').split(',');
            const insuranceID = ids[0];
            const activityID = ids[1];
            const activity = proposalStore.get(activityID);
            const insurance = insurances[insuranceID];
            sendDetails(senderID, activity, insurance);
        }
    });
};

module.exports = subscribeMessages;