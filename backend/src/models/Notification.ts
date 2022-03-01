import { notification } from "../interfaces"
import { Types } from 'mongoose'

export default class Notification implements notification {
    public fromId: Types.ObjectId
    public fromName: string
    public message: string

    constructor(fromId: Types.ObjectId, fromName: string, message: string) {
        this.fromId = fromId
        this.fromName = fromName
        this.message = message
    }
}