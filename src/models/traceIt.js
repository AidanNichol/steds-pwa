export const traceId = 'A2030';
export const traceIt = id => process.env.NODE_ENV === 'development' && id === traceId;
