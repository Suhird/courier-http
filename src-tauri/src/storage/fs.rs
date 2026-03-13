use std::fs;
use std::path::PathBuf;
use dirs::data_dir;

pub fn app_data_dir() -> Result<PathBuf, String> {
    let base = data_dir().ok_or("Cannot find data directory")?;
    let dir = base.join("courier-http");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

pub fn collections_dir() -> Result<PathBuf, String> {
    let dir = app_data_dir()?.join("collections");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

pub fn environments_dir() -> Result<PathBuf, String> {
    let dir = app_data_dir()?.join("environments");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

pub fn history_file() -> Result<PathBuf, String> {
    Ok(app_data_dir()?.join("history.json"))
}

pub fn read_json<T: serde::de::DeserializeOwned>(path: &PathBuf) -> Result<T, String> {
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

pub fn write_json<T: serde::Serialize>(path: &PathBuf, value: &T) -> Result<(), String> {
    let content = serde_json::to_string_pretty(value).map_err(|e| e.to_string())?;
    let tmp = path.with_extension("tmp");
    fs::write(&tmp, content).map_err(|e| e.to_string())?;
    fs::rename(&tmp, path).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_write_and_read_json() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("test.json");
        let data = vec!["hello", "world"];
        write_json(&path, &data).unwrap();
        let result: Vec<String> = read_json(&path).unwrap();
        assert_eq!(result, vec!["hello", "world"]);
    }

    #[test]
    fn test_write_json_is_atomic() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("data.json");
        write_json(&path, &42u32).unwrap();
        assert!(!path.with_extension("tmp").exists());
    }

    #[test]
    fn test_read_json_nonexistent() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("does_not_exist.json");
        let result: Result<Vec<String>, String> = read_json(&path);
        assert!(result.is_err());
    }

    #[test]
    fn test_read_json_malformed() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("bad.json");
        std::fs::write(&path, b"{ not valid json !!!").unwrap();
        let result: Result<serde_json::Value, String> = read_json(&path);
        assert!(result.is_err());
    }

    #[test]
    fn test_write_read_struct() {
        #[derive(serde::Serialize, serde::Deserialize, PartialEq, Debug)]
        struct MyData {
            name: String,
            count: u32,
        }
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("data.json");
        let original = MyData { name: "courier".to_string(), count: 42 };
        write_json(&path, &original).unwrap();
        let read_back: MyData = read_json(&path).unwrap();
        assert_eq!(read_back, original);
    }

    #[test]
    fn test_read_json_type_mismatch() {
        let tmp = TempDir::new().unwrap();
        let path = tmp.path().join("number.json");
        // Write a number, try to read as Vec<String>
        write_json(&path, &123u32).unwrap();
        let result: Result<Vec<String>, String> = read_json(&path);
        assert!(result.is_err());
    }
}
