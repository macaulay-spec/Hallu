import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';

// Alert.alert is a no-op on web, so destructive confirmations use this.
interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmTitle?: string;
  cancelTitle?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmTitle = 'Confirm',
  cancelTitle = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): ReactNode {
  const theme = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityLabel={title}
    >
      <Pressable
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel={cancelTitle}
        style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}
      >
        <Pressable
          onPress={() => {}}
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.colors.textDim }]}>{message}</Text>
          <View style={styles.row}>
            <View style={styles.action}>
              <Button title={cancelTitle} variant="secondary" onPress={onCancel} />
            </View>
            <View style={styles.action}>
              <Button
                title={confirmTitle}
                variant={destructive ? 'danger' : 'primary'}
                onPress={onConfirm}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  action: {
    flex: 1,
  },
});
