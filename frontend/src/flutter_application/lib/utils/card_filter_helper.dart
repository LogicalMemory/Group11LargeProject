import '../models/card_model.dart';

class CardFilterHelper {
  static List<CardModel> filterByOwnership({
    required List<CardModel> cards,
    required String? currentUserId,
    required bool showOnlyOwned,
  }) {
    if (!showOnlyOwned || currentUserId == null) {
      return cards;
    }

    return cards
        .where(
          (card) =>
              card.ownerId?.toString() == currentUserId ||
              card.userId == currentUserId,
        )
        .toList();
  }

  static List<CardModel> filterBySearchQuery({
    required List<CardModel> cards,
    required String query,
  }) {
    if (query.isEmpty) return cards;

    final lowerQuery = query.toLowerCase();
    return cards
        .where(
          (card) =>
              card.title.toLowerCase().contains(lowerQuery) ||
              card.description.toLowerCase().contains(lowerQuery) ||
              (card.location?.toLowerCase().contains(lowerQuery) ?? false),
        )
        .toList();
  }

  static List<CardModel> getUpcomingEvents(List<CardModel> cards) {
    final now = DateTime.now();
    return cards.where((card) => card.date.isAfter(now)).toList();
  }

  static List<CardModel> getPastEvents(List<CardModel> cards) {
    final now = DateTime.now();
    return cards.where((card) => card.date.isBefore(now)).toList();
  }

  static List<CardModel> sortByDate(
    List<CardModel> cards, {
    bool ascending = true,
  }) {
    final sorted = List<CardModel>.from(cards);
    sorted.sort(
      (a, b) => ascending ? a.date.compareTo(b.date) : b.date.compareTo(a.date),
    );
    return sorted;
  }
}
