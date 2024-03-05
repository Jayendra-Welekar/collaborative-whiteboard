import { FiHome } from "react-icons/fi";
import { LuUndo2 } from "react-icons/lu";
import { LuRedo2 } from "react-icons/lu";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { useSocket } from "../socketProvider/Socket";


const Navbar = ()=>{
    const socket = useSocket()

    
    return (
        <>
            <nav>
                <div className="part1">
                    <div className="homeBtn">
                        <FiHome />
                    </div>
                    <div className="controlBtn">
                        <div className="undoBtn" >
                        <LuUndo2 />
                        </div>
                        <div className="redoBtn"    >   
                        <LuRedo2 />
                        </div>
                    </div>
                </div>
                <div className="part2">
                    <div className="shareBtn">
                        <FaRegShareFromSquare />
                    </div>
                    
                    <button className="part2btn" onClick={()=>{
                        socket.disconnect()
                        window.location.href ='http://localhost:5173/'
                    }}>
                        Leave
                    </button>
                </div>

            </nav>
        </>
    )
}

export  default Navbar