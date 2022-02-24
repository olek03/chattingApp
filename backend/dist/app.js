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
(0, mongoose_1.connect)(process.env.DATABASE_URL);
var app = (0, express_1["default"])();
app.use(express_1["default"].json());
var posts = [
    {
        username: "olek",
        title: "post 1"
    },
    {
        username: "jake",
        title: "post 2"
    }
];
var refreshTokens = [];
var authorize = function (req, res, next) {
    var header = req.headers["authorization"];
    if (header == null)
        return res.sendStatus(403);
    var token = header.split(" ")[1];
    jsonwebtoken_1["default"].verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err)
            return res.sendStatus(403);
        req.body.user = user;
        next();
    });
};
app["delete"]("/logout", function (req, res) {
    if (req.body.token == null)
        return res.sendStatus(403);
    refreshTokens = refreshTokens.filter(function (token) { return token !== req.body.token; });
    res.send("Logged out");
});
app.post("/token", function (req, res) {
    if (req.body.token == null)
        return res.sendStatus(401);
    var token = req.body.token;
    jsonwebtoken_1["default"].verify(token, process.env.REFRESH_TOKEN, function (err, user) {
        if (err)
            return res.sendStatus(401);
        if (!refreshTokens.includes(token))
            return res.sendStatus(401);
        if (user == null)
            return;
        req.body.user = user;
        var authToken = generateAccessToken(req.body.user.username);
        res.json({ authToken: authToken });
    });
});
app.get("/posts", authorize, function (req, res) {
    res.send(posts.filter(function (post) { return post.username === req.body.user.username; }));
});
app.post("/new", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var checkUser, newuser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (req.body == null)
                    return [2 /*return*/, res.sendStatus(401)];
                if (!("username" in req.body && "password" in req.body))
                    return [2 /*return*/, res.sendStatus(401)];
                return [4 /*yield*/, User_1["default"].find({ username: req.body.username, password: req.body.password })];
            case 1:
                checkUser = _a.sent();
                if (checkUser && checkUser[0] != null)
                    return [2 /*return*/, res.send("This user already exists")];
                newuser = new User_1["default"]({
                    username: req.body.username,
                    password: req.body.password
                });
                return [4 /*yield*/, newuser.save()];
            case 2:
                _a.sent();
                res.json(newuser);
                return [2 /*return*/];
        }
    });
}); });
var generateAccessToken = function (username) { return jsonwebtoken_1["default"].sign({ username: username }, process.env.ACCESS_TOKEN, { expiresIn: "30s" }); };
var generateRefreshToken = function (username) { return jsonwebtoken_1["default"].sign({ username: username }, process.env.REFRESH_TOKEN); };
app.post("/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, accessToken, refreshToken;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (req.body == null)
                    return [2 /*return*/, res.sendStatus(401)];
                if (!("username" in req.body && "password" in req.body))
                    return [2 /*return*/, res.sendStatus(401)];
                return [4 /*yield*/, User_1["default"].find({ username: req.body.username, password: req.body.password })];
            case 1:
                user = _a.sent();
                if (user && user[0] == null)
                    return [2 /*return*/, res.sendStatus(404)];
                accessToken = generateAccessToken(user[0].username);
                refreshToken = generateRefreshToken(user[0].username);
                refreshTokens.push(refreshToken);
                res.json({ accessToken: accessToken, refreshToken: refreshToken });
                return [2 /*return*/];
        }
    });
}); });
app.listen(4000);
