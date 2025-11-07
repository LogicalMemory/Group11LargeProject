class CardModel {
  final String id;
  final String title;
  final String description;
  final DateTime date;
  final String userId;

  const CardModel({
    required this.id,
    required this.title,
    required this.description,
    required this.date,
    required this.userId,
  });

  factory CardModel.fromJson(Map<String, dynamic> json) {
    return CardModel(
      id: json['_id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      userId: json['userId'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'title': title,
      'description': description,
      'date': date.toIso8601String(),
      'userId': userId,
    };
  }
}