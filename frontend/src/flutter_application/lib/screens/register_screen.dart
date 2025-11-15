import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import 'card_screen.dart';
import 'login_screen.dart';
import 'package:flutter_application/widgets/gradient_text.dart';
import '../widgets/navbar.dart';
import '../widgets/gradient_button.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _fullNameController = TextEditingController();
  final _handleController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String _message = '';
  bool _isLoading = false;

  Future<void> _doRegister() async {
    if (_fullNameController.text.isEmpty ||
        _handleController.text.isEmpty ||
        _emailController.text.isEmpty ||
        _passwordController.text.isEmpty ||
        _confirmPasswordController.text.isEmpty) {
      setState(() {
        _message = 'Please fill all fields';
      });
      return;
    }

    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() {
        _message = 'Passwords do not match';
      });
      return;
    }

    // Require full name to have at least first and last name
    final parts = _fullNameController.text.trim().split(RegExp(r'\s+'));
    if (parts.length < 2) {
      setState(() {
        _message = 'Please enter your full name (first and last)';
      });
      return;
    }
    final firstName = parts.first;
    final lastName = parts.sublist(1).join(' ');

    setState(() {
      _isLoading = true;
      _message = '';
    });

    try {
      final authService = context.read<AuthService>();
      final result = await authService.register(
        firstName,
        lastName,
        _emailController.text,
        _passwordController.text,
      );

      if (!mounted) return;

      if (result['success']) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const CardScreen()),
        );
      } else {
        setState(() {
          _message = result['error'] ?? 'Registration failed';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _message = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isSmallScreen = size.width < 600;

    return Scaffold(
      body: Column(
        children: [
          const Navbar(),
          Expanded(
            child: Center(
              child: SingleChildScrollView(
                child: Container(
                  width: isSmallScreen ? null : 520,
                  margin: const EdgeInsets.all(20),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 16,
                        spreadRadius: 4,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      const GradientText(
                        text: 'Create your LoopU account',
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Step into the feed - never miss what’s happening',
                        style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _fullNameController,
                        cursorColor: Colors.black,
                        decoration: const InputDecoration(
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Color(0xFFFF7A18), width: 2.0),
                          ),
                          labelText: 'Full name',
                          hintText: 'Jordan Alvarez',
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _handleController,
                        cursorColor: Colors.black,
                        decoration: const InputDecoration(
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Color(0xFFFF7A18), width: 2.0),
                          ),
                          labelText: 'Handle / Username',
                          hintText: 'e.g. @loopULife',
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _emailController,
                        cursorColor: Colors.black,
                        decoration: const InputDecoration(
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Color(0xFFFF7A18), width: 2.0),
                          ),
                          labelText: 'School email',
                          hintText: 'YourUCFEmail@ucf.edu',
                        ),
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _passwordController,
                        cursorColor: Colors.black,
                        decoration: const InputDecoration(
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Color(0xFFFF7A18), width: 2.0),
                          ),
                          labelText: 'Password',
                          hintText: 'at least 8 characters',
                        ),
                        obscureText: true,
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _confirmPasswordController,
                        cursorColor: Colors.black,
                        decoration: const InputDecoration(
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Color(0xFFFF7A18), width: 2.0),
                          ),
                          labelText: 'Confirm password',
                          hintText: 're-enter your password',
                        ),
                        obscureText: true,
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: _isLoading
                            ? const Center(child: CircularProgressIndicator())
                            : GradientButton(
                                onPressed: _doRegister,
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                child: const Text('Create Account', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                              ),
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const LoginScreen()),
                          );
                        },
                        child: RichText(
                          text: TextSpan(
                            style: const TextStyle(color: Colors.black),
                            children: [
                              const TextSpan(text: 'Already have an account? '),
                              TextSpan(
                                text: 'Log in',
                                style: const TextStyle(color: Color(0xFFFF2D55), fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                      ),
                      if (_message.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 16),
                          child: Text(
                            _message,
                            style: const TextStyle(color: Colors.red),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _handleController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }
}
