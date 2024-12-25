import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import "../styles/admin.css"



const AdminDashboard = () => {
  const [polygons, setPolygons] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all polygons
  const fetchPolygons = async () => {
    try {

      const response = await axios.get('https://geomesh-back-8gtx.onrender.com/api/polygons');

      setPolygons(response.data);
    } catch (err) {
      setError('Error fetching polygons');
      console.error(err);
    }
  };

  // Fetch all users (optional functionality to fetch users by email)
  const fetchUsers = async () => {
    try {

      const response = await axios.get('https://geomesh-back-8gtx.onrender.com/api/users'); // Replace with the correct API if needed

      setUsers(response.data);
    } catch (err) {
      setError('Error fetching users');
      console.error(err);
    }
  };

  // Delete a polygon
  const deletePolygon = async (id) => {
    try {

      await axios.delete(`https://geomesh-back-8gtx.onrender.com/api/polygon/${id}`);

      setPolygons((prevPolygons) => prevPolygons.filter((polygon) => polygon._id !== id));
      alert('Polygon deleted successfully');
    } catch (err) {
      setError('Error deleting polygon');
      console.error(err);
    }
  };

  const sendEmail = async(email , description , _id)=>{
    
    try{
        const response = fetch('https://complain-backend.onrender.com/sendemail' , {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({to : email , subject : "Delete Alert" , text : `Your segment is not up-to-date. It segment is going to delete by Admin side. Description :  ${description}, ID :  ${_id}. If any query complain at https://complain-frontend.vercel.app/` })
        }
    )

    
    if (!response.ok) {
        // Handle non-2xx HTTP responses
        alert( "email sent" );
        return;
    }
    
    const data = await response.json();
    console.log("Response data:", data);
    alert( "sent successful" );

    }catch(e){
        console.log(e)
    }
    }

  // Fetch data on component mount
  useEffect(() => {
    fetchPolygons();
    fetchUsers();
  }, []);

  return (
    <div className="admin-dashboard" style={{padding:"4rem"}}>
      <h1>Admin Dashboard</h1>

      {/* Polygons Section */}
      <section>
        <h2>All Polygons</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {polygons.length > 0 ? (
          <table border="1" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Email</th>
                <th>Area (sqm)</th>
                <th>Tag</th>
                <th>Color</th>
                <th>Delete Polygon</th>
                <th>Send Mail</th>
              </tr>
            </thead>
            <tbody>
              {polygons.map((polygon) => (
                <tr key={polygon._id}>
                  <td>{polygon._id}</td>
                  <td>{polygon.description}</td>
                  <td>{polygon.email}</td>
                  <td>{polygon.area.toFixed(2)}</td>
                  <td>{polygon.tag}</td>
                  <td>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: polygon.color,
                        border: '1px solid black',
                      }}
                    />
                  </td>
                  <td>
                    <button onClick={() => deletePolygon(polygon._id)}>Delete</button>
                  </td>
                  <td>
                    <button onClick={() => sendEmail( polygon.email , polygon.description , polygon._id )  }>Send Mail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No polygons found</p>
        )}
      </section>

      {/* Users Section */}
      <section>
        <h2>All Users</h2>
        {users.length > 0 ? (
          <table border="1" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
       
                <th>Name</th>
                <th>Email</th>
                <th>Date of Birth</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
          
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.dateOfBirth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found</p>
        )}
      </section>

      {/* Back to Map */}
      <Link style={{position : "absolute" , right : "3rem" , top : "3rem" , padding:"3rem"}} to="/map">
        <button>Back to Map</button>
      </Link>
    </div>
  );
};

export default AdminDashboard;
