import { Types } from 'mongoose'

export interface Tokens {
    LS_ACCESS_TOKEN: string
    LS_REFRESH_TOKEN: string
}

export interface conversation {
    _id: Types.ObjectId
    participants: Types.ObjectId[]
    messages: message[]
}

export interface message {
    senderId: Types.ObjectId
    senderName: string
    text: string
    sentAt: number
}