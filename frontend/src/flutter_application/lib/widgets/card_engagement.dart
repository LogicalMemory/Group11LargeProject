import 'package:flutter/material.dart';

class CardEngagement extends StatelessWidget {
  final int likes;
  final bool likedByMe;
  final int commentsCount;
  final VoidCallback onToggleLike;

  const CardEngagement({
    super.key,
    required this.likes,
    required this.likedByMe,
    required this.commentsCount,
    required this.onToggleLike,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        InkWell(
          onTap: onToggleLike,
          borderRadius: BorderRadius.circular(20),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              gradient: likedByMe
                  ? const LinearGradient(
                      colors: [Color(0xFFFF7A18), Color(0xFFFF2D55), Color(0xFF7B2FFF)])
                  : null,
              color: likedByMe ? null : Colors.grey[200],
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('❤️', style: TextStyle(fontSize: 12)),
                const SizedBox(width: 4),
                Text(
                  '$likes',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: likedByMe ? Colors.white : Colors.grey[700],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.grey[200],
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('💬', style: TextStyle(fontSize: 12)),
              const SizedBox(width: 4),
              Text(
                '$commentsCount',
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
    );
  }
}