use crate::models::*;
use crate::storage::Storage;
use uuid::Uuid;

pub struct BindingManager<'a> {
    storage: &'a Storage,
}

impl<'a> BindingManager<'a> {
    pub fn new(storage: &'a Storage) -> Self {
        BindingManager { storage }
    }

    pub fn activate_mcp(&self, project_id: String, mcp_id: String, overrides: Vec<EnvVar>) -> Result<ProjectMcpBinding, String> {
        let binding = ProjectMcpBinding {
            id: Uuid::new_v4().to_string(),
            project_id,
            mcp_id,
            enabled: true,
            overrides,
        };

        self.storage
            .insert_binding(&binding)
            .map_err(|e| e.to_string())?;

        Ok(binding)
    }

    pub fn list_bindings(&self, project_id: String) -> Result<Vec<ProjectMcpBinding>, String> {
        self.storage
            .get_bindings_by_project(&project_id)
            .map_err(|e| e.to_string())
    }

    pub fn update_binding(&self, binding: ProjectMcpBinding) -> Result<(), String> {
        self.storage
            .update_binding(&binding)
            .map_err(|e| e.to_string())
    }

    pub fn get_active_mcps_for_project(&self, project_id: String) -> Result<Vec<Mcp>, String> {
        let bindings = self.list_bindings(project_id)?;
        let all_mcps = self.storage.get_mcps().map_err(|e| e.to_string())?;

        let active_mcp_ids: Vec<String> = bindings
            .iter()
            .filter(|b| b.enabled)
            .map(|b| b.mcp_id.clone())
            .collect();

        Ok(all_mcps
            .into_iter()
            .filter(|m| active_mcp_ids.contains(&m.id))
            .collect())
    }

    pub fn resolve_config(&self, project_id: String, mcp_id: String) -> Result<Vec<EnvVar>, String> {
        let mcp = self
            .storage
            .get_mcps()
            .map_err(|e| e.to_string())?
            .into_iter()
            .find(|m| m.id == mcp_id)
            .ok_or("MCP not found")?;

        let bindings = self.list_bindings(project_id)?;
        let binding = bindings
            .into_iter()
            .find(|b| b.mcp_id == mcp_id)
            .ok_or("Binding not found")?;

        let mut final_env = mcp.config.env_vars.clone();

        for override_var in binding.overrides {
            if let Some(existing) = final_env.iter_mut().find(|v| v.key == override_var.key) {
                existing.value = override_var.value;
                existing.is_secret = override_var.is_secret;
            } else {
                final_env.push(override_var);
            }
        }

        Ok(final_env)
    }
}
