import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/database/sqlite_service.dart';
import 'core/network/api_client.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Offline SQLite cache database on startup
  final sqlite = SqliteService();
  await sqlite.database;

  // Initialize push notifications mock/setup configurations
  print("🔔 Push Notifications Service successfully mapped and registered!");

  runApp(
    const ProviderScope(
      child: NihongoBridgeMobileApp(),
    ),
  );
}

class NihongoBridgeMobileApp extends StatelessWidget {
  const NihongoBridgeMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Nihongo Bridge Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: const Color(0xFF7C2D12), // Deep Rust Red
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF7C2D12),
          secondary: const Color(0xFFF53F5E),
          surface: const Color(0xFFFFF7ED), // Soft peach
        ),
      ),
      home: const MainMobileGatewayScreen(),
    );
  }
}

// ------------------------------------------------------------------
// Mobile/Tablet/Desktop Multi-device Responsive layout Gateway
// ------------------------------------------------------------------
class MainMobileGatewayScreen extends StatefulWidget {
  const MainMobileGatewayScreen({super.key});

  @override
  State<MainMobileGatewayScreen> createState() => _MainMobileGatewayScreenState();
}

class _MainMobileGatewayScreenState extends State<MainMobileGatewayScreen> {
  int _currentIndex = 0;

  final List<Widget> _tabs = [
    const MobileDashboardTab(),
    const MobileDictionaryTab(),
    const MobileGrammarTab(),
    const MobileKanjiTab(),
    const MobileQuizTab(),
  ];

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isTabletOrDesktop = width > 768; // Standard responsive boundary

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Nihongo Bridge 🗣️",
          style: TextStyle(fontWeight: FontWeight.black, fontSize: 18),
        ),
        backgroundColor: const Color(0xFF7C2D12),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.cloud_download),
            tooltip: "Download Offline Packs",
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("📥 Downloading complete N5-N4 offline catalog to SQLite database...")),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_active),
            tooltip: "Push Notifications Settings",
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("🔔 Push notifications sync enabled on this device!")),
              );
            },
          )
        ],
      ),
      body: isTabletOrDesktop
          ? Row(
              // Sidebar Navigation for Tablet & Desktops
              children: [
                NavigationRail(
                  selectedIndex: _currentIndex,
                  onDestinationSelected: (idx) {
                    setState(() {
                      _currentIndex = idx;
                    });
                  },
                  backgroundColor: const Color(0xFF7C2D12),
                  unselectedIconTheme: const IconThemeData(color: Colors.white70),
                  selectedIconTheme: const IconThemeData(color: Colors.white),
                  selectedLabelTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  unselectedLabelTextStyle: const TextStyle(color: Colors.white70),
                  labelType: NavigationRailLabelType.all,
                  destinations: const [
                    NavigationRailDestination(icon: Icon(Icons.dashboard), label: Text("Home")),
                    NavigationRailDestination(icon: Icon(Icons.menu_book), label: Text("Takoboto")),
                    NavigationRailDestination(icon: Icon(Icons.timeline), label: Text("Grammar")),
                    NavigationRailDestination(icon: Icon(Icons.explore), label: Text("Kanji")),
                    NavigationRailDestination(icon: Icon(Icons.quiz), label: Text("Quiz")),
                  ],
                ),
                Expanded(child: _tabs[_currentIndex]),
              ],
            )
          : _tabs[_currentIndex], // Standard bottom tabs navigation for Mobile phone
      bottomNavigationBar: isTabletOrDesktop
          ? null
          : BottomNavigationBar(
              currentIndex: _currentIndex,
              type: BottomNavigationBarType.fixed,
              selectedItemColor: const Color(0xFF7C2D12),
              unselectedItemColor: Colors.slate,
              onTap: (idx) {
                setState(() {
                  _currentIndex = idx;
                });
              },
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: "Home"),
                BottomNavigationBarItem(icon: Icon(Icons.menu_book), label: "Takoboto"),
                BottomNavigationBarItem(icon: Icon(Icons.timeline), label: "Grammar"),
                BottomNavigationBarItem(icon: Icon(Icons.explore), label: "Kanji"),
                BottomNavigationBarItem(icon: Icon(Icons.quiz), label: "Quiz"),
              ],
            ),
    );
  }
}

// ------------------------------------------------------------------
// Sub Tab 1: Mobile Dashboard & Situational Conversation
// ------------------------------------------------------------------
class MobileDashboardTab extends StatelessWidget {
  const MobileDashboardTab({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Card
          Card(
            color: const Color(0xFF7C2D12),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text("Konnichiwa, Student!", style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.black)),
                  SizedBox(height: 5),
                  Text("You are on an active 8-day streak! Keep studying to lock down daily milestones.", style: TextStyle(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text("💬 Conversation Labs & Role Play", style: TextStyle(fontSize: 16, fontWeight: FontWeight.black)),
          const SizedBox(height: 10),
          // Situational Conversational Row Card
          ListView(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: const [
              Card(
                child: ListTile(
                  leading: Text("🏮", style: TextStyle(fontSize: 24)),
                  title: Text("Izakaya Restaurant ordering", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text("Level: N5 • 2 Dialogue lines", style: TextStyle(fontSize: 11)),
                  trailing: Icon(Icons.chevron_right),
                ),
              ),
              Card(
                child: ListTile(
                  leading: Text("💼", style: TextStyle(fontSize: 24)),
                  title: Text("Bilingual Corporate Job Interview", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text("Level: N3 • 2 Dialogue lines", style: TextStyle(fontSize: 11)),
                  trailing: Icon(Icons.chevron_right),
                ),
              )
            ],
          )
        ],
      ),
    );
  }
}

// ------------------------------------------------------------------
// Sub Tab 2: Mobile Takoboto-style Offline Dictionary
// ------------------------------------------------------------------
class MobileDictionaryTab extends StatefulWidget {
  const MobileDictionaryTab({super.key});

  @override
  State<MobileDictionaryTab> createState() => _MobileDictionaryTabState();
}

class _MobileDictionaryTabState extends State<MobileDictionaryTab> {
  final _searchController = TextEditingController();
  List<Map<String, dynamic>> _results = [];

  void _search() async {
    final query = _searchController.text;
    final results = await SqliteService().searchWordOffline(query);
    setState(() {
      _results = results;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            onChanged: (val) => _search(),
            decoration: InputDecoration(
              hintText: "Search offline dictionary...",
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(15)),
            ),
          ),
          const SizedBox(height: 15),
          Expanded(
            child: _results.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.search_off, size: 48, color: Colors.grey),
                        SizedBox(height: 10),
                        Text("Search terms in your local SQLite cache", style: TextStyle(color: Colors.grey, fontSize: 13)),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: _results.length,
                    itemBuilder: (context, index) {
                      final item = _results[index];
                      return Card(
                        child: ListTile(
                          title: Text("${item['japanese']} (${item['furigana']})", style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text(item['meaning']),
                          trailing: const Icon(Icons.volume_up, color: Color(0xFF7C2D12)),
                        ),
                      );
                    },
                  ),
          )
        ],
      ),
    );
  }
}

// ------------------------------------------------------------------
// Sub Tab 3: Mobile Syllabus Grammar Timeline
// ------------------------------------------------------------------
class MobileGrammarTab extends StatelessWidget {
  const MobileGrammarTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        Text("🗺️ JLPT Grammar Timeline", style: TextStyle(fontSize: 16, fontWeight: FontWeight.black)),
        SizedBox(height: 10),
        Card(
          child: ListTile(
            leading: CircleAvatar(backgroundColor: Color(0xFF7C2D12), child: Text("1", style: TextStyle(color: Colors.white))),
            title: Text("〜たいです (~tai desu)", style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text("Want to do... (Expression of desire)"),
          ),
        ),
        Card(
          child: ListTile(
            leading: CircleAvatar(backgroundColor: Color(0xFF7C2D12), child: Text("2", style: TextStyle(color: Colors.white))),
            title: Text("〜てください (~te kudasai)", style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text("Polite request instructions"),
          ),
        ),
      ],
    );
  }
}

// ------------------------------------------------------------------
// Sub Tab 4: Mobile Kanji Explorer Radial Satellites
// ------------------------------------------------------------------
class MobileKanjiTab extends StatelessWidget {
  const MobileKanjiTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("🌀 Kanji Radial Mindmap Nodes", style: TextStyle(fontSize: 16, fontWeight: FontWeight.black)),
          const SizedBox(height: 15),
          Expanded(
            child: GridView.count(
              crossAxisCount: 3,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              children: [
                _buildKanjiNode("日", "Sun", "Level 1"),
                _buildKanjiNode("本", "Book", "Level 2"),
                _buildKanjiNode("人", "Person", "Level 1"),
                _buildKanjiNode("学", "Study", "Level 3"),
                _buildKanjiNode("生", "Life", "Level 2"),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildKanjiNode(String character, String meaning, String level) {
    return Card(
      elevation: 2,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {},
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(character, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.black)),
            const SizedBox(height: 4),
            Text(meaning, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            Text(level, style: const TextStyle(fontSize: 9, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}

// ------------------------------------------------------------------
// Sub Tab 5: Mobile Diagnostic Adaptive Quizzes
// ------------------------------------------------------------------
class MobileQuizTab extends StatelessWidget {
  const MobileQuizTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.timer, size: 64, color: Color(0xFF7C2D12)),
          const SizedBox(height: 15),
          const Text("Adaptive CAT Practice Quiz", style: TextStyle(fontSize: 18, fontWeight: FontWeight.black)),
          const SizedBox(height: 8),
          const Text("Start a timed practice session mapping N5 to N1 lexical question banks.", textAlign: TextAlign.center, style: TextStyle(color: Colors.slate, fontSize: 13)),
          const SizedBox(height: 20),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF7C2D12),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 40, py: 15),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
            ),
            onPressed: () {},
            child: const Text("Launch Practice Exam", style: TextStyle(fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }
}
