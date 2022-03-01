import axios, { AxiosResponse } from 'axios'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { conversation, Tokens } from '../interfaces'
import Chat from './Chat'

const Dashboard: React.FC<Tokens> = ({ LS_ACCESS_TOKEN, LS_REFRESH_TOKEN }): ReactElement => {

    const [chats, setChats] = useState<conversation[]>([])
    const name = useRef<HTMLParagraphElement>(null)
    const notifications = useRef<HTMLParagraphElement>(null)

    useEffect((): void => {
        const accessToken: string = localStorage.getItem(LS_ACCESS_TOKEN as string) as string
        const refreshToken: string = localStorage.getItem(LS_REFRESH_TOKEN as string) as string
        if (accessToken == null || refreshToken == null) {
            window.location.pathname = "/login"
            return
        }
        sync()
        getName()
    }, [])

    const sync: VoidFunction = async (): Promise<void> => {
        const token: string = localStorage.getItem(LS_ACCESS_TOKEN as string) as string

        const resp: AxiosResponse = await axios.get("/chats", {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        if (resp.data === "Failed") return getNewToken()

        const conversations: conversation[] = []
        const conversationsId: string[] = resp.data.conversations

        for (let i = 0; i < conversationsId.length; i++) {
            const activeChat: AxiosResponse = await axios.post("/getchat", { id: conversationsId[i] }, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            })
            conversations.push(activeChat.data)
        }
        setChats(conversations)
    }

    const getNewToken: VoidFunction = async (): Promise<void> => {
        const refresh: AxiosResponse = await axios.post("/token", {
            token: localStorage.getItem(LS_REFRESH_TOKEN as string)
        })

        const newAccessToken: string = refresh.data.authToken
        localStorage.setItem(LS_ACCESS_TOKEN as string, newAccessToken)
        getName()
        sync()
    }

    const getName = async (): Promise<void> => {
        const token: string = localStorage.getItem(LS_ACCESS_TOKEN as string) as string

        const resp: AxiosResponse = await axios.get("/info", {
            headers: {
                authorization: `Bearer ${token}`
            }
        })

        if (resp.data === "Failed") return getName()
        if (resp.data.username == null || resp.data.id == null) return getName()
        if (name == null) return
        if (name.current == null) return

        name.current.innerText = resp.data.username + "#" + resp.data.id

        if (notifications == null) return
        if (notifications.current == null) return

        if (resp.data.notifications.length > 0) notifications.current.innerText = `New notifications: ${resp.data.notifications.length}`
    }

    const conversationForm: VoidFunction = async (): Promise<void> => {
        const checkCopy: HTMLDivElement = document.querySelector(".new-conversation") as HTMLDivElement
        if (checkCopy != null) return

        const buttons = document.querySelectorAll("button")

        buttons.forEach((button: HTMLButtonElement): void => {
            button.disabled = true
            button.style.cursor = "auto"
        })

        const root: HTMLDivElement = document.querySelector("#root") as HTMLDivElement
        root.style.filter = "blur(20px)"

        const div: HTMLDivElement = document.createElement("div") as HTMLDivElement
        const buttonCover: HTMLDivElement = document.createElement("div") as HTMLDivElement
        const backButton: HTMLButtonElement = document.createElement("button") as HTMLButtonElement

        backButton.onclick = (): void => {
            const conversation: HTMLDivElement = document.querySelector(".new-conversation") as HTMLDivElement
            conversation.remove()
            root.style.filter = ""

            buttons.forEach((button: HTMLButtonElement): void => {
                button.disabled = false
                button.style.cursor = "pointer"
            })
        }
        backButton.innerText = "X"
        backButton.className = "button-back"
        buttonCover.append(backButton)

        const title: HTMLParagraphElement = document.createElement("p")
        title.innerText = "New Conversation"
        title.className = "title"

        const datalist: HTMLDataListElement = document.createElement("datalist") as HTMLDataListElement
        datalist.id = "user-list"

        const input: HTMLInputElement = document.createElement("input") as HTMLInputElement
        input.setAttribute("list", "user-list")
        input.spellcheck = false
        input.className = "friend-input"

        const resp = await axios.get("/userslist")

        resp.data.forEach((user: any): void => {
            const option: HTMLOptionElement = document.createElement("option") as HTMLOptionElement
            option.value = user.username + "#" + user.id
            datalist.append(option)
        })

        const label: HTMLLabelElement = document.createElement("label") as HTMLLabelElement
        label.innerText = "Find your friend"

        const labelWrapper: HTMLDivElement = document.createElement("div") as HTMLDivElement
        labelWrapper.append(label)
        labelWrapper.className = "label-wrapper"

        const form: HTMLFormElement = document.createElement("form") as HTMLFormElement
        form.append(labelWrapper)
        form.append(input)
        form.append(datalist)


        const openButton: HTMLButtonElement = document.createElement("button") as HTMLButtonElement
        openButton.innerText = "Open Conversation"
        openButton.className = "button-open"

        openButton.onclick = async (): Promise<void> => {
            const friendInput: HTMLInputElement = document.querySelector(".friend-input") as HTMLInputElement
            const friendName: string = friendInput.value
            if (friendName === "") return

            const token: string = localStorage.getItem(LS_ACCESS_TOKEN) as string

            const addChat: AxiosResponse = await axios.post("/newchat", { friend: friendName }, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            })

            const conversation: HTMLDivElement = document.querySelector(".new-conversation") as HTMLDivElement
            conversation.remove()
            root.style.filter = ""

            buttons.forEach((button: HTMLButtonElement): void => {
                button.disabled = false
                button.style.cursor = "pointer"
            })
            window.location.reload()
        }

        div.append(buttonCover)
        div.append(title)
        div.append(form)
        div.append(openButton)

        div.className = "new-conversation"

        document.body.append(div)
    }

    const logout: VoidFunction = async (): Promise<void> => {
        await axios.delete("/logout", {
            data: {
                token: localStorage.getItem(LS_REFRESH_TOKEN as string)
            }
        })

        localStorage.clear()
        window.location.pathname = "/login"
    }

    const checkNotifications: VoidFunction = async (): Promise<void> => {

        const token: string = localStorage.getItem(LS_ACCESS_TOKEN as string) as string

        const resp: AxiosResponse = await axios.get("/info", {
            headers: {
                authorization: `Bearer ${token}`
            }
        })

        const checkCopy: HTMLDivElement = document.querySelector(".notifications-window") as HTMLDivElement
        if (checkCopy != null) {
            checkCopy.remove()
            return
        }

        const div: HTMLDivElement = document.createElement("div") as HTMLDivElement

        const clearButton: HTMLButtonElement = document.createElement("button") as HTMLButtonElement
        clearButton.className = "button-clear"
        clearButton.innerText = "Clear"
        clearButton.onclick = async (): Promise<void> => {
            await axios.get("/resetnotifications", {
                headers: {
                    authorization: `Bearer ${token}`
                }
            })
            const allNotifications = document.querySelectorAll(".notification")
            allNotifications.forEach((field): void => void field.remove())

            if (notifications == null) return
            if (notifications.current == null) return
            notifications.current.innerText = ""
        }

        const title: HTMLParagraphElement = document.createElement("p")
        title.innerText = "Notifications"
        title.className = "title"

        const buttonCover: HTMLDivElement = document.createElement("div") as HTMLDivElement
        const backButton: HTMLButtonElement = document.createElement("button") as HTMLButtonElement

        backButton.onclick = (): void => {
            const conversation: HTMLDivElement = document.querySelector(".notifications-window") as HTMLDivElement
            conversation.remove()
        }
        backButton.innerText = "X"
        backButton.className = "button-back"
        buttonCover.append(backButton)

        div.append(buttonCover)
        div.append(clearButton)
        div.append(title)

        for (let i = 0; i < resp.data.notifications.length; i++) {
            const notification: HTMLDivElement = document.createElement("div") as HTMLDivElement
            const title: HTMLParagraphElement = document.createElement("p") as HTMLParagraphElement
            title.innerText = resp.data.notifications[i].message
            title.style.textAlign = "left"
            notification.className = "notification"

            notification.append(title)
            div.append(notification)
        }

        div.className = "notifications-window"

        document.body.append(div)
    }

    return (
        <div className="dashboard">
            <div className="buttons-wrapper">
                <button className="button-logout" onClick={logout}>Log out</button>
                <div className="notifications-bar">
                    <p ref={notifications} className="notifications"></p>
                    <button className="button-notifications" onClick={checkNotifications}>Notifications</button>
                </div>
            </div>
            <p ref={name}></p>
            <div className="conversation">
                <p>Create new conversation</p>
                <button className="plus" onClick={conversationForm}>+</button>
            </div>
            <div className="chats">
                {chats.map((chat: conversation, index: number): ReactElement => (
                    <Chat key={index} chat={chat} LS_ACCESS_TOKEN={LS_ACCESS_TOKEN} />
                ))}
            </div>
        </div>
    )
}

export default Dashboard