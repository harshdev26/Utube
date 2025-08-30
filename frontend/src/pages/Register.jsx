import { useState } from "react";
import axios from "../utils/axios";
function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    avatar: null,
    coverImage: null,
  });
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    try {
      const res = await axios.post("/users/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Registered:", res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl"
    >
      <h2 className="text-3xl mb-6 font-extrabold text-gray-900 text-center">
        Register
      </h2>
      <div className="mb-4">
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <input
          name="email"
          placeholder="Email"
          type="email"
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <input
          name="fullName"
          placeholder="Full Name"
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
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Avatar:
          <input
            type="file"
            name="avatar"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </label>
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Cover Image:
          <input
            type="file"
            name="coverImage"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </label>
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out"
      >
        Register
      </button>
    </form>
  );
}
export default Register;
