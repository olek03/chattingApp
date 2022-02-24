"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var User = new mongoose_1.Schema({
    username: String,
    password: String
});
exports["default"] = (0, mongoose_1.model)("users", User);
