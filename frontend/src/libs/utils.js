function getLanguageName(languageId) {
  const LANGUAGE_NAMES = {
    50: "C",
    54: "C++",
    60: "Go",
    73: "Rust",
    74: "TypeScript",
    63: "JavaScript",
    71: "Python",
    62: "Java",
  };
  return LANGUAGE_NAMES[languageId] || "Unknown";
}

export { getLanguageName };


export function getLanguageId(language) {
  const normalized = String(language || "").trim().toUpperCase();
  const languageMap = {
    "C": 50,
    "C++": 54,
    "CPP": 54,
    "GO": 60,
    "RUST": 73,
    "TS": 74,
    "TYPESCRIPT": 74,
    "JS": 63,
    "PYTHON": 71,
    "JAVASCRIPT": 63,
    "JAVA": 62,
  };
  return languageMap[normalized];
}
export function getMonacoLanguage(lang) {
  const langMap = {
    'javascript': 'javascript',
    'JAVASCRIPT': 'javascript',
    'python': 'python',
    'PYTHON': 'python',
    'java': 'java',
    'JAVA': 'java',
    'cpp': 'cpp',
    'CPP': 'cpp',
    'C++': 'cpp',
  };
  return langMap[lang] || 'plaintext';
}
