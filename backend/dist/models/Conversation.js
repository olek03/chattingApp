"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var Conversation = new mongoose_1.Schema({
    participants: [],
    messages: [{
            senderId: mongoose_1.Types.ObjectId,
            senderName: String,
            text: String
        }]
});
exports["default"] = (0, mongoose_1.model)("conversations", Conversation);
