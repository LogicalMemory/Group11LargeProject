import 'package:flutter/material.dart';
import '../utils/url_utils.dart';

class CardImage extends StatelessWidget {
  final String? imageUrl;
  const CardImage({Key? key, this.imageUrl}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      final absUrl = UrlUtils.toAbsoluteUrl(imageUrl);
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.network(
          absUrl,
          width: double.infinity,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => Container(
            width: double.infinity,
            height: 180,
            color: Colors.grey[300],
            child: const Icon(Icons.image, size: 48, color: Colors.grey),
          ),
        ),
      );
    } else {
      return Container(
        width: double.infinity,
        height: 180,
        decoration: BoxDecoration(
          color: Colors.grey[300],
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.image, size: 48, color: Colors.grey),
      );
    }
  }
}
