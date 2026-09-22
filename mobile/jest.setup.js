jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-document-picker', () => ({
  pick: jest.fn(async () => null),
  types: {
    allFiles: 'application/octet-stream',
    pdf: 'application/pdf',
    images: 'image/*',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
}));

global.fetch = jest.fn(() => Promise.reject(new Error('network unavailable')));