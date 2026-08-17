-- PostgreSQL Schema for Japanese Knowledge Graph (Normalized)
-- Designed for Nihongo Bridge Enterprise ETL Engine

-- 1. JMdict (Dictionary Entries & Senses)
CREATE TABLE IF NOT EXISTS jmdict_entries (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER UNIQUE NOT NULL, -- JMdict ent_seq
    kanji VARCHAR(256),
    reading VARCHAR(256) NOT NULL,
    is_common BOOLEAN DEFAULT false,
    frequency_rank INTEGER
);

CREATE TABLE IF NOT EXISTS jmdict_senses (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES jmdict_entries(entry_id) ON DELETE CASCADE,
    parts_of_speech TEXT[], -- e.g., ["noun", "verb"]
    glosses TEXT[] NOT NULL -- e.g., ["sun", "day"]
);

-- 2. KANJIDIC2 (Kanji Characters, Readings, Meanings)
CREATE TABLE IF NOT EXISTS kanjidic_characters (
    id SERIAL PRIMARY KEY,
    character VARCHAR(16) UNIQUE NOT NULL,
    stroke_count INTEGER,
    grade INTEGER,
    frequency INTEGER,
    onyomi TEXT[],
    kunyomi TEXT[],
    meanings TEXT[]
);

-- 3. JMnedict (Proper Names)
CREATE TABLE IF NOT EXISTS jmnedict_names (
    id SERIAL PRIMARY KEY,
    name_id INTEGER UNIQUE NOT NULL, -- JMnedict seq
    kanji VARCHAR(256),
    reading VARCHAR(256) NOT NULL,
    type VARCHAR(128), -- e.g., place, person, product
    translation TEXT NOT NULL
);

-- 4. Tatoeba (Sentences & Bilingual Translations)
CREATE TABLE IF NOT EXISTS tatoeba_sentences (
    id SERIAL PRIMARY KEY,
    sentence_id INTEGER UNIQUE NOT NULL,
    japanese VARCHAR(2048) NOT NULL,
    english VARCHAR(2048) NOT NULL,
    difficulty VARCHAR(12) DEFAULT 'N5'
);

-- 5. UniDic (Morphological Analysis Data)
CREATE TABLE IF NOT EXISTS unidic_morphemes (
    id SERIAL PRIMARY KEY,
    surface VARCHAR(256) NOT NULL,
    lemma VARCHAR(256) NOT NULL,
    reading VARCHAR(256),
    part_of_speech TEXT[]
);

-- 6. JMDictFurigana (Furigana segmentations)
CREATE TABLE IF NOT EXISTS jmdict_furigana (
    id SERIAL PRIMARY KEY,
    word VARCHAR(256) NOT NULL,
    reading VARCHAR(256) NOT NULL,
    furigana_markup JSONB NOT NULL -- e.g., [{"text": "日", "ruby": "ひ"}]
);

-- 7. KanjiVG (Stroke Order Vector Paths)
CREATE TABLE IF NOT EXISTS kanjivg_strokes (
    id SERIAL PRIMARY KEY,
    character VARCHAR(16) UNIQUE NOT NULL,
    svg_data TEXT NOT NULL
);

-- 8. Pitch Accent
CREATE TABLE IF NOT EXISTS pitch_accents (
    id SERIAL PRIMARY KEY,
    word VARCHAR(256) NOT NULL,
    reading VARCHAR(256) NOT NULL,
    pitch_pattern VARCHAR(64) NOT NULL -- e.g., "0", "1"
);

-- 9. Frequency Lists
CREATE TABLE IF NOT EXISTS word_frequencies (
    id SERIAL PRIMARY KEY,
    word VARCHAR(256) NOT NULL,
    frequency_rank INTEGER NOT NULL,
    source VARCHAR(128) NOT NULL -- e.g., "wikipedia", "asahi"
);

-- 10. Grammar & JLPT Matrix
CREATE TABLE IF NOT EXISTS grammar_matrix (
    id SERIAL PRIMARY KEY,
    pattern VARCHAR(256) NOT NULL,
    meaning TEXT NOT NULL,
    explanation TEXT NOT NULL,
    jlpt_level VARCHAR(12) NOT NULL, -- e.g., "N5", "N4"
    examples JSONB DEFAULT '[]' -- e.g., [{"ja": "日本に行きたい", "en": "I want to go to Japan"}]
);
