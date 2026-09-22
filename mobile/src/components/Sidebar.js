import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const items = [
  { key: 'dashboard', icon: '\u2302', label: 'Dashboard' },
  { key: 'tasks', icon: '\u25A4', label: 'My Tasks' },
  { key: 'submissions', icon: '\u2713', label: 'Submissions' },
  { key: 'calendar', icon: '\u25F7', label: 'Calendar' },
  { key: 'settings', icon: '\u2699', label: 'Settings' },
];

export default function Sidebar({ visible, onClose, active, onSelect, username, role, onLogout }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.drawer} onPress={() => {}}>
          <View style={styles.brand}>
            <Text style={styles.brandText}>Assignments</Text>
          </View>

          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(username || 'S').charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{username || 'Student'}</Text>
              <Text style={styles.profileRole}>
                {role === 'teacher' ? 'Teacher Account' : 'Student Account'}
              </Text>
            </View>
          </View>

          <Text style={styles.label}>MAIN MENU</Text>

          {items.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.item, active === item.key && styles.itemActive]}
              onPress={() => {
                onSelect(item.key);
                onClose();
              }}
            >
              <Text style={[styles.itemIcon, active === item.key && styles.itemActiveText]}>
                {item.icon}
              </Text>
              <Text style={[styles.itemLabel, active === item.key && styles.itemActiveText]}>
                {item.label}
              </Text>
            </Pressable>
          ))}

          <View style={styles.bottom}>
            <Pressable style={styles.item} onPress={onLogout}>
              <Text style={[styles.itemIcon, { color: colors.danger }]}>{'\u21AA'}</Text>
              <Text style={[styles.itemLabel, { color: colors.danger }]}>Logout</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(23,33,26,0.35)',
  },
  drawer: {
    width: 255,
    height: '100%',
    backgroundColor: colors.white,
    paddingTop: 24,
  },
  brand: {
    paddingHorizontal: 28,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandText: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.primary,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  profileRole: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: '#9ba69e',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 9,
    marginHorizontal: 8,
  },
  itemActive: {
    backgroundColor: colors.primaryLight,
  },
  itemIcon: {
    width: 22,
    fontSize: 17,
    color: colors.muted,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  itemActiveText: {
    color: colors.primary,
    fontWeight: '700',
  },
  bottom: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 'auto',
    paddingVertical: 12,
  },
});
