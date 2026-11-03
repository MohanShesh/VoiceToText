import React from "react";
import { useNavigate } from "react-router-dom";
import { FaMicrophone } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <button
        onClick={() => navigate("/dictation")}
        className="p-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg hover:scale-110 transform transition duration-300 ease-in-out"
      >
        <FaMicrophone/>
      </button>
    </div>
  );
}
