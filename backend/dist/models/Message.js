"use strict";
exports.__esModule = true;
var Message = /** @class */ (function () {
    function Message(senderId, senderName, text) {
        this.senderId = senderId;
        this.senderName = senderName;
        this.text = text;
        this.sentAt = Date.now();
    }
    return Message;
}());
exports["default"] = Message;
