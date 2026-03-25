import { useState } from "react";
import API from "../api/axios";

const ForgotPassword = () => {

  const [email,setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try{
      await API.post("/forgot-password/",{email});
      alert("Reset link sent to email");
    }
    catch(error){
      alert(JSON.stringify(error.response?.data));
    }
  };

  return(
    <div className="min-h-screen flex items-center justify-center">

      <form onSubmit={handleSubmit} className="bg-white p-8 shadow rounded w-96">

        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>

        <input
        type="email"
        placeholder="Enter Email"
        className="w-full p-3 border mb-4"
        onChange={(e)=>setEmail(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded">
        Send Reset Link
        </button>

      </form>

    </div>
  )
}

export default ForgotPassword