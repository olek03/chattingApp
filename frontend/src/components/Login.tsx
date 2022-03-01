import axios, { AxiosResponse } from "axios"
import { ReactElement, useRef } from "react"

interface tokens {
    LS_ACCESS_TOKEN: string
    LS_REFRESH_TOKEN: string
}

const Login: React.FC<tokens> = ({ LS_ACCESS_TOKEN, LS_REFRESH_TOKEN }): ReactElement => {

    const nameRef = useRef<HTMLInputElement>(null)
    const pwRef = useRef<HTMLInputElement>(null)

    const login = async (): Promise<void> => {
        if (nameRef == null || pwRef == null) return
        if (nameRef.current == null || pwRef.current == null) return

        try {
            const resp: AxiosResponse = await axios.post("/login", {
                username: nameRef.current.value,
                password: pwRef.current.value
            })
            localStorage.setItem(LS_ACCESS_TOKEN, resp.data.accessToken)
            localStorage.setItem(LS_REFRESH_TOKEN, resp.data.refreshToken)
        } catch { return }
        
        window.location.pathname = "/posts"
    }

    return (
        <div className="form">
            <h1>Chatter</h1>
            <div className="field">
                <span className="form-title">Username:</span>
                <input ref={nameRef} className="form-input" />
            </div>
            <div className="field">
                <span className="form-title">Password:</span>
                <input ref={pwRef} type="password" className="form-input" />
            </div>
            <div className="button-wrapper"><button onClick={login}>Login</button></div>
            <a href="/new">or create <strong className="link">new account</strong></a>
        </div>
    )
}

export default Login