import '../models/card_model.dart';

class PermissionHelper {
  static bool canEditCard({
    required CardModel card,
    required String? currentUserId,
  }) {
    if (currentUserId == null) return false;
    return card.ownerId?.toString() == currentUserId || card.userId == currentUserId;
  }

  static bool canDeleteCard({
    required CardModel card,
    required String? currentUserId,
  }) {
    return canEditCard(card: card, currentUserId: currentUserId);
  }

  static bool canLikeCard({
    required String? currentUserId,
  }) {
    return currentUserId != null;
  }

  static bool canCommentOnCard({
    required String? currentUserId,
  }) {
    return currentUserId != null;
  }
}