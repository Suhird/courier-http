use crate::models::{history::HistoryEntry, request::AppendHistoryPayload};
use crate::storage::fs::{history_file, read_json, write_json};
use uuid::Uuid;

const MAX_HISTORY: usize = 200;

#[tauri::command]
pub fn get_history() -> Result<Vec<HistoryEntry>, String> {
    let path = history_file()?;
    if !path.exists() {
        return Ok(vec![]);
    }
    read_json(&path)
}

#[tauri::command]
pub fn append_history(payload: AppendHistoryPayload) -> Result<HistoryEntry, String> {
    let entry = HistoryEntry {
        id: Uuid::new_v4().to_string(),
        request: payload.request,
        response: payload.response,
        timestamp: chrono::Utc::now().to_rfc3339(),
    };
    let path = history_file()?;
    let mut history: Vec<HistoryEntry> = if path.exists() {
        read_json(&path).unwrap_or_default()
    } else {
        vec![]
    };
    history.insert(0, entry.clone());
    history.truncate(MAX_HISTORY);
    write_json(&path, &history)?;
    Ok(entry)
}

#[tauri::command]
pub fn clear_history() -> Result<(), String> {
    let path = history_file()?;
    write_json(&path, &Vec::<HistoryEntry>::new())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{request::{AuthConfig, RequestConfig}, response::HttpResponse};
    use std::collections::HashMap;

    fn make_payload() -> AppendHistoryPayload {
        AppendHistoryPayload {
            request: RequestConfig {
                method: "GET".into(), url: "https://example.com".into(),
                params: vec![], headers: vec![],
                auth: AuthConfig { r#type: "none".to_string(), bearer: None, basic: None, api_key: None, oauth2: None },
                body_type: "none".into(), body_raw: String::new(), body_form_pairs: vec![],
            },
            response: HttpResponse {
                status: 200, status_text: "OK".into(), headers: HashMap::new(),
                body: "{}".into(), duration_ms: 42, size_bytes: 2,
                timestamp: "2024-01-01T00:00:00Z".into(),
            },
        }
    }

    #[test]
    fn test_history_cap() {
        let mut history: Vec<HistoryEntry> = (0..205).map(|i| HistoryEntry {
            id: i.to_string(), request: make_payload().request,
            response: make_payload().response, timestamp: String::new(),
        }).collect();
        history.truncate(MAX_HISTORY);
        assert_eq!(history.len(), 200);
    }

    #[test]
    fn test_history_at_exact_cap() {
        // Exactly MAX_HISTORY (200) items — truncate must keep all 200
        let mut history: Vec<HistoryEntry> = (0..200).map(|i| HistoryEntry {
            id: i.to_string(),
            request: make_payload().request,
            response: make_payload().response,
            timestamp: String::new(),
        }).collect();
        history.truncate(MAX_HISTORY);
        assert_eq!(history.len(), 200);
    }

    #[test]
    fn test_history_below_cap() {
        // Fewer than MAX_HISTORY items — truncate must leave the count unchanged
        let count = 50;
        let mut history: Vec<HistoryEntry> = (0..count).map(|i| HistoryEntry {
            id: i.to_string(),
            request: make_payload().request,
            response: make_payload().response,
            timestamp: String::new(),
        }).collect();
        history.truncate(MAX_HISTORY);
        assert_eq!(history.len(), count);
    }
}
