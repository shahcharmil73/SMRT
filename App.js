import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

const { width: screenWidth } = Dimensions.get('window');

const API_BASE_URL = 'http://10.0.2.2:5001/api'; // Android emulator localhost

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dataSummary, setDataSummary] = useState(null);
  
  const [showReports, setShowReports] = useState(false);
  const [currentChart, setCurrentChart] = useState(null);

  useEffect(() => {
    loadDataSummary();
    // Add welcome message
    setMessages([{
      id: 1,
      text: "Hello! I'm your AI assistant. I can help you analyze your business data. Try asking me about customers, orders, products, or sales!",
      isUser: false,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const loadDataSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/data/summary`);
      setDataSummary(response.data);
    } catch (error) {
      console.error('Error loading data summary:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        query: inputText
      });

      // Check if this is an advanced analytics request
      if (response.data.result.advanced_analytics) {
        const analyticsResponse = await axios.post(`${API_BASE_URL}/analytics/advanced`, {
          type: response.data.result.analysis_type
        });

        const aiMessage = {
          id: Date.now() + 1,
          text: formatAdvancedAnalytics(analyticsResponse.data.analysis, analyticsResponse.data.analysis_type),
          isUser: false,
          timestamp: new Date().toISOString(),
          data: analyticsResponse.data.analysis
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        const aiMessage = {
          id: Date.now() + 1,
          text: formatAIResponse(response.data.result),
          isUser: false,
          timestamp: new Date().toISOString(),
          data: response.data.result
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAIResponse = (data) => {
    if (typeof data === 'string') return data;
    
    if (data.message) return data.message;
    
    // Enhanced customer responses
    if (data.total_customers) {
      return `📊 Total customers: ${data.total_customers}`;
    }
    
    if (data.premium_customers && Array.isArray(data.premium_customers)) {
      return `👑 Premium customers (${data.premium_customers.length}):\n\n${data.premium_customers.slice(0, 5).map(c => `• ${c.FNAME1} ${c.LNAME} - ${c.Email}`).join('\n')}${data.premium_customers.length > 5 ? '\n...and more' : ''}`;
    }
    
    if (data.standard_customers && Array.isArray(data.standard_customers)) {
      return `👤 Standard customers (${data.standard_customers.length}):\n\n${data.standard_customers.slice(0, 5).map(c => `• ${c.FNAME1} ${c.LNAME} - ${c.Email}`).join('\n')}${data.standard_customers.length > 5 ? '\n...and more' : ''}`;
    }
    
    if (data.top_customers_by_revenue) {
      const topCustomers = Object.entries(data.top_customers_by_revenue)
        .slice(0, 5)
        .map(([customer, revenue]) => `• ${customer}: $${revenue.toFixed(2)}`)
        .join('\n');
      return `🏆 Top customers by revenue:\n${topCustomers}`;
    }
    
    if (data.top_customers_by_orders) {
      const topCustomers = Object.entries(data.top_customers_by_orders)
        .slice(0, 5)
        .map(([customer, orders]) => `• ${customer}: ${orders} orders`)
        .join('\n');
      return `📈 Top customers by orders:\n${topCustomers}`;
    }
    
    if (data.average_customer_spending) {
      return `💰 Average customer spending: $${data.average_customer_spending}`;
    }
    
    if (data.recent_customers && Array.isArray(data.recent_customers)) {
      return `🆕 Recent customers:\n\n${data.recent_customers.slice(0, 5).map(c => `• ${c.FNAME1} ${c.LNAME} - Joined: ${new Date(c.FIRSTDATE).toLocaleDateString()}`).join('\n')}`;
    }
    
    // Enhanced order responses
    if (data.total_orders) {
      return `📦 Total orders: ${data.total_orders}`;
    }
    
    if (data.pending_orders !== undefined) {
      return `⏳ Pending orders: ${data.pending_orders}\n💰 Pending revenue: $${data.pending_revenue.toFixed(2)}`;
    }
    
    if (data.completed_orders !== undefined) {
      return `✅ Completed orders: ${data.completed_orders}\n💰 Completed revenue: $${data.completed_revenue.toFixed(2)}`;
    }
    
    if (data.average_order_value) {
      return `💵 Average order value: $${data.average_order_value}`;
    }
    
    // Enhanced product responses
    if (data.top_products_by_revenue) {
      const topProducts = Object.entries(data.top_products_by_revenue)
        .slice(0, 5)
        .map(([product, revenue]) => `• ${product}: $${revenue.toFixed(2)}`)
        .join('\n');
      return `🏆 Top products by revenue:\n${topProducts}`;
    }
    
    if (data.top_products_by_quantity) {
      const topProducts = Object.entries(data.top_products_by_quantity)
        .slice(0, 5)
        .map(([product, count]) => `• ${product}: ${count} sales`)
        .join('\n');
      return `📈 Top products by quantity:\n${topProducts}`;
    }
    
    if (data.category_revenue) {
      const categories = Object.entries(data.category_revenue)
        .slice(0, 5)
        .map(([category, revenue]) => `• ${category}: $${revenue.toFixed(2)}`)
        .join('\n');
      return `📊 Revenue by category:\n${categories}`;
    }
    
    if (data.category_distribution) {
      const categories = Object.entries(data.category_distribution)
        .slice(0, 5)
        .map(([category, count]) => `• ${category}: ${count} items`)
        .join('\n');
      return `📦 Items by category:\n${categories}`;
    }
    
    if (data.average_product_price) {
      return `💰 Average product price: $${data.average_product_price}`;
    }
    
    if (data.highest_product_price) {
      return `⬆️ Highest product price: $${data.highest_product_price}`;
    }
    
    if (data.lowest_product_price) {
      return `⬇️ Lowest product price: $${data.lowest_product_price}`;
    }
    
    // Enhanced financial responses
    if (data.total_revenue) {
      return `💰 Total revenue: $${data.total_revenue.toLocaleString()}`;
    }
    
    if (data.monthly_revenue) {
      const months = Object.entries(data.monthly_revenue)
        .slice(0, 6)
        .map(([month, revenue]) => `• ${month}: $${revenue.toFixed(2)}`)
        .join('\n');
      return `📅 Monthly revenue:\n${months}`;
    }
    
    if (data.daily_revenue) {
      const days = Object.entries(data.daily_revenue)
        .slice(0, 7)
        .map(([day, revenue]) => `• ${day}: $${revenue.toFixed(2)}`)
        .join('\n');
      return `📅 Daily revenue (recent):\n${days}`;
    }
    
    if (data.revenue_growth_rate) {
      const trend = data.revenue_growth_rate > 0 ? '📈' : '📉';
      return `${trend} Revenue growth rate: ${data.revenue_growth_rate}%`;
    }
    
    // Business insights
    if (data.business_insights) {
      const insights = data.business_insights;
      return `📊 Business Insights:\n\n` +
        `👥 Total customers: ${insights.total_customers}\n` +
        `📦 Total orders: ${insights.total_orders}\n` +
        `💰 Total revenue: $${insights.total_revenue.toLocaleString()}\n` +
        `💵 Average order value: $${insights.average_order_value}\n` +
        `🏆 Top customer: ${insights.top_customer}\n` +
        `⭐ Top product: ${insights.top_product}\n` +
        `✅ Order completion rate: ${insights.order_completion_rate}%`;
    }
    
    // Time-based responses
    if (data.period_orders !== undefined) {
      return `📊 Period Summary:\n\n` +
        `📦 Orders: ${data.period_orders}\n` +
        `💰 Revenue: $${data.period_revenue.toFixed(2)}\n` +
        `👥 Customers: ${data.period_customers}`;
    }
    
    // Legacy responses
    if (data.customers && Array.isArray(data.customers)) {
      return `👥 Found ${data.customers.length} customers:\n\n${data.customers.slice(0, 3).map(c => `• ${c.FNAME1} ${c.LNAME} (${c.Customer_Type}) - ${c.Email}`).join('\n')}${data.customers.length > 3 ? '\n...and more' : ''}`;
    }
    
    if (data.products && Array.isArray(data.products)) {
      return `🛍️ Found ${data.products.length} products:\n\n${data.products.slice(0, 3).map(p => `• ${p.name} - $${p.baseprice}`).join('\n')}${data.products.length > 3 ? '\n...and more' : ''}`;
    }
    
    if (data.top_products) {
      const topProducts = Object.entries(data.top_products)
        .map(([product, count]) => `• ${product}: ${count} sales`)
        .join('\n');
      return `🏆 Top products by sales:\n${topProducts}`;
    }
    
    if (data.order_status_distribution) {
      const statuses = Object.entries(data.order_status_distribution)
        .map(([status, count]) => `• ${status}: ${count}`)
        .join('\n');
      return `📊 Order status distribution:\n${statuses}`;
    }
    
    if (data.customer_revenue) {
      const topCustomers = Object.entries(data.customer_revenue)
        .slice(0, 3)
        .map(([customer, revenue]) => `• ${customer}: $${revenue.toFixed(2)}`)
        .join('\n');
      return `🏆 Top customers by revenue:\n${topCustomers}`;
    }
    
    // Help and suggestions
    if (data.suggestions && Array.isArray(data.suggestions)) {
      return `💡 ${data.message}\n\n${data.suggestions.map(s => `• ${s}`).join('\n')}`;
    }
    
    return JSON.stringify(data, null, 2);
  };

  const formatAdvancedAnalytics = (analysis, analysisType) => {
    if (analysisType === 'comprehensive') {
      const business = analysis.business_overview;
      const customer = analysis.customer_analysis;
      const product = analysis.product_analysis;
      const financial = analysis.financial_analysis;
      const time = analysis.time_analysis;

      return `📊 COMPREHENSIVE BUSINESS ANALYSIS\n\n` +
        `🏢 BUSINESS OVERVIEW:\n` +
        `• Total Customers: ${business.total_customers}\n` +
        `• Total Orders: ${business.total_orders}\n` +
        `• Total Revenue: $${business.total_revenue.toLocaleString()}\n` +
        `• Average Order Value: $${business.average_order_value}\n` +
        `• Order Completion Rate: ${business.order_completion_rate}%\n\n` +
        `👥 CUSTOMER ANALYSIS:\n` +
        `• Premium Customers: ${customer.premium_customers}\n` +
        `• Standard Customers: ${customer.standard_customers}\n` +
        `• Top Customer: ${customer.top_customer_by_revenue}\n` +
        `• Top Customer Revenue: $${customer.top_customer_revenue.toLocaleString()}\n` +
        `• Average Customer Spending: $${customer.average_customer_spending}\n\n` +
        `🛍️ PRODUCT ANALYSIS:\n` +
        `• Total Products: ${product.total_products}\n` +
        `• Top Product (Quantity): ${product.top_product_by_quantity}\n` +
        `• Top Product (Revenue): ${product.top_product_by_revenue}\n` +
        `• Average Product Price: $${product.average_product_price}\n\n` +
        `💰 FINANCIAL ANALYSIS:\n` +
        `• Total Revenue: $${financial.total_revenue.toLocaleString()}\n` +
        `• Pending Revenue: $${financial.pending_revenue.toLocaleString()}\n` +
        `• Completed Revenue: $${financial.completed_revenue.toLocaleString()}\n\n` +
        `⏰ TIME ANALYSIS:\n` +
        `• Recent Orders (2025): ${time.recent_orders}\n` +
        `• Oldest Order: ${time.oldest_order}\n` +
        `• Newest Order: ${time.newest_order}`;
    }
    
    else if (analysisType === 'customer_segmentation') {
      const segments = analysis.customer_segments;
      const high = segments.high_value_customers;
      const medium = segments.medium_value_customers;
      const low = segments.low_value_customers;

      return `👥 CUSTOMER SEGMENTATION ANALYSIS\n\n` +
        `🏆 HIGH VALUE CUSTOMERS:\n` +
        `• Count: ${high.count} (${high.percentage}%)\n` +
        `• Average Spending: $${high.avg_spending}\n\n` +
        `📊 MEDIUM VALUE CUSTOMERS:\n` +
        `• Count: ${medium.count} (${medium.percentage}%)\n` +
        `• Average Spending: $${medium.avg_spending}\n\n` +
        `📈 LOW VALUE CUSTOMERS:\n` +
        `• Count: ${low.count} (${low.percentage}%)\n` +
        `• Average Spending: $${low.avg_spending}`;
    }
    
    else if (analysisType === 'product_performance') {
      const performance = analysis.product_performance;
      const price = performance.price_analysis;

      return `🛍️ PRODUCT PERFORMANCE ANALYSIS\n\n` +
        `💰 PRICE ANALYSIS:\n` +
        `• Highest Price: $${price.highest_price}\n` +
        `• Lowest Price: $${price.lowest_price}\n` +
        `• Average Price: $${price.average_price}\n` +
        `• Median Price: $${price.median_price}\n\n` +
        `📊 CATEGORY PERFORMANCE:\n` +
        `${Object.entries(performance.category_performance).slice(0, 5).map(([cat, rev]) => `• ${cat}: $${rev.toFixed(2)}`).join('\n')}`;
    }
    
    return JSON.stringify(analysis, null, 2);
  };

  const generateTextReport = async (type) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/reports/text`, {
        type: type
      });
      
      const reportMessage = {
        id: Date.now(),
        text: response.data.report,
        isUser: false,
        timestamp: new Date().toISOString(),
        isReport: true
      };
      
      setMessages(prev => [...prev, reportMessage]);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const generateVisualReport = async (type) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/reports/visual`, {
        type: type
      });
      
      setCurrentChart({
        type: type,
        data: response.data.chart
      });
      setShowReports(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate visual report');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      <Text style={[styles.messageText, item.isUser ? styles.userMessageText : styles.aiMessageText]}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.quickActionsTitle}>Quick Actions:</Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setInputText('Show me business insights')}
        >
          <Text style={styles.actionButtonText}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setInputText('Who are the top customers by spending?')}
        >
          <Text style={styles.actionButtonText}>Top Customers</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setInputText('What are the most popular products?')}
        >
          <Text style={styles.actionButtonText}>Top Products</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setInputText('Show me today\'s sales')}
        >
          <Text style={styles.actionButtonText}>Today's Sales</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setInputText('How many orders are pending?')}
        >
          <Text style={styles.actionButtonText}>Pending Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setInputText('Show me monthly revenue trends')}
        >
          <Text style={styles.actionButtonText}>Revenue Trends</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setInputText('What is the average order value?')}
        >
          <Text style={styles.actionButtonText}>Avg Order Value</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setInputText('Give me advanced analytics')}
        >
          <Text style={styles.actionButtonText}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setShowReports(true)}
        >
          <Text style={styles.actionButtonText}>Reports</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDataSummary = () => {
    if (!dataSummary) return null;
    
    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Business Overview</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{dataSummary.total_customers}</Text>
            <Text style={styles.summaryLabel}>Customers</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{dataSummary.total_orders}</Text>
            <Text style={styles.summaryLabel}>Orders</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>${dataSummary.total_revenue?.toFixed(0)}</Text>
            <Text style={styles.summaryLabel}>Revenue</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{dataSummary.total_products}</Text>
            <Text style={styles.summaryLabel}>Products</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Business Assistant</Text>
        <TouchableOpacity onPress={loadDataSummary}>
          <Icon name="refresh" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      {/* Data Summary */}
      {renderDataSummary()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me about your business data..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Reports Modal */}
      {showReports && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate Reports</Text>
            
            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => generateTextReport('summary')}
            >
              <Text style={styles.reportButtonText}>📊 Business Summary Report</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => generateTextReport('customer')}
            >
              <Text style={styles.reportButtonText}>👥 Customer Analysis Report</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => generateVisualReport('revenue_by_customer')}
            >
              <Text style={styles.reportButtonText}>📈 Revenue by Customer Chart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => generateVisualReport('product_sales')}
            >
              <Text style={styles.reportButtonText}>🛍️ Top Products Chart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => generateVisualReport('order_status')}
            >
              <Text style={styles.reportButtonText}>📦 Order Status Pie Chart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowReports(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    marginBottom: 10,
    minWidth: '45%',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
  },
  quickActions: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    minWidth: '22%',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#343a40',
  },
  timestamp: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: 5,
    textAlign: 'right',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    color: '#6c757d',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007bff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 20,
    textAlign: 'center',
  },
  reportButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  reportButtonText: {
    fontSize: 16,
    color: '#343a40',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
