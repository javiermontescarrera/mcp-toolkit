import { useEffect, useState } from "react";
import { api, Mcp, McpConfig, EnvVar, ImportPreview } from "../api";

function McpCatalog() {
  const [mcps, setMcps] = useState<Mcp[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingMcp, setEditingMcp] = useState<Mcp | null>(null);
  const [name, setName] = useState("");
  const [mcpType, setMcpType] = useState<"Docker" | "Binary" | "Http">("Binary");
  const [dockerImage, setDockerImage] = useState("");
  const [binaryPath, setBinaryPath] = useState("");
  const [httpUrl, setHttpUrl] = useState("");
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [jsonInput, setJsonInput] = useState("");
  const [importPreviews, setImportPreviews] = useState<ImportPreview[]>([]);

  useEffect(() => {
    loadMcps();
  }, []);

  const loadMcps = async () => {
    const data = await api.listMcps();
    setMcps(data);
  };

  const handleCreate = async () => {
    try {
      const config: McpConfig = {
        docker_image: mcpType === "Docker" ? dockerImage : undefined,
        binary_path: mcpType === "Binary" ? binaryPath : undefined,
        http_url: mcpType === "Http" ? httpUrl : undefined,
        command: undefined,
        args: [],
        env_vars: envVars,
      };
      await api.createMcp(name, mcpType, config);
      resetForm();
      loadMcps();
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  const handleUpdate = async () => {
    if (!editingMcp) return;
    try {
      const config: McpConfig = {
        docker_image: mcpType === "Docker" ? dockerImage : undefined,
        binary_path: mcpType === "Binary" ? binaryPath : undefined,
        http_url: mcpType === "Http" ? httpUrl : undefined,
        command: undefined,
        args: [],
        env_vars: envVars,
      };
      await api.updateMcp({ ...editingMcp, name, mcp_type: mcpType, config });
      resetForm();
      loadMcps();
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this MCP?")) return;
    try {
      await api.deleteMcp(id);
      loadMcps();
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  const handleEdit = (mcp: Mcp) => {
    setEditingMcp(mcp);
    setName(mcp.name);
    setMcpType(mcp.mcp_type);
    setDockerImage(mcp.config.docker_image || "");
    setBinaryPath(mcp.config.binary_path || "");
    setHttpUrl(mcp.config.http_url || "");
    setEnvVars(mcp.config.env_vars || []);
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingMcp(null);
    setName("");
    setMcpType("Binary");
    setDockerImage("");
    setBinaryPath("");
    setHttpUrl("");
    setEnvVars([]);
  };

  const handleParseJson = async () => {
    try {
      const previews = await api.parseMcpJson(jsonInput);
      setImportPreviews(previews);
    } catch (error) {
      alert(`Error parsing JSON: ${error}`);
    }
  };

  const handleImportJson = async () => {
    try {
      await api.importMcpsFromJson(jsonInput);
      setShowImportModal(false);
      setJsonInput("");
      setImportPreviews([]);
      loadMcps();
    } catch (error) {
      alert(`Error importing MCPs: ${error}`);
    }
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "", is_secret: false }]);
  };

  const updateEnvVar = (index: number, field: keyof EnvVar, value: string | boolean) => {
    const updated = [...envVars];
    updated[index] = { ...updated[index], [field]: value };
    setEnvVars(updated);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>MCP Catalog</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="secondary" onClick={() => setShowImportModal(true)}>Import JSON</button>
          <button onClick={() => setShowModal(true)}>Add MCP</button>
        </div>
      </div>

      <div>
        {mcps.map((mcp) => (
          <div key={mcp.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>{mcp.name}</h3>
                <span className="badge success">{mcp.mcp_type}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="secondary" onClick={() => handleEdit(mcp)}>Edit</button>
                <button className="danger" onClick={() => handleDelete(mcp.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingMcp ? "Edit MCP" : "Add MCP"}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            <div className="form-group">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="MCP Name" />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={mcpType} onChange={(e) => setMcpType(e.target.value as any)}>
                <option value="Docker">Docker</option>
                <option value="Binary">Binary</option>
                <option value="Http">Http</option>
              </select>
            </div>
            {mcpType === "Docker" && (
              <div className="form-group">
                <label>Docker Image</label>
                <input value={dockerImage} onChange={(e) => setDockerImage(e.target.value)} placeholder="image:tag" />
              </div>
            )}
            {mcpType === "Binary" && (
              <div className="form-group">
                <label>Binary Path</label>
                <input value={binaryPath} onChange={(e) => setBinaryPath(e.target.value)} placeholder="/path/to/binary" />
              </div>
            )}
            {mcpType === "Http" && (
              <div className="form-group">
                <label>HTTP URL</label>
                <input value={httpUrl} onChange={(e) => setHttpUrl(e.target.value)} placeholder="http://localhost:8080" />
              </div>
            )}
            <div className="form-group">
              <label>Environment Variables</label>
              {envVars.map((envVar, index) => (
                <div key={index} style={{ marginBottom: 10, padding: 10, backgroundColor: "#1a1a1a", borderRadius: 5 }}>
                  <input
                    value={envVar.key}
                    onChange={(e) => updateEnvVar(index, "key", e.target.value)}
                    placeholder="Key"
                    style={{ marginBottom: 5 }}
                  />
                  <input
                    value={envVar.value}
                    onChange={(e) => updateEnvVar(index, "value", e.target.value)}
                    placeholder="Value"
                    style={{ marginBottom: 5 }}
                  />
                  <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <input
                      type="checkbox"
                      checked={envVar.is_secret}
                      onChange={(e) => updateEnvVar(index, "is_secret", e.target.checked)}
                    />
                    Is Secret
                  </label>
                  <button className="danger" onClick={() => removeEnvVar(index)} style={{ marginTop: 5 }}>
                    Remove
                  </button>
                </div>
              ))}
              <button onClick={addEnvVar} style={{ marginTop: 10 }}>Add Env Var</button>
            </div>
            <div className="button-group">
              <button onClick={editingMcp ? handleUpdate : handleCreate}>
                {editingMcp ? "Update" : "Create"}
              </button>
              <button className="secondary" onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Import MCPs from JSON</h2>
              <button className="close-btn" onClick={() => setShowImportModal(false)}>×</button>
            </div>
            <div className="form-group">
              <label>Paste MCP JSON Configuration</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`{\n  "mcpServers": {\n    "server-name": {\n      "command": "executable",\n      "args": ["arg1"],\n      "env": { "KEY": "value" }\n    }\n  }\n}`}
                rows={12}
                style={{ fontFamily: "monospace", fontSize: 12 }}
              />
            </div>
            {importPreviews.length > 0 && (
              <div style={{ marginTop: 15, padding: 15, backgroundColor: "#1a1a1a", borderRadius: 5 }}>
                <h3 style={{ fontSize: 14, marginBottom: 10 }}>Preview ({importPreviews.length} MCPs)</h3>
                {importPreviews.map((preview, idx) => (
                  <div key={idx} style={{ marginBottom: 8, fontSize: 13 }}>
                    <strong>{preview.name}</strong>
                    <span className="badge success" style={{ marginLeft: 8 }}>{preview.mcp_type}</span>
                    <div style={{ color: "#888", fontSize: 11, marginTop: 3 }}>
                      {preview.command} {preview.args.join(" ")}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="button-group">
              {importPreviews.length === 0 ? (
                <button onClick={handleParseJson}>Parse JSON</button>
              ) : (
                <button onClick={handleImportJson}>Import {importPreviews.length} MCP(s)</button>
              )}
              <button className="secondary" onClick={() => setShowImportModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default McpCatalog;
