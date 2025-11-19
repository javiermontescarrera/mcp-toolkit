import { useEffect, useState } from "react";
import { api, RouterLog } from "../api";

function RouterStatus() {
  const [logs, setLogs] = useState<RouterLog[]>([]);
  const [routerStatus, setRouterStatus] = useState<"ok" | "error">("ok");

  useEffect(() => {
    loadLogs();
    checkRouter();
    const interval = setInterval(() => {
      loadLogs();
      checkRouter();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    try {
      const data = await api.getRecentLogs(50);
      setLogs(data);
    } catch (error) {
      console.error(error);
    }
  };

  const checkRouter = async () => {
    try {
      const response = await fetch("http://127.0.0.1:9876/health");
      if (response.ok) {
        setRouterStatus("ok");
      } else {
        setRouterStatus("error");
      }
    } catch (error) {
      setRouterStatus("error");
    }
  };

  return (
    <div>
      <h1>Router Status</h1>
      <div className="card" style={{ marginBottom: 20 }}>
        <h3>MCP Router</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>Status:</span>
          <span className={`badge ${routerStatus === "ok" ? "success" : "error"}`}>
            {routerStatus === "ok" ? "Running" : "Error"}
          </span>
        </div>
        <p style={{ marginTop: 10, color: "#888" }}>http://127.0.0.1:9876</p>
      </div>

      <h2>Recent Logs</h2>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Tool</th>
            <th>Status</th>
            <th>Duration (ms)</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
              <td>{log.tool_name}</td>
              <td>
                <span className={`badge ${log.status === "success" ? "success" : "error"}`}>
                  {log.status}
                </span>
              </td>
              <td>{log.duration_ms}</td>
              <td style={{ color: log.error ? "#e63946" : "#888" }}>{log.error || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RouterStatus;
