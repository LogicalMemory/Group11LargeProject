import 'package:flutter/material.dart';
import 'gradient_button.dart';
import 'filter_button.dart';

class SearchSection extends StatelessWidget {
  final TextEditingController searchController;
  final VoidCallback onSearch;
  final String currentFilter;
  final Function(String) onFilterChanged;
  final String? searchMessage;

  const SearchSection({
    super.key,
    required this.searchController,
    required this.onSearch,
    required this.currentFilter,
    required this.onFilterChanged,
    this.searchMessage,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: searchController,
                  decoration: InputDecoration(
                    hintText: 'search for events',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                ),
              ),

              const SizedBox(width: 20),

              SizedBox(
                height: 48,
                child: GradientButton(
                  onPressed: onSearch,
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                  child: const Text('Search', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                ),
              ),

              const SizedBox(width: 20),

              Container(
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(20),
                ),
                padding: const EdgeInsets.all(4),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    FilterButton(
                      label: 'My events',
                      value: 'mine',
                      currentFilter: currentFilter,
                      onFilterChanged: onFilterChanged,
                    ),
                    FilterButton(
                      label: 'All',
                      value: 'all',
                      currentFilter: currentFilter,
                      onFilterChanged: onFilterChanged,
                    ),
                  ],
                ),
              ),
            ],
          ),

          if (searchMessage != null && searchMessage!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(searchMessage!, style: const TextStyle(fontSize: 14, color: Colors.green)),
            ),
        ],
      ),
    );
  }
}