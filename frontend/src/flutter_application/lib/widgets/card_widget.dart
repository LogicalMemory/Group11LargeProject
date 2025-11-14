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
      if (mounted) {
        setState(() {
          _card = updated;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Like failed: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isLiking = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateText = _card.date.toLocal().toString().split(' ')[0];
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
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
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                  Text(
                    dateText,
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if ((_card.location ?? '').isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: Row(
                    children: [
                      Icon(Icons.place, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 6),
                      Text(
                        _card.location ?? '',
                        style: TextStyle(
                          color: Colors.grey[700],
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 8),
              Text(
                _card.description,
                style: const TextStyle(
                  fontSize: 15,
                  color: Colors.black87,
                  height: 1.4,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.redAccent,
                      elevation: 0,
                      side: const BorderSide(color: Colors.redAccent),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('RSVP sent')));
                    },
                    child: const Text('RSVP', style: TextStyle(fontSize: 13)),
                  ),
                  Row(
                    children: [
                      Text(
                        (_card.likes ?? 0).toString(),
                        style: TextStyle(
                          color: Colors.grey[700],
                          fontSize: 13,
                        ),
                      ),
                      IconButton(
                        icon: _isLiking
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                            : Icon(
                                _card.likes != null && _card.likes! > 0 ? Icons.favorite : Icons.favorite_border,
                                color: Colors.pink,
                                size: 20,
                              ),
                        onPressed: _toggleLike,
                        constraints: const BoxConstraints(),
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                      ),
                      const SizedBox(width: 8),
                      Icon(Icons.comment_outlined, color: Colors.grey[600], size: 20),
                      const SizedBox(width: 4),
                      Text(
                        (_card.comments?.length ?? 0).toString(),
                        style: TextStyle(
                          color: Colors.grey[700],
                          fontSize: 13,
                        ),
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