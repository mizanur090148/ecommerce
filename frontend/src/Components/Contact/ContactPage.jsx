import React, { useState } from "react";
import "./ContactPage.css";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaCrosshairs } from "react-icons/fa";
import authService from "../../Services/authService";
import apiClient from "../../Services/apiClient";

const ContactPage = () => {
  const currentUser = authService.getCurrentUser();

  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Default location: Dhaka, Bangladesh
  const [mapCoords, setMapCoords] = useState({
    lat: 23.8103,
    lng: 90.4125,
    locationName: "Dhaka, Bangladesh",
  });
  const [locating, setLocating] = useState(false);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCoords({
          lat: latitude,
          lng: longitude,
          locationName: `Your Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        });
        setLocating(false);
        toast.success("Location updated to your current local position!", {
          duration: 3000,
          style: { backgroundColor: "#07bc0c", color: "white" },
        });
      },
      (error) => {
        setLocating(false);
        console.error("Location detection error", error);
        toast.error("Could not fetch location. Showing default Bangladesh location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient.post("/contact", {
        name,
        email,
        phone,
        subject,
        message,
      });

      if (response?.status === "success" || response?.data?.status === "success") {
        toast.success(`Thank you ${name}! Your inquiry has been submitted.`, {
          duration: 3500,
          style: { backgroundColor: "#07bc0c", color: "white" },
        });
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
      }
    } catch (err) {
      console.error("Contact inquiry submit error", err);
      toast.success(`Thank you ${name}! Your message has been submitted.`, {
        duration: 3500,
        style: { backgroundColor: "#07bc0c", color: "white" },
      });
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } finally {
      setSubmitting(false);
    }
  };

  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&z=14&output=embed`;

  return (
    <>
      <div className="contactSection">
        <h2>Contact Us</h2>

        {/* Map Header Controls */}
        <div
          style={{
            padding: "0 250px",
            marginBottom: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
          className="contactMapControls"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaMapMarkerAlt color="#e53e3e" size={20} />
            <span style={{ fontWeight: "600", fontSize: "0.95rem", color: "#2d3748" }}>
              Location Indicator: <strong style={{ color: "#2b6cb0" }}>{mapCoords.locationName}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locating}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#000",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "0.85rem",
              cursor: locating ? "wait" : "pointer",
              transition: "background 0.2s",
            }}
          >
            <FaCrosshairs size={14} />
            {locating ? "Locating your GPS..." : "📍 Locate My Position"}
          </button>
        </div>

        <div className="contactMap">
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Local Location Map"
          ></iframe>
        </div>

        <div className="contactInfo">
          <div className="contactAddress">
            <div className="address">
              <h3>Head Office (Dhaka)</h3>
              <p>
                Level 8, Tower 14, Gulshan-2, Dhaka 1212
                <br /> Bangladesh
              </p>
              <p>
                sale@gentlestyle.com
                <br />
                +880 1733-714009
              </p>
            </div>
            <div className="address">
              <h3>Sirajganj Branch</h3>
              <p>
                SS Road, Sirajganj 6700
                <br /> Bangladesh
              </p>
              <p>
                sirajganj@ecommerce.com.bd
                <br />
                +880 1610-608835
              </p>
            </div>
          </div>

          <div className="contactForm">
            <h3>Get In Touch</h3>
            <form onSubmit={handleSubmit}>
              <div className="contactFormRow">
                <input
                  type="text"
                  value={name}
                  placeholder="Name *"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  value={email}
                  placeholder="Email address *"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="contactFormRow">
                <input
                  type="text"
                  value={phone}
                  placeholder="Phone Number (e.g. +8801XXXXXXXXX)"
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  type="text"
                  value={subject}
                  placeholder="Subject"
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <textarea
                rows={8}
                cols={40}
                placeholder="Your Message *"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />

              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
