class CommentModel {
  final int? commentId;
  final int? authorId;
  final String? authorName;
  final String? authorImageUrl;
  final String? text;
  final String? createdAt;

  CommentModel({
    this.commentId,
    this.authorId,
    this.authorName,
    this.authorImageUrl,
    this.text,
    this.createdAt,
  });

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    return CommentModel(
      commentId: json['CommentId'] as int?,
      authorId: json['AuthorId'] as int?,
      authorName: json['AuthorName'] as String?,
      authorImageUrl: json['AuthorImageUrl'] as String?,
      text: json['Text'] as String?,
      createdAt: json['CreatedAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'CommentId': commentId,
      'AuthorId': authorId,
      'AuthorName': authorName,
      'AuthorImageUrl': authorImageUrl,
      'Text': text,
      'CreatedAt': createdAt,
    };
  }
}

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
  final List<CommentModel>? comments;
  final String? location;
  final int? ownerId;
  final String? eventDuration;
  final List<dynamic>? likedBy;
  final String? eventImageUrl;
  final String? ownerProfileImageUrl;

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
    this.eventDuration,
    this.likedBy,
    this.eventImageUrl,
    this.ownerProfileImageUrl,
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
    List<CommentModel>? comments;
    String? location;
    int? ownerId;
    String? eventDuration;
    List<dynamic>? likedBy;
    String? eventImageUrl;
    String? ownerProfileImageUrl;

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
      eventDuration = json['EventDuration']?.toString();
      likes = json['Likes'] is int ? json['Likes'] as int : (json['likes'] is int ? json['likes'] as int : null);
      
      // Parse comments if they exist
      if (json['Comments'] != null) {
        comments = (json['Comments'] as List<dynamic>)
            .map((c) => CommentModel.fromJson(c as Map<String, dynamic>))
            .toList();
      } else if (json['comments'] != null) {
        comments = (json['comments'] as List<dynamic>)
            .map((c) => CommentModel.fromJson(c as Map<String, dynamic>))
            .toList();
      }
      
      likedBy = json['LikedBy'] as List<dynamic>? ?? json['likedBy'] as List<dynamic>?;
      ownerId = json['EventOwnerId'] is int ? json['EventOwnerId'] as int : null;
      userId = ownerId?.toString() ?? '';
      eventImageUrl = json['EventImageUrl'] as String?;
      ownerProfileImageUrl = json['OwnerProfileImageUrl'] as String?;
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
      
      // Parse comments for legacy format
      if (json['comments'] != null) {
        comments = (json['comments'] as List<dynamic>)
            .map((c) => CommentModel.fromJson(c as Map<String, dynamic>))
            .toList();
      }

      location = json['location'];
      eventDuration = json['eventDuration']?.toString() ?? json['EventDuration']?.toString();
      likedBy = json['likedBy'] as List<dynamic>? ?? json['LikedBy'] as List<dynamic>?;
      ownerId = json['ownerId'] is int ? json['ownerId'] as int : (json['EventOwnerId'] is int ? json['EventOwnerId'] as int : null);
      eventImageUrl = json['eventImageUrl'] as String? ?? json['EventImageUrl'] as String?;
      ownerProfileImageUrl = json['ownerProfileImageUrl'] as String? ?? json['OwnerProfileImageUrl'] as String?;
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
      eventDuration: eventDuration,
      likedBy: likedBy,
      eventImageUrl: eventImageUrl,
      ownerProfileImageUrl: ownerProfileImageUrl,
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
      'comments': comments?.map((c) => c.toJson()).toList(),
      'location': location,
      'EventId': id,
      'EventTitle': title,
      'EventDescription': description,
      'EventTime': date.toIso8601String(),
      'EventLocation': location,
      'EventDuration': eventDuration,
      'EventOwnerId': ownerId,
      'Likes': likes,
      'LikedBy': likedBy,
      'Comments': comments?.map((c) => c.toJson()).toList(),
      'EventImageUrl': eventImageUrl,
      'OwnerProfileImageUrl': ownerProfileImageUrl,
    };
  }
}