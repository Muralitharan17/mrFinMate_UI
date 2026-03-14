import React, { useEffect, useState } from "react";
import axios from "axios";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";
import type { MasterConfig } from "../types/MasterConfig";



const API_BASE = "http://localhost:8080/mrFinMateService";

const MasterConfiguration: React.FC = () => {

    
  const { profileId, month, year } = useProfileMonthYear();
  const [configs, setConfigs] = useState<MasterConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<MasterConfig | null>(null);

  const [form, setForm] = useState<MasterConfig>({
    profileId: 0,
    profileName: "",
    month: null,
    year: null,
    configName: "",
    configValue: "",
    description: "",
  });

  // ✅ Local states for dropdown options (defaults + will be replaced dynamically)
  const [monthOptions, setMonthOptions] = useState<string[]>([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]);
  const [yearOptions, setYearOptions] = useState<string[]>(["2024", "2025", "2026"]);

  // Load all configs for selected profile
  useEffect(() => {
    if (profileId) {
      loadConfigs(profileId);
      setForm((prev) => ({ ...prev, profileId }));
      fetchMonthYearOptions(); // ✅ fetch dynamic dropdowns
    }
  }, [profileId]);

  const loadConfigs = async (pid: number) => {
    try {
      const res = await axios.get(`${API_BASE}/fetchMasterConfig?profileId=${pid}`);
      setConfigs(res.data || []);
    } catch (err) {
      console.error("Failed to load configs:", err);
    }
  };
  
    // ✅ Function to fetch month/year dropdown values dynamically
  const fetchMonthYearOptions = async () => {
    try {
      const fetchConfig = async (configName: string) => {
        const res = await axios.get(`${API_BASE}/value`, {
          params: { profileId, configName , month, year},
        });
        if (res.data) {
          return res.data.split(",").map((v: string) => v.trim());
        }
        return [];
      };

      const months = await fetchConfig("MONTH_OPTIONS");
      if (months.length > 0) setMonthOptions(months);

      const years = await fetchConfig("YEAR_OPTIONS");
      if (years.length > 0) setYearOptions(years);
    } catch (err) {
      console.error("Error fetching month/year options:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSaveOrUpdate = async () => {
    if (!form.configName || !form.configValue) {
      alert("Config Name and Config Value are mandatory.");
      return;
    }

    try {
        await axios.post(`${API_BASE}/saveOrUpdateMasterConfig`, form);
      resetForm();
      loadConfigs(profileId!);
    } catch (err) {
      console.error("Error saving config:", err);
    }
  };

  const handleEdit = (cfg: MasterConfig) => {
    setEditingConfig(cfg);
    setForm({ ...cfg });
  };

  const handleDelete = async (id?: number) => {
    console.log("Deleting config with id:", id);
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this configuration?")) {
      try {
        await axios.delete(`${API_BASE}/deleteMasterConfig`, {
          params: { configId:id},
        });
        loadConfigs(profileId!);
      } catch (err) {
        console.error("Failed to delete config:", err);
      }
    }
  };

  const resetForm = () => {
    setEditingConfig(null);
    setForm({
      profileId: profileId!,
      profileName: "",
      month: null,
      year: null,
      configName: "",
      configValue: "",
      description: "",
    });
  };

  return (
    <div className="container mt-5">
      <h4 className="fw-semibold mb-3">Master Configuration</h4>

      {/* Input Form */}
      <div className="card p-3 shadow-sm mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-2">
            <label className="form-label fw-medium">Month</label>
            <select className="form-select" name="month" value={form.month || ""} onChange={handleChange}>
                <option value="">Select Month</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label fw-medium">Year</label>
            <select className="form-select" name="year" value={form.year || ""} onChange={handleChange}>
                <option value="">Select Year</option>
                    {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-medium">Config Name *</label>
            <input
              type="text"
              className="form-control"
              name="configName"
              value={form.configName}
              onChange={handleChange}
              placeholder="Enter config name"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-medium">Config Value *</label>
            <input
              type="text"
              className="form-control"
              name="configValue"
              value={form.configValue}
              onChange={handleChange}
              placeholder="Enter config value"
            />
          </div>

          <div className="col-md-2 text-end">
            <button
              className="btn btn-primary px-4"
              onClick={handleSaveOrUpdate}
            >
              {editingConfig ? "Update" : "Save"}
            </button>
            {editingConfig && (
              <button
                className="btn btn-secondary ms-2"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="mt-3">
          <label className="form-label fw-medium">Description</label>
          <textarea
            className="form-control"
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            placeholder="Optional: Enter description"
            rows={2}
          ></textarea>
        </div>
      </div>

      {/* Config Table */}
      <div className="table-responsive shadow-sm">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "5%" }}>S.No</th>
              <th>Profile Id</th>
              <th>Month</th>
              <th>Year</th>
              <th>Config Name</th>
              <th>Config Value</th>
              <th>Description</th>
              <th style={{ width: "10%" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {configs.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted py-3">
                  No configurations found
                </td>
              </tr>
            ) : (
              configs.map((cfg, idx) => (
                <tr key={cfg.id}>
                  <td>{idx + 1}</td>
                  <td>{cfg.profileName}</td>
                  <td>{cfg.month || "-"}</td>
                  <td>{cfg.year || "-"}</td>
                  <td>{cfg.configName}</td>
                  <td>{cfg.configValue}</td>
                  <td>{cfg.description || "-"}</td>
                  <td>
                    <i
                      className="bi bi-pencil-square text-primary me-3"
                      role="button"
                      title="Edit"
                      onClick={() => handleEdit(cfg)}
                    ></i>
                    <i
                      className="bi bi-trash text-danger"
                      role="button"
                      title="Delete"
                      onClick={() => handleDelete(cfg.id)}
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

export default MasterConfiguration;
