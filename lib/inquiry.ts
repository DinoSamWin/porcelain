export function createInquiryId() {
  const date = new Date();
  const year = date.getFullYear();
  const stamp = String(date.getTime()).slice(-6);
  return `IQ-${year}-AP-${stamp}`;
}

export function formatMoq(moq: number) {
  return `MOQ ${moq}+`;
}
