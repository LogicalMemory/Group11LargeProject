import 'package:flutter/material.dart';

class GradientText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final Gradient gradient;

  const GradientText({super.key, required this.text, this.style, Gradient? gradient})
      : gradient = gradient ?? const LinearGradient(
          colors: [Color(0xFFFF7A18), Color(0xFFFF2D55), Color(0xFF7B2FFF)],
        );

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (bounds) => gradient.createShader(Rect.fromLTWH(0, 0, bounds.width, bounds.height)),
      blendMode: BlendMode.srcIn,
      child: Text(
        text,
        style: style ?? const TextStyle(fontWeight: FontWeight.w700),
      ),
    );
  }
}
