import { useState } from "react";
import axios from "../utils/axios";
function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/users/login", form);
      console.log("Login success:", res.data);
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl"
    >
      <h2 className="text-3xl mb-6 font-extrabold text-gray-900 text-center">
        Login
      </h2>
      <div className="mb-4">
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-6">
        <input
          name="password"
          placeholder="Password"
          type="password"
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out"
      >
        Login
      </button>
    </form>
  );
}
export default Login;
