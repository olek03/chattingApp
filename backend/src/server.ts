import dotenv from 'dotenv'
dotenv.config()

import express, { Application, Request, Response, NextFunction } from 'express'
import { connect, Types } from 'mongoose'
import User from './models/User'
import { conversation, message, userProps } from './interfaces'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Conversation from './models/Conversation'
import Message from './models/Message'
import Notification from './models/Notification'

connect(process.env.DATABASE_URL as string)
const app: Application = express()
app.use(express.json())

let refreshTokens: string[] = []

const generateAccessToken = (user: userProps): string => jwt.sign({ _id: user._id, username: user.username, id: user.id, notifications: user.notifications, conversations: user.conversations, friends: user.friends }, process.env.ACCESS_TOKEN as string, { expiresIn: "10m" })
const generateRefreshToken = (user: userProps): string => jwt.sign({ _id: user._id, username: user.username, id: user.id, notifications: user.notifications, conversations: user.conversations, friends: user.friends }, process.env.REFRESH_TOKEN as string)

const authorize = (req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | void => {
    const header = req.headers["authorization"]
    if (header == null) return res.send("Failed")

    const token = header.split(" ")[1]

    jwt.verify(token, process.env.ACCESS_TOKEN as string, (err, user): Response<any, Record<string, any>> | void => {
        if (err) return res.send("Failed")
        req.body.user = user
        next()
    })
}

const getName = (name: string): string => {
    let username: string = ""
    for (let i = 0; i < name.length; i++) {
        if (name.charAt(i + 5) == "") return username
        username += name.charAt(i)
    }
    return ""
}

const getId = (name: string): number => {
    let username: string = ""
    for (let i = name.length; i > 0; i--) {
        if (name.charAt(i) === "#") return parseInt(username.split("").reverse().join(""))
        username += name.charAt(i)
    }
    return 0
}

const getData = (username: string): [string, number] => {
    const parsedName: string = getName(username)
    const id: number = getId(username)

    return [parsedName, id]
}

app.post("/new", async (req: Request, res: Response): Promise<Response<any, Record<string, any>> | void> => {
    if (req.body == null) return res.send("Failed")
    if (!("username" in req.body && "password" in req.body)) return res.send("Failed")

    const checkUser = await User.find({ username: req.body.username, password: req.body.password })
    if (checkUser && checkUser[0] != null) return res.send("This user already exists")
    if (req.body.username.length < 3 || req.body.username.length > 16) return res.send("Your name must be between 3 and 16")

    const newuser = new User({
        username: req.body.username,
        id: Math.floor(Math.random() * 8999) + 1000,
        password: await bcrypt.hash(req.body.password, 10)
    })
    
    await newuser.save()
    res.json(newuser)
})

app.post("/login", async (req: Request, res: Response): Promise<Response<any, Record<string, any>> | void> => {
    if (req.body == null) return res.send("body is null")
    if (req.body.username == null || req.body.password == null) return res.send("wrong data")

    const user = await User.find({ username: req.body.username })
    if (user && user[0] == null) return res.status(406).send("Some error occured")

    if (!await bcrypt.compare(req.body.password, user[0].password)) return res.status(406).send("No user found")  
    const accessToken = generateAccessToken(user[0])
    const refreshToken = generateRefreshToken(user[0])

    refreshTokens.push(refreshToken)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

app.post("/token", (req: Request, res: Response): Response<any, Record<string, any>> | void => {
    if (req.body.token == null) return res.send("Failed")
    const token: string = req.body.token

    jwt.verify(token, process.env.REFRESH_TOKEN as string, (err, user): Response<any, Record<string, any>> | void => {
        if (err) return res.send("Failed")
        if (!refreshTokens.includes(token)) return res.send("Failed")
        if (user == null) return
        req.body.user = user
        const authToken = generateAccessToken(req.body.user)

        res.json({ authToken: authToken })
    })
})

app.delete("/logout", (req: Request, res: Response): Response<any, Record<string, any>> | void => {
    if (req.body.token == null) return res.send("Failed")
    refreshTokens = refreshTokens.filter((token: string): boolean => token !== req.body.token)
    res.send("Logged out")
})

app.get("/data", authorize, (req: Request, res: Response): void => {
    res.json(req.body.user)
})

app.get("/chats", authorize, async (req: Request, res: Response): Promise<Response<any, Record<string, any>> | void> => {
    const user = await User.find({ username: req.body.user.username, id: req.body.user.id })
    res.json(user[0])
})

app.post("/newchat", authorize, async (req: Request, res: Response): Promise<void> => {
    if (req.body.user.username === getData(req.body.friend)[0]) {
        res.end()
        return
    }

    const chat = new Conversation({
        participants: [],
        messages: []
    })
    
    const query = await User.find({ username: req.body.user.username, id: req.body.user.id })
    const user: userProps = query[0]
    chat.participants.push(new Types.ObjectId(user._id))

    const addedUser = getData(req.body.friend)
    const query2 = await User.find({ username: addedUser[0], id: addedUser[1] })
    const friend: userProps = query2[0]
    chat.participants.push(new Types.ObjectId(friend._id))
    
    for (let i = 0; i < user.friends.length; i++) {
        if (user.friends[i].toString() == friend._id.toString()) {
            res.end()
            return
        }
    }

    await chat.save()

    user.friends.push(friend._id)
    user.conversations.push(chat._id)
    friend.conversations.push(chat._id)

    await User.updateOne({ _id: user._id }, { $set: { conversations: user.conversations } })
    await User.updateOne({ _id: user._id }, { $set: { friends: user.friends } })
    await User.updateOne({ _id: friend._id }, { $set: { conversations: friend.conversations } })

    res.send(chat._id)
})

app.post("/getchat", authorize, async (req: Request, res: Response): Promise<void> => {
    const query = await Conversation.find({ _id: req.body.id })
    const conversation: conversation = query[0]

    res.json(conversation)
})

app.post("/sendmessage", authorize, async (req: Request, res: Response): Promise<void> => {
    if (req.body.text == "") {
        res.end()
        return
    }
    const message = new Message(req.body.senderId, req.body.senderName, req.body.text)

    const conversation = await Conversation.find({ _id: req.body.conversationId })
    const chat: conversation = conversation[0]

    chat.messages.push(message)
    
    await Conversation.updateOne({ _id: req.body.conversationId }, { $set: { messages: chat.messages } })

    const participants: Types.ObjectId[] = chat.participants

    for (let i = 0; i < participants.length; i++) {
        if (participants[i] == req.body.user._id) continue
        const notification = new Notification(req.body.senderId, req.body.senderName, `${req.body.senderName} has sent you a message!`)

        const targetUser = await User.find({ _id: participants[i] })
        const user: userProps = targetUser[0]

        user.notifications.push(notification)

        await User.updateOne({ _id: participants[i] }, { $set: { notifications: user.notifications } })
    }

    res.sendStatus(201)
})

app.post("/getmessages", authorize, async (req: Request, res: Response): Promise<void> => {
    const conversation = await Conversation.find({ _id: req.body.conversationId })
    res.send(conversation[0].messages)
})

app.post("/getName", authorize, async (req: Request, res: Response): Promise<void> => {
    if (req.body.id == null) return
    const query = await User.find({ _id: req.body.id }, { username: 1 })

    res.send(query[0])
})

app.get("/info", authorize, async (req: Request, res: Response): Promise<void> => {
    const user = await User.find({ _id: req.body.user._id })
    res.send(user[0])
})

app.get("/userslist", async (req: Request, res: Response): Promise<void> => {
    const users = await User.find({ }, { username: 1, id: 1 })
    res.json(users)
})

app.get("/resetnotifications", authorize, async (req: Request, res: Response): Promise<void> => {
    await User.updateOne({ _id: req.body.user._id }, { $set: { notifications: [] } })
    const user = await User.find({ _id: req.body.user._id })
    res.send(user[0])
})

app.listen(process.env.PORT || 5000)