import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../utils/url_utils.dart';

class ProfileSection extends StatelessWidget {
  final String? profileImageUrl;
  final String userName;
  final VoidCallback onUpload;

  const ProfileSection({
    super.key,
    this.profileImageUrl,
    required this.userName,
    required this.onUpload,
  });



  @override
  Widget build(BuildContext context) {
    print('[Flutter] ProfileSection: profileImageUrl = $profileImageUrl');
    return Row(
      children: [
        GestureDetector(
          onTap: onUpload,
          child: profileImageUrl != null
              ? CircleAvatar(
                  radius: 18,
                  backgroundColor: Colors.grey[300],
                  backgroundImage: CachedNetworkImageProvider(
                    UrlUtils.buildAbsoluteUrl(profileImageUrl!)!,
                  ),
                  onBackgroundImageError: (_, __) {
                    print('[Flutter] ProfileSection: Failed to load image: $profileImageUrl');
                    // fallback to icon if image fails
                  },
                  child: null,
                )
              : const CircleAvatar(
                  radius: 18,
                  backgroundColor: Colors.grey,
                  child: Icon(Icons.person),
                ),
        ),
        const SizedBox(width: 12),
      ],
    );
  }
}
