import 'package:flutter/material.dart';
import '../widgets/card_widget.dart';
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
  bool _isLoading = false;
  final CardService _cardService = CardService();
  final AuthService _authService = AuthService();

  @override
  void initState() {
    super.initState();
    _loadCards();
  }

  Future<void> _loadCards() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final cards = await _cardService.getCards();
      if (!mounted) return;

      setState(() {
        _cards.clear();
        _cards.addAll(cards);
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

  Future<void> _addNewCard() async {
    String title = '';
    String description = '';

    final result = await showDialog<Map<String, String>>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add New Card'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: const InputDecoration(labelText: 'Title'),
              onChanged: (value) => title = value,
            ),
            TextField(
              decoration: const InputDecoration(labelText: 'Description'),
              onChanged: (value) => description = value,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, {
              'title': title,
              'description': description,
            }),
            child: const Text('Add'),
          ),
        ],
      ),
    );

    if (result != null) {
      try {
        await _cardService.createCard(
          result['title'] ?? '',
          result['description'] ?? '',
        );
        _loadCards(); // Reload the cards list
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error creating card: ${e.toString()}')),
        );
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
        title: const Text('Cards'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Colors.blue, Colors.lightBlueAccent],
          ),
        ),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Colors.white))
            : _cards.isEmpty
                ? const Center(
                    child: Text(
                      'No cards found.\nAdd your first card!',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _cards.length,
                    itemBuilder: (context, index) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: CardWidget(card: _cards[index]),
                      );
                    },
                  ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addNewCard,
        child: const Icon(Icons.add),
      ),
    );
  }
}