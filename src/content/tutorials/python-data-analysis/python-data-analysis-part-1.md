---
title: "Python Data Analysis - Part 1: Pandas Fundamentals"
description: "Learn Pandas essentials: Series, DataFrame, indexing, filtering, and basic transforms."
publishDate: 2025-01-19
tags: ["Python", "Pandas", "Data Analysis"]
difficulty: "beginner"
series: "Python Data Analysis"
part: 1
estimatedTime: "50 minutes"
totalParts: 2
featured: false
---

# Python Data Analysis - Part 1: Pandas Fundamentals

## Setup
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install pandas jupyter
jupyter notebook
```

## Basics
```python
import pandas as pd

data = {
    'name': ['Ada', 'Linus', 'Guido', 'Grace'],
    'lang': ['Ada', 'C', 'Python', 'COBOL'],
    'year': [1843, 1950, 1991, 1959]
}

df = pd.DataFrame(data)
print(df.head())
```

## Filtering and selection
```python
# Boolean mask
modern = df[df['year'] > 1950]

# Select columns
subset = df[['name', 'year']]

# Sorting
sorted_df = df.sort_values('year')
```

In Part 2, we’ll cover grouping, merging, and simple visualization.