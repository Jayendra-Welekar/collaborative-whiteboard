import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";




const EnterRoom = () => {
  const navigate = useNavigate();
  const [room, setRoom] = useState<string | null>(null);
  let name: string;
    try {
         name = JSON.parse(localStorage.getItem('user')!).user.id
    } catch (error) {
        window.location.href = 'http://localhost:5173/Login'     
    }
 

  const handleJoinRoom = () => {
    // Basic input validation (optional, could be enhanced)
    if (!room || !name) {
      alert("Please enter a room name and your name.");
      return;
    }

    navigate(`/Board?name=${name}&room=${room}`);
  };

  return (
    <>
      <div style={{height: '100vh'}}>
      <div className="roomDetails">
        <h3>Create a New Instance</h3>
        <input
          className="form-control"
          type="text"
          placeholder="Enter a roomId for your room"
          onChange={(e) => setRoom(e.target.value)}
        />
        
        <div className="signBtn">
          <button className="btn btn-primary" onClick={handleJoinRoom}>Start Whiteboard</button>
          <Link to='http://localhost:5173/available' className="btn btn-primary">Check Available</Link>
        </div>

      </div>
      </div>
    </>
  );
};

export default EnterRoom;