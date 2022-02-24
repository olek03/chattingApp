import { Schema, model } from 'mongoose'
import { userProps } from '../interfaces'

const User = new Schema<userProps>({
    username: String,
    password: String,
})

export default model("users", User)