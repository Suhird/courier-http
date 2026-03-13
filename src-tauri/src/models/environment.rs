use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EnvVariable {
    pub id: String,
    pub key: String,
    pub value: String,
    pub enabled: bool,
    #[serde(default)]
    pub secret: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Environment {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub variables: Vec<EnvVariable>,
    #[serde(default)]
    pub created_at: String,
    #[serde(default)]
    pub updated_at: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_env_variable(id: &str, key: &str, value: &str, secret: bool) -> EnvVariable {
        EnvVariable {
            id: id.to_string(),
            key: key.to_string(),
            value: value.to_string(),
            enabled: true,
            secret,
        }
    }

    // ---- EnvVariable ----

    #[test]
    fn test_env_variable_roundtrip() {
        let v = make_env_variable("v1", "API_BASE_URL", "https://api.example.com", false);
        let json = serde_json::to_string(&v).unwrap();
        let back: EnvVariable = serde_json::from_str(&json).unwrap();
        assert_eq!(back.id, "v1");
        assert_eq!(back.key, "API_BASE_URL");
        assert_eq!(back.value, "https://api.example.com");
        assert!(back.enabled);
        assert!(!back.secret);
    }

    #[test]
    fn test_env_variable_secret_field_present() {
        let v = EnvVariable {
            id: "v2".to_string(),
            key: "SECRET_TOKEN".to_string(),
            value: "s3cr3t".to_string(),
            enabled: true,
            secret: true,
        };
        let json = serde_json::to_string(&v).unwrap();
        // "secret" field must be present in JSON
        assert!(json.contains("\"secret\""));
        assert!(json.contains("true"));
        // "enabled" field must be present
        assert!(json.contains("\"enabled\""));
        let back: EnvVariable = serde_json::from_str(&json).unwrap();
        assert!(back.secret);
        assert!(back.enabled);
    }

    #[test]
    fn test_env_variable_disabled() {
        let v = EnvVariable {
            id: "v3".to_string(),
            key: "OLD_KEY".to_string(),
            value: "old_value".to_string(),
            enabled: false,
            secret: false,
        };
        let json = serde_json::to_string(&v).unwrap();
        let back: EnvVariable = serde_json::from_str(&json).unwrap();
        assert!(!back.enabled);
        assert!(!back.secret);
    }

    // ---- Environment ----

    #[test]
    fn test_environment_roundtrip_with_variables() {
        let env = Environment {
            id: "env-1".to_string(),
            name: "Production".to_string(),
            variables: vec![
                make_env_variable("v1", "BASE_URL", "https://prod.example.com", false),
                make_env_variable("v2", "API_KEY", "prod-key-123", true),
            ],
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-06-15T08:00:00Z".to_string(),
        };
        let json = serde_json::to_string(&env).unwrap();
        let back: Environment = serde_json::from_str(&json).unwrap();
        assert_eq!(back.id, "env-1");
        assert_eq!(back.name, "Production");
        assert_eq!(back.variables.len(), 2);
        assert_eq!(back.variables[0].key, "BASE_URL");
        assert!(!back.variables[0].secret);
        assert_eq!(back.variables[1].key, "API_KEY");
        assert!(back.variables[1].secret);
    }

    #[test]
    fn test_environment_camel_case_timestamps() {
        let env = Environment {
            id: "env-2".to_string(),
            name: "Staging".to_string(),
            variables: vec![],
            created_at: "2024-02-01T00:00:00Z".to_string(),
            updated_at: "2024-03-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_string(&env).unwrap();
        assert!(json.contains("\"createdAt\""));
        assert!(json.contains("\"updatedAt\""));
        assert!(!json.contains("\"created_at\""));
        assert!(!json.contains("\"updated_at\""));
        let v: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(v["createdAt"], "2024-02-01T00:00:00Z");
        assert_eq!(v["updatedAt"], "2024-03-01T00:00:00Z");
    }

    #[test]
    fn test_environment_empty_variables() {
        let env = Environment {
            id: "env-empty".to_string(),
            name: "Empty".to_string(),
            variables: vec![],
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_string(&env).unwrap();
        let back: Environment = serde_json::from_str(&json).unwrap();
        assert!(back.variables.is_empty());
    }
}
