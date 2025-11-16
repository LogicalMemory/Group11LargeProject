import 'package:flutter/material.dart';
import '../models/card_model.dart';

class EventActions extends StatelessWidget {
  final CardModel card;
  final VoidCallback onAddToCalendar;
  final VoidCallback onEmailReminder;
  final bool isLoadingReminder;
  final String? reminderMessage;

  const EventActions({
    super.key,
    required this.card,
    required this.onAddToCalendar,
    required this.onEmailReminder,
    this.isLoadingReminder = false,
    this.reminderMessage,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _ActionButton(
              icon: Icons.calendar_today,
              label: 'Add to Calendar',
              onPressed: onAddToCalendar,
            ),
            _ActionButton(
              icon: Icons.email_outlined,
              label: isLoadingReminder ? 'Sending...' : 'Remind Me',
              onPressed: isLoadingReminder ? null : onEmailReminder,
            ),
          ],
        ),
        if (reminderMessage != null) ...[
          const SizedBox(height: 8),
          Text(
            reminderMessage!,
            style: TextStyle(
              fontSize: 11,
              color: reminderMessage!.toLowerCase().contains('error')
                  ? Colors.red
                  : Colors.green,
            ),
          ),
        ],
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onPressed;

  const _ActionButton({
    required this.icon,
    required this.label,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 14, color: Color(0xFF000000)),
      label: Text(
        label,
        style: const TextStyle(fontSize: 11, color: Color(0xFF000000)),
      ),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        minimumSize: const Size(0, 28),
        side: BorderSide(color: Colors.grey[300]!),
      ),
    );
  }
}