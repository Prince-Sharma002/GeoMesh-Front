import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/info.css"
import { Link } from "react-router-dom";

const PersonInfo = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const email = localStorage.getItem('email'); // Get email from local storage
      if (!email) {
        console.log('No email found in local storage');
        return;
      }

      try {
        const response = await axios.get(`https://geomesh-back.onrender.com/api/user?email=${email}`);
        setUserDetails(response.data);

        // Fetch polygons for the user
        const polygonResponse = await axios.get(`https://geomesh-back.onrender.com/api/polygons/email?email=${email}`);
        setPolygons(polygonResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err.response?.data?.message || err.message);
      }
    };

    fetchUserDetails();
  }, []);

  // Helper function to parse coordinates
  const parseCoordinates = (coordinatesArray) => {
    return coordinatesArray.map((coordSet) =>
      coordSet.map((coord) =>
        typeof coord === 'object' && '$numberDouble' in coord
          ? parseFloat(coord.$numberDouble)
          : coord
      )
    );
  };

  // Delete polygon by ID
  const handleDelete = async (polygonId) => {
    try {
      const response = await axios.delete(`https://geomesh-back.onrender.com/api/polygon/${polygonId}`);
      alert(response.data.message);

      // Update the state to remove the deleted polygon
      setPolygons((prevPolygons) => prevPolygons.filter((polygon) => polygon._id !== polygonId));
    } catch (err) {
      console.error('Error deleting polygon:', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className='dashboard-container'>
      <h2>User Dashboard</h2>
      <Link to="/map" style={{position : "absolute" , right : "2rem" , top : "3rem"}} >
        <button>Map</button>
      </Link>
      {userDetails ? (
        <div>
          <h3>Welcome, {userDetails.name}</h3>
          <h3> Email : {userDetails.email}</h3>
          {/* <p>Date of Birth: {userDetails.dateOfBirth}</p> */}
        </div>
      ) : (
        <p>Loading user details...</p>
      )}

      <h3>User Polygons</h3>
      {polygons.length > 0 ? (
        <ul>
          {polygons.map((polygon, index) => (
            <li key={index}>
              <p style={{textAlign : "left"}} > <strong> Description : </strong>  {polygon.description}</p>
              <p style={{textAlign : "left"}}>
                <strong>Coordinates</strong>: 
                <br />
                {JSON.stringify(parseCoordinates(polygon.coordinates))}
              </p>
              <p style={{textAlign : "left"}}> <strong> Color: </strong>  {polygon.color}</p>
              <p style={{textAlign : "left"}}> <strong> Area: </strong>  {polygon.area.$numberDouble || polygon.area} sq. meters</p>
              <p style={{textAlign : "left"}}> <strong> Likes: </strong>  {polygon.likes.$numberInt || polygon.likes}</p>
              <div>
                <p style={{textAlign : "left"}}> <strong> Reviews: </strong>  </p>
                {polygon.reviews.length > 0 ? (
                  <ul>
                    {polygon.reviews.map((review, reviewIndex) => (
                      <li key={reviewIndex}>{reviewIndex + 1}: {review}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No reviews available.</p>
                )}
              </div>
              <button className='delete-button' onClick={() => handleDelete(polygon._id)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No polygons found for this user.</p>
      )}
    </div>
  );
};

export default PersonInfo;
