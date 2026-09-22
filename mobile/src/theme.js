export const colors = {
  primary: '#056c24',
  primaryDark: '#04551c',
  primaryLight: '#eaf7ee',
  text: '#17211a',
  muted: '#66736a',
  border: '#e5e9e6',
  background: '#f6f8f7',
  white: '#ffffff',
  danger: '#dc3545',
  orange: '#d97706',
  blue: '#2563eb',
  purple: '#7c3aed',
};

export const fonts = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '600' },
  bold: { fontWeight: '800' },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
};

export function statusColor(status) {
  switch (status) {
    case 'approved':
      return colors.primary;
    case 'review':
      return colors.orange;
    case 'revision':
      return colors.danger;
    default:
      return colors.orange;
  }
}

export function statusBg(status) {
  switch (status) {
    case 'approved':
      return '#e8f7ed';
    case 'review':
      return '#fff4df';
    case 'revision':
      return '#fde9e9';
    default:
      return '#fff4df';
  }
}
