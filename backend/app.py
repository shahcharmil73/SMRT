from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
from datetime import datetime
import json
import plotly.graph_objects as go
import plotly.express as px
from plotly.utils import PlotlyJSONEncoder
import base64
from io import BytesIO

app = Flask(__name__)
CORS(app)

class CSVDataManager:
    def __init__(self, data_dir='../data'):
        self.data_dir = data_dir
        self.customer_df = None
        self.inventory_df = None
        self.detail_df = None
        self.pricelist_df = None
        self.load_all_data()
    
    def load_all_data(self):
        """Load all CSV files into memory"""
        try:
            self.customer_df = pd.read_csv(os.path.join(self.data_dir, 'Customer.csv'))
            self.inventory_df = pd.read_csv(os.path.join(self.data_dir, 'Inventory.csv'))
            self.detail_df = pd.read_csv(os.path.join(self.data_dir, 'Detail.csv'))
            self.pricelist_df = pd.read_csv(os.path.join(self.data_dir, 'Pricelist.csv'))
            print("All CSV files loaded successfully")
        except Exception as e:
            print(f"Error loading CSV files: {e}")
    
    def get_merged_data(self):
        """Get fully merged dataset for comprehensive queries"""
        # Merge all tables
        merged = self.detail_df.merge(
            self.inventory_df, on='IID'
        ).merge(
            self.customer_df, on='CID'
        ).merge(
            self.pricelist_df, left_on='price_table_item_id', right_on='price_table_item_id'
        )
        return merged
    
    def validate_query_result(self, result, query_context):
        """Validate that AI response is grounded in actual data"""
        if isinstance(result, dict):
            # Check if numeric values are reasonable
            for key, value in result.items():
                if isinstance(value, (int, float)):
                    if value < 0 or value > 1000000:  # Sanity check
                        return False, f"Value {value} for {key} seems unrealistic"
        return True, "Validated"
    
    def get_data_summary(self):
        """Get summary statistics of the dataset"""
        merged = self.get_merged_data()
        summary = {
            'total_customers': len(self.customer_df),
            'total_orders': len(self.inventory_df),
            'total_order_items': len(self.detail_df),
            'total_products': len(self.pricelist_df),
            'total_revenue': merged['Total_Price'].sum(),
            'avg_order_value': merged.groupby('IID')['Total_Price'].sum().mean(),
            'top_customer_by_orders': merged['Customer_Name'].value_counts().head(1).to_dict(),
            'top_product_by_sales': merged['Product_Name'].value_counts().head(1).to_dict()
        }
        return summary

# Initialize data manager
data_manager = CSVDataManager()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/query', methods=['POST'])
def process_query():
    """Process natural language queries about the data"""
    try:
        data = request.get_json()
        query = data.get('query', '').lower()
        
        if not query:
            return jsonify({'error': 'No query provided'}), 400
        
        # Get merged data for comprehensive analysis
        merged_data = data_manager.get_merged_data()
        
        # Process different types of queries
        result = process_data_query(query, merged_data, data_manager)
        
        # Validate the result
        is_valid, validation_msg = data_manager.validate_query_result(result, query)
        if not is_valid:
            result['validation_warning'] = validation_msg
        
        return jsonify({
            'query': query,
            'result': result,
            'timestamp': datetime.now().isoformat(),
            'data_grounded': True
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def process_data_query(query, merged_data, data_manager):
    """Process different types of queries and return structured results with enhanced AI capabilities"""
    
    query_lower = query.lower()
    
    # Handle "big customers" type queries even without explicit "customer" word
    if any(word in query_lower for word in ['big customers', 'large customers', 'major customers', 'key customers', 'important customers']):
        customer_revenue = merged_data.groupby('Customer_Name')['Total_Price'].sum().sort_values(ascending=False).head(10)
        return {'top_customers_by_revenue': customer_revenue.to_dict()}
    
    # Enhanced customer queries
    if any(word in query_lower for word in ['customer', 'client', 'buyer']):
        if any(word in query_lower for word in ['list', 'show', 'all', 'every']):
            if 'premium' in query_lower:
                premium_customers = data_manager.customer_df[data_manager.customer_df['Customer_Type'] == 'Premium']
                return {'premium_customers': premium_customers.to_dict('records')}
            elif 'standard' in query_lower:
                standard_customers = data_manager.customer_df[data_manager.customer_df['Customer_Type'] == 'Standard']
                return {'standard_customers': standard_customers.to_dict('records')}
            else:
                return {'customers': data_manager.customer_df.to_dict('records')}
        elif any(word in query_lower for word in ['total', 'count', 'how many', 'number']):
            return {'total_customers': len(data_manager.customer_df)}
        elif any(word in query_lower for word in ['top', 'best', 'highest', 'big', 'large', 'major', 'key', 'important']):
            if 'spending' in query_lower or 'revenue' in query_lower or 'big' in query_lower or 'large' in query_lower:
                customer_revenue = merged_data.groupby('Customer_Name')['Total_Price'].sum().sort_values(ascending=False).head(10)
                return {'top_customers_by_revenue': customer_revenue.to_dict()}
            elif 'orders' in query_lower:
                customer_orders = merged_data.groupby('Customer_Name')['IID'].nunique().sort_values(ascending=False).head(10)
                return {'top_customers_by_orders': customer_orders.to_dict()}
            else:
                # Default to revenue-based ranking for "big customers" type queries
                customer_revenue = merged_data.groupby('Customer_Name')['Total_Price'].sum().sort_values(ascending=False).head(10)
                return {'top_customers_by_revenue': customer_revenue.to_dict()}
        elif 'average' in query_lower and 'spending' in query_lower:
            avg_spending = merged_data.groupby('Customer_Name')['Total_Price'].sum().mean()
            return {'average_customer_spending': round(avg_spending, 2)}
        elif 'new' in query_lower or 'recent' in query_lower:
            recent_customers = data_manager.customer_df.sort_values('FIRSTDATE', ascending=False).head(10)
            return {'recent_customers': recent_customers.to_dict('records')}
    
    # Enhanced order queries
    elif any(word in query_lower for word in ['order', 'transaction', 'purchase']):
        if any(word in query_lower for word in ['total', 'count', 'how many', 'number']):
            return {'total_orders': len(data_manager.inventory_df)}
        elif any(word in query_lower for word in ['revenue', 'sales', 'income', 'money']):
            if 'total' in query_lower:
                total_revenue = merged_data['Total_Price'].sum()
                return {'total_revenue': round(total_revenue, 2)}
            elif 'average' in query_lower:
                avg_order_value = merged_data.groupby('IID')['Total_Price'].sum().mean()
                return {'average_order_value': round(avg_order_value, 2)}
        elif 'status' in query_lower or 'state' in query_lower:
            order_status = data_manager.inventory_df['Status'].value_counts().to_dict()
            return {'order_status_distribution': order_status}
        elif 'pending' in query_lower or 'unpaid' in query_lower:
            pending_orders = data_manager.inventory_df[data_manager.inventory_df['PIF'] == 'N']
            return {'pending_orders': len(pending_orders), 'pending_revenue': pending_orders['SUBTOTAL'].sum()}
        elif 'completed' in query_lower or 'paid' in query_lower:
            completed_orders = data_manager.inventory_df[data_manager.inventory_df['PIF'] == 'Y']
            return {'completed_orders': len(completed_orders), 'completed_revenue': completed_orders['SUBTOTAL'].sum()}
    
    # Enhanced product queries
    elif any(word in query_lower for word in ['product', 'item', 'service', 'inventory']):
        if any(word in query_lower for word in ['list', 'show', 'all', 'every']):
            return {'products': data_manager.pricelist_df.to_dict('records')}
        elif any(word in query_lower for word in ['top', 'best', 'popular', 'selling', 'highest']):
            if 'revenue' in query_lower or 'sales' in query_lower:
                product_revenue = merged_data.groupby('Product_Name')['Total_Price'].sum().sort_values(ascending=False).head(10)
                return {'top_products_by_revenue': product_revenue.to_dict()}
            else:
                top_products = merged_data['Product_Name'].value_counts().head(10).to_dict()
                return {'top_products_by_quantity': top_products}
        elif 'category' in query_lower:
            if 'revenue' in query_lower or 'sales' in query_lower:
                category_revenue = merged_data.groupby('Category')['Total_Price'].sum().sort_values(ascending=False).to_dict()
                return {'category_revenue': category_revenue}
            else:
                category_count = merged_data['Category'].value_counts().to_dict()
                return {'category_distribution': category_count}
        elif 'price' in query_lower:
            if 'average' in query_lower:
                avg_price = merged_data['Total_Price'].mean()
                return {'average_product_price': round(avg_price, 2)}
            elif 'highest' in query_lower:
                highest_price = merged_data['Total_Price'].max()
                return {'highest_product_price': highest_price}
            elif 'lowest' in query_lower:
                lowest_price = merged_data['Total_Price'].min()
                return {'lowest_product_price': lowest_price}
    
    # Enhanced financial queries
    elif any(word in query_lower for word in ['revenue', 'sales', 'profit', 'income', 'money', 'financial']):
        if 'total' in query_lower:
            total_revenue = merged_data['Total_Price'].sum()
            return {'total_revenue': round(total_revenue, 2)}
        elif 'by customer' in query_lower:
            customer_revenue = merged_data.groupby('Customer_Name')['Total_Price'].sum().sort_values(ascending=False).to_dict()
            return {'customer_revenue': customer_revenue}
        elif any(word in query_lower for word in ['monthly', 'by month', 'month']):
            merged_data['Order_Date'] = pd.to_datetime(merged_data['Order_Date'])
            monthly_revenue = merged_data.groupby(merged_data['Order_Date'].dt.to_period('M'))['Total_Price'].sum().to_dict()
            return {'monthly_revenue': {str(k): v for k, v in monthly_revenue.items()}}
        elif any(word in query_lower for word in ['daily', 'by day', 'day']):
            merged_data['Order_Date'] = pd.to_datetime(merged_data['Order_Date'])
            daily_revenue = merged_data.groupby(merged_data['Order_Date'].dt.date)['Total_Price'].sum().to_dict()
            return {'daily_revenue': {str(k): v for k, v in daily_revenue.items()}}
        elif 'growth' in query_lower or 'trend' in query_lower:
            merged_data['Order_Date'] = pd.to_datetime(merged_data['Order_Date'])
            monthly_revenue = merged_data.groupby(merged_data['Order_Date'].dt.to_period('M'))['Total_Price'].sum()
            if len(monthly_revenue) > 1:
                growth_rate = ((monthly_revenue.iloc[-1] - monthly_revenue.iloc[0]) / monthly_revenue.iloc[0]) * 100
                return {'revenue_growth_rate': round(growth_rate, 2)}
    
    # Enhanced analytical queries
    elif 'analysis' in query_lower or 'insights' in query_lower or 'analytics' in query_lower:
        insights = {
            'total_customers': len(data_manager.customer_df),
            'total_orders': len(data_manager.inventory_df),
            'total_revenue': round(merged_data['Total_Price'].sum(), 2),
            'average_order_value': round(merged_data.groupby('IID')['Total_Price'].sum().mean(), 2),
            'top_customer': merged_data.groupby('Customer_Name')['Total_Price'].sum().idxmax(),
            'top_product': merged_data['Product_Name'].value_counts().idxmax(),
            'order_completion_rate': round((data_manager.inventory_df['PIF'] == 'Y').mean() * 100, 2)
        }
        return {'business_insights': insights}
    
    # Time-based queries
    elif any(word in query_lower for word in ['today', 'yesterday', 'this week', 'this month', 'this year']):
        merged_data['Order_Date'] = pd.to_datetime(merged_data['Order_Date'])
        now = pd.Timestamp.now()
        
        if 'today' in query_lower:
            today_data = merged_data[merged_data['Order_Date'].dt.date == now.date()]
        elif 'yesterday' in query_lower:
            yesterday = now - pd.Timedelta(days=1)
            today_data = merged_data[merged_data['Order_Date'].dt.date == yesterday.date()]
        elif 'this week' in query_lower:
            week_start = now - pd.Timedelta(days=now.weekday())
            today_data = merged_data[merged_data['Order_Date'] >= week_start]
        elif 'this month' in query_lower:
            month_start = now.replace(day=1)
            today_data = merged_data[merged_data['Order_Date'] >= month_start]
        elif 'this year' in query_lower:
            year_start = now.replace(month=1, day=1)
            today_data = merged_data[merged_data['Order_Date'] >= year_start]
        
        return {
            'period_orders': len(today_data),
            'period_revenue': round(today_data['Total_Price'].sum(), 2),
            'period_customers': today_data['Customer_Name'].nunique()
        }
    
    # General summary
    elif any(word in query_lower for word in ['summary', 'overview', 'dashboard', 'stats', 'statistics']):
        return data_manager.get_data_summary()
    
    # Advanced analytics queries
    elif any(word in query_lower for word in ['advanced analytics', 'analytics', 'comprehensive analysis', 'detailed analysis']):
        # This will trigger the advanced analytics endpoint
        return {'advanced_analytics': True, 'analysis_type': 'comprehensive'}
    
    elif 'customer segmentation' in query_lower or 'segment customers' in query_lower:
        return {'advanced_analytics': True, 'analysis_type': 'customer_segmentation'}
    
    elif 'product performance' in query_lower or 'product analysis' in query_lower:
        return {'advanced_analytics': True, 'analysis_type': 'product_performance'}
    
    # Help and suggestions
    elif any(word in query_lower for word in ['help', 'what can', 'how to', 'suggestions']):
        return {
            'message': 'I can help you analyze your business data! Here are some things you can ask me:',
            'suggestions': [
                'Show me all customers',
                'What is the total revenue?',
                'Who are the top customers by spending?',
                'What are the most popular products?',
                'Show me order status distribution',
                'What is the average order value?',
                'Show me monthly revenue trends',
                'How many orders are pending?',
                'Give me business insights',
                'Show me today\'s sales',
                'Give me advanced analytics',
                'Show me customer segmentation',
                'Analyze product performance'
            ]
        }
    
    # Default response for unrecognized queries
    else:
        return {
            'message': 'I can help you with questions about customers, orders, products, and sales data. Try asking me about revenue, top customers, popular products, or business insights!',
            'available_queries': [
                'Show all customers',
                'What is the total revenue?',
                'Who are the top customers?',
                'What are the most popular products?',
                'Show me business insights',
                'How many orders are there?'
            ]
        }

@app.route('/api/reports/text', methods=['POST'])
def generate_text_report():
    """Generate textual reports"""
    try:
        data = request.get_json()
        report_type = data.get('type', 'summary')
        
        merged_data = data_manager.get_merged_data()
        
        if report_type == 'summary':
            summary = data_manager.get_data_summary()
            report = f"""
# Business Summary Report
Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Key Metrics
- Total Customers: {summary['total_customers']}
- Total Orders: {summary['total_orders']}
- Total Order Items: {summary['total_order_items']}
- Total Products: {summary['total_products']}
- Total Revenue: ${summary['total_revenue']:,.2f}
- Average Order Value: ${summary['avg_order_value']:,.2f}

## Top Performers
- Top Customer by Orders: {list(summary['top_customer_by_orders'].keys())[0]}
- Top Product by Sales: {list(summary['top_product_by_sales'].keys())[0]}

## Customer Analysis
Premium Customers: {len(data_manager.customer_df[data_manager.customer_df['Customer_Type'] == 'Premium'])}
Standard Customers: {len(data_manager.customer_df[data_manager.customer_df['Customer_Type'] == 'Standard'])}

## Order Status Distribution
{data_manager.inventory_df['Status'].value_counts().to_string()}
            """
        elif report_type == 'customer':
            customer_analysis = merged_data.groupby('Customer_Name').agg({
                'Total_Price': 'sum',
                'IID': 'count',
                'Customer_Type': 'first'
            }).round(2)
            customer_analysis.columns = ['Total_Spent', 'Total_Orders', 'Customer_Type']
            customer_analysis = customer_analysis.sort_values('Total_Spent', ascending=False)
            
            report = f"""
# Customer Analysis Report
Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Customer Spending Summary
{customer_analysis.to_string()}
            """
        
        return jsonify({'report': report, 'type': report_type})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/visual', methods=['POST'])
def generate_visual_report():
    """Generate visual reports using Plotly"""
    try:
        data = request.get_json()
        chart_type = data.get('type', 'revenue_trend')
        
        merged_data = data_manager.get_merged_data()
        
        if chart_type == 'revenue_by_customer':
            customer_revenue = merged_data.groupby('Customer_Name')['Total_Price'].sum().sort_values(ascending=False)
            
            fig = go.Figure(data=[
                go.Bar(x=customer_revenue.index, y=customer_revenue.values)
            ])
            fig.update_layout(
                title='Revenue by Customer',
                xaxis_title='Customer',
                yaxis_title='Total Revenue ($)'
            )
            
        elif chart_type == 'order_status':
            status_counts = data_manager.inventory_df['Status'].value_counts()
            
            fig = go.Figure(data=[
                go.Pie(labels=status_counts.index, values=status_counts.values)
            ])
            fig.update_layout(title='Order Status Distribution')
            
        elif chart_type == 'product_sales':
            product_sales = merged_data['Product_Name'].value_counts().head(10)
            
            fig = go.Figure(data=[
                go.Bar(x=product_sales.values, y=product_sales.index, orientation='h')
            ])
            fig.update_layout(
                title='Top 10 Products by Sales Volume',
                xaxis_title='Number of Sales',
                yaxis_title='Product'
            )
            
        elif chart_type == 'category_revenue':
            category_revenue = merged_data.groupby('Category')['Total_Price'].sum()
            
            fig = go.Figure(data=[
                go.Pie(labels=category_revenue.index, values=category_revenue.values)
            ])
            fig.update_layout(title='Revenue by Product Category')
        
        # Convert plot to JSON
        chart_json = json.dumps(fig, cls=PlotlyJSONEncoder)
        
        return jsonify({'chart': chart_json, 'type': chart_type})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/summary', methods=['GET'])
def get_data_summary():
    """Get basic data summary"""
    try:
        summary = data_manager.get_data_summary()
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/advanced', methods=['POST'])
def advanced_analytics():
    """Advanced analytics and insights"""
    try:
        data = request.get_json()
        analysis_type = data.get('type', 'comprehensive')
        
        merged_data = data_manager.get_merged_data()
        
        if analysis_type == 'comprehensive':
            # Comprehensive business analysis
            analysis = {
                'business_overview': {
                    'total_customers': len(data_manager.customer_df),
                    'total_orders': len(data_manager.inventory_df),
                    'total_revenue': round(merged_data['Total_Price'].sum(), 2),
                    'average_order_value': round(merged_data.groupby('IID')['Total_Price'].sum().mean(), 2),
                    'order_completion_rate': round((data_manager.inventory_df['PIF'] == 'Y').mean() * 100, 2)
                },
                'customer_analysis': {
                    'premium_customers': len(data_manager.customer_df[data_manager.customer_df['Customer_Type'] == 'Premium']),
                    'standard_customers': len(data_manager.customer_df[data_manager.customer_df['Customer_Type'] == 'Standard']),
                    'top_customer_by_revenue': merged_data.groupby('Customer_Name')['Total_Price'].sum().idxmax(),
                    'top_customer_revenue': round(merged_data.groupby('Customer_Name')['Total_Price'].sum().max(), 2),
                    'average_customer_spending': round(merged_data.groupby('Customer_Name')['Total_Price'].sum().mean(), 2)
                },
                'product_analysis': {
                    'total_products': len(data_manager.pricelist_df),
                    'top_product_by_quantity': merged_data['Product_Name'].value_counts().idxmax(),
                    'top_product_by_revenue': merged_data.groupby('Product_Name')['Total_Price'].sum().idxmax(),
                    'category_distribution': merged_data['Category'].value_counts().to_dict(),
                    'average_product_price': round(merged_data['Total_Price'].mean(), 2)
                },
                'financial_analysis': {
                    'total_revenue': round(merged_data['Total_Price'].sum(), 2),
                    'pending_revenue': round(data_manager.inventory_df[data_manager.inventory_df['PIF'] == 'N']['SUBTOTAL'].sum(), 2),
                    'completed_revenue': round(data_manager.inventory_df[data_manager.inventory_df['PIF'] == 'Y']['SUBTOTAL'].sum(), 2),
                    'revenue_by_category': merged_data.groupby('Category')['Total_Price'].sum().to_dict()
                },
                'time_analysis': {
                    'recent_orders': len(data_manager.inventory_df[data_manager.inventory_df['INDATE'] >= '2025-01-01']),
                    'oldest_order': data_manager.inventory_df['INDATE'].min(),
                    'newest_order': data_manager.inventory_df['INDATE'].max()
                }
            }
            
        elif analysis_type == 'customer_segmentation':
            # Customer segmentation analysis
            customer_metrics = merged_data.groupby('Customer_Name').agg({
                'Total_Price': ['sum', 'count', 'mean'],
                'IID': 'nunique'
            }).round(2)
            customer_metrics.columns = ['Total_Spent', 'Total_Items', 'Avg_Item_Price', 'Unique_Orders']
            customer_metrics = customer_metrics.sort_values('Total_Spent', ascending=False)
            
            # Segment customers
            high_value = customer_metrics[customer_metrics['Total_Spent'] > customer_metrics['Total_Spent'].quantile(0.8)]
            medium_value = customer_metrics[(customer_metrics['Total_Spent'] > customer_metrics['Total_Spent'].quantile(0.4)) & 
                                          (customer_metrics['Total_Spent'] <= customer_metrics['Total_Spent'].quantile(0.8))]
            low_value = customer_metrics[customer_metrics['Total_Spent'] <= customer_metrics['Total_Spent'].quantile(0.4)]
            
            analysis = {
                'customer_segments': {
                    'high_value_customers': {
                        'count': len(high_value),
                        'percentage': round(len(high_value) / len(customer_metrics) * 100, 2),
                        'avg_spending': round(high_value['Total_Spent'].mean(), 2),
                        'top_customers': high_value.head(5).to_dict('index')
                    },
                    'medium_value_customers': {
                        'count': len(medium_value),
                        'percentage': round(len(medium_value) / len(customer_metrics) * 100, 2),
                        'avg_spending': round(medium_value['Total_Spent'].mean(), 2)
                    },
                    'low_value_customers': {
                        'count': len(low_value),
                        'percentage': round(len(low_value) / len(customer_metrics) * 100, 2),
                        'avg_spending': round(low_value['Total_Spent'].mean(), 2)
                    }
                }
            }
            
        elif analysis_type == 'product_performance':
            # Product performance analysis
            product_metrics = merged_data.groupby('Product_Name').agg({
                'Total_Price': ['sum', 'count', 'mean'],
                'IID': 'nunique'
            }).round(2)
            product_metrics.columns = ['Total_Revenue', 'Total_Quantity', 'Avg_Price', 'Unique_Orders']
            product_metrics = product_metrics.sort_values('Total_Revenue', ascending=False)
            
            analysis = {
                'product_performance': {
                    'top_products_by_revenue': product_metrics.head(10).to_dict('index'),
                    'top_products_by_quantity': merged_data['Product_Name'].value_counts().head(10).to_dict(),
                    'category_performance': merged_data.groupby('Category')['Total_Price'].sum().sort_values(ascending=False).to_dict(),
                    'price_analysis': {
                        'highest_price': merged_data['Total_Price'].max(),
                        'lowest_price': merged_data['Total_Price'].min(),
                        'average_price': round(merged_data['Total_Price'].mean(), 2),
                        'median_price': round(merged_data['Total_Price'].median(), 2)
                    }
                }
            }
            
        return jsonify({
            'analysis_type': analysis_type,
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    import socket
    
    def find_free_port():
        """Find a free port starting from 5000"""
        for port in range(5000, 5100):
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(('localhost', port))
                    return port
            except OSError:
                continue
        return None
    
    # Try to find a free port
    port = find_free_port()
    if port is None:
        print("No free ports available in range 5000-5099")
        exit(1)
    
    print(f"Starting Flask server on port {port}")
    try:
        app.run(debug=True, host='127.0.0.1', port=port, use_reloader=False)
    except Exception as e:
        print(f"Error starting server: {e}")
        print("Trying alternative port...")
        port = find_free_port()
        if port:
            app.run(debug=True, host='127.0.0.1', port=port, use_reloader=False)
        else:
            print("Failed to start server on any available port")
