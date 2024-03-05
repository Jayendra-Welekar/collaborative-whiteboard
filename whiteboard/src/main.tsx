
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SocketProvider } from './socketProvider/Socket.tsx'
import {RecoilRoot} from 'recoil'
import {BrowserRouter} from "react-router-dom"

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
    <RecoilRoot>
    <SocketProvider>
            <App />
    </SocketProvider>
    </RecoilRoot>
    </BrowserRouter>
    
  
)
