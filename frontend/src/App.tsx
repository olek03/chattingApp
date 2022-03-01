import React, { ReactElement } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import NewAcc from './components/NewAcc'
import Dashboard from './components/Dashboard'

const App: React.FC = (): ReactElement => {

  const LS_ACCESS_TOKEN: string = "jwt_access_token"
  const LS_REFRESH_TOKEN: string = "jwt_refresh_token"

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/login" element={<Login LS_ACCESS_TOKEN={LS_ACCESS_TOKEN} LS_REFRESH_TOKEN={LS_REFRESH_TOKEN} />} />
          <Route path="/new" element={<NewAcc />} />
          <Route path="/posts" element={<Dashboard LS_ACCESS_TOKEN={LS_ACCESS_TOKEN} LS_REFRESH_TOKEN={LS_REFRESH_TOKEN} />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
