import "./App.css";
import Board from "./Pages/Board";
import Navbar from "./Components/Navbar";
import {Routes, Route} from "react-router-dom"
import Available from "./Pages/Available";
import SignIn from "./Pages/SignIn";
import EnterRoom from "./Pages/EnterRoom";

function App(){
  return (
    <Routes>
      <Route path='/' element={<EnterRoom />}/>
      <Route path='/available' element={<Available />}/>
      <Route path='/login' element={<SignIn />}/>
      <Route path='/board' element={<><Navbar /><Board /></>} />
    </Routes>
  )
}

export default App;
