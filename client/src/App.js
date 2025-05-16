import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RealEstateLanding from "./components/RealEstateLanding";
import Properties from "./components/Properties";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import PostProperty from "./components/PostProperty";
import PropertyDetails from "./components/PropertyDetails"; 
import Profile from "./components/Profile";
import EditProperty from "./components/EditProperty";

function App() {
  return (
    <Router>
    <Header />
    <Routes>
      <Route path="/" element={<RealEstateLanding />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/post-property" element={<PostProperty />} />
      <Route path="/user-profile/:token" element={<Profile />} />
      <Route path="/property-details/:id" element={<PropertyDetails />} />
      <Route path="/edit-property/:id" element={<EditProperty />} />

    </Routes>
    <Footer />
  </Router>
  );
}

export default App;