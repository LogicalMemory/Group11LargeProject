import 'package:flutter/material.dart';
import '../models/card_model.dart';
import 'card_header.dart';
import 'card_image.dart';
import 'card_badges.dart';
import 'card_engagement.dart';
import 'comment_list.dart';
import 'comment_input.dart';
import 'event_actions.dart';

class CardItem extends StatelessWidget {
  final CardModel card;
  final bool isOwner;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onToggleLike;
  final TextEditingController commentController;
  final VoidCallback onAddComment;
  final VoidCallback? onAddToCalendar;
  final VoidCallback? onEmailReminder;
  final bool isLoadingReminder;
  final String? reminderMessage;

  const CardItem({
    super.key,
    required this.card,
    required this.isOwner,
    required this.onEdit,
    required this.onDelete,
    required this.onToggleLike,
    required this.commentController,
    required this.onAddComment,
    this.onAddToCalendar,
    this.onEmailReminder,
    this.isLoadingReminder = false,
    this.reminderMessage,
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
          // Header with Edit/Delete buttons
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: CardHeader(
                  title: card.title,
                  description: card.description,
                  isOwner: isOwner,
                  onEdit: onEdit,
                  onDelete: onDelete,
                ),
              ),
            ],
          ),

          CardImage(imageUrl: card.eventImageUrl),

          const SizedBox(height: 12),

          CardBadges(
            date: card.date,
            duration: card.eventDuration,
            location: card.location,
          ),

          const SizedBox(height: 12),

          // Engagement and Actions Row
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              CardEngagement(
                likes: card.likes ?? 0,
                likedByMe: card.likedBy?.isNotEmpty ?? false,
                commentsCount: card.comments?.length ?? 0,
                onToggleLike: onToggleLike,
              ),

              if (onAddToCalendar != null || onEmailReminder != null)
                EventActions(
                  card: card,
                  onAddToCalendar: onAddToCalendar ?? () {},
                  onEmailReminder: onEmailReminder ?? () {},
                  isLoadingReminder: isLoadingReminder,
                  reminderMessage: reminderMessage,
                ),
            ],
          ),

          const SizedBox(height: 12),

          CommentList(comments: card.comments ?? []),

          const SizedBox(height: 12),
          CommentInput(controller: commentController, onSubmit: onAddComment),
        ],
      ),
    );
  }
}