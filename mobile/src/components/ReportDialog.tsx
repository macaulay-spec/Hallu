import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import type { ReportReason } from '@/services/reports';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

interface ReasonOption {
  value: ReportReason;
  label: string;
}

const REASONS: ReasonOption[] = [
  { value: 'spam', label: 'Spam or scam' },
  { value: 'harassment', label: 'Harassment or hate' },
  { value: 'spoiler-abuse', label: 'Unmarked spoilers' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'explicit', label: 'Explicit content' },
  { value: 'other', label: 'Something else' },
];

interface ReportDialogProps {
  visible: boolean;
  targetLabel: string;
  busy: boolean;
  onSubmit: (reason: ReportReason, details: string) => void;
  onClose: () => void;
}

export function ReportDialog({
  visible,
  targetLabel,
  busy,
  onSubmit,
  onClose,
}: ReportDialogProps): ReactNode {
  const theme = useTheme();
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Report {targetLabel}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textDim }]}>
            Our trust team reviews every report.
          </Text>
          {REASONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setReason(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: reason === option.value }}
              style={styles.reason}
            >
              <Ionicons
                name={reason === option.value ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={reason === option.value ? theme.colors.brandBlue : theme.colors.textMuted}
              />
              <Text style={[styles.reasonLabel, { color: theme.colors.text }]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
          <TextField
            label="Details (optional)"
            value={details}
            onChangeText={setDetails}
            placeholder="Anything that helps the review…"
            multiline
          />
          <View style={styles.actions}>
            <Button title="Cancel" variant="secondary" onPress={onClose} disabled={busy} />
            <Button
              title="Submit report"
              onPress={() => onSubmit(reason, details)}
              loading={busy}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 8,
    maxHeight: '90%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
  },
  reasonLabel: {
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
});
