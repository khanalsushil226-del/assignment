import React, { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { pick } from 'react-native-document-picker';
import { api, formatDate, subjectLabel, statusLabel } from '../api/client';
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

export default function Submissions() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, review: 0, approved: 0, revision: 0 });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');

  const [submitOpen, setSubmitOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);

  async function load() {
    try {
      const [sub, assign] = await Promise.all([
        api.get('/api/submissions'),
        api.get('/api/assignments'),
      ]);
      setSubmissions(sub.submissions || []);
      setStats(sub.stats || {});
      setAssignments(assign.assignments || []);
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
    if (statusFilter === 'all') return submissions;
    return submissions.filter((row) => row.status === statusFilter);
  }, [submissions, statusFilter]);

  async function handlePickFile() {
    try {
      const picked = await pick({
        type: ['public.item'],
        copyTo: 'cachesDirectory',
      });
      const doc = picked && picked[0];
      if (!doc) return;
      setFile({
        uri: doc.fileCopyUri || doc.uri,
        name: doc.name || 'document',
        type: doc.type || (Platform.OS === 'android' ? 'application/octet-stream' : 'application/octet-stream'),
      });
    } catch (error) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
        setMessage({ text: 'Could not pick a file.', color: colors.danger });
      }
    }
  }

  async function handleSubmit() {
    setMessage(null);

    if (!selectedId) {
      setMessage({ text: 'Please select an assignment.', color: colors.danger });
      return;
    }
    if (!file) {
      setMessage({ text: 'Please upload a file.', color: colors.danger });
      return;
    }

    setBusy(true);
    try {
      const form = new FormData();
      form.append('assignment_id', String(selectedId));
      form.append('note', note);
      form.append('file', file);

      await api.postForm('/api/submissions', form);
      setMessage({ text: 'Submission uploaded successfully', color: colors.primary });
      setSubmitOpen(false);
      setSelectedId(null);
      setNote('');
      setFile(null);
      load();
    } catch (error) {
      setMessage({ text: error.message, color: colors.danger });
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.patch(`/api/submissions/${id}`, { status });
      load();
    } catch (error) {
      setMessage({ text: error.message, color: colors.danger });
    }
  }

  const statCards = [
    { label: 'Total Submissions', value: stats.total },
    { label: 'Under Review', value: stats.review },
    { label: 'Approved', value: stats.approved },
    { label: 'Needs Revision', value: stats.revision },
  ];

  return (
    <Screen>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <View style={styles.headingText}>
            <Text style={styles.title}>
              {isTeacher ? 'Review Submissions' : 'My Submissions'}
            </Text>
            <Text style={styles.subtitle}>Review and manage submitted assignments.</Text>
          </View>

          {!isTeacher && (
            <TouchableOpacity style={styles.submitBtn} onPress={() => setSubmitOpen(true)}>
              <Text style={styles.submitBtnText}>+ Submit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsRow}>
          {statCards.map((card) => (
            <Card key={card.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{card.label}</Text>
              <Text style={styles.statValue}>{card.value}</Text>
            </Card>
          ))}
        </View>

        <Message message={message} />

        <View style={styles.chips}>
          {['all', 'review', 'approved', 'revision'].map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.chip, statusFilter === value && styles.chipActive]}
              onPress={() => setStatusFilter(value)}
            >
              <Text style={[styles.chipText, statusFilter === value && styles.chipTextActive]}>
                {value === 'all'
                  ? 'All'
                  : value === 'review'
                    ? 'Under Review'
                    : value === 'approved'
                      ? 'Approved'
                      : 'Revision'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <Loading visible text="Loading submissions..." />
        ) : filtered.length === 0 ? (
          <EmptyState title="No submissions found" subtitle="Try changing your filter options." />
        ) : (
          filtered.map((row) => (
            <Card key={row.id}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{row.assignment_title}</Text>
                <Badge label={statusLabel(row.status)} status={row.status} />
              </View>
              <Text style={styles.cardSub}>
                {subjectLabel(row.subject)}
                {isTeacher && row.student_username ? `  •  ${row.student_username}` : ''}
              </Text>
              <Text style={styles.cardMeta}>
                Submitted on {formatDate(row.created_at)}
              </Text>
              <Text style={styles.cardMeta}>{row.original_name || 'File attached'}</Text>

              <View style={styles.cardActions}>
                <SecondaryButton title="View" onPress={() => setDetails(row)} />
                {isTeacher && (
                  <>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => updateStatus(row.id, 'approved')}
                    >
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.revisionBtn}
                      onPress={() => updateStatus(row.id, 'revision')}
                    >
                      <Text style={styles.revisionBtnText}>Revision</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </Card>
          ))
        )}

        <CenterModal
          visible={submitOpen}
          onClose={() => setSubmitOpen(false)}
          title="Submit Assignment"
          subtitle="Select an assignment and attach your file."
        >
          <Text style={styles.fieldLabel}>Assignment</Text>
          <View style={styles.assignList}>
            {assignments.length === 0 ? (
              <Text style={styles.mutedText}>No assignments available.</Text>
            ) : (
              assignments.map((assignment) => {
                const active = selectedId === assignment.id;
                return (
                  <TouchableOpacity
                    key={assignment.id}
                    style={[styles.assignItem, active && styles.assignItemActive]}
                    onPress={() => setSelectedId(assignment.id)}
                  >
                    <Text style={[styles.assignText, active && styles.assignTextActive]}>
                      {assignment.title}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <Field
            label="Submission Note"
            value={note}
            onChangeText={setNote}
            placeholder="Write a short note about your submission..."
            multiline
          />

          <TouchableOpacity style={styles.fileBtn} onPress={handlePickFile}>
            <Text style={styles.fileBtnText}>
              {file ? `Selected: ${file.name}` : 'Choose File'}
            </Text>
          </TouchableOpacity>

          <View style={styles.modalFooter}>
            <SecondaryButton title="Cancel" onPress={() => setSubmitOpen(false)} />
            <PrimaryButton
              title={busy ? 'Uploading...' : 'Submit'}
              onPress={handleSubmit}
              disabled={busy}
            />
          </View>
        </CenterModal>

        <CenterModal
          visible={Boolean(details)}
          onClose={() => setDetails(null)}
          title={details?.assignment_title}
          subtitle="SUBMISSION DETAILS"
        >
          {details && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Submission Status</Text>
                <Badge label={statusLabel(details.status)} status={details.status} />
              </View>
              {isTeacher && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Student</Text>
                  <Text style={styles.detailValue}>{details.student_username}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Submitted On</Text>
                <Text style={styles.detailValue}>{formatDate(details.created_at)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>File</Text>
                <Text style={styles.detailValue}>{details.original_name || 'None'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Note</Text>
                <Text style={styles.detailValue}>{details.note || 'No note provided.'}</Text>
              </View>
              <View style={styles.modalFooter}>
                <SecondaryButton title="Close" onPress={() => setDetails(null)} />
              </View>
            </>
          )}
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
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  submitBtnText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%' },
  statLabel: { fontSize: 11, fontWeight: '700', color: colors.muted },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
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
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text, flex: 1, paddingRight: 8 },
  cardSub: { fontSize: 11, color: colors.muted, marginTop: 6 },
  cardMeta: { fontSize: 11, color: colors.muted, marginTop: 4 },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  approveBtn: {
    backgroundColor: '#e8f7ed',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  approveBtnText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  revisionBtn: {
    backgroundColor: '#fde9e9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  revisionBtnText: { color: '#b42323', fontSize: 12, fontWeight: '800' },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  assignList: { marginBottom: 16 },
  assignItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  assignItemActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  assignText: { fontSize: 13, fontWeight: '600', color: colors.text },
  assignTextActive: { color: colors.primary },
  fileBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  fileBtnText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  detailLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, flex: 1 },
  detailValue: { fontSize: 12, color: colors.text, flex: 2, textAlign: 'right' },
  mutedText: { fontSize: 12, color: colors.muted },
});