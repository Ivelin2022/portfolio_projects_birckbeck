"""
Stock Data Processor for BDM Assignment Dashboard
Processes NASDAQ stock data and exports to JSON for visualization
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path

def load_and_clean_data(filepath):
    """Load CSV and clean price columns"""
    df = pd.read_csv(filepath)
    
    # Clean price columns (remove $ symbols)
    price_cols = ['Close/Last', 'Open', 'High', 'Low']
    for col in price_cols:
        df[col] = df[col].str.replace('$', '', regex=False).astype(float)
    
    # Rename columns for clarity
    df.columns = ['Company', 'Date', 'Close', 'Volume', 'Open', 'High', 'Low']
    
    # Calculate daily range (volatility proxy)
    df['DailyRange'] = df['High'] - df['Low']
    
    # Parse dates (handle mixed formats)
    df['Date'] = pd.to_datetime(df['Date'], format='mixed', dayfirst=False)
    df = df.dropna(subset=['Date'])
    df = df.sort_values(['Company', 'Date'])
    
    return df

def calculate_summary_stats(df):
    """Calculate summary statistics per company"""
    summary = df.groupby('Company').agg({
        'Close': ['mean', 'min', 'max', 'std'],
        'Volume': 'mean',
        'DailyRange': ['mean', 'std'],
        'Company': 'count'
    }).round(2)
    
    summary.columns = ['avgClose', 'minClose', 'maxClose', 'stdClose', 
                       'avgVolume', 'avgDailyRange', 'stdDailyRange', 'records']
    summary = summary.reset_index()
    
    return summary.to_dict('records')

def calculate_monthly_data(df):
    """Aggregate to monthly averages for time series"""
    df['YearMonth'] = df['Date'].dt.to_period('M')
    
    monthly = df.groupby(['Company', 'YearMonth']).agg({
        'Close': 'mean',
        'Volume': 'mean',
        'DailyRange': 'mean'
    }).round(2).reset_index()
    
    monthly['YearMonth'] = monthly['YearMonth'].astype(str)
    
    # Convert to nested dict by company
    result = {}
    for company in df['Company'].unique():
        comp_data = monthly[monthly['Company'] == company]
        result[company] = [
            {
                'date': row['YearMonth'],
                'close': row['Close'],
                'volume': int(row['Volume']),
                'dailyRange': row['DailyRange']
            }
            for _, row in comp_data.iterrows()
        ]
    
    return result

def calculate_volume_ranking(df):
    """Calculate average volume ranking for ANOVA visualization"""
    ranking = df.groupby('Company')['Volume'].mean().sort_values(ascending=False)
    return [
        {'company': company, 'avgVolume': int(vol)}
        for company, vol in ranking.items()
    ]

def calculate_correlations(df):
    """Calculate key correlations from assignment"""
    corr_matrix = df[['Close', 'Volume', 'DailyRange']].corr()
    
    return [
        {'pair': 'Price-Volatility', 'coefficient': round(corr_matrix.loc['Close', 'DailyRange'], 3)},
        {'pair': 'Price-Volume', 'coefficient': round(corr_matrix.loc['Close', 'Volume'], 3)},
        {'pair': 'Volume-Volatility', 'coefficient': round(corr_matrix.loc['Volume', 'DailyRange'], 3)}
    ]

def calculate_scatter_data(df, sample_size=500):
    """Get sample data for scatter plot"""
    sample = df.sample(n=min(sample_size, len(df)), random_state=42)
    return [
        {
            'company': row['Company'],
            'close': round(row['Close'], 2),
            'dailyRange': round(row['DailyRange'], 2),
            'volume': int(row['Volume'])
        }
        for _, row in sample.iterrows()
    ]

def generate_monte_carlo_data(mean=2.82, std=4.01, n=1000):
    """Generate Monte Carlo simulation data"""
    np.random.seed(42)
    simulated = np.random.normal(mean, std, n)
    
    return {
        'values': [round(v, 2) for v in simulated.tolist()],
        'mean': mean,
        'std': std,
        'percentile5': round(np.percentile(simulated, 5), 2),
        'percentile95': round(np.percentile(simulated, 95), 2)
    }

def get_volatility_distribution(df, bins=20):
    """Get distribution of daily range values"""
    counts, edges = np.histogram(df['DailyRange'].dropna(), bins=bins)
    
    return [
        {'range': f'{edges[i]:.1f}-{edges[i+1]:.1f}', 'count': int(counts[i])}
        for i in range(len(counts))
    ]

def main():
    # Load data
    print("Loading data...")
    script_dir = Path(__file__).parent
    df = load_and_clean_data(script_dir / 'data.csv')
    print(f"Loaded {len(df)} records for {df['Company'].nunique()} companies")
    
    # Process all data
    print("Processing statistics...")
    data = {
        'metadata': {
            'totalRecords': len(df),
            'companies': sorted(df['Company'].unique().tolist()),
            'dateRange': {
                'start': df['Date'].min().strftime('%Y-%m-%d'),
                'end': df['Date'].max().strftime('%Y-%m-%d')
            }
        },
        'summary': calculate_summary_stats(df),
        'monthlyData': calculate_monthly_data(df),
        'volumeRanking': calculate_volume_ranking(df),
        'correlations': calculate_correlations(df),
        'scatterData': calculate_scatter_data(df),
        'volatilityDistribution': get_volatility_distribution(df),
        'monteCarlo': generate_monte_carlo_data(),
        'anova': {
            'fStatistic': 3015.193,
            'pValue': '<0.001',
            'effectSize': 0.519,
            'conclusion': 'H₀ rejected: Significant volume differences exist between companies'
        },
        'regression': {
            'rSquared': 0.608,
            'coefficient': 0.031,
            'intercept': -0.318,
            'beta': 0.78,
            'equation': 'DailyRange = -0.318 + 0.031 × Close'
        },
        'colors': {
            'AAPL': '#007AFF',
            'AMD': '#ED1C24',
            'AMZN': '#FF9900',
            'CSCO': '#049FD9',
            'META': '#0668E1',
            'MSFT': '#00A4EF',
            'NFLX': '#E50914',
            'QCOM': '#3253DC',
            'SBUX': '#00704A',
            'TSLA': '#CC0000'
        }
    }
    
    # Export to JSON
    output_path = script_dir / 'stock_data.json'
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Exported to {output_path}")

    # Also create a JS module version
    js_output = f"const STOCK_DATA = {json.dumps(data, indent=2)};"
    js_path = script_dir / 'stock_data.js'
    with open(js_path, 'w') as f:
        f.write(js_output)
    print(f"Exported to {js_path}")
    
    return data

if __name__ == '__main__':
    main()
