import React, { useState, useEffect } from "react";
import "./CustomerDashboard.css";
import authService from "../../../Services/authService";
import customerService from "../../../Services/customerService";
import { useNavigate } from "react-router-dom";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(authService.getCurrentUser());

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  // Address Form State
  const [addressData, setAddressData] = useState({
    first_name: user?.name ? user.name.split(" ")[0] : "",
    last_name: user?.name ? user.name.split(" ").slice(1).join(" ") : "",
    address_line_1: "",
    city: "",
    postcode: "",
    phone: user?.phone || "",
  });
  const [addressMsg, setAddressMsg] = useState("");
  const [addressErr, setAddressErr] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await customerService.getProfile();
      if (res.data) {
        setUser(res.data);
        setProfileData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
        });
        if (res.data.addresses && res.data.addresses.length > 0) {
          const addr = res.data.addresses[0];
          setAddressData({
            first_name: addr.first_name || "",
            last_name: addr.last_name || "",
            address_line_1: addr.address_line_1 || "",
            city: addr.city || "",
            postcode: addr.postcode || "",
            phone: addr.phone || "",
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await customerService.getOrders(1);
      if (res.data && res.data.data) {
        setOrders(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");
    setProfileLoading(true);
    try {
      const res = await customerService.updateProfile(profileData);
      setProfileMsg("Profile updated successfully!");
      setUser(res.user);
    } catch (err) {
      setProfileErr(err.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg("");
    setPassErr("");

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setPassErr("New passwords do not match.");
      return;
    }

    setPassLoading(true);
    try {
      await customerService.updatePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation,
      });
      setPassMsg("Password changed successfully!");
      setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (err) {
      setPassErr(err.message || "Failed to update password. Verify current password.");
    } finally {
      setPassLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressMsg("");
    setAddressErr("");
    setAddressLoading(true);
    try {
      await customerService.saveAddress({ ...addressData, type: "billing" });
      setAddressMsg("Default address saved successfully!");
    } catch (err) {
      setAddressErr(err.message || "Failed to save address.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="customerDashboardSection">
      <div className="customerDashboardHeader">
        <h2>My Account</h2>
        <p>Manage your orders, profile details, and shipping addresses.</p>
      </div>

      <div className="customerDashboardLayout">
        {/* Navigation Sidebar */}
        <div className="customerDashboardNav">
          <button
            className={`customerDashboardNavItem ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            📊 Dashboard Overview
          </button>
          <button
            className={`customerDashboardNavItem ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            📦 Order History ({orders.length})
          </button>
          <button
            className={`customerDashboardNavItem ${activeTab === "addresses" ? "active" : ""}`}
            onClick={() => setActiveTab("addresses")}
          >
            🏠 Shipping & Billing Address
          </button>
          <button
            className={`customerDashboardNavItem ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 Profile Details
          </button>
          <button
            className={`customerDashboardNavItem ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            🔒 Change Password
          </button>
          <button className="customerDashboardNavItem" onClick={handleLogout} style={{ color: "#e53e3e" }}>
            🚪 Log Out
          </button>
        </div>

        {/* Dynamic Content Panel */}
        <div className="customerDashboardContent">
          {/* Tab 1: Dashboard Overview */}
          {activeTab === "dashboard" && (
            <div>
              <h3>Hello, {user?.name || "Customer"}! 👋</h3>
              <p style={{ color: "#666", marginTop: "5px" }}>
                From your account dashboard you can view your <b>recent orders</b>, manage your <b>shipping addresses</b>, and edit your <b>password</b>.
              </p>

              <div className="customerOverviewGrid">
                <div className="customerOverviewCard">
                  <h4>Total Orders Placed</h4>
                  <p>{orders.length}</p>
                </div>
                <div className="customerOverviewCard">
                  <h4>Account Email</h4>
                  <p style={{ fontSize: "16px", textTransform: "none" }}>{user?.email}</p>
                </div>
                <div className="customerOverviewCard">
                  <h4>Account Status</h4>
                  <p style={{ fontSize: "18px", color: "#22543d" }}>✓ Active</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Order History */}
          {activeTab === "orders" && (
            <div>
              <h3>Order History</h3>
              {ordersLoading ? (
                <p style={{ padding: "20px 0" }}>Loading order history...</p>
              ) : orders.length > 0 ? (
                <>
                  <table className="customerOrderTable">
                    <thead>
                      <tr>
                        <th>ORDER #</th>
                        <th>DATE</th>
                        <th>STATUS</th>
                        <th>TOTAL</th>
                        <th>ITEMS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => {
                        const statusClass = (ord.status || "pending").toLowerCase();
                        return (
                          <tr key={ord.id}>
                            <td style={{ fontWeight: "600" }}>{ord.order_number}</td>
                            <td>{new Date(ord.created_at).toLocaleDateString()}</td>
                            <td>
                              <span className={`orderStatusBadge ${statusClass}`}>
                                {ord.status || "pending"}
                              </span>
                            </td>
                            <td style={{ fontWeight: "600" }}>
                              ${Number(ord.grand_total || 0).toFixed(2)}
                            </td>
                            <td>
                              <button
                                style={{ background: "none", border: "1px solid #111", padding: "4px 10px", borderRadius: "4px", cursor: "pointer" }}
                                onClick={() => setSelectedOrderDetails(selectedOrderDetails?.id === ord.id ? null : ord)}
                              >
                                {selectedOrderDetails?.id === ord.id ? "Hide Details" : "View Details"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Expandable Order Details Card */}
                  {selectedOrderDetails && (
                    <div style={{ marginTop: "25px", padding: "20px", background: "#f9f9f9", borderRadius: "6px", border: "1px solid #ddd" }}>
                      <h4>Order Details: {selectedOrderDetails.order_number}</h4>
                      <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
                        Payment Method: <b>{selectedOrderDetails.payment_method}</b> | Payment Status: <b>{selectedOrderDetails.payment_status}</b>
                      </p>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#eee" }}>
                            <th style={{ padding: "8px", textAlign: "left" }}>Product</th>
                            <th style={{ padding: "8px", textAlign: "center" }}>Qty</th>
                            <th style={{ padding: "8px", textAlign: "right" }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrderDetails.items?.map((item) => (
                            <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                              <td style={{ padding: "8px" }}>{item.product_name}</td>
                              <td style={{ padding: "8px", textAlign: "center" }}>{item.quantity}</td>
                              <td style={{ padding: "8px", textAlign: "right" }}>${Number(item.subtotal).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ padding: "20px 0", color: "#666" }}>No orders placed yet.</p>
              )}
            </div>
          )}

          {/* Tab 3: Saved Addresses */}
          {activeTab === "addresses" && (
            <div>
              <h3>Shipping & Billing Address</h3>
              {addressMsg && <p style={{ color: "#07bc0c", fontWeight: "bold", marginTop: "10px" }}>{addressMsg}</p>}
              {addressErr && <p style={{ color: "#e53e3e", marginTop: "10px" }}>{addressErr}</p>}

              <form className="customerFormGroup" onSubmit={handleAddressSubmit}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={addressData.first_name}
                    onChange={(e) => setAddressData({ ...addressData, first_name: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name *"
                    value={addressData.last_name}
                    onChange={(e) => setAddressData({ ...addressData, last_name: e.target.value })}
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Street Address *"
                  value={addressData.address_line_1}
                  onChange={(e) => setAddressData({ ...addressData, address_line_1: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Town / City *"
                  value={addressData.city}
                  onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Postcode / ZIP *"
                  value={addressData.postcode}
                  onChange={(e) => setAddressData({ ...addressData, postcode: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Phone Number *"
                  value={addressData.phone}
                  onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                />
                <button className="customerFormBtn" disabled={addressLoading}>
                  {addressLoading ? "Saving..." : "Save Address"}
                </button>
              </form>
            </div>
          )}

          {/* Tab 4: Profile Details */}
          {activeTab === "profile" && (
            <div>
              <h3>Profile Settings</h3>
              {profileMsg && <p style={{ color: "#07bc0c", fontWeight: "bold", marginTop: "10px" }}>{profileMsg}</p>}
              {profileErr && <p style={{ color: "#e53e3e", marginTop: "10px" }}>{profileErr}</p>}

              <form className="customerFormGroup" onSubmit={handleProfileSubmit}>
                <label style={{ fontSize: "14px", fontWeight: "600" }}>Full Name *</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />

                <label style={{ fontSize: "14px", fontWeight: "600" }}>Email Address *</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />

                <label style={{ fontSize: "14px", fontWeight: "600" }}>Phone Number</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />

                <button className="customerFormBtn" disabled={profileLoading}>
                  {profileLoading ? "Updating..." : "Update Profile"}
                </button>
              </form>
            </div>
          )}

          {/* Tab 5: Change Password */}
          {activeTab === "password" && (
            <div>
              <h3>Change Password</h3>
              {passMsg && <p style={{ color: "#07bc0c", fontWeight: "bold", marginTop: "10px" }}>{passMsg}</p>}
              {passErr && <p style={{ color: "#e53e3e", marginTop: "10px" }}>{passErr}</p>}

              <form className="customerFormGroup" onSubmit={handlePasswordSubmit}>
                <input
                  type="password"
                  placeholder="Current Password *"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="New Password (min 6 chars) *"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm New Password *"
                  value={passwordData.new_password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                  required
                />
                <button className="customerFormBtn" disabled={passLoading}>
                  {passLoading ? "Changing Password..." : "Change Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
