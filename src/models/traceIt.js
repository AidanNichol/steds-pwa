export const traceId = 'A2014';
export const traceIt = id => process.env.NODE_ENV === 'development' && id === traceId;
