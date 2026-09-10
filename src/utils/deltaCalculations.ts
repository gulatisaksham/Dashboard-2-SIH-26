export function calculateDelta(currentWindow: number[], previousWindow: number[]): { percent: number; direction: 'up' | 'down' | 'flat' } {
  if (currentWindow.length === 0 || previousWindow.length === 0) {
    return { percent: 0, direction: 'flat' };
  }
  
  const currentAvg = currentWindow.reduce((a, b) => a + b, 0) / currentWindow.length;
  const previousAvg = previousWindow.reduce((a, b) => a + b, 0) / previousWindow.length;

  if (previousAvg === 0) {
     return { percent: 0, direction: 'flat' };
  }

  const change = currentAvg - previousAvg;
  const percentChange = (change / previousAvg) * 100;
  const absPercent = Math.abs(percentChange);

  if (absPercent < 2) {
    return { percent: absPercent, direction: 'flat' };
  }

  return {
    percent: absPercent,
    direction: change > 0 ? 'up' : 'down'
  };
}
