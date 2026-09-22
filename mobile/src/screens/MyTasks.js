import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { api, formatFullDate, subjectLabel, statusLabel } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Badge,
  Card,
  CenterModal,
  EmptyState,
  Field,
  Loading,
  Message,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from '../components/ui';
import { colors } from '../theme';

const subjects = ['Python', 'Database', 'Web Development', 'Project'];

export default function MyTasks() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [viewing, setViewing] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);

  const [form, setForm] = useState({ title: '', subject: '', description: '', due_date: '' });
  const [question, setQuestion] = useState('');
  const [message, setMessage] = useState(null);

  async function load() {
    try {
      const data = await api.get('/api/assignments');
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return assignments.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'submitted'
          ? task.my_status === 'approved'
          : task.my_status === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [assignments, search, statusFilter]);

  async function handleAddTask() {
    setMessage(null);
    if (!form.title.trim() || !form.subject || !form.due_date.trim()) {
      setMessage({ text: 'Title, subject, and due date are required.', color: colors.danger });
      return;
    }
    try {
      await api.post('/api/assignments', {
        title: form.title.trim(),
        subject: form.subject,
        description: form.description.trim(),
        due_date: form.due_date.trim(),
      });
      setMessage({ text: 'Assignment created successfully', color: colors.primary });
      setForm({ title: '', subject: '', description: '', due_date: '' });
      setAddOpen(false);
      load();
    } catch (error) {
      setMessage({ text: error.message, color: colors.danger });
    }
  }

  async function handleQuestion() {
    setMessage(null);
    if (!question.trim()) {return;}
    try {
      await api.post('/api/questions', { content: question.trim() });
      setQuestion('');
      setQuestionOpen(false);
    } catch (error) {
      setMessage({ text: error.message, color: colors.danger });
    }
  }

  return (
    <Screen>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <View style={styles.headingText}>
            <Text style={styles.title}>My Tasks</Text>
            <Text style={styles.subtitle}>View and manage your assignments.</Text>
          </View>

          {isTeacher ? (
            <TouchableOpacity style={styles.addBtn} onPress={() => setAddOpen(true)}>
              <Text style={styles.addBtnText}>+ Add Task</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.questionBtn} onPress={() => setQuestionOpen(true)}>
              <Text style={styles.questionBtnText}>? Raise a Question</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.controls}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>{'\u2315'}</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search assignments..."
              placeholderTextColor="#9aa69d"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.chips}>
            {['all', 'pending', 'submitted'].map((value) => (
              <TouchableOpacity
                key={value}
                style={[styles.chip, statusFilter === value && styles.chipActive]}
                onPress={() => setStatusFilter(value)}
              >
                <Text style={[styles.chipText, statusFilter === value && styles.chipTextActive]}>
                  {value === 'all' ? 'All' : value.charAt(0).toUpperCase() + value.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Message message={message} />

        {loading ? (
          <Loading visible text="Loading tasks..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No assignments found"
            subtitle="Try changing your search or filters."
          />
        ) : (
          filtered.map((task) => (
            <Card key={task.id}>
              <View style={styles.cardTop}>
                <Text style={styles.taskType}>{subjectLabel(task.subject).toUpperCase()}</Text>
                <Badge label={statusLabel(task.my_status)} status={task.my_status} />
              </View>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDesc}>
                {task.description || 'No description provided.'}
              </Text>
              <View style={styles.cardBottom}>
                <Text style={styles.deadline}>
                  {'\u25F7'} Due: {formatFullDate(task.due_date)}
                </Text>
                <SecondaryButton title="View Task" onPress={() => setViewing(task)} />
              </View>
            </Card>
          ))
        )}

        <CenterModal
          visible={Boolean(viewing)}
          onClose={() => setViewing(null)}
          title={viewing?.title}
          subtitle={viewing ? formatFullDate(viewing.due_date) : undefined}
        >
          <Text style={styles.modalBody}>
            {viewing?.description || 'Assignment details will appear here.'}
          </Text>
          <View style={styles.modalFooter}>
            <SecondaryButton title="Close" onPress={() => setViewing(null)} />
          </View>
        </CenterModal>

        <CenterModal
          visible={addOpen}
          onClose={() => setAddOpen(false)}
          title="Add Task"
          subtitle="Create a new assignment for your students."
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.form}>
              <Field
                label="Title"
                value={form.title}
                onChangeText={(title) => setForm({ ...form, title })}
                placeholder="Assignment title"
              />

              <Text style={styles.fieldLabel}>Subject</Text>
              <View style={styles.subjectRow}>
                {subjects.map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.subjectChip, form.subject === value && styles.subjectChipActive]}
                    onPress={() => setForm({ ...form, subject: value })}
                  >
                    <Text
                      style={[
                        styles.subjectChipText,
                        form.subject === value && styles.subjectChipTextActive,
                      ]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Field
                label="Due Date (YYYY-MM-DD)"
                value={form.due_date}
                onChangeText={(due_date) => setForm({ ...form, due_date })}
                placeholder="e.g. 2026-10-15"
              />

              <Field
                label="Description"
                value={form.description}
                onChangeText={(description) => setForm({ ...form, description })}
                placeholder="Describe the assignment..."
                multiline
              />

              <PrimaryButton title="Create Assignment" onPress={handleAddTask} />
            </View>
          </KeyboardAvoidingView>
        </CenterModal>

        <CenterModal
          visible={questionOpen}
          onClose={() => setQuestionOpen(false)}
          title="Raise a Question"
          subtitle="Have a question about an assignment? Ask it here."
        >
          <Field
            label="Your Question"
            value={question}
            onChangeText={setQuestion}
            placeholder="Type your question..."
            multiline
          />
          <View style={styles.modalFooter}>
            <SecondaryButton title="Cancel" onPress={() => setQuestionOpen(false)} />
            <PrimaryButton title="Submit Question" onPress={handleQuestion} />
          </View>
        </CenterModal>
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
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  addBtnText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  questionBtn: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  questionBtnText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  controls: { marginBottom: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 16, color: colors.muted, marginRight: 8 },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 12,
  },
  chips: { flexDirection: 'row', gap: 8, marginTop: 12 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  chipTextActive: { color: colors.white },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskType: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2, color: colors.primary },
  taskTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 8 },
  taskDesc: { fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 18 },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  deadline: { fontSize: 11, color: colors.muted },
  modalBody: { fontSize: 13, color: colors.text, lineHeight: 20 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  form: { marginTop: 8 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  subjectChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subjectChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  subjectChipText: { fontSize: 11, fontWeight: '700', color: colors.muted },
  subjectChipTextActive: { color: colors.primary },
});
