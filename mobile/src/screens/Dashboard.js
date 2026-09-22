import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, formatDate, formatFullDate, subjectLabel, statusLabel } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge, Card, CenterModal, EmptyState, Loading, PrimaryButton, SecondaryButton, Screen } from '../components/ui';
import { colors } from '../theme';

function dateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [stats, setStats] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [today, setToday] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }, []);

  async function load() {
    try {
      const [data, list] = await Promise.all([
        api.get('/api/dashboard'),
        api.get('/api/assignments'),
      ]);
      setStats(data.stats || []);
      setCompletionRate(data.completionRate || 0);
      setAssignments(list.assignments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const username = user?.username || 'Student';
  const recent = assignments.slice(0, 3);
  const upcoming = assignments
    .filter((item) => item.due_date >= dateKey(new Date()))
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 3);

  const statIcons = ['\u25A4', '\u25F7', '\u2713', '\u2197'];

  return (
    <Screen>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.welcome}>
          <Text style={styles.welcomeLabel}>
            {isTeacher ? 'TEACHER WORKSPACE' : 'STUDENT WORKSPACE'}
          </Text>
          <Text style={styles.welcomeTitle}>
            Welcome back, <Text style={styles.accent}>{username}</Text>!
          </Text>
          <Text style={styles.welcomeSub}>
            Here's what's happening with your assignments today.
          </Text>
        </View>

        <View style={styles.today}>
          <Text style={styles.todayLabel}>Today</Text>
          <Text style={styles.todayValue}>{today}</Text>
        </View>

        <Loading visible={loading} text="Loading dashboard..." />

        {!loading && (
          <>
            <View style={styles.stats}>
              {stats.map((stat, index) => (
                <Card key={stat.label} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <View style={styles.statIcon}>
                      <Text style={styles.statIconText}>
                        {statIcons[index % statIcons.length]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </Card>
              ))}
            </View>

            <Card>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Assignments</Text>
                <Text style={styles.sectionSub}>Keep track of your latest tasks.</Text>
              </View>

              {recent.length === 0 ? (
                <EmptyState
                  title="No assignments yet"
                  subtitle={isTeacher ? 'Post your first assignment.' : 'Check back soon.'}
                />
              ) : (
                recent.map((task) => (
                  <View key={task.id} style={styles.taskCard}>
                    <View style={styles.taskTop}>
                      <Text style={styles.taskType}>
                        {subjectLabel(task.subject).toUpperCase()}
                      </Text>
                      <Badge label={statusLabel(task.my_status)} status={task.my_status} />
                    </View>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDesc}>
                      {task.description || 'No description provided.'}
                    </Text>
                    <View style={styles.taskBottom}>
                      <Text style={styles.deadline}>
                        {'\u25F7'} Due: {formatDate(task.due_date)}
                      </Text>
                      <SecondaryButton title="View Task" onPress={() => setSelected(task)} />
                    </View>
                  </View>
                ))
              )}
            </Card>

            <Card>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Progress</Text>
                <Text style={styles.sectionSub}>Assignment completion</Text>
              </View>
              <View style={styles.progressRow}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressValue}>{completionRate}%</Text>
                </View>
                <Text style={styles.progressCaption}>Completed</Text>
              </View>
            </Card>

            <Card>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
                <Text style={styles.sectionSub}>Don't miss your tasks.</Text>
              </View>

              {upcoming.length === 0 ? (
                <Text style={styles.mutedText}>No upcoming deadlines.</Text>
              ) : (
                upcoming.map((task) => {
                  const due = new Date(`${task.due_date}T00:00:00`);
                  return (
                    <View key={task.id} style={styles.deadlineItem}>
                      <View style={styles.deadlineDate}>
                        <Text style={styles.deadlineDay}>{due.getDate()}</Text>
                        <Text style={styles.deadlineMonth}>
                          {due
                            .toLocaleDateString('en-US', { month: 'short' })
                            .toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.deadlineInfo}>
                        <Text style={styles.deadlineTitle}>{task.title}</Text>
                        <Text style={styles.deadlineSub}>Assignment deadline</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </Card>
          </>
        )}

        <CenterModal
          visible={Boolean(selected)}
          onClose={() => setSelected(null)}
          title={selected?.title}
          subtitle={selected ? formatFullDate(selected.due_date) : undefined}
        >
          <Text style={styles.modalBody}>
            {selected?.description || 'Assignment details will appear here.'}
          </Text>
          <View style={styles.modalFooter}>
            <SecondaryButton title="Close" onPress={() => setSelected(null)} />
            {!isTeacher && selected && (
              <PrimaryButton
                title="Submit Assignment"
                onPress={() => {
                  setSelected(null);
                  onNavigate?.('submissions');
                }}
              />
            )}
          </View>
        </CenterModal>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  welcome: { marginBottom: 8 },
  welcomeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.primary,
  },
  welcomeTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 8 },
  accent: { color: colors.primary },
  welcomeSub: { fontSize: 12, color: colors.muted, marginTop: 6 },
  today: {
    marginTop: 14,
    marginBottom: 18,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 14,
  },
  todayLabel: { fontSize: 9, fontWeight: '800', color: colors.primary, letterSpacing: 1.2 },
  todayValue: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 4 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%' },
  statHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, flex: 1 },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 10 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  sectionSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  taskCard: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 14,
  },
  taskTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskType: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2, color: colors.primary },
  taskTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 8 },
  taskDesc: { fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 18 },
  taskBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  deadline: { fontSize: 11, color: colors.muted },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 6 },
  progressCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  progressCaption: { fontSize: 12, color: colors.muted },
  mutedText: { fontSize: 12, color: colors.muted },
  deadlineItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  deadlineDate: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadlineDay: { fontSize: 16, fontWeight: '800', color: colors.text },
  deadlineMonth: { fontSize: 8, fontWeight: '800', color: colors.muted, letterSpacing: 0.8 },
  deadlineInfo: { flex: 1 },
  deadlineTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  deadlineSub: { fontSize: 10, color: colors.muted, marginTop: 2 },
  modalBody: { fontSize: 13, color: colors.text, lineHeight: 20 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
});
