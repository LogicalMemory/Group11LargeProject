import 'package:flutter/material.dart';
import '../widgets/card_widget.dart';
import '../widgets/gradient_button.dart';
import '../models/card_model.dart';
import '../services/card_service.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';

class CardScreen extends StatefulWidget {
  const CardScreen({super.key});

  @override
  State<CardScreen> createState() => _CardScreenState();
}

class _CardScreenState extends State<CardScreen> {
  final List<CardModel> _cards = [];
  final List<CardModel> _filteredCards = [];
  bool _isLoading = false;
  final CardService _cardService = CardService();
  final AuthService _authService = AuthService();
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  String _searchMessage = '';

  @override
  void initState() {
    super.initState();
    _loadCards();
    _searchController.addListener(_filterCards);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _filterCards() {
    setState(() {
      if (_searchController.text.isEmpty) {
        _filteredCards.clear();
        _filteredCards.addAll(_cards);
      } else {
        _filteredCards.clear();
        _filteredCards.addAll(
          _cards.where((card) =>
              card.title.toLowerCase().contains(_searchController.text.toLowerCase()) ||
              card.description.toLowerCase().contains(_searchController.text.toLowerCase())),
        );
      }
    });
  }

  Future<void> _loadCards() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _searchMessage = '';
    });

    try {
      final cards = await _cardService.getCards();
      if (!mounted) return;

      setState(() {
        _cards.clear();
        _cards.addAll(cards);
        _filteredCards.clear();
        _filteredCards.addAll(cards);
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading cards: ${e.toString()}')),
      );
    }
  }

  Future<void> _searchCards() async {
    if (_searchController.text.isEmpty) {
      setState(() => _searchMessage = 'Please enter a search term');
      return;
    }

    try {
      _filterCards();
      setState(() => _searchMessage = 'Card(s) have been retrieved');
    } catch (e) {
      if (!mounted) return;
      setState(() => _searchMessage = 'Error searching cards: ${e.toString()}');
    }
  }

  Future<void> _addNewCard() async {
    _titleController.clear();
    _descriptionController.clear();

    final result = await showDialog<Map<String, String>>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add New Card'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Title',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, {
              'title': _titleController.text,
              'description': _descriptionController.text,
            }),
            child: const Text('Add'),
          ),
        ],
      ),
    );

    if (result != null && result['title']!.isNotEmpty) {
      try {
        await _cardService.createCard(
          result['title'] ?? '',
          result['description'] ?? '',
        );
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Card has been added')));
        _loadCards();
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error creating card: ${e.toString()}')));
      }
    }
  }

  Future<void> _logout() async {
    await _authService.logout();
    if (!mounted) return;

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('LoopU - Cards'),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
      ),
      body: Container(
        color: const Color(0xFFFAFAFA),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Search Section
                          Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.05),
                                  blurRadius: 10,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Search Cards',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black87,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextField(
                                        controller: _searchController,
                                        decoration: InputDecoration(
                                          hintText: 'Card To Search For',
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          contentPadding: const EdgeInsets.symmetric(
                                            horizontal: 12,
                                            vertical: 12,
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                        SizedBox(
                                          height: 40,
                                          child: GradientButton(
                                            onPressed: _searchCards,
                                            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                                            child: const Text('Search', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                                          ),
                                        ),
                                  ],
                                ),
                                if (_searchMessage.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 12),
                                    child: Text(
                                      _searchMessage,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        color: Colors.green,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                          const SizedBox(height: 20),
                          // Cards List Header with compact Add button
                          Row(
                            children: [
                              const Expanded(
                                child: Text(
                                  'Your Cards',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black87,
                                  ),
                                ),
                              ),
                              SizedBox(
                                height: 36,
                                child: GradientButton(
                                  onPressed: _addNewCard,
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  child: Row(
                                    children: const [
                                      Icon(Icons.add, size: 16, color: Colors.white),
                                      SizedBox(width: 8),
                                      Text('Add', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Cards List
                  if (_filteredCards.isEmpty)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.inbox,
                                size: 48,
                                color: Colors.grey[300],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'No cards found.\nAdd your first card!',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: CardWidget(card: _filteredCards[index]),
                            );
                          },
                          childCount: _filteredCards.length,
                        ),
                      ),
                    ),
                  SliverToBoxAdapter(
                    child: SizedBox(height: 20),
                  ),
                ],
              ),
      ),
    );
  }
}