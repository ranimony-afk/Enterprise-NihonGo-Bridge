import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';

class SqliteService {
  static final SqliteService _instance = SqliteService._internal();
  factory SqliteService() => _instance;
  SqliteService._internal();

  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final documentsDirectory = await getApplicationDocumentsDirectory();
    final path = join(documentsDirectory.path, "nihongobridge_offline.db");

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        // Create Dictionary Table (Offline cache)
        await db.execute('''
          CREATE TABLE IF NOT EXISTS dictionary_cache (
            id INTEGER PRIMARY KEY,
            japanese TEXT NOT NULL,
            furigana TEXT,
            romaji TEXT,
            meaning TEXT NOT NULL,
            jlpt_level TEXT,
            category TEXT,
            pitch_accent TEXT,
            synonyms TEXT,
            antonyms TEXT
          )
        ''');

        // Create Kanji Table
        await db.execute('''
          CREATE TABLE IF NOT EXISTS kanji_cache (
            id INTEGER PRIMARY KEY,
            kanji TEXT UNIQUE NOT NULL,
            meaning TEXT NOT NULL,
            onyomi TEXT,
            kunyomi TEXT,
            stroke_count INTEGER,
            radicals TEXT,
            rtk_index TEXT,
            wanikani_level TEXT
          )
        ''');

        // Create Grammar Table
        await db.execute('''
          CREATE TABLE IF NOT EXISTS grammar_cache (
            id INTEGER PRIMARY KEY,
            pattern TEXT UNIQUE NOT NULL,
            meaning TEXT NOT NULL,
            explanation TEXT NOT NULL,
            structure TEXT,
            jlpt_level TEXT
          )
        ''');

        // Create User Session Cache
        await db.execute('''
          CREATE TABLE IF NOT EXISTS user_session (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          )
        ''');
      },
    );
  }

  // Helper inserts and searches
  Future<void> cacheWord(Map<String, dynamic> word) async {
    final db = await database;
    await db.insert('dictionary_cache', word, conflictAlgorithm: ConflictConflictAlgorithm.replace);
  }

  Future<List<Map<String, dynamic>>> searchWordOffline(String query) async {
    final db = await database;
    return await db.query(
      'dictionary_cache',
      where: 'japanese LIKE ? OR meaning LIKE ?',
      whereArgs: ['%$query%', '%$query%'],
    );
  }

  Future<void> cacheKanji(Map<String, dynamic> kanji) async {
    final db = await database;
    await db.insert('kanji_cache', kanji, conflictAlgorithm: ConflictConflictAlgorithm.replace);
  }

  Future<List<Map<String, dynamic>>> fetchAllKanjiOffline() async {
    final db = await database;
    return await db.query('kanji_cache');
  }

  Future<void> saveSessionToken(String token) async {
    final db = await database;
    await db.insert(
      'user_session',
      {'key': 'jwt_token', 'value': token},
      conflictAlgorithm: ConflictConflictAlgorithm.replace,
    );
  }

  Future<String?> getSessionToken() async {
    final db = await database;
    final results = await db.query('user_session', where: 'key = ?', whereArgs: ['jwt_token']);
    if (results.isNotEmpty) {
      return results.first['value'] as String;
    }
    return null;
  }
}

// Emulated conflict algorithms
enum ConflictConflictAlgorithm {
  replace,
  ignore,
  fail
}
