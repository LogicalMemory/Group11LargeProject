import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../utils/url_utils.dart';

class CardImage extends StatelessWidget {
  final String? imageUrl;
  final double height;

  const CardImage({
    super.key,
    this.imageUrl,
    this.height = 200,
  });

  @override
  Widget build(BuildContext context) {
    if (imageUrl == null) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: CachedNetworkImage(
          imageUrl: UrlUtils.buildAbsoluteUrl(imageUrl)!,
          height: height,
          width: double.infinity,
          fit: BoxFit.cover,
          placeholder: (context, url) => Container(
            height: height,
            color: Colors.grey[200],
            child: const Center(child: CircularProgressIndicator()),
          ),
          errorWidget: (context, url, error) => Container(
            height: height,
            color: Colors.grey[200],
            child: const Icon(Icons.broken_image, size: 48),
          ),
        ),
      ),
    );
  }
}