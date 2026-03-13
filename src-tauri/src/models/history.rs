use serde::{Deserialize, Serialize};
use crate::models::{request::RequestConfig, response::HttpResponse};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct HistoryEntry {
    pub id: String,
    pub request: RequestConfig,
    pub response: HttpResponse,
    pub timestamp: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::request::{AuthConfig, RequestConfig};
    use std::collections::HashMap;

    fn make_request_config() -> RequestConfig {
        RequestConfig {
            method: "POST".to_string(),
            url: "https://api.example.com/items".to_string(),
            params: vec![],
            headers: vec![],
            auth: AuthConfig {
                r#type: "none".to_string(),
                bearer: None,
                basic: None,
                api_key: None,
                oauth2: None,
            },
            body_type: "json".to_string(),
            body_raw: r#"{"item":"value"}"#.to_string(),
            body_form_pairs: vec![],
        }
    }

    fn make_http_response() -> HttpResponse {
        let mut headers = HashMap::new();
        headers.insert("content-type".to_string(), "application/json".to_string());
        HttpResponse {
            status: 201,
            status_text: "Created".to_string(),
            headers,
            body: r#"{"id":99}"#.to_string(),
            duration_ms: 75,
            size_bytes: 9,
            timestamp: "2024-06-01T10:00:00Z".to_string(),
        }
    }

    #[test]
    fn test_history_entry_roundtrip() {
        let entry = HistoryEntry {
            id: "entry-1".to_string(),
            request: make_request_config(),
            response: make_http_response(),
            timestamp: "2024-06-01T10:00:00Z".to_string(),
        };
        let json = serde_json::to_string(&entry).unwrap();
        let back: HistoryEntry = serde_json::from_str(&json).unwrap();
        assert_eq!(back.id, "entry-1");
        assert_eq!(back.request.method, "POST");
        assert_eq!(back.request.url, "https://api.example.com/items");
        assert_eq!(back.response.status, 201);
        assert_eq!(back.response.status_text, "Created");
        assert_eq!(back.timestamp, "2024-06-01T10:00:00Z");
    }

    #[test]
    fn test_history_entry_timestamp_field_present() {
        let entry = HistoryEntry {
            id: "entry-2".to_string(),
            request: make_request_config(),
            response: make_http_response(),
            timestamp: "2024-12-25T00:00:00Z".to_string(),
        };
        let json = serde_json::to_string(&entry).unwrap();
        // "timestamp" must appear in the JSON output
        assert!(json.contains("\"timestamp\""));
        assert!(json.contains("2024-12-25T00:00:00Z"));
        let v: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(v["timestamp"], "2024-12-25T00:00:00Z");
    }

    #[test]
    fn test_history_entry_nested_response_camel_case() {
        let entry = HistoryEntry {
            id: "entry-3".to_string(),
            request: make_request_config(),
            response: make_http_response(),
            timestamp: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_string(&entry).unwrap();
        // The nested HttpResponse fields must be camelCase
        assert!(json.contains("\"statusText\""));
        assert!(json.contains("\"durationMs\""));
        assert!(json.contains("\"sizeBytes\""));
    }
}
