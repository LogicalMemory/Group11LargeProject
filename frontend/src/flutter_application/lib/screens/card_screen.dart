import 'package:flutter/material.dart';
import 'package:flutter_application/widgets/gradient_text.dart';
import 'package:flutter_application/widgets/outline_button.dart';
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
  String _viewFilter = 'mine'; // 'mine' or 'all'
  final Map<String, TextEditingController> _commentControllers = {};
  String? _currentUserId;
  String? _currentUserName;

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
    _loadCards();
    _searchController.addListener(_filterCards);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _titleController.dispose();
    _descriptionController.dispose();
    for (var controller in _commentControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _loadUserInfo() async {
    // Load current user info from auth service
    final userInfo = await _authService.getCurrentUser();
    setState(() {
      _currentUserId = userInfo?['userId']?.toString();
      _currentUserName =
          '${userInfo?['firstName'] ?? ''} ${userInfo?['lastName'] ?? ''}'
              .trim();
    });
  }

  void _filterCards() {
    setState(() {
      List<CardModel> baseCards = _cards;

      // Apply view filterF
      if (_viewFilter == 'mine' && _currentUserId != null) {
        baseCards = _cards
            .where(
              (card) =>
                  card.ownerId?.toString() == _currentUserId ||
                  card.userId == _currentUserId,
            )
            .toList();
      }

      // Apply search filter
      if (_searchController.text.isEmpty) {
        _filteredCards.clear();
        _filteredCards.addAll(baseCards);
      } else {
        _filteredCards.clear();
        _filteredCards.addAll(
          baseCards.where(
            (card) =>
                card.title.toLowerCase().contains(
                  _searchController.text.toLowerCase(),
                ) ||
                card.description.toLowerCase().contains(
                  _searchController.text.toLowerCase(),
                ) ||
                (card.location?.toLowerCase().contains(
                      _searchController.text.toLowerCase(),
                    ) ??
                    false),
          ),
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
        _filterCards();
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

    _filterCards();
    setState(() => _searchMessage = 'Card(s) have been retrieved');
  }

  void _clearSearch() {
    _searchController.clear();
    setState(() => _searchMessage = '');
  }

  Future<void> _addNewCard() async {
    _titleController.clear();
    _descriptionController.clear();
    final timeController = TextEditingController();
    final durationController = TextEditingController(text: '60');
    final locationController = TextEditingController();

  final result = await showDialog<Map<String, String>>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Add New Event'),
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
            const SizedBox(height: 16),
            TextField(
              controller: timeController,
              decoration: const InputDecoration(
                labelText: 'Event Time (ISO format, optional)',
                border: OutlineInputBorder(),
                hintText: '2024-12-01T19:00:00',
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: durationController,
              decoration: const InputDecoration(
                labelText: 'Duration (minutes)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: locationController,
              decoration: const InputDecoration(
                labelText: 'Location',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
      ),
      actions: [
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            OutlinedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            const SizedBox(width: 12),
            GradientButton(
              onPressed: () => Navigator.pop(context, {
                'title': _titleController.text,
                'description': _descriptionController.text,
                'time': timeController.text,
                'duration': durationController.text,
                'location': locationController.text,
              }),
              child: const Text('Add'),
            ),
          ],
        ),
      ],
    ),
  );

    if (result != null && result['title']!.isNotEmpty) {
      try {
        await _cardService.createCard(
          result['title'] ?? '',
          result['description'] ?? '',
          time: result['time']?.isNotEmpty == true ? result['time'] : null,
          duration: result['duration'],
          location: result['location'],
        );
        if (!mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Card has been added')));
        _loadCards();
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error creating card: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _editCard(CardModel card) async {
    final isOwner =
        card.ownerId?.toString() == _currentUserId ||
        card.userId == _currentUserId;
    if (!isOwner) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You can only edit cards you created')),
      );
      return;
    }

    _titleController.text = card.title;
    _descriptionController.text = card.description;
    final timeController = TextEditingController(
      text: card.date.toIso8601String(),
    );
    final durationController = TextEditingController(
      text: card.eventDuration ?? '60',
    );
    final locationController = TextEditingController(text: card.location ?? '');

    final result = await showDialog<Map<String, String>>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Card'),
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
              const SizedBox(height: 16),
              TextField(
                controller: timeController,
                decoration: const InputDecoration(
                  labelText: 'Event Time (ISO format or leave empty)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: durationController,
                decoration: const InputDecoration(
                  labelText: 'Duration (minutes)',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: locationController,
                decoration: const InputDecoration(
                  labelText: 'Location',
                  border: OutlineInputBorder(),
                ),
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
              'time': timeController.text,
              'duration': durationController.text,
              'location': locationController.text,
            }),
            child: const Text('Update'),
          ),
        ],
      ),
    );

    if (result != null && result['title']!.isNotEmpty) {
      try {
        await _cardService.updateCard({
          'eventId': card.id,
          'eventTitle': result['title'],
          'eventDescription': result['description'],
          'eventTime': result['time'],
          'eventDuration': result['duration'],
          'eventLocation': result['location'],
        });
        if (!mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Card updated')));
        _loadCards();
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error updating card: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _deleteCard(CardModel card) async {
    final isOwner =
        card.ownerId?.toString() == _currentUserId ||
        card.userId == _currentUserId;
    if (!isOwner) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You can only delete events you created')),
      );
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Card'),
        content: Text('Delete "${card.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await _cardService.deleteCard(card.id);
        if (!mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Card deleted')));
        _loadCards();
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error deleting card: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _toggleLike(CardModel card) async {
    try {
      await _cardService.toggleLike(card.id);
      _loadCards(); // Refresh to get updated like count
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating like: ${e.toString()}')),
      );
    }
  }

  Future<void> _addComment(CardModel card) async {
    final controller = _commentControllers[card.id];
    if (controller == null || controller.text.trim().isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please enter a comment')));
      return;
    }

    try {
      await _cardService.addComment(card.id, controller.text.trim());
      controller.clear();
      _loadCards(); // Refresh to get updated comments
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error posting comment: ${e.toString()}')),
      );
    }
  }

  Future<void> _logout() async {
    await _authService.logout();
    if (!mounted) return;

    Navigator.of(
      context,
    ).pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen()));
  }

  String _formatDateTime(DateTime? dateTime) {
    if (dateTime == null) return 'Date TBA';
    try {
      final weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      final months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return '${weekdays[dateTime.weekday - 1]}, ${months[dateTime.month - 1]} ${dateTime.day}, ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateTime.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    final upcomingCards = _filteredCards.where((card) {
      return card.date.isAfter(DateTime.now());
    }).toList();

    final ownedCount = _currentUserId != null
        ? _cards
              .where(
                (card) =>
                    card.ownerId?.toString() == _currentUserId ||
                    card.userId == _currentUserId,
              )
              .length
        : 0;

    /*
        NAVIGAION BAR
    */
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text(
              'Loop',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(width: 6),
            GradientText(
              text: 'U',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
            ),
          ],
        ),

        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        actions: [
          IconButton(icon: const Icon(Icons.logout), onPressed: _logout),
        ],
      ),


      /*
          LISTING STATS
      */
      body: Container(
        color: const Color(0xFFF5F5F7),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : CustomScrollView(
                slivers: [

                  // spacer
                  const SliverToBoxAdapter(child: SizedBox(height: 16)),

                  /*
                    ADDING AN EVENT
                  */
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Container(
                        padding: const EdgeInsets.all(16),
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
                        child: Row(
                          children: [
                            const Expanded(
                              child: Text(
                                'Plan Something New:',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            SizedBox(
                              height: 36,
                              child: GradientButton(
                                onPressed: _addNewCard,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                                child: Row(
                                  children: const [
                                    Icon(
                                      Icons.add,
                                      size: 16,
                                      color: Colors.white,
                                    ),
                                    SizedBox(width: 8),
                                    Text(
                                      'Add',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // spacer
                  const SliverToBoxAdapter(child: SizedBox(height: 16)),

                  // Stats Section
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Expanded(
                            child: _buildStatCard('Total Events', _cards.length),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildStatCard('Owned Events', ownedCount),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildStatCard(
                              'Upcoming Events',
                              upcomingCards.length,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),


                  /*
                    SEARCHING FOR AN EVENT
                  */
                  SliverToBoxAdapter(
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16),
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
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _searchController,
                                  decoration: InputDecoration(
                                    hintText:
                                        'Search for events',
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
                                height: 48,
                                child: GradientButton(
                                  onPressed: _searchCards,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 18,
                                    vertical: 10,
                                  ),
                                  child: const Text(
                                    'Search',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          // View Filter Toggle
                          Container(
                            decoration: BoxDecoration(
                              color: Colors.grey[100],
                              borderRadius: BorderRadius.circular(20),
                            ),
                            padding: const EdgeInsets.all(4),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                _buildFilterButton('My events', 'mine'),
                                _buildFilterButton('All events', 'all'),
                              ],
                            ),
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
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 16)),
                  // Cards List
                  if (_filteredCards.isEmpty)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Container(
                          padding: const EdgeInsets.all(32),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: Colors.grey[300]!,
                              style: BorderStyle.solid,
                            ),
                          ),
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
                                  'No events found.\nAdd your first event!',
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
                      ),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate((context, index) {
                          final card = _filteredCards[index];
                          final isOwner =
                              card.ownerId?.toString() == _currentUserId ||
                              card.userId == _currentUserId;
                          final likes = card.likes ?? 0;
                          final likedByMe =
                              card.likedBy?.any(
                                (id) => id.toString() == _currentUserId,
                              ) ??
                              false;
                          final comments = card.comments ?? [];

                          // Ensure comment controller exists
                          _commentControllers.putIfAbsent(
                            card.id,
                            () => TextEditingController(),
                          );

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: Container(
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
                                  // Card Header
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            const SizedBox(height: 4),
                                            Text(
                                              card.title,
                                              style: const TextStyle(
                                                fontSize: 18,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              card.description,
                                              style: TextStyle(
                                                fontSize: 14,
                                                color: Colors.grey[600],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (isOwner) ...[
                                        const SizedBox(width: 8),
                                        OutlinedButton(
                                          onPressed: () => _editCard(card),
                                          style: OutlinedButton.styleFrom(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 12,
                                              vertical: 8,
                                            ),
                                            minimumSize: const Size(0, 32),
                                          ),
                                          child: const Text(
                                            'Edit',
                                            style: TextStyle(fontSize: 12),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        OutlinedButton(
                                          onPressed: () => _deleteCard(card),
                                          style: OutlinedButton.styleFrom(
                                            foregroundColor: Colors.red,
                                            side: const BorderSide(
                                              color: Colors.red,
                                            ),
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 12,
                                              vertical: 8,
                                            ),
                                            minimumSize: const Size(0, 32),
                                          ),
                                          child: const Text(
                                            'Delete',
                                            style: TextStyle(fontSize: 12),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                  // Event Details
                                  const SizedBox(height: 12),
                                  Wrap(
                                    spacing: 8,
                                    runSpacing: 8,
                                    children: [
                                      _buildBadge(
                                        _formatDateTime(card.date),
                                        Colors.orange[50]!,
                                        const Color(0xFFFF7A18),
                                      ),
                                      if (card.eventDuration != null)
                                        _buildBadge(
                                          '${card.eventDuration} mins',
                                          Colors.purple[50]!,
                                          const Color(0xFF7B2FFF),
                                        ),
                                      if (card.location != null &&
                                          card.location!.isNotEmpty)
                                        _buildBadge(
                                          card.location!,
                                          Colors.grey[100]!,
                                          Colors.grey[600]!,
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  // Like and Comment Count
                                  Row(
                                    children: [
                                      InkWell(
                                        onTap: () => _toggleLike(card),
                                        borderRadius: BorderRadius.circular(20),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 12,
                                            vertical: 6,
                                          ),
                                          decoration: BoxDecoration(
                                            gradient: likedByMe
                                                ? const LinearGradient(
                                                    colors: [
                                                      Color(0xFFFF7A18),
                                                      Color(0xFFFF2D55),
                                                      Color(0xFF7B2FFF),
                                                    ],
                                                  )
                                                : null,
                                            color: likedByMe
                                                ? null
                                                : Colors.grey[200],
                                            borderRadius: BorderRadius.circular(
                                              20,
                                            ),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Text(
                                                '❤️',
                                                style: TextStyle(fontSize: 12),
                                              ),
                                              const SizedBox(width: 4),
                                              Text(
                                                '$likes',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w600,
                                                  color: likedByMe
                                                      ? Colors.white
                                                      : Colors.grey[700],
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.grey[200],
                                          borderRadius: BorderRadius.circular(
                                            20,
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            const Text(
                                              '💬',
                                              style: TextStyle(fontSize: 12),
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              '${comments.length}',
                                              style: TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600,
                                                color: Colors.grey[700],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  // Comments Section
                                  if (comments.isNotEmpty) ...[
                                    const SizedBox(height: 12),
                                    ...comments
                                        .take(3)
                                        .map(
                                          (comment) => Container(
                                            margin: const EdgeInsets.only(
                                              bottom: 8,
                                            ),
                                            padding: const EdgeInsets.all(12),
                                            decoration: BoxDecoration(
                                              color: Colors.grey[50],
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  comment.authorName ??
                                                      'Anonymous',
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  comment.text ?? '',
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                  ),
                                                ),
                                                if (comment.createdAt !=
                                                    null) ...[
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    _formatDateTime(
                                                      DateTime.tryParse(
                                                        comment.createdAt!,
                                                      ),
                                                    ),
                                                    style: TextStyle(
                                                      fontSize: 10,
                                                      color: Colors.grey[400],
                                                    ),
                                                  ),
                                                ],
                                              ],
                                            ),
                                          ),
                                        ),
                                  ],
                                  // Add Comment
                                  const SizedBox(height: 12),
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      border: Border.all(
                                        color: Colors.grey[300]!,
                                      ),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Column(
                                      children: [
                                        TextField(
                                          controller:
                                              _commentControllers[card.id],
                                          decoration: const InputDecoration(
                                            hintText: 'Add a comment',
                                            border: OutlineInputBorder(),
                                            contentPadding:
                                                EdgeInsets.symmetric(
                                                  horizontal: 12,
                                                  vertical: 8,
                                                ),
                                            isDense: true,
                                          ),
                                          style: const TextStyle(fontSize: 12),
                                        ),
                                        const SizedBox(height: 8),
                                        SizedBox(
                                          width: double.infinity,
                                          child: GradientButton(
                                            onPressed: () => _addComment(card),
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 10,
                                            ),
                                            child: const Text(
                                              'Post comment',
                                              style: TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }, childCount: _filteredCards.length),
                      ),
                    ),
                  const SliverToBoxAdapter(child: SizedBox(height: 20)),
                ],
              ),
      ),
    );
  }

  Widget _buildStatCard(String label, int value) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[100]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 10,
              color: Colors.grey[400],
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '$value',
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterButton(String label, String value) {
    final isSelected = _viewFilter == value;
    return InkWell(
      onTap: () {
        setState(() {
          _viewFilter = value;
          _filterCards();
        });
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.black : Colors.grey[600],
          ),
        ),
      ),
    );
  }

  Widget _buildBadge(String text, Color bgColor, Color textColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }
}
