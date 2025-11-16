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
    return Row(
      children: [
        GestureDetector(
          onTap: onUpload,
          child: CircleAvatar(
            radius: 18,
            backgroundColor: Colors.grey[300],
            backgroundImage: profileImageUrl != null
                ? CachedNetworkImageProvider(
                    UrlUtils.buildAbsoluteUrl(profileImageUrl!)!,
                  )
                : null,
            child:
                profileImageUrl == null ? const Icon(Icons.person) : null,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          userName,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(width: 12),
      ],
    );
  }
}
