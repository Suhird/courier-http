use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct HttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub duration_ms: u128,
    pub size_bytes: usize,
    pub timestamp: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    fn make_response() -> HttpResponse {
        let mut headers = HashMap::new();
        headers.insert("content-type".to_string(), "application/json".to_string());
        headers.insert("x-request-id".to_string(), "abc-123".to_string());
        HttpResponse {
            status: 200,
            status_text: "OK".to_string(),
            headers,
            body: r#"{"hello":"world"}"#.to_string(),
            duration_ms: 123,
            size_bytes: 17,
            timestamp: "2024-06-01T12:00:00Z".to_string(),
        }
    }

    #[test]
    fn test_http_response_roundtrip() {
        let resp = make_response();
        let json = serde_json::to_string(&resp).unwrap();
        let back: HttpResponse = serde_json::from_str(&json).unwrap();
        assert_eq!(back.status, 200);
        assert_eq!(back.status_text, "OK");
        assert_eq!(back.body, r#"{"hello":"world"}"#);
        assert_eq!(back.duration_ms, 123);
        assert_eq!(back.size_bytes, 17);
        assert_eq!(back.timestamp, "2024-06-01T12:00:00Z");
        assert_eq!(back.headers["content-type"], "application/json");
        assert_eq!(back.headers["x-request-id"], "abc-123");
    }

    #[test]
    fn test_http_response_camel_case_keys() {
        let resp = make_response();
        let json = serde_json::to_string(&resp).unwrap();
        // status_text → statusText
        assert!(json.contains("\"statusText\""));
        // duration_ms → durationMs
        assert!(json.contains("\"durationMs\""));
        // size_bytes → sizeBytes
        assert!(json.contains("\"sizeBytes\""));
        // Verify the snake_case versions are NOT present as JSON keys
        assert!(!json.contains("\"status_text\""));
        assert!(!json.contains("\"duration_ms\""));
        assert!(!json.contains("\"size_bytes\""));
    }

    #[test]
    fn test_http_response_headers_roundtrip() {
        let mut headers = HashMap::new();
        headers.insert("cache-control".to_string(), "no-cache".to_string());
        headers.insert("transfer-encoding".to_string(), "chunked".to_string());
        let resp = HttpResponse {
            status: 304,
            status_text: "Not Modified".to_string(),
            headers,
            body: String::new(),
            duration_ms: 50,
            size_bytes: 0,
            timestamp: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_string(&resp).unwrap();
        let back: HttpResponse = serde_json::from_str(&json).unwrap();
        assert_eq!(back.headers.len(), 2);
        assert_eq!(back.headers["cache-control"], "no-cache");
        assert_eq!(back.headers["transfer-encoding"], "chunked");
    }

    #[test]
    fn test_http_response_camel_case_deserialization() {
        // Verify that camelCase JSON keys deserialize correctly into Rust fields
        let json = r#"{
            "status": 404,
            "statusText": "Not Found",
            "headers": {},
            "body": "missing",
            "durationMs": 99,
            "sizeBytes": 7,
            "timestamp": "2024-03-01T00:00:00Z"
        }"#;
        let resp: HttpResponse = serde_json::from_str(json).unwrap();
        assert_eq!(resp.status, 404);
        assert_eq!(resp.status_text, "Not Found");
        assert_eq!(resp.duration_ms, 99);
        assert_eq!(resp.size_bytes, 7);
    }
}
