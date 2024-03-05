/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import {useNavigate} from 'react-router-dom'
import { v4 as uuidv4 } from "uuid";  

import axios from "axios"


const SignIn = ()=>{

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e: { preventDefault: () => void; })=>{
        e.preventDefault()
        const user = {
            name: email.split('@')[0],
            email,
            password,
            id: uuidv4()
        }

        const newUser = await axios.post(`${import.meta.env.VITE_BK_PATH}/newUser`, user);
        // console.log(newUser)
        localStorage.setItem("user", JSON.stringify(newUser.data))
        console.log(localStorage.getItem('user'))

        navigate('/available')
    }

    const handleSubmitLogin = async (e: { preventDefault: () => void; })=>{
        e.preventDefault()
        const user = {
            email,
            password,
        }
        let newUser;
        try {
            newUser = await axios.post(`${import.meta.env.VITE_BK_PATH}/login`, user);
        } catch (error) {
            if((error as any).response.status == 404){
            alert("The provide user does not exits. Signup with the new user")}
            else if((error as any).response.status == 403){
                alert("Incorrect password")}
        } 
        console.log(newUser)
        localStorage.setItem("user", JSON.stringify(newUser?.data))
        navigate('/available')
    }

    return (
        <div className="parentLogin">
            <div className="loginForm">
                <h1>SignUp/Login</h1>
            <form>
                <div className="mb-3">
                    <label className="form-label">Email address</label>
                    <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" onChange={(e)=>{
                        setEmail(e.target.value)
                    }} />
                        <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" id="exampleInputPassword1" onChange={(e)=>{
                        setPassword(e.target.value)
                    }} />
                </div>
               <div className='signBtn'>
               <button type="submit" className="btn btn-primary" onClick={handleSubmit}>SignUp</button>
                <button type="submit" className="btn btn-primary" onClick={handleSubmitLogin}>LogIn</button>

               </div>
            </form>
        </div>
        </div>
    )
}

export default SignIn