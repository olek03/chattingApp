"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1["default"].config();
var express_1 = __importDefault(require("express"));
var mongoose_1 = require("mongoose");
var User_1 = __importDefault(require("./models/User"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var Conversation_1 = __importDefault(require("./models/Conversation"));
var Message_1 = __importDefault(require("./models/Message"));
var Notification_1 = __importDefault(require("./models/Notification"));
(0, mongoose_1.connect)(process.env.DATABASE_URL);
var app = (0, express_1["default"])();
app.use(express_1["default"].json());
var refreshTokens = [];
var generateAccessToken = function (user) { return jsonwebtoken_1["default"].sign({ _id: user._id, username: user.username, id: user.id, notifications: user.notifications, conversations: user.conversations, friends: user.friends }, process.env.ACCESS_TOKEN, { expiresIn: "10m" }); };
var generateRefreshToken = function (user) { return jsonwebtoken_1["default"].sign({ _id: user._id, username: user.username, id: user.id, notifications: user.notifications, conversations: user.conversations, friends: user.friends }, process.env.REFRESH_TOKEN); };
var authorize = function (req, res, next) {
    var header = req.headers["authorization"];
    if (header == null)
        return res.send("Failed");
    var token = header.split(" ")[1];
    jsonwebtoken_1["default"].verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err)
            return res.send("Failed");
        req.body.user = user;
        next();
    });
};
var getName = function (name) {
    var username = "";
    for (var i = 0; i < name.length; i++) {
        if (name.charAt(i + 5) == "")
            return username;
        username += name.charAt(i);
    }
    return "";
};
var getId = function (name) {
    var username = "";
    for (var i = name.length; i > 0; i--) {
        if (name.charAt(i) === "#")
            return parseInt(username.split("").reverse().join(""));
        username += name.charAt(i);
    }
    return 0;
};
var getData = function (username) {
    var parsedName = getName(username);
    var id = getId(username);
    return [parsedName, id];
};
app.post("/new", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var checkUser, newuser, _a;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (req.body == null)
                    return [2 /*return*/, res.send("Failed")];
                if (!("username" in req.body && "password" in req.body))
                    return [2 /*return*/, res.send("Failed")];
                return [4 /*yield*/, User_1["default"].find({ username: req.body.username, password: req.body.password })];
            case 1:
                checkUser = _c.sent();
                if (checkUser && checkUser[0] != null)
                    return [2 /*return*/, res.send("This user already exists")];
                if (req.body.username.length < 3 || req.body.username.length > 16)
                    return [2 /*return*/, res.send("Your name must be between 3 and 16")];
                _a = User_1["default"].bind;
                _b = {
                    username: req.body.username,
                    id: Math.floor(Math.random() * 8999) + 1000
                };
                return [4 /*yield*/, bcrypt_1["default"].hash(req.body.password, 10)];
            case 2:
                newuser = new (_a.apply(User_1["default"], [void 0, (_b.password = _c.sent(),
                        _b)]))();
                return [4 /*yield*/, newuser.save()];
            case 3:
                _c.sent();
                res.json(newuser);
                return [2 /*return*/];
        }
    });
}); });
app.post("/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, accessToken, refreshToken;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (req.body == null)
                    return [2 /*return*/, res.send("body is null")];
                if (req.body.username == null || req.body.password == null)
                    return [2 /*return*/, res.send("wrong data")];
                return [4 /*yield*/, User_1["default"].find({ username: req.body.username })];
            case 1:
                user = _a.sent();
                if (user && user[0] == null)
                    return [2 /*return*/, res.status(406).send("Some error occured")];
                return [4 /*yield*/, bcrypt_1["default"].compare(req.body.password, user[0].password)];
            case 2:
                if (!(_a.sent()))
                    return [2 /*return*/, res.status(406).send("No user found")];
                accessToken = generateAccessToken(user[0]);
                refreshToken = generateRefreshToken(user[0]);
                refreshTokens.push(refreshToken);
                res.json({ accessToken: accessToken, refreshToken: refreshToken });
                return [2 /*return*/];
        }
    });
}); });
app.post("/token", function (req, res) {
    if (req.body.token == null)
        return res.send("Failed");
    var token = req.body.token;
    jsonwebtoken_1["default"].verify(token, process.env.REFRESH_TOKEN, function (err, user) {
        if (err)
            return res.send("Failed");
        if (!refreshTokens.includes(token))
            return res.send("Failed");
        if (user == null)
            return;
        req.body.user = user;
        var authToken = generateAccessToken(req.body.user);
        res.json({ authToken: authToken });
    });
});
app["delete"]("/logout", function (req, res) {
    if (req.body.token == null)
        return res.send("Failed");
    refreshTokens = refreshTokens.filter(function (token) { return token !== req.body.token; });
    res.send("Logged out");
});
app.get("/data", authorize, function (req, res) {
    res.json(req.body.user);
});
app.get("/chats", authorize, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User_1["default"].find({ username: req.body.user.username, id: req.body.user.id })];
            case 1:
                user = _a.sent();
                res.json(user[0]);
                return [2 /*return*/];
        }
    });
}); });
app.post("/newchat", authorize, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var chat, query, user, addedUser, query2, friend, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (req.body.user.username === getData(req.body.friend)[0]) {
                    res.end();
                    return [2 /*return*/];
                }
                chat = new Conversation_1["default"]({
                    participants: [],
                    messages: []
                });
                return [4 /*yield*/, User_1["default"].find({ username: req.body.user.username, id: req.body.user.id })];
            case 1:
                query = _a.sent();
                user = query[0];
                chat.participants.push(new mongoose_1.Types.ObjectId(user._id));
                addedUser = getData(req.body.friend);
                return [4 /*yield*/, User_1["default"].find({ username: addedUser[0], id: addedUser[1] })];
            case 2:
                query2 = _a.sent();
                friend = query2[0];
                chat.participants.push(new mongoose_1.Types.ObjectId(friend._id));
                for (i = 0; i < user.friends.length; i++) {
                    if (user.friends[i].toString() == friend._id.toString()) {
                        res.end();
                        return [2 /*return*/];
                    }
                }
                return [4 /*yield*/, chat.save()];
            case 3:
                _a.sent();
                user.friends.push(friend._id);
                user.conversations.push(chat._id);
                friend.conversations.push(chat._id);
                return [4 /*yield*/, User_1["default"].updateOne({ _id: user._id }, { $set: { conversations: user.conversations } })];
            case 4:
                _a.sent();
                return [4 /*yield*/, User_1["default"].updateOne({ _id: user._id }, { $set: { friends: user.friends } })];
            case 5:
                _a.sent();
                return [4 /*yield*/, User_1["default"].updateOne({ _id: friend._id }, { $set: { conversations: friend.conversations } })];
            case 6:
                _a.sent();
                res.send(chat._id);
                return [2 /*return*/];
        }
    });
}); });
app.post("/getchat", authorize, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, conversation;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Conversation_1["default"].find({ _id: req.body.id })];
            case 1:
                query = _a.sent();
                conversation = query[0];
                res.json(conversation);
                return [2 /*return*/];
        }
    });
}); });
app.post("/sendmessage", authorize, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var message, conversation, chat, participants, i, notification, targetUser, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (req.body.text == "") {
                    res.end();
                    return [2 /*return*/];
                }
                message = new Message_1["default"](req.body.senderId, req.body.senderName, req.body.text);
                return [4 /*yield*/, Conversation_1["default"].find({ _id: req.body.conversationId })];
            case 1:
                conversation = _a.sent();
                chat = conversation[0];
                chat.messages.push(message);
                return [4 /*yield*/, Conversation_1["default"].updateOne({ _id: req.body.conversationId }, { $set: { messages: chat.messages } })];
            case 2:
                _a.sent();
                participants = chat.participants;
                i = 0;
                _a.label = 3;
            case 3:
                if (!(i < participants.length)) return [3 /*break*/, 7];
                if (participants[i] == req.body.user._id)
                    return [3 /*break*/, 6];
                notification = new Notification_1["default"](req.body.senderId, req.body.senderName, "".concat(req.body.senderName, " has sent you a message!"));
                return [4 /*yield*/, User_1["default"].find({ _id: participants[i] })];
            case 4:
                targetUser = _a.sent();
                user = targetUser[0];
                user.notifications.push(notification);
                return [4 /*yield*/, User_1["default"].updateOne({ _id: participants[i] }, { $set: { notifications: user.notifications } })];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6:
                i++;
                return [3 /*break*/, 3];
            case 7:
                res.sendStatus(201);
                return [2 /*return*/];
        }
    });
}); });
app.post("/getmessages", authorize, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var conversation;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Conversation_1["default"].find({ _id: req.body.conversationId })];
            case 1:
                conversation = _a.sent();
                res.send(conversation[0].messages);
                return [2 /*return*/];
        }
    });
}); });
app.post("/getName", authorize, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (req.body.id == null)
                    return [2 /*return*/];
                return [4 /*yield*/, User_1["default"].find({ _id: req.body.id }, { username: 1 })];
            case 1:
                query = _a.sent();
                res.send(query[0]);
                return [2 /*return*/];
        }
    });
}); });
app.get("/info", authorize, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User_1["default"].find({ _id: req.body.user._id })];
            case 1:
                user = _a.sent();
                res.send(user[0]);
                return [2 /*return*/];
        }
    });
}); });
app.get("/userslist", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var users;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User_1["default"].find({}, { username: 1, id: 1 })];
            case 1:
                users = _a.sent();
                res.json(users);
                return [2 /*return*/];
        }
    });
}); });
app.get("/resetnotifications", authorize, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User_1["default"].updateOne({ _id: req.body.user._id }, { $set: { notifications: [] } })];
            case 1:
                _a.sent();
                return [4 /*yield*/, User_1["default"].find({ _id: req.body.user._id })];
            case 2:
                user = _a.sent();
                res.send(user[0]);
                return [2 /*return*/];
        }
    });
}); });
app.listen(process.env.PORT || 5000);
