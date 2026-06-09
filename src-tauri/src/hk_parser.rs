use std::collections::HashMap;

#[derive(Debug, Clone)]
pub enum HkValue {
    String(String),
    Number(f64),
    Bool(bool),
    Array(Vec<HkValue>),
    Map(HashMap<String, HkValue>),
}

impl HkValue {
    pub fn as_str(&self) -> Option<&str> {
        match self { HkValue::String(s) => Some(s.as_str()), _ => None }
    }
    pub fn as_f64(&self) -> Option<f64> {
        match self { HkValue::Number(n) => Some(*n), _ => None }
    }
    pub fn as_bool(&self) -> Option<bool> {
        match self { HkValue::Bool(b) => Some(*b), _ => None }
    }
    pub fn as_array(&self) -> Option<&Vec<HkValue>> {
        match self { HkValue::Array(a) => Some(a), _ => None }
    }
    pub fn as_map(&self) -> Option<&HashMap<String, HkValue>> {
        match self { HkValue::Map(m) => Some(m), _ => None }
    }
}

pub type HkSection = HashMap<String, HkValue>;
pub type HkConfig  = HashMap<String, HkSection>;

/// Parsuje string formatu .hk → HkConfig
pub fn parse_hk(input: &str) -> HkConfig {
    let mut config: HkConfig = HashMap::new();
    let mut current_section = String::from("global");
    // Stack: (depth, key) dla map inline
    let mut map_stack: Vec<(usize, String)> = Vec::new();

    for line in input.lines() {
        let trimmed = line.trim();

        // Pusta linia lub komentarz
        if trimmed.is_empty() || trimmed.starts_with('!') {
            continue;
        }

        // Sekcja [nazwa]
        if trimmed.starts_with('[') && trimmed.ends_with(']') {
            current_section = trimmed[1..trimmed.len()-1].trim().to_string();
            map_stack.clear();
            config.entry(current_section.clone()).or_default();
            continue;
        }

        // Klucze z -> / --> / --->
        if let Some(rest) = trimmed.strip_prefix("->") {
            // Policz głębokość (dodatkowe '-')
            let mut depth = 1usize;
            let mut s = rest;
            while s.starts_with('-') {
                depth += 1;
                s = &s[1..];
            }
            // Teraz s powinno zaczynać się od '>'
            let s = s.strip_prefix('>').unwrap_or(s).trim();

            // Rozdziel klucz => wartość
            if let Some(eq_pos) = s.find("=>") {
                let key_raw = s[..eq_pos].trim().to_string();
                let val_raw = s[eq_pos+2..].trim().to_string();
                let value   = parse_value(&val_raw);

                // Truncate stack do depth-1
                map_stack.truncate(depth - 1);

                let section = config.entry(current_section.clone()).or_default();

                if map_stack.is_empty() {
                    // klucze z kropką
                    insert_dotted(section, &key_raw, value);
                } else {
                    // Zagnieżdżony w mapach
                    insert_nested(section, &map_stack, &key_raw, value);
                }
            } else {
                // Mapa inline (bez =>)
                let key_raw = s.trim().to_string();
                map_stack.truncate(depth - 1);
                map_stack.push((depth, key_raw.clone()));

                // Upewnij się że mapa istnieje
                let section = config.entry(current_section.clone()).or_default();
                ensure_map_path(section, &map_stack[..map_stack.len()-1], &key_raw);
            }
        }
    }

    config
}

/// Parsuje wartość: bool, number, array, lub string
fn parse_value(raw: &str) -> HkValue {
    let r = raw.trim();

    // Bool
    if r.eq_ignore_ascii_case("true")  { return HkValue::Bool(true);  }
    if r.eq_ignore_ascii_case("false") { return HkValue::Bool(false); }

    // Number
    if let Ok(n) = r.parse::<f64>() { return HkValue::Number(n); }

    // Array [...]
    if r.starts_with('[') && r.ends_with(']') {
        let inner = &r[1..r.len()-1];
        let elems = split_array(inner);
        let values: Vec<HkValue> = elems.iter().map(|e| parse_value(e.trim())).collect();
        return HkValue::Array(values);
    }

    // String (z cudzysłowami lub bez)
    if r.starts_with('"') && r.ends_with('"') {
        let unquoted = &r[1..r.len()-1];
        return HkValue::String(unescape(unquoted));
    }

    HkValue::String(r.to_string())
}

fn split_array(s: &str) -> Vec<&str> {
    let mut parts = Vec::new();
    let mut depth = 0i32;
    let mut start = 0;
    let bytes = s.as_bytes();
    let mut in_str = false;

    for (i, &b) in bytes.iter().enumerate() {
        match b {
            b'"' => in_str = !in_str,
            b'[' if !in_str => depth += 1,
            b']' if !in_str => depth -= 1,
            b',' if !in_str && depth == 0 => {
                parts.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    if start < s.len() { parts.push(&s[start..]); }
    parts
}

fn unescape(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '\\' {
            match chars.next() {
                Some('n')  => out.push('\n'),
                Some('t')  => out.push('\t'),
                Some('r')  => out.push('\r'),
                Some('"')  => out.push('"'),
                Some('\\') => out.push('\\'),
                Some(c)    => { out.push('\\'); out.push(c); }
                None       => out.push('\\'),
            }
        } else {
            out.push(c);
        }
    }
    out
}

/// Wstawia wartość pod kluczem z kropkami (a.b.c)
fn insert_dotted(section: &mut HkSection, key: &str, value: HkValue) {
    let parts: Vec<&str> = key.split('.').collect();
    if parts.len() == 1 {
        section.insert(key.to_string(), value);
        return;
    }
    // Idź przez mapy tworząc je po drodze
    let first = parts[0].to_string();
    let entry = section.entry(first).or_insert_with(|| HkValue::Map(HashMap::new()));
    insert_deep(entry, &parts[1..], value);
}

fn insert_deep(val: &mut HkValue, path: &[&str], value: HkValue) {
    if path.is_empty() { return; }
    if let HkValue::Map(m) = val {
        if path.len() == 1 {
            m.insert(path[0].to_string(), value);
        } else {
            let e = m.entry(path[0].to_string())
                .or_insert_with(|| HkValue::Map(HashMap::new()));
            insert_deep(e, &path[1..], value);
        }
    }
}

/// Wstaw wartość zagnieżdżoną zgodnie ze stosem map
fn insert_nested(
    section: &mut HkSection,
    stack: &[(usize, String)],
    key: &str,
    value: HkValue,
) {
    if stack.is_empty() {
        section.insert(key.to_string(), value);
        return;
    }
    let root_key = &stack[0].1;
    let entry = section.entry(root_key.clone())
        .or_insert_with(|| HkValue::Map(HashMap::new()));
    insert_nested_deep(entry, &stack[1..], key, value);
}

fn insert_nested_deep(
    val: &mut HkValue,
    stack: &[(usize, String)],
    key: &str,
    value: HkValue,
) {
    if let HkValue::Map(m) = val {
        if stack.is_empty() {
            insert_dotted_into_map(m, key, value);
        } else {
            let e = m.entry(stack[0].1.clone())
                .or_insert_with(|| HkValue::Map(HashMap::new()));
            insert_nested_deep(e, &stack[1..], key, value);
        }
    }
}

fn insert_dotted_into_map(m: &mut HashMap<String, HkValue>, key: &str, value: HkValue) {
    let parts: Vec<&str> = key.split('.').collect();
    if parts.len() == 1 {
        m.insert(key.to_string(), value);
        return;
    }
    let e = m.entry(parts[0].to_string())
        .or_insert_with(|| HkValue::Map(HashMap::new()));
    insert_deep(e, &parts[1..], value);
}

fn ensure_map_path(
    section: &mut HkSection,
    parent_stack: &[(usize, String)],
    key: &str,
) {
    if parent_stack.is_empty() {
        section.entry(key.to_string())
            .or_insert_with(|| HkValue::Map(HashMap::new()));
        return;
    }
    let root = &parent_stack[0].1;
    let entry = section.entry(root.clone())
        .or_insert_with(|| HkValue::Map(HashMap::new()));
    ensure_map_deep(entry, &parent_stack[1..], key);
}

fn ensure_map_deep(val: &mut HkValue, stack: &[(usize, String)], key: &str) {
    if let HkValue::Map(m) = val {
        if stack.is_empty() {
            m.entry(key.to_string())
                .or_insert_with(|| HkValue::Map(HashMap::new()));
        } else {
            let e = m.entry(stack[0].1.clone())
                .or_insert_with(|| HkValue::Map(HashMap::new()));
            ensure_map_deep(e, &stack[1..], key);
        }
    }
}

/// Serializuje HkConfig z powrotem do formatu .hk
pub fn serialize_hk(config: &HkConfig) -> String {
    let mut out = String::new();
    for (section, keys) in config {
        out.push_str(&format!("[{}]\n", section));
        for (k, v) in keys {
            serialize_value(&mut out, k, v, 1);
        }
        out.push('\n');
    }
    out
}

fn serialize_value(out: &mut String, key: &str, val: &HkValue, depth: usize) {
    let prefix = "-".repeat(depth) + ">";
    match val {
        HkValue::Map(m) => {
            out.push_str(&format!("{} {}\n", prefix, key));
            for (k, v) in m {
                serialize_value(out, k, v, depth + 1);
            }
        }
        HkValue::Array(arr) => {
            let elems: Vec<String> = arr.iter().map(|v| format_val(v)).collect();
            out.push_str(&format!("{} {} => [{}]\n", prefix, key, elems.join(", ")));
        }
        other => {
            out.push_str(&format!("{} {} => {}\n", prefix, key, format_val(other)));
        }
    }
}

fn format_val(v: &HkValue) -> String {
    match v {
        HkValue::String(s) => {
            if s.contains(' ') || s.contains('"') {
                format!("\"{}\"", s.replace('\\', "\\\\").replace('"', "\\\""))
            } else {
                s.clone()
            }
        }
        HkValue::Number(n) => {
            if n.fract() == 0.0 { format!("{}", *n as i64) } else { format!("{}", n) }
        }
        HkValue::Bool(b) => b.to_string(),
        HkValue::Array(arr) => {
            let elems: Vec<String> = arr.iter().map(format_val).collect();
            format!("[{}]", elems.join(", "))
        }
        HkValue::Map(_) => "{}".to_string(),
    }
}
