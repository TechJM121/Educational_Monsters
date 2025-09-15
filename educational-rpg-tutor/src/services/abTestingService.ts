// A/B Testing Service for Educational RPG Tutor
// Handles experiment management, variant assignment, and result tracking

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: Variant[];
  trafficAllocation: number; // Percentage of users to include
  startDate: Date;
  endDate?: Date;
  targetingRules: TargetingRule[];
  metrics: ExperimentMetric[];
}

interface Variant {
  id: string;
  name: string;
  allocation: number; // Percentage of experiment traffic
  config: Record<string, any>;
  isControl: boolean;
}

interface TargetingRule {
  type: 'user_property' | 'session_property' | 'random';
  property?: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

interface ExperimentMetric {
  name: string;
  type: 'conversion' | 'numeric' | 'duration';
  goal: 'increase' | 'decrease';
  primaryMetric: boolean;
}

interface UserAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: Date;
  exposedAt?: Date;
  converted?: boolean;
  conversionValue?: number;
}

interface ExperimentResult {
  experimentId: string;
  variantId: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  averageValue: number;
  confidence: number;
  significance: number;
}

class ABTestingService {
  private experiments: Map<string, Experiment> = new Map();
  private userAssignments: Map<string, Map<string, UserAssignment>> = new Map();
  private exposureTracked: Set<string> = new Set();

  constructor() {
    this.loadExperiments();
    this.setupEventListeners();
  }

  // Experiment management
  async loadExperiments(): Promise<void> {
    try {
      const response = await fetch('/api/experiments/active');
      const experiments: Experiment[] = await response.json();
      
      experiments.forEach(experiment => {
        this.experiments.set(experiment.id, experiment);
      });
      
      console.log(`Loaded ${experiments.length} active experiments`);
    } catch (error) {
      console.error('Failed to load experiments:', error);
    }
  }

  // User assignment and variant retrieval
  getVariant(experimentId: string, userId: string, userProperties: Record<string, any> = {}): string | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user is already assigned
    const userExperiments = this.userAssignments.get(userId);
    if (userExperiments?.has(experimentId)) {
      const assignment = userExperiments.get(experimentId)!;
      this.trackExposure(assignment);
      return assignment.variantId;
    }

    // Check targeting rules
    if (!this.matchesTargeting(experiment.targetingRules, userId, userProperties)) {
      return null;
    }

    // Check traffic allocation
    if (!this.isInTrafficAllocation(experiment.trafficAllocation, userId, experimentId)) {
      return null;
    }

    // Assign variant
    const variantId = this.assignVariant(experiment, userId);
    if (variantId) {
      this.recordAssignment(userId, experimentId, variantId);
      return variantId;
    }

    return null;
  }

  // Get variant configuration
  getVariantConfig(experimentId: string, userId: string, userProperties: Record<string, any> = {}): Record<string, any> {
    const variantId = this.getVariant(experimentId, userId, userProperties);
    if (!variantId) {
      return {};
    }

    const experiment = this.experiments.get(experimentId);
    const variant = experiment?.variants.find(v => v.id === variantId);
    
    return variant?.config || {};
  }

  // Feature flag functionality
  isFeatureEnabled(featureName: string, userId: string, userProperties: Record<string, any> = {}): boolean {
    const config = this.getVariantConfig(featureName, userId, userProperties);
    return config.enabled === true;
  }

  // Targeting logic
  private matchesTargeting(rules: TargetingRule[], userId: string, userProperties: Record<string, any>): boolean {
    if (rules.length === 0) return true;

    return rules.every(rule => {
      switch (rule.type) {
        case 'user_property':
          return this.evaluateRule(userProperties[rule.property!], rule.operator, rule.value);
        case 'session_property':
          return this.evaluateRule(this.getSessionProperty(rule.property!), rule.operator, rule.value);
        case 'random':
          return this.hashUserId(userId, 'targeting') < rule.value;
        default:
          return true;
      }
    });
  }

  private evaluateRule(actualValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return actualValue === expectedValue;
      case 'not_equals':
        return actualValue !== expectedValue;
      case 'contains':
        return String(actualValue).includes(String(expectedValue));
      case 'greater_than':
        return Number(actualValue) > Number(expectedValue);
      case 'less_than':
        return Number(actualValue) < Number(expectedValue);
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);
      default:
        return false;
    }
  }

  private getSessionProperty(property: string): any {
    switch (property) {
      case 'is_mobile':
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      case 'is_new_user':
        return !localStorage.getItem('returning_user');
      case 'session_count':
        return parseInt(localStorage.getItem('session_count') || '1');
      default:
        return null;
    }
  }

  // Traffic allocation
  private isInTrafficAllocation(allocation: number, userId: string, experimentId: string): boolean {
    const hash = this.hashUserId(userId, experimentId);
    return hash < allocation / 100;
  }

  // Variant assignment
  private assignVariant(experiment: Experiment, userId: string): string | null {
    const hash = this.hashUserId(userId, experiment.id + '_variant');
    let cumulativeAllocation = 0;

    for (const variant of experiment.variants) {
      cumulativeAllocation += variant.allocation;
      if (hash < cumulativeAllocation / 100) {
        return variant.id;
      }
    }

    return null;
  }

  // Consistent hashing for user assignment
  private hashUserId(userId: string, salt: string): number {
    const str = userId + salt;
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash) / Math.pow(2, 31);
  }

  // Assignment tracking
  private recordAssignment(userId: string, experimentId: string, variantId: string): void {
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }

    const assignment: UserAssignment = {
      userId,
      experimentId,
      variantId,
      assignedAt: new Date(),
    };

    this.userAssignments.get(userId)!.set(experimentId, assignment);

    // Send assignment to analytics
    this.trackAssignment(assignment);
  }

  private trackAssignment(assignment: UserAssignment): void {
    fetch('/api/experiments/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignment),
    }).catch(error => {
      console.error('Failed to track assignment:', error);
    });
  }

  // Exposure tracking
  private trackExposure(assignment: UserAssignment): void {
    const exposureKey = `${assignment.userId}_${assignment.experimentId}`;
    
    if (this.exposureTracked.has(exposureKey)) {
      return;
    }

    this.exposureTracked.add(exposureKey);
    assignment.exposedAt = new Date();

    // Send exposure event to analytics
    fetch('/api/experiments/exposures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: assignment.userId,
        experimentId: assignment.experimentId,
        variantId: assignment.variantId,
        exposedAt: assignment.exposedAt,
      }),
    }).catch(error => {
      console.error('Failed to track exposure:', error);
    });
  }

  // Conversion tracking
  trackConversion(experimentId: string, userId: string, metricName: string, value?: number): void {
    const userExperiments = this.userAssignments.get(userId);
    const assignment = userExperiments?.get(experimentId);

    if (!assignment) {
      console.warn(`No assignment found for user ${userId} in experiment ${experimentId}`);
      return;
    }

    // Update assignment
    assignment.converted = true;
    assignment.conversionValue = value;

    // Send conversion event
    fetch('/api/experiments/conversions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        experimentId,
        variantId: assignment.variantId,
        metricName,
        value,
        convertedAt: new Date(),
      }),
    }).catch(error => {
      console.error('Failed to track conversion:', error);
    });
  }

  // Event listeners for automatic tracking
  private setupEventListeners(): void {
    // Track page views as exposures
    window.addEventListener('popstate', () => {
      this.trackPageViewExposures();
    });

    // Track conversions based on custom events
    window.addEventListener('ab-test-conversion', ((event: CustomEvent) => {
      const { experimentId, userId, metricName, value } = event.detail;
      this.trackConversion(experimentId, userId, metricName, value);
    }) as EventListener);
  }

  private trackPageViewExposures(): void {
    // Track exposures for experiments that should trigger on page view
    const currentPath = window.location.pathname;
    
    this.experiments.forEach(experiment => {
      if (experiment.status === 'running') {
        // Check if this page should trigger exposure
        const shouldTrackExposure = this.shouldTrackExposureForPage(experiment, currentPath);
        if (shouldTrackExposure) {
          // This would need user context - simplified for example
          console.log(`Should track exposure for experiment ${experiment.id} on page ${currentPath}`);
        }
      }
    });
  }

  private shouldTrackExposureForPage(experiment: Experiment, path: string): boolean {
    // Define which experiments should track exposure on which pages
    const exposureRules: Record<string, string[]> = {
      'onboarding_flow_v2': ['/onboarding', '/character-creation'],
      'home_page_layout': ['/home', '/dashboard'],
      'question_ui_redesign': ['/learn', '/questions'],
    };

    const paths = exposureRules[experiment.id];
    return paths ? paths.some(p => path.startsWith(p)) : false;
  }

  // Results and analytics
  async getExperimentResults(experimentId: string): Promise<ExperimentResult[]> {
    try {
      const response = await fetch(`/api/experiments/${experimentId}/results`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get experiment results:', error);
      return [];
    }
  }

  // Utility methods
  getAllActiveExperiments(): Experiment[] {
    return Array.from(this.experiments.values()).filter(exp => exp.status === 'running');
  }

  getUserAssignments(userId: string): UserAssignment[] {
    const userExperiments = this.userAssignments.get(userId);
    return userExperiments ? Array.from(userExperiments.values()) : [];
  }

  // Debug methods
  debugUserAssignments(userId: string): void {
    const assignments = this.getUserAssignments(userId);
    console.table(assignments);
  }

  forceVariant(experimentId: string, userId: string, variantId: string): void {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('forceVariant should only be used in development');
      return;
    }

    this.recordAssignment(userId, experimentId, variantId);
    console.log(`Forced user ${userId} into variant ${variantId} for experiment ${experimentId}`);
  }
}

// Export singleton instance
export const abTestingService = new ABTestingService();

export default abTestingService;