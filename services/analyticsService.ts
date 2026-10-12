
/**
 * YouChef Growth Analytics Service
 * Tracks user engagement to optimize AI recommendations and viral loops.
 */

type EventName = 
  | 'RECIPE_VIEWED' 
  | 'INGREDIENT_ADDED' 
  | 'RECIPE_COOKED' 
  | 'REFERRAL_LINK_COPIED' 
  | 'MEAL_PLAN_GENERATED'
  | 'SCAN_COMPLETED'
  | 'CHEF_CHANGED';

export const trackEvent = (
    eventName: EventName,
    properties: Record<string, any> = {}
): void => {
    // In production, this would send to Segment, Mixpanel, or Google Analytics
    const payload = {
        event: eventName,
        properties: {
            ...properties,
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
        },
    };

    console.group(`📊 Analytics: ${eventName}`);
    console.table(payload.properties);
    console.groupEnd();

    // Mock network call
    try {
        // window.gtag?.('event', eventName, properties);
    } catch (e) {}
};
