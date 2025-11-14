class CardModel {
  // Backwards compatible model that can represent both the simple card used
  // previously and the richer "event" records returned by the web frontend.
  final String id;
  final String title;
  final String description;
  final DateTime date;
  final String userId;

  // Additional fields used by the event API
  final int? likes;
  final List<dynamic>? comments;
  final String? location;
  final int? ownerId;

  const CardModel({
    required this.id,
    required this.title,
    required this.description,
    required this.date,
    required this.userId,
    this.likes,
    this.comments,
    this.location,
    this.ownerId,
  });

  factory CardModel.fromJson(Map<String, dynamic> json) {
    // Support both older shape (_id/title/description/date/userId)
    // and newer backend event shape (EventId, EventTitle, EventDescription, EventTime, EventLocation, Likes, Comments, EventOwnerId)
    String id = '';
    String title = '';
    String description = '';
    DateTime date = DateTime.now();
    String userId = '';
    int? likes;
    List<dynamic>? comments;
    String? location;
    int? ownerId;

    if (json.containsKey('EventId')) {
      id = (json['EventId'] ?? '').toString();
      title = json['EventTitle'] ?? '';
      description = json['EventDescription'] ?? '';
      final t = json['EventTime'] ?? json['date'] ?? '';
      try {
        date = DateTime.parse(t ?? DateTime.now().toIso8601String());
      } catch (_) {
        date = DateTime.now();
      }
      location = json['EventLocation'] ?? '';
      likes = json['Likes'] is int ? json['Likes'] as int : (json['likes'] is int ? json['likes'] as int : null);
      comments = json['Comments'] as List<dynamic>? ?? json['comments'] as List<dynamic>?;
      ownerId = json['EventOwnerId'] is int ? json['EventOwnerId'] as int : null;
    } else {
      id = json['_id'] ?? (json['id']?.toString() ?? '');
      title = json['title'] ?? '';
      description = json['description'] ?? '';
      final dStr = json['date'] ?? json['EventTime'] ?? DateTime.now().toIso8601String();
      try {
        date = DateTime.parse(dStr);
      } catch (_) {
        date = DateTime.now();
      }
      userId = json['userId'] ?? json['user'] ?? '';
      likes = json['likes'] is int ? json['likes'] as int : null;
      comments = json['comments'] as List<dynamic>?;
      location = json['location'];
    }

    return CardModel(
      id: id,
      title: title,
      description: description,
      date: date,
      userId: userId,
      likes: likes,
      comments: comments,
      location: location,
      ownerId: ownerId,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'title': title,
      'description': description,
      'date': date.toIso8601String(),
      'userId': userId,
      'likes': likes,
      'comments': comments,
      'location': location,
      'EventId': id,
      'EventTitle': title,
      'EventDescription': description,
      'EventTime': date.toIso8601String(),
      'EventLocation': location,
    };
  }
}