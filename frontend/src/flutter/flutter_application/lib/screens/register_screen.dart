import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import 'card_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _loginController = TextEditingController();
  final _passwordController = TextEditingController();
  String _message = '';
  bool _isLoading = false;

  Future<void> _doRegister() async {
    if (_firstNameController.text.isEmpty ||
        _lastNameController.text.isEmpty ||
        _loginController.text.isEmpty ||
        _passwordController.text.isEmpty) {
      setState(() {
        _message = 'Please fill all fields';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _message = '';
    });

    try {
      final authService = context.read<AuthService>();
      final result = await authService.register(
        _firstNameController.text,
        _lastNameController.text,
        _loginController.text,
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
    return Scaffold(
      appBar: AppBar(title: const Text('Register')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            children: [
              TextField(
                controller: _firstNameController,
                decoration: const InputDecoration(labelText: 'First name'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _lastNameController,
                decoration: const InputDecoration(labelText: 'Last name'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _loginController,
                decoration: const InputDecoration(labelText: 'Login'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _passwordController,
                decoration: const InputDecoration(labelText: 'Password'),
                obscureText: true,
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : ElevatedButton(
                        onPressed: _doRegister,
                        child: const Text('Register'),
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
    );
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _loginController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
