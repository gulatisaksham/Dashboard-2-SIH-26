import numpy as np
from sklearn.ensemble import IsolationForest

def compute_rolling_zscore(domain_scores, baseline_len=4):
    """
    Computes a rolling Z-score for the latest session based on past baseline sessions.
    Returns the z-score and a boolean flag (True if significantly declining).
    """
    if len(domain_scores) <= baseline_len:
        return {"mean": 0, "std_dev": 0, "z_score": 0, "is_anomaly": False}
    
    baseline = domain_scores[:baseline_len]
    mean = np.mean(baseline)
    std_dev = max(np.std(baseline), 1.0) # Clamp to 1 to prevent div by zero
    
    current_val = domain_scores[-1]
    z_score = (current_val - mean) / std_dev
    
    return {
        "mean": round(mean, 2),
        "std_dev": round(std_dev, 2),
        "z_score": round(z_score, 2),
        "is_anomaly": bool(z_score <= -1.5)
    }

def detect_isolation_forest_anomaly(session_features):
    """
    Uses IsolationForest to detect non-linear anomalies in multi-dimensional session data
    (e.g., [accuracy, response_time, error_rate]).
    """
    if len(session_features) < 10:
        return False # Not enough data for reliable isolation forest
        
    clf = IsolationForest(contamination=0.1, random_state=42)
    clf.fit(session_features[:-1])
    
    # Predict for the most recent session (-1 means anomaly, 1 means normal)
    prediction = clf.predict([session_features[-1]])
    
    return bool(prediction[0] == -1)

if __name__ == "__main__":
    # Test Data: Memory scores dropping significantly
    memory_scores = [75, 78, 72, 70, 55, 50]
    result = compute_rolling_zscore(memory_scores)
    print(f"Memory Domain Check: {result}") # Should flag True
    
    # Test Data: Attention scores remaining stable
    attention_scores = [85, 87, 86, 88, 85, 86]
    result2 = compute_rolling_zscore(attention_scores)
    print(f"Attention Domain Check: {result2}") # Should flag False
