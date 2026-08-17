#!/usr/bin/env python3
"""
Unit and Integration Tests for Japanese Knowledge Graph ETL Engine
------------------------------------------------------------------
Validates parsing and extraction correctness on actual structural mock files.
"""

import os
import unittest
import tempfile
import json
from etl import ETLPipeline

class TestETLPipeline(unittest.TestCase):
    def setUp(self):
        # Always run in dry-run mode for unit test isolation
        self.pipeline = ETLPipeline(dry_run=True)
        self.temp_files = []

    def tearDown(self):
        # Clean up temporary test files
        for f in self.temp_files:
            if os.path.exists(f):
                os.remove(f)

    def create_temp_file(self, content: str, suffix: str = ".xml") -> str:
        fd, path = tempfile.mkstemp(suffix=suffix)
        with os.fdopen(fd, "w", encoding="utf-8") as tmp:
            tmp.write(content)
        self.temp_files.append(path)
        return path

    def test_jmdict_parsing(self):
        xml_content = """<JMdict>
            <entry>
                <ent_seq>12000</ent_seq>
                <k_ele><keb>日本語</keb></k_ele>
                <r_ele><reb>にほんご</reb></r_ele>
                <sense>
                    <pos>&amp;n;</pos>
                    <gloss>Japanese language</gloss>
                </sense>
            </entry>
        </JMdict>"""
        path = self.create_temp_file(xml_content, ".xml")
        count = self.pipeline.import_jmdict(path)
        self.assertEqual(count, 1, "Should successfully parse one JMdict entry.")

    def test_kanjidic2_parsing(self):
        xml_content = """<kanjidic2>
            <character>
                <literal>水</literal>
                <misc>
                    <stroke_count>4</stroke_count>
                    <grade>1</grade>
                </misc>
                <reading_meaning>
                    <rmgroup>
                        <reading r_type="ja_on">スイ</reading>
                        <reading r_type="ja_kun">みず</reading>
                        <meaning>water</meaning>
                    </rmgroup>
                </reading_meaning>
            </character>
        </kanjidic2>"""
        path = self.create_temp_file(xml_content, ".xml")
        count = self.pipeline.import_kanjidic2(path)
        self.assertEqual(count, 1, "Should successfully parse one KANJIDIC2 character.")

    def test_jmnedict_parsing(self):
        xml_content = """<JMnedict>
            <entry>
                <ent_seq>99011</ent_seq>
                <k_ele><keb>富士山</keb></k_ele>
                <r_ele><reb>ふじさん</reb></r_ele>
                <trans>
                    <name_type>place</name_type>
                    <trans_det>Mount Fuji</trans_det>
                </trans>
            </entry>
        </JMnedict>"""
        path = self.create_temp_file(xml_content, ".xml")
        count = self.pipeline.import_jmnedict(path)
        self.assertEqual(count, 1, "Should successfully parse one JMnedict name entry.")

    def test_tatoeba_parsing(self):
        tsv_content = "100\tお元気ですか。\tHow are you?"
        path = self.create_temp_file(tsv_content, ".tsv")
        count = self.pipeline.import_tatoeba(path)
        self.assertEqual(count, 1, "Should successfully parse one Tatoeba sentence mapping.")

    def test_unidic_parsing(self):
        csv_content = "走る,ハシル,はしる,動詞-自立"
        path = self.create_temp_file(csv_content, ".csv")
        count = self.pipeline.import_unidic(path)
        self.assertEqual(count, 1, "Should successfully parse one UniDic row.")

    def test_jmdict_furigana_parsing(self):
        data = [
            {
                "word": "食べる",
                "reading": "たべる",
                "furigana": [{"text": "食", "ruby": "た"}]
            }
        ]
        path = self.create_temp_file(json.dumps(data), ".json")
        count = self.pipeline.import_jmdict_furigana(path)
        self.assertEqual(count, 1, "Should successfully parse JMDictFurigana records.")

    def test_pitch_accent_parsing(self):
        data = [
            {"word": "青い", "reading": "あおい", "pattern": "2"}
        ]
        path = self.create_temp_file(json.dumps(data), ".json")
        count = self.pipeline.import_pitch_accent(path)
        self.assertEqual(count, 1, "Should successfully parse Pitch Accent elements.")

    def test_grammar_and_jlpt_parsing(self):
        data = [
            {
                "pattern": "〜ている",
                "meaning": "is doing",
                "explanation": "Expresses ongoing continuous action.",
                "jlpt_level": "N5",
                "examples": [{"ja": "走っている。", "en": "He is running."}]
            }
        ]
        path = self.create_temp_file(json.dumps(data), ".json")
        count = self.pipeline.import_grammar_and_jlpt(path)
        self.assertEqual(count, 1, "Should successfully parse grammar matrices.")

if __name__ == "__main__":
    unittest.main()
