# Machine Learning Methodology & Data Mining Alignment

## 1. Syllabus Context & Alignment

This module strictly fulfills **Module 3 (Classification and Clustering)** of the **KTU S5 Data Mining Course (PECST525)**.

| Syllabus Section | Theoretical Requirement | Implementation in DATAMI |
|---|---|---|
| **Classification Introduction** | Supervised learning from historical observations | Categorizing police stations into discrete relative crime risk tiers |
| **Decision Tree Principle** | Information Gain / Gini Impurity | scikit-learn `DecisionTreeClassifier` with `criterion='gini'` |
| **Tree Construction Algorithm** | ID3 / CART Induction | CART (Classification and Regression Trees) constrained to `max_depth=3` for full explainability |
| **Evaluation Measures** | Accuracy, Precision, Recall, F1-Score | Chronological out-of-time test set evaluation; confusion matrix generation |
| **Comparative Baselines** | Comparison with a similar/baseline approach | Evaluated against Zero-R (Majority class) and Persistence (Lag-1) baselines |

---

## 2. Problem Formulation

### A. Prediction Objective
To predict whether a given police station in Kochi or Ernakulam will experience a **Higher Relative Risk** ($y=1$) or **Lower Relative Risk** ($y=0$) in a future reporting period $T$, conditioned strictly on features extracted prior to $T$.

> [!IMPORTANT]
> **Defensible Risk Labeling**: DATAMI predicts *relative operational volume tiers* at the police-station level. It explicitly **does not claim** to predict individual crimes at arbitrary street coordinates, which would be scientifically invalid on annual aggregate data.

### B. Target Discretization (Syllabus Module 2)
Continuous historical annual incident counts ($C_{s,t}$) are discretized into binary ordinal risk classes using the metropolitan median threshold ($\theta = 824.5$ annual cases):

$$y_{s,t} = \begin{cases} 1 & \text{if } C_{s,t} \ge \theta \quad (\text{Higher Relative Risk}) \\ 0 & \text{if } C_{s,t} < \theta \quad (\text{Lower Relative Risk}) \end{cases}$$

---

## 3. Feature Engineering & Strict Temporal Causality

To prevent **temporal data leakage**, the feature vector $X_{s,t}$ for year $t$ is constructed exclusively from observations in years $\le t-1$:

1. **Preceding Year Volume ($Lag_1$)**:
   $$x_1 = C_{s, t-1}$$
2. **Two-Year Preceding Volume ($Lag_2$)**:
   $$x_2 = C_{s, t-2}$$
3. **Rolling 2-Year Mean**:
   $$x_3 = \frac{C_{s, t-1} + C_{s, t-2}}{2}$$
4. **Registration Trend Rate (Velocity)**:
   $$x_4 = \frac{C_{s, t-1} - C_{s, t-2}}{C_{s, t-2} + 1}$$
5. **Special & Local Laws Enforcement Ratio**:
   $$x_5 = \frac{SLL_{s, t-1}}{C_{s, t-1} + 1}$$

---

## 4. Decision Tree Construction Principle

### Gini Impurity (CART)
For a node $t$ containing samples with class proportions $p(k|t)$ for $k \in \{0, 1\}$:

$$I_G(t) = 1 - \sum_{k=0}^{1} p(k|t)^2$$

For a binary split $s$ dividing node $t$ into children $t_L$ and $t_R$ with sample weights $\frac{N_L}{N}$ and $\frac{N_R}{N}$:

$$\Delta I_G(s, t) = I_G(t) - \left( \frac{N_L}{N} I_G(t_L) + \frac{N_R}{N} I_G(t_R) \right)$$

The algorithm selects the split candidate $s^*$ that maximizes $\Delta I_G(s, t)$.

### Tree Depth Constraint
To ensure complete interpretability suitable for police administration and college examination defense, tree depth is constrained to:
$$\text{max\_depth} = 3$$
This produces a compact decision tree whose complete rule set can be inspected directly in plaintext.

---

## 5. Inducted Decision Tree Rules

```text
|--- lag1_cases <= 919.00
|   |--- rolling_avg <= 570.25
|   |   |--- rolling_avg <= 398.25
|   |   |   |--- class: 0 (Lower Relative Risk)
|   |   |--- rolling_avg >  398.25
|   |   |   |--- class: 1 (Higher Relative Risk)
|   |--- rolling_avg >  570.25
|   |   |--- class: 0 (Lower Relative Risk)
|--- lag1_cases >  919.00
|   |--- sll_ratio <= 0.42
|   |   |--- class: 0 (Lower Relative Risk)
|   |--- sll_ratio >  0.42
|   |   |--- lag1_cases <= 5968.50
|   |   |   |--- class: 1 (Higher Relative Risk)
|   |   |--- lag1_cases >  5968.50
|   |   |   |--- class: 0 (Lower Relative Risk)
```

---

## 6. Chronological Partitioning & Test Evaluation

### Strict Temporal Train/Test Split:
- **Training Set**: Historical observations from **2016 to 2019** (Pre-pandemic baseline).
- **Test Set**: Historical observations from **2020 to 2025** (Evaluation period).
- **Zero Future Leakage**: Training data contains no records from 2020 onwards.

### Test Set Performance Metrics:

| Metric | Measured Value | Formula |
|---|---|---|
| **Accuracy** | **61.06%** | $\frac{TP + TN}{TP + TN + FP + FN}$ |
| **Precision** | **27.03%** | $\frac{TP}{TP + FP}$ |
| **Recall** | **37.04%** | $\frac{TP}{TP + FN}$ |
| **F1-Score** | **31.25%** | $2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$ |

### Confusion Matrix:

$$\begin{pmatrix} \text{TN} = 59 & \text{FP} = 27 \\ \text{FN} = 17 & \text{TP} = 10 \end{pmatrix}$$

### Baseline Comparison:
- **Zero-R Baseline (Majority Class)**: 76.11% accuracy (always predicts class 0).
- **Persistence Baseline (Lag-1 Volume)**: 64.60% accuracy, F1-Score: 37.50%.

### Empirical Finding on Lockdown Disruption:
During the 2020–2021 test period, strict COVID-19 pandemic lockdowns caused a sharp anomaly across Kerala police stations: mobility restrictions drastically suppressed conventional street crime registrations, while shifting police enforcement to pandemic curfews. Evaluating models across this real-world disruption highlights temporal concept drift in real historical datasets.
