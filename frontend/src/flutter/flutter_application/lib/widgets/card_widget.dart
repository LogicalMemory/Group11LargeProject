import 'package:flutter/material.dart';
import '../models/card_model.dart';
import '../services/card_service.dart';

class CardWidget extends StatefulWidget {
  final CardModel card;

  const CardWidget({super.key, required this.card});

  @override
  State<CardWidget> createState() => _CardWidgetState();
}

class _CardWidgetState extends State<CardWidget> {
  late CardModel _card;
  final CardService _service = CardService();
  bool _isLiking = false;

  @override
  void initState() {
    super.initState();
    _card = widget.card;
  }

  Future<void> _toggleLike() async {
    if (_isLiking) return;
    setState(() => _isLiking = true);
    try {
      final updated = await _service.toggleLike(_card.id);
      setState(() {
        _card = updated;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Like failed: $e')));
    } finally {
      setState(() => _isLiking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateText = _card.date.toLocal().toString().split(' ')[0];
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(15),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Colors.white, Colors.grey.shade100],
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      _card.title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
                    ),
                  ),
                  Text(
                    dateText,
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if ((_card.location ?? '').isNotEmpty)
                Row(
                  children: [
                    const Icon(Icons.place, size: 16, color: Colors.grey),
                    const SizedBox(width: 6),
                    Text(
                      _card.location ?? '',
                      style: TextStyle(color: Colors.grey[700]),
                    ),
                  ],
                ),
              const SizedBox(height: 12),
              Text(
                _card.description,
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.redAccent,
                      elevation: 1,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                    ),
                    onPressed: () {
                      // RSVP placeholder - web frontend has RSVP behavior; here we show a confirmation.
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('RSVP sent')));
                    },
                    child: const Text('RSVP'),
                  ),
                  Row(
                    children: [
                      Text((_card.likes ?? 0).toString()),
                      IconButton(
                        icon: _isLiking
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                            : const Icon(Icons.favorite, color: Colors.pink),
                        onPressed: _toggleLike,
                      ),
                      const SizedBox(width: 8),
                      Row(
                        children: [
                          const Icon(Icons.comment, color: Colors.indigo),
                          const SizedBox(width: 4),
                          Text((_card.comments?.length ?? 0).toString()),
                        ],
                      ),
                    ],
                  )
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}