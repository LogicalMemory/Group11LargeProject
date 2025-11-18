import 'package:flutter/material.dart';
import '../widgets/gradient_text.dart';
import '../widgets/add_event_section.dart';
import '../widgets/stats_section.dart';
import '../widgets/search_section.dart';
import '../widgets/empty_state.dart';
import '../widgets/card_item.dart';
import '../models/card_model.dart';
import '../services/card_service.dart';
import '../services/auth_service.dart';
import '../services/card_actions.dart';
import '../services/notification_service.dart';
import '../dialogs/add_card_dialog.dart';
import '../dialogs/edit_card_dialog.dart';
import '../utils/calendar_helper.dart';
import '../utils/snackbar_helper.dart';
import '../widgets/profile_image_section.dart';

class CardScreen extends StatefulWidget {
  const CardScreen({super.key});

  @override
  State<CardScreen> createState() => _CardScreenState();
}

class _CardScreenState extends State<CardScreen> {
  // Services
  final CardService _cardService = CardService();
  final AuthService _authService = AuthService();
  final CardActions _cardActions = CardActions();
  final NotificationService _notificationService = NotificationService();

  // States
  final List<CardModel> _cards = [];
  final List<CardModel> _filteredCards = [];
  bool _isLoading = false;
  final TextEditingController _searchController = TextEditingController();
  String _searchMessage = '';
  String _viewFilter = 'mine';
  final Map<String, TextEditingController> _commentControllers = {};
  Map<String, bool> _reminderLoading = {};
  final Map<String, String> _reminderMessages = {};
  String? _currentUserId;
  String? _userProfileImageUrl;
  String? _userToken;

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
    _loadCards();
    _searchController.addListener(_filterCards);
    _loadToken();
  }

  Future<void> _loadToken() async {
    final token = await _authService.getToken();
    setState(() {
      _userToken = token;
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    for (var controller in _commentControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _loadUserInfo() async {
    final userInfo = await _authService.getCurrentUser();
    setState(() {
      _currentUserId = userInfo?['userId']?.toString();
      _userProfileImageUrl = userInfo?['profileImageUrl'];
    });
  }

  // FILTER CARDS
  void _filterCards() {
    setState(() {
      List<CardModel> baseCards = _cards;

      if (_viewFilter == 'mine' && _currentUserId != null) {
        baseCards = _cards
            .where(
              (card) =>
                  card.ownerId?.toString() == _currentUserId ||
                  card.userId == _currentUserId,
            )
            .toList();
      }

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

  // LOAD EVENT CARDS
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
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading cards: ${e.toString()}')),
      );
    }
  }

  // SEARCH FOR EVENTS
  Future<void> _searchCards() async {
    if (_searchController.text.isEmpty) {
      setState(() => _searchMessage = 'Please enter a search term');
      return;
    }
    _filterCards();
    setState(() => _searchMessage = 'Card(s) have been retrieved');
  }

  // ADD NEW CARD
  Future<void> _addNewCard() async {
    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => AddCardDialog(userToken: _userToken),
    );

    if (result != null && result['title']!.isNotEmpty) {
      await _cardActions.createCard(
        context: context,
        title: result['title'] ?? '',
        description: result['description'] ?? '',
        time: result['time'],
        duration: result['duration'],
        location: result['location'],
        eventImageUrl: result['imageUrl'],
        onSuccess: _loadCards,
      );
    }
  }

  // EDIT CARD
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

    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => EditCardDialog(card: card, userToken: _userToken),
    );

    if (result != null && result['title']!.isNotEmpty) {
      await _cardActions.updateCard(
        context: context,
        cardData: {
          'eventId': card.id,
          'eventTitle': result['title'],
          'eventDescription': result['description'],
          'eventTime': result['time'],
          'eventDuration': result['duration'],
          'eventLocation': result['location'],
          'eventImageUrl': result['imageUrl'],
        },
        onSuccess: _loadCards,
      );
    }
  }

  // DELETE CARD
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

    // Show confirmation dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Event'),
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

    if (confirmed != true) return;

    try {
      // Delete the card
      await _cardService.deleteCard(card.id);

      // Immediately reload - ignore any errors since deletion worked
      await _loadCards();

      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Event deleted')));
    } catch (e) {
      // Even if there's an error, try reloading anyway
      await _loadCards();

      if (!mounted) return;
      // Only show error if it's NOT the "not found" message (since that means it worked)
      if (!e.toString().contains('not found')) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}')));
      }
    }
  }

  // TOGGLE LIKE
  Future<void> _toggleLike(CardModel card) async {
    await _cardActions.toggleLike(
      context: context,
      cardId: card.id,
      onSuccess: _loadCards,
    );
  }

  // ADD COMMENT
  Future<void> _addComment(CardModel card) async {
    final controller = _commentControllers[card.id];
    if (controller == null) return;

    await _cardActions.addComment(
      context: context,
      cardId: card.id,
      comment: controller.text,
      onSuccess: () {
        controller.clear();
        _loadCards();
      },
    );
  }

  // ADD TO CALENDAR - NEW
  Future<void> _addToCalendar(CardModel card) async {
    try {
      final success = await CalendarHelper.addToCalendar(card);
      if (!mounted) return;

      if (success) {
        SnackbarHelper.showSuccess(context, 'Opening calendar...');
      } else {
        SnackbarHelper.showError(context, 'Unable to open calendar app');
      }
    } catch (e) {
      if (!mounted) return;
      SnackbarHelper.showError(context, 'Error opening calendar');
    }
  }

  // EMAIL REMINDER - NEW
  Future<void> _sendEmailReminder(CardModel card) async {
    setState(() {
      _reminderLoading[card.id] = true;
      _reminderMessages[card.id] = 'Sending reminder...';
    });

    try {
      final token = await _authService.getToken();
      if (token == null) {
        throw Exception('Please log in again to send reminders');
      }

      final result = await _notificationService.sendEventReminder(
        token: token,
        eventId: card.id,
      );

      if (!mounted) return;

      setState(() {
        _reminderMessages[card.id] = result['message'] as String;
      });

      SnackbarHelper.showSuccess(context, 'Reminder sent! Check your email.');
    } catch (e) {
      if (!mounted) return;

      final message = e.toString().replaceAll('Exception: ', '');
      setState(() {
        _reminderMessages[card.id] = message;
      });

      SnackbarHelper.showError(context, message);
    } finally {
      if (mounted) {
        setState(() {
          _reminderLoading[card.id] = false;
        });
      }
    }
  }

  // BUILDING THE SITE
  // =====================================================================================================================

  @override
  Widget build(BuildContext context) {
    final upcomingCards = _filteredCards
        .where((card) => card.date.isAfter(DateTime.now()))
        .toList();
    final ownedCount = _currentUserId != null
        ? _cards
              .where(
                (card) =>
                    card.ownerId?.toString() == _currentUserId ||
                    card.userId == _currentUserId,
              )
              .length
        : 0;

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
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
            ),
          ],
        ),

        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        actions: [
          AddEventSection(onAddEvent: _addNewCard),
          SizedBox(width: 15),
        ],
      ),

      body: Container(
        color: const Color(0xFFF5F5F7),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : CustomScrollView(
                slivers: [
                  const SliverToBoxAdapter(child: SizedBox(height: 16)),

                  SliverToBoxAdapter(
                    child: StatsSection(
                      totalEvents: _cards.length,
                      ownedEvents: ownedCount,
                      upcomingEvents: upcomingCards.length,
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 16)),

                  SliverToBoxAdapter(
                    child: SearchSection(
                      searchController: _searchController,
                      onSearch: _searchCards,
                      currentFilter: _viewFilter,
                      onFilterChanged: (value) {
                        setState(() {
                          _viewFilter = value;
                          _filterCards();
                        });
                      },
                      searchMessage: _searchMessage,
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 32)),

                  if (_filteredCards.isEmpty)
                    const SliverToBoxAdapter(
                      child: EmptyState(
                        message: 'No events found.\nAdd your first event!',
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

                          _commentControllers.putIfAbsent(
                            card.id,
                            () => TextEditingController(),
                          );

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: CardItem(
                              card: card,
                              isOwner: isOwner,
                              onEdit: () => _editCard(card),
                              onDelete: () => _deleteCard(card),
                              onToggleLike: () => _toggleLike(card),
                              commentController: _commentControllers[card.id]!,
                              onAddComment: () => _addComment(card),
                              onAddToCalendar: () => _addToCalendar(card),
                              onEmailReminder: () => _sendEmailReminder(card),
                              isLoadingReminder:
                                  _reminderLoading[card.id] ?? false,
                              reminderMessage: _reminderMessages[card.id],
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
}
