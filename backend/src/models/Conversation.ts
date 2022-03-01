import { Schema, Types, model } from 'mongoose'
import { conversation } from '../interfaces'

const Conversation = new Schema<conversation>({
    participants: [],
    messages: [{
        senderId: Types.ObjectId,
        senderName: String,
        text: String,
    }]
})

export default model("conversations", Conversation)