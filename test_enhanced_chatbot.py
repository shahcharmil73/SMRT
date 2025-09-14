#!/usr/bin/env python3
"""
Test script for the enhanced AI chatbot system
This script demonstrates the various capabilities of the improved chatbot
"""

import requests
import json
import time

# Configuration
API_BASE_URL = 'http://localhost:5001/api'

def test_query(query, description):
    """Test a single query and display results"""
    print(f"\n{'='*60}")
    print(f"TEST: {description}")
    print(f"Query: {query}")
    print(f"{'='*60}")
    
    try:
        response = requests.post(f'{API_BASE_URL}/query', 
                               json={'query': query},
                               timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ CONNECTION ERROR: {e}")
    
    time.sleep(1)  # Small delay between requests

def test_advanced_analytics(analysis_type, description):
    """Test advanced analytics endpoint"""
    print(f"\n{'='*60}")
    print(f"ADVANCED ANALYTICS: {description}")
    print(f"Type: {analysis_type}")
    print(f"{'='*60}")
    
    try:
        response = requests.post(f'{API_BASE_URL}/analytics/advanced', 
                               json={'type': analysis_type},
                               timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS")
            print(f"Analysis Type: {data.get('analysis_type')}")
            print(f"Timestamp: {data.get('timestamp')}")
            print(f"Analysis Keys: {list(data.get('analysis', {}).keys())}")
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ CONNECTION ERROR: {e}")
    
    time.sleep(1)

def main():
    """Run comprehensive tests of the enhanced AI chatbot"""
    print("🤖 ENHANCED AI CHATBOT TEST SUITE")
    print("=" * 60)
    print("Testing various query types and advanced analytics...")
    
    # Test basic queries
    basic_queries = [
        ("Show me all customers", "List all customers"),
        ("How many customers are there?", "Count customers"),
        ("What is the total revenue?", "Get total revenue"),
        ("Show me top customers by spending", "Top customers by revenue"),
        ("What are the most popular products?", "Top products by quantity"),
        ("Show me pending orders", "Pending orders analysis"),
        ("What is the average order value?", "Average order value"),
        ("Show me business insights", "Business insights summary"),
        ("Show me today's sales", "Today's sales data"),
        ("Show me monthly revenue trends", "Monthly revenue analysis"),
    ]
    
    print("\n🔍 TESTING BASIC QUERIES...")
    for query, description in basic_queries:
        test_query(query, description)
    
    # Test advanced queries
    advanced_queries = [
        ("Show me premium customers", "Premium customers list"),
        ("Who are the top customers by orders?", "Top customers by order count"),
        ("What is the average customer spending?", "Average customer spending"),
        ("Show me recent customers", "Recent customers"),
        ("What are the top products by revenue?", "Top products by revenue"),
        ("Show me revenue by category", "Category revenue analysis"),
        ("What is the highest product price?", "Highest product price"),
        ("Show me order status distribution", "Order status analysis"),
        ("How many orders are completed?", "Completed orders count"),
        ("Show me revenue growth rate", "Revenue growth analysis"),
    ]
    
    print("\n🚀 TESTING ADVANCED QUERIES...")
    for query, description in advanced_queries:
        test_query(query, description)
    
    # Test time-based queries
    time_queries = [
        ("Show me this month's sales", "This month's sales"),
        ("Show me this year's revenue", "This year's revenue"),
        ("Show me yesterday's orders", "Yesterday's orders"),
    ]
    
    print("\n⏰ TESTING TIME-BASED QUERIES...")
    for query, description in time_queries:
        test_query(query, description)
    
    # Test advanced analytics
    print("\n📊 TESTING ADVANCED ANALYTICS...")
    analytics_types = [
        ("comprehensive", "Comprehensive Business Analysis"),
        ("customer_segmentation", "Customer Segmentation Analysis"),
        ("product_performance", "Product Performance Analysis"),
    ]
    
    for analysis_type, description in analytics_types:
        test_advanced_analytics(analysis_type, description)
    
    # Test help and suggestions
    print("\n💡 TESTING HELP AND SUGGESTIONS...")
    test_query("What can you help me with?", "Help and suggestions")
    test_query("Show me suggestions", "Query suggestions")
    
    print("\n🎉 TEST SUITE COMPLETED!")
    print("=" * 60)
    print("All tests have been executed. Check the results above.")
    print("The enhanced AI chatbot should now support:")
    print("• Enhanced natural language processing")
    print("• Advanced analytical queries")
    print("• Time-based analysis")
    print("• Customer segmentation")
    print("• Product performance analysis")
    print("• Comprehensive business insights")
    print("• Better response formatting with emojis and structure")

if __name__ == "__main__":
    main()

