import { Schema, model } from 'mongoose'
import { userProps } from '../interfaces'

const User = new Schema<userProps>({
    username: String,
    id: Number,
    password: String,
    notifications: [],
    conversations: [],
    friends: []
})

export default model("users", User)