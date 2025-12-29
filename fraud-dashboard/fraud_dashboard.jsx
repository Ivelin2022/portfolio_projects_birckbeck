import React, { useState } from 'react';

const FraudSystemDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Real data from your system
  const systemResults = {
    dataset: {
      name: "creditcard_2023.csv",
      rows: 568630,
      columns: 30,
      fraudRate: "50% (synthetic)",
      realFraudRate: "0.17% typical"
    },
    models: {
      random_forest: { accuracy: 0.9999, precision: 0.9999, recall: 0.9998, roc_auc: 0.9999, selected: true },
      lightgbm: { accuracy: 0.9989, precision: 0.9999, recall: 0.9978, roc_auc: 0.9999, selected: false },
      xgboost: { accuracy: 0.9893, precision: 0.9868, recall: 0.9919, roc_auc: 0.9995, selected: false },
      logistic_regression: { accuracy: 0.9651, precision: 0.9523, recall: 0.9792, roc_auc: 0.9933, selected: false }
    },
    evaluation: {
      accuracy: 0.9131,
      precision: 0.9997,
      recall: 0.8263,
      f1: 0.9048,
      roc_auc: 0.9980,
      fraudsCaught: 234938,
      fraudsMissed: 49377,
      falseAlarms: 65,
      totalFraud: 284315
    },
    featureImportance: [
      { name: 'V14', importance: 0.165 },
      { name: 'V12', importance: 0.147 },
      { name: 'V10', importance: 0.128 },
      { name: 'V17', importance: 0.126 },
      { name: 'V4', importance: 0.086 },
      { name: 'V11', importance: 0.060 },
      { name: 'V16', importance: 0.060 },
      { name: 'V7', importance: 0.030 }
    ],
    agents: [
      { name: 'DataAgent', status: 'success', time: '4s', output: 'cleaned_data.parquet' },
      { name: 'EDAAgent', status: 'success', time: '4s', output: '3 plots, stats' },
      { name: 'FeatureAgent', status: 'success', time: '1s', output: 'features.parquet' },
      { name: 'ModelAgent', status: 'success', time: '142s', output: 'best_model.joblib' },
      { name: 'ReporterAgent', status: 'success', time: '<1s', output: 'report.md' },
      { name: 'PredictorAgent', status: 'success', time: '14s', output: 'predictions.csv' },
      { name: 'EvaluatorAgent', status: 'success', time: '12s', output: 'evaluation_report.csv' }
    ]
  };

  const confusionMatrix = {
    tn: 284250,
    fp: 65,
    fn: 49377,
    tp: 234938
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🔍 Fraud Detection System — Results</h1>
          <p className="text-gray-400">Multi-Agent Pipeline Successfully Executed</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['overview', 'models', 'evaluation', 'agents'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">Dataset Size</div>
              <div className="text-3xl font-bold text-white">568,630</div>
              <div className="text-gray-500 text-sm">transactions</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">Best Model</div>
              <div className="text-3xl font-bold text-indigo-400">RandomForest</div>
              <div className="text-gray-500 text-sm">99.99% accuracy</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">Frauds Caught</div>
              <div className="text-3xl font-bold text-green-400">82.6%</div>
              <div className="text-gray-500 text-sm">234,938 detected</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">False Alarms</div>
              <div className="text-3xl font-bold text-amber-400">65</div>
              <div className="text-gray-500 text-sm">0.02% false positive</div>
            </div>
          </div>
        )}

        {/* Models Tab */}
        {activeTab === 'models' && (
          <div className="bg-gray-900 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Model Comparison (Test Set)</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-3">Model</th>
                    <th className="text-right py-3">Accuracy</th>
                    <th className="text-right py-3">Precision</th>
                    <th className="text-right py-3">Recall</th>
                    <th className="text-right py-3">ROC-AUC</th>
                    <th className="text-right py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(systemResults.models).map(([name, metrics]) => (
                    <tr 
                      key={name}
                      className={`border-b border-gray-800 ${metrics.selected ? 'bg-indigo-900/20' : ''}`}
                    >
                      <td className="py-3 font-medium">
                        {name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {metrics.selected && <span className="ml-2 text-xs text-indigo-400">★ BEST</span>}
                      </td>
                      <td className="text-right py-3">{(metrics.accuracy * 100).toFixed(2)}%</td>
                      <td className="text-right py-3 text-amber-400">{(metrics.precision * 100).toFixed(2)}%</td>
                      <td className="text-right py-3 text-green-400">{(metrics.recall * 100).toFixed(2)}%</td>
                      <td className="text-right py-3 text-blue-400">{metrics.roc_auc.toFixed(4)}</td>
                      <td className="text-right py-3">
                        {metrics.selected ? (
                          <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded text-xs">Selected</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-800 text-gray-500 rounded text-xs">Trained</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Feature Importance */}
            <h3 className="text-lg font-semibold mt-8 mb-4">Feature Importance (RandomForest)</h3>
            <div className="space-y-2">
              {systemResults.featureImportance.map(feat => (
                <div key={feat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-mono text-gray-300">{feat.name}</span>
                    <span className="text-gray-400">{(feat.importance * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                      style={{ width: `${feat.importance * 100 * 6}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evaluation Tab */}
        {activeTab === 'evaluation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Confusion Matrix</h3>
              <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                <div className="bg-green-900/40 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{confusionMatrix.tn.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">True Negative</div>
                </div>
                <div className="bg-red-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-300">{confusionMatrix.fp.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">False Positive</div>
                </div>
                <div className="bg-red-900/40 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{confusionMatrix.fn.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">False Negative</div>
                </div>
                <div className="bg-green-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-300">{confusionMatrix.tp.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">True Positive</div>
                </div>
              </div>
              
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Detection Rate</span>
                  <span className="text-green-400 font-medium">82.63%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">False Positive Rate</span>
                  <span className="text-amber-400 font-medium">0.02%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Missed Frauds</span>
                  <span className="text-red-400 font-medium">49,377</span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Evaluation Metrics</h3>
              <div className="space-y-4">
                {[
                  { name: 'Accuracy', value: systemResults.evaluation.accuracy, color: 'bg-blue-500' },
                  { name: 'Precision', value: systemResults.evaluation.precision, color: 'bg-amber-500' },
                  { name: 'Recall', value: systemResults.evaluation.recall, color: 'bg-green-500' },
                  { name: 'F1-Score', value: systemResults.evaluation.f1, color: 'bg-purple-500' },
                  { name: 'ROC-AUC', value: systemResults.evaluation.roc_auc, color: 'bg-cyan-500' }
                ].map(metric => (
                  <div key={metric.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{metric.name}</span>
                      <span className="font-medium">{(metric.value * 100).toFixed(2)}%</span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${metric.color} rounded-full transition-all duration-500`}
                        style={{ width: `${metric.value * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning about synthetic data */}
            <div className="lg:col-span-2 bg-amber-900/20 border border-amber-700/50 rounded-xl p-4">
              <div className="flex gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-amber-400">Synthetic Data Warning</h4>
                  <p className="text-gray-300 text-sm mt-1">
                    Your dataset has 50% fraud rate — this is synthetic/balanced data. 
                    Real credit card fraud is typically 0.1-0.3%. The 82.6% recall on production data 
                    is because the model learned from unrealistic distributions. 
                    Use the original <code className="bg-gray-800 px-1 rounded">creditcard.csv</code> (0.17% fraud) for realistic results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Agent Execution Pipeline</h2>
            
            <div className="space-y-3">
              {systemResults.agents.map((agent, idx) => (
                <div key={agent.name} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center text-green-400 font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-gray-400">{agent.output}</div>
                  </div>
                  <div className="text-sm text-gray-500">{agent.time}</div>
                  <div className="px-2 py-1 bg-green-900/50 text-green-400 rounded text-xs">
                    ✓ {agent.status}
                  </div>
                </div>
              ))}
            </div>

            {/* Pipeline Flow */}
            <div className="mt-8 p-4 bg-gray-800/30 rounded-lg font-mono text-sm text-gray-400">
              <pre>{`Orchestrator
    │
    ├─→ DataAgent      → cleaned_data.parquet
    ├─→ EDAAgent       → stats, plots, imbalance_ratio  
    ├─→ FeatureAgent   → features.parquet, transformers
    ├─→ ModelAgent     → best_model.joblib (RandomForest)
    ├─→ ReporterAgent  → report.md
    │
    └─→ [On Demand]
        ├─→ PredictorAgent  → predictions.csv
        └─→ EvaluatorAgent  → evaluation_report.csv`}</pre>
            </div>
          </div>
        )}

        {/* File Outputs */}
        <div className="bg-gray-900 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">📁 Generated Files</h3>
          <div className="font-mono text-sm text-gray-400 bg-gray-950 rounded-lg p-4">
            <pre>{`outputs/
├── intermediate/
│   ├── data_agent_output.json      ✓
│   ├── eda_agent_output.json       ✓
│   ├── feature_agent_output.json   ✓
│   ├── model_agent_output.json     ✓
│   ├── cleaned_data.parquet        ✓
│   └── features.parquet            ✓
└── final/
    ├── best_model.joblib           ✓ (RandomForest)
    ├── predictions.csv             ✓ (568,630 rows)
    ├── fraud_cases.csv             ✓ (235,003 flagged)
    ├── missed_frauds.csv           ✓ (49,377 missed)
    ├── evaluation_report.csv       ✓
    ├── report.md                   ✓
    └── figures/
        ├── class_distribution.png  ✓
        ├── correlation_heatmap.png ✓
        └── feature_distributions.png ✓`}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Multi-Agent Fraud Detection System • 7 Agents • RandomForest Selected
        </div>
      </div>
    </div>
  );
};

export default FraudSystemDashboard;
