import axios from "../utils/axios";
function Dashboard() {
  const handleLogout = async () => {
    try {
      const res = await axios.post("/users/logout");
      console.log("Logged out:", res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };
  const handleRefresh = async () => {
    try {
      const res = await axios.post("/users/refresh-token");
      console.log("Token refreshed:", res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome User!</h1>
      <div className="flex space-x-4">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Logout
        </button>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Refresh Token
        </button>
      </div>
    </div>
  );
}
export default Dashboard;
