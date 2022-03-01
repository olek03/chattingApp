import { message } from "../interfaces";
import { Types } from 'mongoose'

export default class Message implements message {
    public senderId: Types.ObjectId
    public senderName: string
    public text: string
    public sentAt: number

    constructor(senderId: Types.ObjectId, senderName: string, text: string) {
        this.senderId = senderId
        this.senderName = senderName
        this.text = text
        this.sentAt = Date.now()
    }
}