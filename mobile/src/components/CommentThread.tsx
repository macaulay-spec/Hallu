import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { formatCount, timeAgo } from '@/lib/format';
import { buildCommentTree } from '@/lib/comments';
import type { CommentNode } from '@/lib/comments';
import { commentSchema, firstIssue } from '@/lib/validation';
import type { Comment } from '@/services/comments';
import type { ReportReason } from '@/services/reports';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/useComments';
import { useToggleCommentLike } from '@/hooks/useReactions';
import { useSubmitReport } from '@/hooks/useSafety';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotConfiguredState } from '@/components/ui/NotConfiguredState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ParsedText } from '@/components/ParsedText';
import { ReportDialog } from '@/components/ReportDialog';

interface CommentThreadProps {
  postId: string;
  viewerUsername?: string;
}

interface ReplyTarget {
  commentId: string;
  username: string;
}

export function CommentThread({ postId, viewerUsername }: CommentThreadProps): ReactNode {
  const theme = useTheme();
  const query = useComments(postId);
  const create = useCreateComment(postId);
  const remove = useDeleteComment(postId);
  const like = useToggleCommentLike(postId);
  const report = useSubmitReport();
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingReport, setPendingReport] = useState<string | null>(null);

  const firstPage = query.data?.pages[0];
  const items = (query.data?.pages ?? []).flatMap((page) =>
    page.ok ? page.data.items : [],
  );
  const tree = buildCommentTree(items);
  const configured = firstPage === undefined || firstPage.ok;

  async function handleSend(): Promise<void> {
    const parsed = commentSchema.safeParse({ text: draft });
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }
    setError(null);
    const result = await create.mutateAsync({
      postId,
      parentId: replyTo?.commentId,
      text: parsed.data.text,
    });
    if (result.ok) {
      setDraft('');
      setReplyTo(null);
    } else {
      setError(result.error.message);
    }
  }

  async function handleLike(comment: Comment): Promise<void> {
    setError(null);
    const result = await like.mutateAsync({ commentId: comment.id, liked: !comment.viewerLiked });
    if (!result.ok) setError(result.error.message);
  }

  async function handleDelete(): Promise<void> {
    if (!pendingDelete) return;
    const commentId = pendingDelete;
    setPendingDelete(null);
    setError(null);
    const result = await remove.mutateAsync(commentId);
    if (!result.ok) setError(result.error.message);
  }

  async function handleReport(reason: ReportReason, details: string): Promise<void> {
    if (!pendingReport) return;
    const commentId = pendingReport;
    setError(null);
    const result = await report.mutateAsync({
      targetType: 'comment',
      targetId: commentId,
      reason,
      details: details.length > 0 ? details : undefined,
    });
    if (result.ok) {
      setPendingReport(null);
    } else {
      setError(result.error.message);
    }
  }

  function renderNode(node: CommentNode, depth: number): ReactNode {
    const { comment } = node;
    const mine = viewerUsername !== undefined && comment.author.username === viewerUsername;
    return (
      <View key={comment.id} style={[styles.node, depth > 0 && styles.nested]}>
        <View style={styles.row}>
          <Avatar uri={comment.author.avatarUrl} name={comment.author.displayName} size={32} />
          <View style={styles.content}>
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {comment.author.displayName}{' '}
              <Text style={{ color: theme.colors.textMuted }}>
                @{comment.author.username} · {timeAgo(comment.createdAt)}
              </Text>
            </Text>
            <ParsedText text={comment.text} />
            <View style={styles.nodeActions}>
              <Pressable
                onPress={() => void handleLike(comment)}
                accessibilityRole="button"
                accessibilityLabel={`Like, ${comment.likeCount} likes`}
                accessibilityState={{ selected: comment.viewerLiked }}
                style={styles.miniAction}
              >
                <Ionicons
                  name={comment.viewerLiked ? 'heart' : 'heart-outline'}
                  size={16}
                  color={comment.viewerLiked ? theme.colors.accent : theme.colors.textMuted}
                />
                <Text style={[styles.miniCount, { color: theme.colors.textDim }]}>
                  {formatCount(comment.likeCount)}
                </Text>
              </Pressable>
              {depth < 2 ? (
                <Pressable
                  onPress={() => setReplyTo({ commentId: comment.id, username: comment.author.username })}
                  accessibilityRole="button"
                  accessibilityLabel={`Reply to ${comment.author.username}`}
                  style={styles.miniAction}
                >
                  <Text style={[styles.reply, { color: theme.colors.brandBlue }]}>Reply</Text>
                </Pressable>
              ) : null}
              {mine ? (
                <Pressable
                  onPress={() => setPendingDelete(comment.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Delete comment"
                  style={styles.miniAction}
                >
                  <Text style={[styles.reply, { color: theme.colors.danger }]}>Delete</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => setPendingReport(comment.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Report comment"
                  style={styles.miniAction}
                >
                  <Text style={[styles.reply, { color: theme.colors.textMuted }]}>Report</Text>
                </Pressable>
              )}
            </View>
            {node.replies.map((reply) => renderNode(reply, depth + 1))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        Comments{items.length > 0 ? ` · ${items.length}` : ''}
      </Text>
      {query.isPending ? (
        <LoadingState label="Loading comments…" />
      ) : query.isError ? (
        <ErrorState
          message="Something went wrong loading comments."
          onRetry={() => void query.refetch()}
        />
      ) : !configured ? (
        <NotConfiguredState feature="Comments" onRetry={() => void query.refetch()} />
      ) : tree.length === 0 ? (
        <EmptyState
          icon="chatbubble-outline"
          title="No comments yet"
          message="Start the conversation — be kind, mark spoilers."
        />
      ) : (
        <FlatList
          data={tree}
          keyExtractor={(node) => node.comment.id}
          renderItem={({ item }) => <>{renderNode(item, 0)}</>}
          scrollEnabled={false}
        />
      )}
      {query.hasNextPage ? (
        <Button
          title="Load more comments"
          variant="secondary"
          onPress={() => void query.fetchNextPage()}
          loading={query.isFetchingNextPage}
        />
      ) : null}
      {replyTo ? (
        <Text style={[styles.replying, { color: theme.colors.textDim }]}>
          Replying to @{replyTo.username} ·{' '}
          <Text
            accessibilityRole="link"
            accessibilityLabel="Cancel reply"
            onPress={() => setReplyTo(null)}
            style={{ color: theme.colors.brandBlue }}
          >
            Cancel
          </Text>
        </Text>
      ) : null}
      <TextField
        label={replyTo ? `Reply to @${replyTo.username}` : 'Write a reply…'}
        value={draft}
        onChangeText={setDraft}
        placeholder="Share your take…"
        multiline
      />
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
      <Button title="Reply" onPress={() => void handleSend()} loading={create.isPending} />
      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Delete comment?"
        message="This cannot be undone."
        confirmTitle="Delete"
        destructive
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
      <ReportDialog
        visible={pendingReport !== null}
        targetLabel="comment"
        busy={report.isPending}
        onSubmit={(reason, details) => void handleReport(reason, details)}
        onClose={() => setPendingReport(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
  },
  node: {
    paddingVertical: 8,
  },
  nested: {
    marginLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#2A2A2A',
    paddingLeft: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  nodeActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  miniAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 32,
  },
  miniCount: {
    fontSize: 13,
  },
  reply: {
    fontSize: 13,
    fontWeight: '600',
  },
  replying: {
    fontSize: 13,
  },
  error: {
    fontSize: 13,
  },
});
