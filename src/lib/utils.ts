export const WPM = 150; // Words Per Minute average

export function getWordCount(text: string) {
  return text.trim().split(/\s+/).length;
}
