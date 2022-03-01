import { ReactElement, useEffect, useRef, useState } from "react"
import { conversation, message } from "../interfaces"
import { Types } from 'mongoose'
import axios, { AxiosResponse } from "axios"

const Chat: React.FC<{ chat: conversation, LS_ACCESS_TOKEN: string }> = ({ chat, LS_ACCESS_TOKEN }): ReactElement => {

    const chatComponent = useRef<HTMLDivElement>(null)
    const [messages, setMessages] = useState<message[]>()

    const addListener: VoidFunction = (): void => {
        chatComponent.current.addEventListener("click", async (): Promise<void> => {
            const checkCopy: HTMLDivElement = document.querySelector(".chat-window") as HTMLDivElement
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
                const conversation: HTMLDivElement = document.querySelector(".chat-window") as HTMLDivElement
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

            const token: string = localStorage.getItem(LS_ACCESS_TOKEN as string) as string
            const queryName: AxiosResponse = await axios.get("/info", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const title: HTMLParagraphElement = document.createElement("p")
            title.className = "title"

            for (let i = 0; i < chat.participants.length; i++) {
                const resp: AxiosResponse = await axios.post("/getName", { id: chat.participants[i] }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                if (resp.data.username !== queryName.data.username) title.innerText = resp.data.username
            }

            const messages: HTMLDivElement = document.createElement("div") as HTMLDivElement
            messages.className = "messages-window"

            for (let i = 0; i < chat.messages.length; i++) {
                const senderName: HTMLParagraphElement = document.createElement("p") as HTMLParagraphElement
                senderName.innerText = chat.messages[i].senderName

                const text: HTMLParagraphElement = document.createElement("p") as HTMLParagraphElement
                text.innerText = chat.messages[i].text

                const message: HTMLDivElement = document.createElement("div") as HTMLDivElement
                message.className = "message"

                message.append(senderName)
                message.append(text)

                messages.append(message)
            }

            const textfield: HTMLTextAreaElement = document.createElement("textarea") as HTMLTextAreaElement
            textfield.className = "textfield"

            const sendButton: HTMLButtonElement = document.createElement("button") as HTMLButtonElement
            sendButton.className = "button-send"
            sendButton.innerText = "Send"

            sendButton.onclick = async (): Promise<void> => {
                const textfield: HTMLTextAreaElement = document.querySelector(".textfield") as HTMLTextAreaElement
                const message: string = textfield.value

                await axios.post("/sendmessage",
                    {
                        conversationId: chat._id,
                        senderName: queryName.data.username,
                        senderId: queryName.data._id,
                        text: message
                    }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                const messages: AxiosResponse = await axios.post("/getmessages", {
                    conversationId: chat._id
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                const messagesWindow: HTMLDivElement = document.querySelector(".messages-window") as HTMLDivElement
                messagesWindow.innerHTML = ""

                for (let i = 0; i < messages.data.length; i++) {
                    const senderName: HTMLParagraphElement = document.createElement("p") as HTMLParagraphElement
                    senderName.innerText = messages.data[i].senderName

                    const text: HTMLParagraphElement = document.createElement("p") as HTMLParagraphElement
                    text.innerText = messages.data[i].text

                    const message: HTMLDivElement = document.createElement("div") as HTMLDivElement
                    message.className = "message"

                    message.append(senderName)
                    message.append(text)

                    messagesWindow.appendChild(message)
                }

            }

            const footer: HTMLDivElement = document.createElement("div") as HTMLDivElement
            footer.className = "footer"

            footer.append(textfield)
            footer.append(sendButton)

            div.append(buttonCover)
            div.append(title)
            div.append(messages)
            div.append(footer)

            div.className = "chat-window"

            document.body.append(div)

        })
    }

    const getNames: VoidFunction = async (): Promise<void> => {
        const token: string = localStorage.getItem(LS_ACCESS_TOKEN as string) as string
        const queryName: AxiosResponse = await axios.get("/info", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        
        for (let i = 0; i < chat.participants.length; i++) {
            const resp: AxiosResponse = await axios.post("/getName", { id: chat.participants[i] }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const nameSpan: HTMLSpanElement = document.getElementById(JSON.stringify(chat.participants[i])) as HTMLSpanElement
            nameSpan.className = "chat-names"
            if (resp.data.username !== queryName.data.username) nameSpan.innerText = resp.data.username + " "
        }
    }

    useEffect((): void => {
        addListener()
        getNames()
        
    }, [])

    return (
        <div className="chat" ref={chatComponent}>
            <p key={Math.random() * 10000}>{chat.participants.map((id: Types.ObjectId, index: number): ReactElement => (
                <span id={JSON.stringify(id)} key={index}></span>
            ))}</p>
        </div>
    )
}

export default Chat