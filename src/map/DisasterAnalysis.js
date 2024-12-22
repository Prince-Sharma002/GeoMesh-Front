import { useState } from "react";
import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6666"]; // Chart colors

export default function DisasterAnalysis() {
  const [geoJsonData, setGeoJsonData] = useState(null); // For storing uploaded GeoJSON
  const [chartData, setChartData] = useState([]); // For storing processed chart data
  const [filteredData, setFilteredData] = useState([]); // Data filtered by date
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedGeoJson = JSON.parse(e.target.result);
          setGeoJsonData(parsedGeoJson);
          processChartData(parsedGeoJson); // Process data for chart
        } catch (error) {
          alert("Invalid GeoJSON file!");
        }
      };
      reader.readAsText(file);
    }
  };

  const processChartData = (data) => {
    const disasterData = data.features.reduce((acc, feature) => {
      const { description, area, date } = feature.properties;
      const disasterType = description.split(" ")[0].toLowerCase(); // Assume first word is disaster type
      const disasterDate = new Date(date);

      if (!acc[disasterType]) acc[disasterType] = { totalArea: 0, occurrences: 0, dates: [] };
      acc[disasterType].totalArea += area; // Aggregate area by type
      acc[disasterType].occurrences += 1; // Count occurrences
      acc[disasterType].dates.push(disasterDate);
      return acc;
    }, {});

    const formattedData = Object.entries(disasterData).map(([key, value]) => ({
      name: key,
      totalArea: value.totalArea,
      occurrences: value.occurrences,
    }));

    setChartData(formattedData);
    setFilteredData(data.features); // Default is unfiltered data
  };

  const filterDataByDate = () => {
    if (startDate && endDate) {
      const filtered = geoJsonData.features.filter((feature) => {
        const featureDate = new Date(feature.properties.date);
        return featureDate >= startDate && featureDate <= endDate;
      });
      setFilteredData(filtered);
    }
  };

  return (
    <div style={{padding : "5rem" }}>
      <h1 style={{textAlign:"center"}}>Disaster Analysis</h1>
      <input
        type="file"
        accept=".geojson"
        onChange={handleFileUpload}
        style={{ marginBottom: "20px" }}
      />
      <div style={{  marginBottom : "10rem" }}>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholderText="Start Date"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholderText="End Date"
        />
        <br/>
        <button style={{width:"10rem"}} onClick={filterDataByDate}>Filter by Date</button>
      </div>
      {geoJsonData && (
        <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
          <div style={{ width: "50%", height: "400px" }}>
            <h3>Map Visualization</h3>
            <MapContainer
              center={[29.5, 79]}
              zoom={6}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filteredData.map((feature, index) => (
                <Polygon
                  key={index}
                  positions={feature.geometry.coordinates[0].map(([lat, lng]) => [lat, lng])}
                  color={feature.properties.color}
                >
                  <Popup>
                    <b>{feature.properties.description}</b>
                    <br />
                    Area: {feature.properties.area} sq km
                    <br />
                    Date: {feature.properties.date}
                  </Popup>
                </Polygon>
              ))}
            </MapContainer>
          </div>
          <div style={{ width: "50%", height: "400px" }}>
            <h3>Disaster Areas Breakdown</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="totalArea"
                  nameKey="name"
                  outerRadius={100}
                  fill="#8884d8"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {geoJsonData && (
        <div style={{ width: "70%", height: "400px", marginLeft : "5rem" , padding:"3rem",  marginTop: "5rem" , display:"flex" , alignItems : "center" }}>
          <ResponsiveContainer width="100%" height="100%">
          <h3>Disaster Frequency</h3>
            <BarChart style={{padding:"4rem"}} data={chartData}>
              <CartesianGrid strokeDasharray="4 4"  />
              <XAxis dataKey="name" />
              <YAxis/>
              <Tooltip />
              <Legend />
              <Bar dataKey="occurrences" fill="#8884d8" />
              <Bar dataKey="totalArea" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
