import 'package:flutter/material.dart';
import '../models/card_model.dart';
import 'comment_item.dart';

class CommentList extends StatelessWidget {
  final List<CommentModel> comments;
  final int maxDisplay;

  const CommentList({
    super.key,
    required this.comments,
    this.maxDisplay = 3,
  });

  @override
  Widget build(BuildContext context) {
    if (comments.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        const SizedBox(height: 12),
        ...comments.take(maxDisplay).map((comment) => CommentItem(comment: comment)),
      ],
    );
  }
}