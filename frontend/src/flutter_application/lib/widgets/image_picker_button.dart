import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../utils/url_utils.dart';

class ImagePickerButton extends StatelessWidget {
  final String? imageUrl;
  final bool isUploading;
  final VoidCallback onPick;
  final VoidCallback onRemove;

  const ImagePickerButton({
    super.key,
    this.imageUrl,
    required this.isUploading,
    required this.onPick,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (imageUrl != null) ...[
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: CachedNetworkImage(
              imageUrl: UrlUtils.buildAbsoluteUrl(imageUrl)!,
              height: 150,
              width: double.infinity,
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(
                height: 150,
                color: Colors.grey[200],
                child: const Center(child: CircularProgressIndicator()),
              ),
              errorWidget: (context, url, error) => Container(
                height: 150,
                color: Colors.grey[200],
                child: const Icon(Icons.broken_image, size: 48),
              ),
            ),
          ),
          const SizedBox(height: 8),
          TextButton(onPressed: onRemove, child: const Text('Remove Image')),
          const SizedBox(height: 8),
        ],
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: isUploading ? null : onPick,
            icon: isUploading
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.image),
            label: Text(
              isUploading
                  ? 'Uploading...'
                  : imageUrl != null
                  ? 'Change Cover Image'
                  : 'Add Cover Image',
            ),
          ),
        ),
      ],
    );
  }
}
