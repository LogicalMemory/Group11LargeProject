import 'package:flutter/material.dart' hide Badge;
import 'badge.dart';
import '../utils/date_utils.dart' as date_utils;

class CardBadges extends StatelessWidget {
  final DateTime? date;
  final String? duration;
  final String? location;

  const CardBadges({
    super.key,
    this.date,
    this.duration,
    this.location,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        Badge(
          text: date_utils.DateUtils.formatDateTime(date),
            bgColor: Colors.grey[100]!,
            textColor: Colors.grey[600]!,
        ),
        if (duration != null)
          Badge(
            text: '$duration mins',
            bgColor: Colors.grey[100]!,
            textColor: Colors.grey[600]!,
          ),
        if (location != null && location!.isNotEmpty)
          Badge(
            text: location!,
            bgColor: Colors.grey[100]!,
            textColor: Colors.grey[600]!,
          ),
      ],
    );
  }
}