import 'package:flutter/material.dart';
import 'stat_card.dart';

class StatsSection extends StatelessWidget {
  final int totalEvents;
  final int ownedEvents;
  final int upcomingEvents;

  const StatsSection({
    super.key,
    required this.totalEvents,
    required this.ownedEvents,
    required this.upcomingEvents,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(child: StatCard(label: 'Total Events', value: totalEvents)),
          const SizedBox(width: 12),
          Expanded(child: StatCard(label: 'Owned Events', value: ownedEvents)),
          const SizedBox(width: 12),
          Expanded(child: StatCard(label: 'Upcoming Events', value: upcomingEvents)),
        ],
      ),
    );
  }
}