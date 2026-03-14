import React, { useEffect, useState } from "react";
import axios from "axios";
import type { BudgetConfig } from "../types/Budget";

interface Profile {
  id: number;
  name: string;
}

interface Props {
  show: boolean;
  onClose: () => void;
  onInherit: (config: BudgetConfig) => void;
  targetProfileId: number | null; // the profile into which we will inherit (sent as profileId)
  targetMonth: string;
  targetYear: string;
}

const API_BASE = "http://localhost:8080/mrFinMateService";

const InheritModal: React.FC<Props> = ({ show, onClose, onInherit, targetProfileId, targetMonth, targetYear }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sourceProfileId, setSourceProfileId] = useState<number | "">("");
  const [sourceMonth, setSourceMonth] = useState<string>("");
  const [sourceYear, setSourceYear] = useState<string>("");

  const [sourceMonthOptions, setSourceMonthOptions] = useState<string[]>([]);
  const [sourceYearOptions, setSourceYearOptions] = useState<string[]>([]);

  const [targetMonthLocal, setTargetMonthLocal] = useState<string>(targetMonth || "");
  const [targetYearLocal, setTargetYearLocal] = useState<string>(targetYear || "");

  const [loading, setLoading] = useState(false);

  // load profiles when modal opens
  useEffect(() => {
    if (!show) return;
    axios.get(`${API_BASE}/profiles`).then((res) => {
      setProfiles(res.data || []);
      if (res.data && res.data.length) {
        setSourceProfileId(res.data[0].id);
      }
    }).catch((err) => {
      console.error("Failed to load profiles:", err);
    });
  }, [show]);

  // whenever sourceProfileId changes, fetch source month/year options
  useEffect(() => {
    if (!sourceProfileId) {
      setSourceMonthOptions([]);
      setSourceYearOptions([]);
      return;
    }
    const fetch = async () => {
      try {
        const mRes = await axios.get(`${API_BASE}/value`, {
          params: { profileId: sourceProfileId, configName: "MONTH_OPTIONS", month: "", year: "" },
        });
        const yRes = await axios.get(`${API_BASE}/value`, {
          params: { profileId: sourceProfileId, configName: "YEAR_OPTIONS", month: "", year: "" },
        });
        if (mRes.data) setSourceMonthOptions(mRes.data.split(",").map((s: string) => s.trim()));
        if (yRes.data) setSourceYearOptions(yRes.data.split(",").map((s: string) => s.trim()));
      } catch (err) {
        console.error("Error fetching source month/year options:", err);
      }
    };
    fetch();
  }, [sourceProfileId]);

  // fetch target month/year options for the chosen targetProfileId (if available)
  useEffect(() => {
    if (!show || !targetProfileId) return;
    // default target values from props
    setTargetMonthLocal(targetMonth || "");
    setTargetYearLocal(targetYear || "");
  }, [show, targetProfileId, targetMonth, targetYear]);

  const handleInherit = async () => {
    if (!sourceProfileId || !sourceMonth || !sourceYear) {
      alert("Please select source profile, month and year.");
      return;
    }
    if (!targetProfileId) {
      alert("Target profile is not selected (cannot inherit).");
      return;
    }
    if (!targetMonthLocal || !targetYearLocal) {
      alert("Please select target month and year.");
      return;
    }

    try {
      setLoading(true);
      // Call backend POST /inheritConfigurations with RequestParams
      const res = await axios.post(
        `${API_BASE}/inheritConfigurations`,
        null,
        {
          params: {
            profileId: targetProfileId,
            sourceMonth,
            sourceYear,
            targetMonth: targetMonthLocal,
            targetYear: targetYearLocal,
          },
        }
      );

      if (res.data) {
        // backend returns created BudgetConfigDTO (or similar) - pass to parent
        onInherit(res.data);
        alert("Inheritance completed and loaded into UI.");
        onClose();
      } else {
        alert("No data returned from server after inheritance.");
      }
    } catch (err: unknown) {
      console.error("Error during inheritance:", err);
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : "Error during inheritance";
      alert(msg || "Error during inheritance");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-md">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Inherit Configuration</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Source selection */}
            <div className="mb-3">
              <label className="form-label fw-medium">Source Profile</label>
              <select className="form-select" value={sourceProfileId} onChange={(e) => setSourceProfileId(Number(e.target.value))}>
                <option value="">Select Source Profile</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="row g-2">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-medium">Source Month</label>
                <select className="form-select" value={sourceMonth} onChange={(e) => setSourceMonth(e.target.value)}>
                  <option value="">Select Month</option>
                  {sourceMonthOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-medium">Source Year</label>
                <select className="form-select" value={sourceYear} onChange={(e) => setSourceYear(e.target.value)}>
                  <option value="">Select Year</option>
                  {sourceYearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <hr />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleInherit} disabled={loading}>
              {loading ? "Inheriting..." : "Inherit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InheritModal;
