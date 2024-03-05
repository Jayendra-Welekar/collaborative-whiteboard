import axios from "axios"
import {  Link } from "react-router-dom"
import { MouseEventHandler, useEffect, useState } from "react"
const Available = () => {
    const [whiteBoard, setWHiteBoard] = useState([])
    let name:string;
    try {
         
            name = JSON.parse(localStorage.getItem('user')!).user.id
      
    } catch (error) {
        window.location.href = 'http://localhost:5173/Login'     
    }



    const changeWhiteBoard = async ()=>{
        // const allwhiteBoard = await axios.get("http://localhost:3001/allBoards")
        const allwhiteBoard = await axios.get(`${import.meta.env.VITE_BK_PATH}/allBoards`)

        setWHiteBoard(allwhiteBoard.data.allRooms)
        console.log(allwhiteBoard.data)
    }
   useEffect(()=>{
        changeWhiteBoard()
   }, [])

   const enterBoard: MouseEventHandler<HTMLLIElement> = (e)=>{
        const targetId = (e.target as HTMLLIElement).id;
        window.location.href = `http://localhost:5173/Board?name=${name}&room=${targetId}`
   }

    return (
        <div className="parentAvailable">
            <div className="availableWhiteboards">
            <h2>Choose a session to join</h2>
            <ul className="list-group">
                {
                    whiteBoard.map((board : {key: string, ele: string}) => {
                        return (
                            <li className="list-group-item" key={board?.key} id={board?.key} onClick={enterBoard} style={{display: 'flex', justifyContent: 'space-between'}} >
                                <div>{board.key}</div>
                                <div>{board.ele}</div>
                            </li>
                        )
                    })
                }
            </ul>
            <Link to="/" className="btn btn-primary">Create New Whiteboard</Link>
        </div>
        </div>
    )
}

export default Available