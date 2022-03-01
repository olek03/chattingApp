import axios from "axios"
import { ReactElement, useRef } from "react"

const NewAcc: React.FC = (): ReactElement => {

    const nameRef = useRef<HTMLInputElement>(null)
    const pwRef = useRef<HTMLInputElement>(null)

    const create = async (): Promise<void> => {
        if (nameRef == null || pwRef == null) return
        if (nameRef.current == null || pwRef.current == null) return
        
        await axios.post("/new", {
            username: nameRef.current.value,
            password: pwRef.current.value
        })

        window.location.pathname = "/login"
    }

    return (
        <div className="form">
            <h1>Chatter</h1>
            <p className="create">Create Account</p>
            <div className="field">
                <label>Username:</label>
                <input ref={nameRef} className="form-input" />
            </div>
            <div className="field">
                <label>Password:</label>
                <input ref={pwRef} type="password" className="form-input" />
            </div>
            <button onClick={create}>Create Account</button>
        </div>
    )
}

export default NewAcc