import dotenv from 'dotenv'
dotenv.config()

import express, { Application, Request, Response, NextFunction } from 'express'
import { connect } from 'mongoose'
import User from './models/User'
import { userProps } from './interfaces'
import jwt from 'jsonwebtoken'

connect(process.env.DATABASE_URL as string)

const app: Application = express()

app.use(express.json())

interface post {
    username: string
    title: string
}

const posts: post[] = [
    {
        username: "olek",
        title: "post 1"
    },
    {
        username: "jake",
        title: "post 2"
    }
]

let refreshTokens: string[] = []

const authorize = (req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | void => {
    const header = req.headers["authorization"]
    if (header == null) return res.sendStatus(403)

    const token = header.split(" ")[1]

    jwt.verify(token, process.env.ACCESS_TOKEN as string, (err, user): Response<any, Record<string, any>> | void => {
        if (err) return res.sendStatus(403)
        req.body.user = user
        next()
    })
}

app.delete("/logout", (req: Request, res: Response): Response<any, Record<string, any>> | void => {
    if (req.body.token == null) return res.sendStatus(403)
    refreshTokens = refreshTokens.filter((token: string): boolean => token !== req.body.token)
    res.send("Logged out")
})

app.post("/token", (req: Request, res: Response): Response<any, Record<string, any>> | void => {
    if (req.body.token == null) return res.sendStatus(401)
    const token: string = req.body.token

    jwt.verify(token, process.env.REFRESH_TOKEN as string, (err, user): Response<any, Record<string, any>> | void => {
        if (err) return res.sendStatus(401)
        if (!refreshTokens.includes(token)) return res.sendStatus(401)
        if (user == null) return
        req.body.user = user
        const authToken = generateAccessToken(req.body.user.username)

        res.json({ authToken: authToken })
    })
})

app.get("/posts", authorize, (req: Request, res: Response): Response<any, Record<string, any>> | void => {
    res.send(posts.filter((post: post) => post.username === req.body.user.username))
})

app.post("/new", async (req: Request, res: Response): Promise<Response<any, Record<string, any>> | void> => {
    if (req.body == null) return res.sendStatus(401)
    if (!("username" in req.body && "password" in req.body)) return res.sendStatus(401)

    const checkUser = await User.find({ username: req.body.username, password: req.body.password })
    if (checkUser && checkUser[0] != null) return res.send("This user already exists")

    const newuser: userProps | any = new User({
        username: req.body.username,
        password: req.body.password
    })
    
    await newuser.save()
    res.json(newuser)
})

const generateAccessToken = (username: string): string => jwt.sign({ username: username }, process.env.ACCESS_TOKEN as string, { expiresIn: "30s" })
const generateRefreshToken = (username: string): string => jwt.sign({ username: username }, process.env.REFRESH_TOKEN as string)

app.post("/login", async (req: Request, res: Response): Promise<Response<any, Record<string, any>> | void> => {
    if (req.body == null) return res.sendStatus(401)
    if (!("username" in req.body && "password" in req.body)) return res.sendStatus(401)

    const user = await User.find({ username: req.body.username, password: req.body.password })
    if (user && user[0] == null) return res.sendStatus(404)
    
    const accessToken = generateAccessToken(user[0].username)
    const refreshToken = generateRefreshToken(user[0].username)

    refreshTokens.push(refreshToken)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

app.listen(4000)