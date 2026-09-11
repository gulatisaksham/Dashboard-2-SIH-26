from datetime import datetime, timedelta

def compute_sm2_spaced_repetition(item_id, quality, easiness, interval, repetitions):
    """
    SuperMemo-2 (SM-2) algorithm adapted for cognitive item difficulty tracking.
    quality: 0-5 scale (0 = total blank, 5 = perfect recall under 2s)
    """
    if quality >= 3:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = round(interval * easiness)
        repetitions += 1
    else:
        repetitions = 0
        interval = 1
        
    easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    easiness = max(easiness, 1.3) # Minimum easiness factor per SM-2 rules
    
    next_due_date = datetime.now() + timedelta(days=interval)
    
    return {
        "item_id": item_id,
        "new_easiness": round(easiness, 2),
        "new_interval": interval,
        "new_repetitions": repetitions,
        "next_due_date": next_due_date.isoformat(),
        "difficulty_hint": "easier" if quality < 3 else "maintain"
    }

def get_next_due_items(patient_item_registry):
    """
    Sorts a patient's memory items to find the ones that are overdue for review.
    """
    now = datetime.now()
    due_items = []
    
    for item in patient_item_registry:
        due_date = datetime.fromisoformat(item['next_due_date'])
        if due_date <= now:
            due_items.append(item)
            
    # Sort by how overdue they are, and then by easiness (hardest first)
    due_items.sort(key=lambda x: (x['next_due_date'], x['easiness']))
    
    return due_items

if __name__ == "__main__":
    # Test Data
    item = {"item_id": "photo_daughter", "quality": 1, "easiness": 2.5, "interval": 6, "repetitions": 2}
    print("Patient got item wrong (quality=1):")
    result = compute_sm2_spaced_repetition(**item)
    print(result) # Should reset interval to 1 and lower easiness
