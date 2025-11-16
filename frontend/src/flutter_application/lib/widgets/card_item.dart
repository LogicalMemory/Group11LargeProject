import 'package:flutter/material.dart';
import '../models/card_model.dart';
import 'card_header.dart';
import 'card_image.dart';
import 'card_badges.dart';
import 'card_engagement.dart';
import 'comment_list.dart';
import 'comment_input.dart';

class CardItem extends StatelessWidget {
  final CardModel card;
  final bool isOwner;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onToggleLike;
  final TextEditingController commentController;
  final VoidCallback onAddComment;

  const CardItem({
    super.key,
    required this.card,
    required this.isOwner,
    required this.onEdit,
    required this.onDelete,
    required this.onToggleLike,
    required this.commentController,
    required this.onAddComment,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
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
          CardHeader(
            title: card.title,
            description: card.description,
            isOwner: isOwner,
            onEdit: onEdit,
            onDelete: onDelete,
          ),

          CardImage(imageUrl: card.eventImageUrl),

          const SizedBox(height: 12),

          CardBadges(
            date: card.date,
            duration: card.eventDuration,
            location: card.location,
          ),

          const SizedBox(height: 12),

          CardEngagement(
            likes: card.likes ?? 0,
            likedByMe: card.likedBy?.isNotEmpty ?? false,
            commentsCount: card.comments?.length ?? 0,
            onToggleLike: onToggleLike,
          ),

          CommentList(comments: card.comments ?? []),

          const SizedBox(height: 12),
          CommentInput(controller: commentController, onSubmit: onAddComment),
        ],
      ),
    );
  }
}
