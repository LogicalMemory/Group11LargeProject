import 'package:flutter/material.dart';
import '../models/card_model.dart';
import 'card_service.dart';

class CardActions {
  final CardService _cardService = CardService();

  Future<void> createCard({
    required BuildContext context,
    required String title,
    required String description,
    String? time,
    String? duration,
    String? location,
    String? eventImageUrl,
    required VoidCallback onSuccess,
  }) async {
    try {
      await _cardService.createCard(
        title,
        description,
        time: time?.isNotEmpty == true ? time : null,
        duration: duration,
        location: location,
        eventImageUrl: eventImageUrl,
      );
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Card has been added')),
      );
      onSuccess();
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error creating card: ${e.toString()}')),
      );
    }
  }

  Future<void> updateCard({
    required BuildContext context,
    required Map<String, dynamic> cardData,
    required VoidCallback onSuccess,
  }) async {
    try {
      await _cardService.updateCard(cardData);
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Card updated')),
      );
      onSuccess();
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating card: ${e.toString()}')),
      );
    }
  }

  Future<void> deleteCard({
    required BuildContext context,
    required CardModel card,
    required VoidCallback onSuccess,
  }) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Card'),
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

    if (confirmed == true) {
      try {
        await _cardService.deleteCard(card.id);
        if (!context.mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Card deleted')),
        );
        onSuccess();
      } catch (e) {
        if (!context.mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error deleting card: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> toggleLike({
    required BuildContext context,
    required String cardId,
    required VoidCallback onSuccess,
  }) async {
    try {
      await _cardService.toggleLike(cardId);
      onSuccess();
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating like: ${e.toString()}')),
      );
    }
  }

  Future<void> addComment({
    required BuildContext context,
    required String cardId,
    required String comment,
    required VoidCallback onSuccess,
  }) async {
    if (comment.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a comment')),
      );
      return;
    }

    try {
      await _cardService.addComment(cardId, comment.trim());
      onSuccess();
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error posting comment: ${e.toString()}')),
      );
    }
  }
}