/* jshint node: true, devel: true */
'use strict';

const uuid = require('node-uuid');
const fetch = require('node-fetch');
const callSendAPI = require('./sendMessage');
const proposalStore = require('./proposalStore');
const categories = require('../data/categories.json');

const proposeEvents = (recipientId, city) => {
    const textMessage = {
        recipient: {
            id: recipientId
        },
        "message":{
            "text": `Let me see what you could do in ${city}`
        }
    };

    callSendAPI(textMessage);

    /*fetch(`https://www.eventbriteapi.com/v3/events/search?token=${token}&location.address=${city}&categories=108,109,116`)
        .then(res => res.json())
        .then(result => {
        const proposals = result.events.map((event) => {
            const category = categories.find((c) => c)
            return {
                id: event.id,
                category:
            }
        });*/

        // now the proposals
        const proposals = [
            {
                id: uuid.v4(),
                title: "Do a Bungee Jump",
                subtitle: "Experience the free fall",
                image_url: "http://xtremecanadian.com/wp-content/uploads/2015/07/Bungee_Jumping_Whistler.jpg",
                price: 35,
                category: "Action",
                city: city
            },
            {
                id: uuid.v4(),
                title: "Go to the Colplay concert",
                subtitle: "See them live and experience",
                image_url: "http://images.sk-static.com/images/media/profile_images/artists/197928/huge_avatar",
                price: 60,
                category: "Concert",
                city: city
            },
            {
                id: uuid.v4(),
                title: "Drive a Lamborghini",
                subtitle: "Feel the power of the bull",
                image_url: "https://www.lamborghini.com/de-en/sites/de-en/files/DAM/lamborghini/share%20img/huracan-coupe-facebook-og.jpg",
                price: 200,
                category: "Action",
                city: city
            }
        ];

        proposals.forEach((event) => {
            proposalStore.add(event.id, event);
        });

        const elements = proposals.map((event) => {
            const eventData = {
                title: event.title,
                subtitle: `${event.subtitle} for ${event.price}€`,
                image_url: event.image_url
            };
            return Object.assign({}, eventData,  {
                buttons: [{
                    type: "postback",
                    title: "Let's do this!",
                    payload: `activity ${event.id}`,
                }]
            });
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
    //});
};

const sendCityProposal = (recipientId) => {
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
                        title: "Munich",
                        image_url: "https://res.cloudinary.com/muenchen/.imaging/stk/responsive/teaser300/dms/th/panorama-marienplatz-620/document/panorama-marienplatz-620.jpg",
                        buttons: [ {
                            type: "postback",
                            title: "Let's go to Munich",
                            payload: "city munich",
                        }],
                    }, {
                        title: "Paris",
                        image_url: "http://www.socialeconomy.eu.org/sites/default/files/Paris.jpg",
                        buttons: [{
                            type: "postback",
                            title: "Paris sounds great",
                            payload: "city paris",
                        }]
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
};

const getCityFromText = (messageText) => {
    if (messageText.indexOf('Munich') === -1) {
        return null;
    }

    return 'Munich';
};

const subscribeMessages = (eventEmitter) => {
    eventEmitter.on(eventEmitter.events.messageReceived, (event) => {
       // event
        const senderID = event.sender.id;
        const message = event.message;

        const city = getCityFromText(message.text);
        if (!city) {
            sendCityProposal(senderID);
        } else {
            proposeEvents(senderID, city);
        }
    });

    eventEmitter.on(eventEmitter.events.postbackReceived, (event) => {
        // event
        const senderID = event.sender.id;
        const payload = event.postback.payload;

        if (payload.startsWith('city')) {
            const city = payload.replace('city ','');
            proposeEvents(senderID, city);
        }
    });
};

module.exports = subscribeMessages;