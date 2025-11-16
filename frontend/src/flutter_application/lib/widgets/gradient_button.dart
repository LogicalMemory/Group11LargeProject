import 'package:flutter/material.dart';

class GradientButton extends StatelessWidget {
  final VoidCallback onPressed;
  final Widget child;
  final EdgeInsets padding;

  const GradientButton({super.key, required this.onPressed, required this.child, this.padding = const EdgeInsets.symmetric(horizontal: 24, vertical: 12)});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
            colors: [Color(0xFFFF7A18), Color(0xFFFF2D55), Color(0xFF7B2FFF)],
          ),
          borderRadius: BorderRadius.circular(999),
          boxShadow: [
            BoxShadow(
              color: Colors.purple.withValues(alpha: 0.15),
              blurRadius: 8,
              offset: const Offset(0, 0),
            ),
          ],
        ),
        padding: padding,
        child: DefaultTextStyle(
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [child],
          ),
        ),
      ),
    );
  }
}
