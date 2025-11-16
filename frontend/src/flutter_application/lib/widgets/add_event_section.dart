import 'package:flutter/material.dart';
import 'gradient_button.dart';

class AddEventSection extends StatelessWidget {
  final VoidCallback onAddEvent;

  const AddEventSection({
    super.key,
    required this.onAddEvent,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
          children: [
            SizedBox(
              height: 36,
              child: GradientButton(
                onPressed: onAddEvent,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: Row(
                  children: const [
                    Icon(Icons.add, size: 16, color: Colors.white),
                    SizedBox(width: 8),
                    Text(
                      'New Event',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
  }
}