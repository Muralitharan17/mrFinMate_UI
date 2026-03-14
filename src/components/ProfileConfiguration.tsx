import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080/mrFinMateService";

interface Profile {
  id?: number;
  name: string;
  isManager: boolean;
  createdUser?: string;
  createdDate?: string;
  updatedDate?: string;
}

const ProfileConfiguration: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile>({
    name: "",
    isManager: false,
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/profiles`);
      setProfiles(res.data || []);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSaveOrUpdate = async () => {
    if (!form.name.trim()) {
      alert("Profile Name is required.");
      return;
    }

    try {
      await axios.post(`${API_BASE}/saveOrUpdateProfile`, form);
      resetForm();
      loadProfiles();
    } catch (err) {
      console.error("Error saving/updating profile:", err);
    }
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setForm({ ...profile });
  };

  const handleDelete = async (profileId?: number) => {
    if (!profileId) return;
    if (window.confirm("Are you sure you want to delete this profile?")) {
      try {
        await axios.delete(`${API_BASE}/deleteProfile`, {
          params: { profileId },
        });
        loadProfiles();
      } catch (err) {
        console.error("Error deleting profile:", err);
      }
    }
  };

  const resetForm = () => {
    setEditingProfile(null);
    setForm({
      name: "",
      isManager: false,
    });
  };

  return (
    <div className="container mt-5">
      <h4 className="fw-semibold mb-3">Profile Configuration</h4>

      {/* Input Form */}
      <div className="card p-3 shadow-sm mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label fw-medium">Profile Name *</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter profile name"
            />
          </div>

          <div className="col-md-2 d-flex align-items-center">
            <div className="form-check mt-3">
              <input
                className="form-check-input"
                type="checkbox"
                name="isManager"
                checked={form.isManager}
                onChange={handleChange}
                id="isManager"
              />
              <label className="form-check-label" htmlFor="isManager">
                Is Manager
              </label>
            </div>
          </div>

          <div className="col-md-3 text-end">
            <button
              className="btn btn-primary px-4"
              onClick={handleSaveOrUpdate}
            >
              {editingProfile ? "Update" : "Save"}
            </button>
            {editingProfile && (
              <button
                className="btn btn-secondary ms-2"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="table-responsive shadow-sm">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "5%" }}>S.No</th>
              <th>Profile Name</th>
              <th>Is Manager</th>
              <th>Created User</th>
              <th>Created Date</th>
              <th>Updated Date</th>
              <th style={{ width: "10%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-3">
                  No profiles found
                </td>
              </tr>
            ) : (
              profiles.map((p, idx) => (
                <tr key={p.id}>
                  <td>{idx + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.isManager ? "Yes" : "No"}</td>
                  <td>{p.createdUser || "-"}</td>
                  <td>{p.createdDate ? new Date(p.createdDate).toLocaleDateString() : "-"}</td>
                  <td>{p.updatedDate ? new Date(p.updatedDate).toLocaleDateString() : "-"}</td>
                  <td>
                    <i
                      className="bi bi-pencil-square text-primary me-3"
                      role="button"
                      title="Edit"
                      onClick={() => handleEdit(p)}
                    ></i>
                    <i
                      className="bi bi-trash text-danger"
                      role="button"
                      title="Delete"
                      onClick={() => handleDelete(p.id)}
                    ></i>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfileConfiguration;
