use crate::models::environment::Environment;
use crate::storage::fs::{environments_dir, read_json, write_json};
use std::fs;

#[tauri::command]
pub fn get_environments() -> Result<Vec<Environment>, String> {
    let dir = environments_dir()?;
    let mut result = Vec::new();
    for entry in fs::read_dir(&dir).map_err(|e| e.to_string())?.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("json") {
            if let Ok(env) = read_json::<Environment>(&path) {
                result.push(env);
            }
        }
    }
    Ok(result)
}

#[tauri::command]
pub fn save_environment(environment: Environment) -> Result<(), String> {
    let path = environments_dir()?.join(format!("{}.json", environment.id));
    write_json(&path, &environment)
}

#[tauri::command]
pub fn delete_environment(id: String) -> Result<(), String> {
    let path = environments_dir()?.join(format!("{id}.json"));
    if path.exists() {
        fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    Ok(())
}
