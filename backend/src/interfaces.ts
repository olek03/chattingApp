import { Types } from 'mongoose'

export interface userProps {
    _id: Types.ObjectId
    username: string
    id: number
    password: string
    notifications: notification[]
    conversations: Types.ObjectId[]
    __v: number
    friends: Types.ObjectId[]
}

export interface notification {
    fromId: Types.ObjectId
    fromName: string
    message: string
}


export interface conversation {
    participants: Types.ObjectId[]
    messages: message[]
}

export interface message {
    senderId: Types.ObjectId
    senderName: string
    text: string
    sentAt: number
}