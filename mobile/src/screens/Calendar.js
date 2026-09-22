import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, formatDate, subjectLabel } from '../api/client';
import { Card, EmptyState, Loading, Screen } from '../components/ui';
import { colors } from '../theme';

function dateKey(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function todayKey() {
  const now = new Date();
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Calendar() {
  const [current, setCurrent] = useState(() => new Date());
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/assignments')
      .then((data) => setAssignments(data.assignments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const eventsByDate = useMemo(() => {
    const map = {};
    assignments.forEach((assignment) => {
      const key = assignment.due_date;
      if (!map[key]) {map[key] = [];}
      map[key].push({
        title: assignment.title,
        subject: subjectLabel(assignment.subject),
      });
    });
    return map;
  }, [assignments]);

  const year = current.getFullYear();
  const month = current.getMonth();
  const monthName = current.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const tKey = todayKey();

  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1),
  ];

  const upcoming = useMemo(() => {
    const today = todayKey();
    return assignments
      .filter((item) => item.due_date >= today)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .slice(0, 10);
  }, [assignments]);

  return (
    <Screen>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <View style={styles.headingText}>
            <Text style={styles.title}>Calendar</Text>
            <Text style={styles.subtitle}>Track your assignment deadlines.</Text>
          </View>
          <TouchableOpacity style={styles.todayBtn} onPress={() => setCurrent(new Date())}>
            <Text style={styles.todayBtnText}>Today</Text>
          </TouchableOpacity>
        </View>

        <Card>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.monthBtn}
              onPress={() => setCurrent(new Date(year, month - 1, 1))}
            >
              <Text style={styles.monthBtnText}>{'\u2039'}</Text>
            </TouchableOpacity>
            <Text style={styles.monthName}>{monthName}</Text>
            <TouchableOpacity
              style={styles.monthBtn}
              onPress={() => setCurrent(new Date(year, month + 1, 1))}
            >
              <Text style={styles.monthBtnText}>{'\u203A'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekdays}>
            {weekdays.map((day, index) => (
              <Text key={`${day}-${index}`} style={styles.weekday}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.days}>
            {cells.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.dayEmpty} />;
              }

              const key = dateKey(year, month, day);
              const isToday = key === tKey;
              const hasEvent = Boolean(eventsByDate[key]?.length);

              return (
                <View
                  key={key}
                  style={[
                    styles.day,
                    hasEvent && !isToday && styles.dayEvent,
                    isToday && styles.dayToday,
                  ]}
                >
                  <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
                    {day}
                  </Text>
                  {hasEvent && <View style={styles.dayDot} />}
                </View>
              );
            })}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={styles.legendDotEvent} />
              <Text style={styles.legendText}>Assignment Deadline</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendDotToday} />
              <Text style={styles.legendText}>Today</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
            <Text style={styles.sectionSub}>{upcoming.length} coming up</Text>
          </View>

          {loading ? (
            <Loading visible text="Loading calendar..." />
          ) : upcoming.length === 0 ? (
            <EmptyState title="No upcoming deadlines" />
          ) : (
            upcoming.map((item) => (
              <View key={`${item.title}-${item.due_date}`} style={styles.upcomingItem}>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingTitle}>{item.title}</Text>
                  <Text style={styles.upcomingSubject}>{subjectLabel(item.subject)}</Text>
                </View>
                <Text style={styles.upcomingDate}>{formatDate(item.due_date)}</Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headingText: { flex: 1, paddingRight: 12 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 4 },
  todayBtn: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  todayBtnText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthBtnText: { fontSize: 20, color: colors.primary, fontWeight: '800' },
  monthName: { fontSize: 16, fontWeight: '800', color: colors.text },
  weekdays: { flexDirection: 'row', marginBottom: 6 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: colors.muted },
  days: { flexDirection: 'row', flexWrap: 'wrap' },
  day: {
    width: '14.285%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayEmpty: { width: '14.285%', aspectRatio: 1 },
  dayNumber: { fontSize: 13, color: colors.text },
  dayToday: { backgroundColor: colors.primary },
  dayNumberToday: { color: colors.white, fontWeight: '800' },
  dayEvent: { backgroundColor: colors.primaryLight },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  legend: { flexDirection: 'row', gap: 18, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDotEvent: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primary },
  legendDotToday: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  legendText: { fontSize: 11, color: colors.muted },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  sectionSub: { fontSize: 11, color: colors.muted },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  upcomingInfo: { flex: 1, paddingRight: 12 },
  upcomingTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  upcomingSubject: { fontSize: 11, color: colors.primary, marginTop: 3 },
  upcomingDate: { fontSize: 12, fontWeight: '700', color: colors.muted },
});
