---
title: "Python Data Analysis - Part 2: Grouping, Merging, and Charts"
description: "Aggregate with groupby, join datasets with merge, and plot quick charts."
publishDate: 2025-01-20
tags: ["Python", "Pandas", "Visualization"]
difficulty: "beginner"
series: "Python Data Analysis"
part: 2
estimatedTime: "55 minutes"
totalParts: 2
featured: false
---

# Python Data Analysis - Part 2: Grouping, Merging, and Charts

## Groupby
```python
by_lang = df.groupby('lang')['year'].mean()
print(by_lang)
```

## Merge
```python
langs = pd.DataFrame({
    'lang': ['Ada', 'C', 'Python', 'COBOL'],
    'typed': [True, True, True, False]
})
merged = df.merge(langs, on='lang', how='left')
```

## Quick charts
```python
# Requires matplotlib
import matplotlib.pyplot as plt

by_lang.sort_values().plot(kind='bar', title='Average Year by Language')
plt.tight_layout(); plt.show()
```

You can now aggregate, combine, and visualize data quickly with Pandas.