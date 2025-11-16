import 'package:flutter/material.dart';
import '../widgets/gradient_button.dart';

class CommentInput extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSubmit;

  const CommentInput({
    super.key,
    required this.controller,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          TextField(
            controller: controller,
            decoration: const InputDecoration(
              hintText: 'Add a comment',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              isDense: true,
            ),
            style: const TextStyle(fontSize: 12),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: GradientButton(
              onPressed: onSubmit,
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: const Text(
                'Post comment',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }
}