use crate::models::collection::{Collection, CollectionFolder, SavedRequest};
use crate::storage::fs::{collections_dir, read_json, write_json};
use std::fs;

#[tauri::command]
pub fn get_collections() -> Result<Vec<Collection>, String> {
    let dir = collections_dir()?;
    let mut result = Vec::new();
    let entries = fs::read_dir(&dir).map_err(|e| e.to_string())?;
    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("json") {
            if let Ok(c) = read_json::<Collection>(&path) {
                result.push(c);
            }
        }
    }
    Ok(result)
}

#[tauri::command]
pub fn save_collection(collection: Collection) -> Result<(), String> {
    let path = collections_dir()?.join(format!("{}.json", collection.id));
    write_json(&path, &collection)
}

#[tauri::command]
pub fn delete_collection(id: String) -> Result<(), String> {
    let path = collections_dir()?.join(format!("{id}.json"));
    if path.exists() {
        fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn export_collection(id: String) -> Result<String, String> {
    let path = collections_dir()?.join(format!("{id}.json"));
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

fn upsert_request_in_folder(
    folder: &mut CollectionFolder,
    target_id: &str,
    request: SavedRequest,
) -> bool {
    if folder.id == target_id {
        if let Some(pos) = folder.requests.iter().position(|r| r.id == request.id) {
            folder.requests[pos] = request;
        } else {
            folder.requests.push(request);
        }
        return true;
    }
    for f in folder.folders.iter_mut() {
        if upsert_request_in_folder(f, target_id, request.clone()) {
            return true;
        }
    }
    false
}

fn delete_request_in_folder(
    folder: &mut CollectionFolder,
    target_folder_id: &str,
    request_id: &str,
) -> bool {
    if folder.id == target_folder_id {
        folder.requests.retain(|r| r.id != request_id);
        return true;
    }
    for f in folder.folders.iter_mut() {
        if delete_request_in_folder(f, target_folder_id, request_id) {
            return true;
        }
    }
    false
}

#[tauri::command]
pub fn save_request_to_collection(
    collection_id: String,
    folder_id: Option<String>,
    request: SavedRequest,
) -> Result<Collection, String> {
    let path = collections_dir()?.join(format!("{collection_id}.json"));
    let mut collection: Collection = read_json(&path)?;
    match folder_id {
        None => {
            if let Some(pos) = collection.requests.iter().position(|r| r.id == request.id) {
                collection.requests[pos] = request;
            } else {
                collection.requests.push(request);
            }
        }
        Some(fid) => {
            for folder in collection.folders.iter_mut() {
                if upsert_request_in_folder(folder, &fid, request.clone()) {
                    break;
                }
            }
        }
    }
    write_json(&path, &collection)?;
    Ok(collection)
}

#[tauri::command]
pub fn delete_request_from_collection(
    collection_id: String,
    folder_id: Option<String>,
    request_id: String,
) -> Result<Collection, String> {
    let path = collections_dir()?.join(format!("{collection_id}.json"));
    let mut collection: Collection = read_json(&path)?;
    match folder_id {
        None => collection.requests.retain(|r| r.id != request_id),
        Some(fid) => {
            for folder in collection.folders.iter_mut() {
                if delete_request_in_folder(folder, &fid, &request_id) {
                    break;
                }
            }
        }
    }
    write_json(&path, &collection)?;
    Ok(collection)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::request::{AuthConfig, RequestConfig};

    fn make_request(id: &str, name: &str) -> SavedRequest {
        SavedRequest {
            id: id.to_string(),
            name: name.to_string(),
            request: RequestConfig {
                method: "GET".to_string(),
                url: "https://example.com".to_string(),
                params: vec![],
                headers: vec![],
                auth: AuthConfig { r#type: "none".to_string(), bearer: None, basic: None, api_key: None, oauth2: None },
                body_type: "none".to_string(),
                body_raw: String::new(),
                body_form_pairs: vec![],
            },
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        }
    }

    #[test]
    fn test_upsert_request_in_folder() {
        let mut folder = CollectionFolder {
            id: "f1".to_string(),
            name: "Folder".to_string(),
            requests: vec![],
            folders: vec![],
        };
        let req = make_request("r1", "Request 1");
        let found = upsert_request_in_folder(&mut folder, "f1", req.clone());
        assert!(found);
        assert_eq!(folder.requests.len(), 1);
        let found2 = upsert_request_in_folder(&mut folder, "f1", req);
        assert!(found2);
        assert_eq!(folder.requests.len(), 1);
    }

    #[test]
    fn test_delete_request_in_folder() {
        let mut folder = CollectionFolder {
            id: "f1".to_string(),
            name: "Folder".to_string(),
            requests: vec![make_request("r1", "R1")],
            folders: vec![],
        };
        delete_request_in_folder(&mut folder, "f1", "r1");
        assert!(folder.requests.is_empty());
    }

    #[test]
    fn test_upsert_wrong_folder_returns_false() {
        let mut folder = CollectionFolder {
            id: "f1".to_string(),
            name: "Folder".to_string(),
            requests: vec![],
            folders: vec![],
        };
        let req = make_request("r1", "Request 1");
        // Target ID "wrong-id" doesn't match "f1" or any subfolder
        let found = upsert_request_in_folder(&mut folder, "wrong-id", req);
        assert!(!found);
        // Request must NOT have been added
        assert!(folder.requests.is_empty());
    }

    #[test]
    fn test_upsert_in_nested_subfolder() {
        let child = CollectionFolder {
            id: "child".to_string(),
            name: "Child".to_string(),
            requests: vec![],
            folders: vec![],
        };
        let mut parent = CollectionFolder {
            id: "parent".to_string(),
            name: "Parent".to_string(),
            requests: vec![],
            folders: vec![child],
        };
        let req = make_request("r1", "Request 1");
        // Parent doesn't match "child", but child does
        let found = upsert_request_in_folder(&mut parent, "child", req);
        assert!(found);
        // Parent itself has no requests
        assert!(parent.requests.is_empty());
        // Child has the request
        assert_eq!(parent.folders[0].requests.len(), 1);
        assert_eq!(parent.folders[0].requests[0].id, "r1");
    }

    #[test]
    fn test_delete_wrong_folder_returns_false() {
        let mut folder = CollectionFolder {
            id: "f1".to_string(),
            name: "Folder".to_string(),
            requests: vec![make_request("r1", "R1")],
            folders: vec![],
        };
        let found = delete_request_in_folder(&mut folder, "nonexistent-folder", "r1");
        assert!(!found);
        // Request must still be in folder
        assert_eq!(folder.requests.len(), 1);
    }

    #[test]
    fn test_delete_nonexistent_request_is_noop() {
        let mut folder = CollectionFolder {
            id: "f1".to_string(),
            name: "Folder".to_string(),
            requests: vec![make_request("r1", "R1"), make_request("r2", "R2")],
            folders: vec![],
        };
        // "r-ghost" doesn't exist in the folder — should not panic, list unchanged
        delete_request_in_folder(&mut folder, "f1", "r-ghost");
        // Both original requests remain
        assert_eq!(folder.requests.len(), 2);
        assert_eq!(folder.requests[0].id, "r1");
        assert_eq!(folder.requests[1].id, "r2");
    }

    #[test]
    fn test_delete_in_nested_subfolder() {
        let child = CollectionFolder {
            id: "child".to_string(),
            name: "Child".to_string(),
            requests: vec![make_request("r1", "R1"), make_request("r2", "R2")],
            folders: vec![],
        };
        let mut parent = CollectionFolder {
            id: "parent".to_string(),
            name: "Parent".to_string(),
            requests: vec![],
            folders: vec![child],
        };
        let found = delete_request_in_folder(&mut parent, "child", "r1");
        assert!(found);
        // Parent has no requests
        assert!(parent.requests.is_empty());
        // Child has only r2 remaining
        assert_eq!(parent.folders[0].requests.len(), 1);
        assert_eq!(parent.folders[0].requests[0].id, "r2");
    }
}
