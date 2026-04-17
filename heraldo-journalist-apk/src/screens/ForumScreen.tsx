import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../stores/auth';
import { api } from '../services/api';

interface Channel {
  id: string;
  name: string;
}

interface Reply {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  authorName: string;
  authorInitials: string;
  content: string;
  reactions: number;
  replyCount: number;
  createdAt: string;
  replies?: Reply[];
}

const COLORS = {
  navy: '#0D1B3E',
  orange: '#E8742E',
  gold: '#C8A45C',
  green: '#1A7A3C',
  ivory: '#FAF8F4',
  warmGray: '#8A8278',
};

export default function ForumScreen() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingReplies, setLoadingReplies] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);

  const loadChannels = useCallback(async () => {
    try {
      const data = await api.get<{ channels: Channel[] }>('/journalist/forum/channels');
      setChannels(data.channels || []);
      if (data.channels?.length > 0 && !activeChannel) {
        setActiveChannel(data.channels[0].id);
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de charger les canaux');
    } finally {
      setLoading(false);
    }
  }, [activeChannel]);

  const loadPosts = useCallback(async (channelId: string) => {
    setLoadingPosts(true);
    try {
      const data = await api.get<{ posts: Post[] }>(`/journalist/forum/channels/${channelId}/posts`);
      setPosts(data.posts || []);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de charger les posts');
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadChannels(); }, [loadChannels]);

  useEffect(() => {
    if (activeChannel) loadPosts(activeChannel);
  }, [activeChannel, loadPosts]);

  const loadReplies = async (postId: string) => {
    if (expandedId === postId) {
      setExpandedId(null);
      return;
    }
    setLoadingReplies(postId);
    try {
      const data = await api.get<{ replies: Reply[] }>(`/journalist/forum/posts/${postId}/replies`);
      setPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, replies: data.replies || [] } : p)
      );
      setExpandedId(postId);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de charger les réponses');
    } finally {
      setLoadingReplies(null);
    }
  };

  const handleReact = async (postId: string) => {
    try {
      await api.post(`/journalist/forum/posts/${postId}/react`);
      setPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, reactions: p.reactions + 1 } : p)
      );
    } catch {
      // Silent
    }
  };

  const handlePost = async () => {
    if (!newPostContent.trim() || !activeChannel) return;
    setPosting(true);
    try {
      await api.post(`/journalist/forum/channels/${activeChannel}/posts`, {
        content: newPostContent.trim(),
      });
      setNewPostContent('');
      setComposing(false);
      loadPosts(activeChannel);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de publier');
    } finally {
      setPosting(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'maintenant';
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}j`;
  };

  const renderPost = ({ item }: { item: Post }) => {
    const isExpanded = expandedId === item.id;
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.postAvatar}>
            <Text style={styles.postAvatarText}>{item.authorInitials}</Text>
          </View>
          <View style={styles.postHeaderInfo}>
            <Text style={styles.postAuthor}>{item.authorName}</Text>
            <Text style={styles.postTime}>{timeAgo(item.createdAt)}</Text>
          </View>
        </View>
        <Text style={styles.postContent}>{item.content}</Text>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.postAction} onPress={() => handleReact(item.id)}>
            <Text style={styles.postActionText}>{item.reactions} J'aime</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.postAction}
            onPress={() => loadReplies(item.id)}
          >
            {loadingReplies === item.id ? (
              <ActivityIndicator size="small" color={COLORS.warmGray} />
            ) : (
              <Text style={styles.postActionText}>{item.replyCount} Réponses</Text>
            )}
          </TouchableOpacity>
        </View>

        {isExpanded && item.replies && (
          <View style={styles.repliesContainer}>
            {item.replies.length === 0 ? (
              <Text style={styles.noReplies}>Aucune réponse</Text>
            ) : (
              item.replies.map((reply) => (
                <View key={reply.id} style={styles.replyCard}>
                  <Text style={styles.replyAuthor}>{reply.authorName}</Text>
                  <Text style={styles.replyContent}>{reply.content}</Text>
                  <Text style={styles.replyTime}>{timeAgo(reply.createdAt)}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Channel selector */}
      <View style={styles.channelBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.channelScroll}>
          {channels.map((ch) => (
            <TouchableOpacity
              key={ch.id}
              style={[styles.channelChip, activeChannel === ch.id && styles.channelChipActive]}
              onPress={() => setActiveChannel(ch.id)}
            >
              <Text style={[styles.channelChipText, activeChannel === ch.id && styles.channelChipTextActive]}>
                {ch.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Compose modal */}
      {composing && (
        <View style={styles.composeBox}>
          <TextInput
            style={styles.composeInput}
            placeholder="Votre message..."
            placeholderTextColor={COLORS.warmGray}
            multiline
            value={newPostContent}
            onChangeText={setNewPostContent}
            autoFocus
          />
          <View style={styles.composeActions}>
            <TouchableOpacity onPress={() => { setComposing(false); setNewPostContent(''); }}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.postBtn, posting && { opacity: 0.6 }]}
              onPress={handlePost}
              disabled={posting}
            >
              {posting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.postBtnText}>Publier</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Posts */}
      {loadingPosts ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.orange} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); if (activeChannel) loadPosts(activeChannel); }}
              tintColor={COLORS.orange}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Aucune discussion dans ce canal</Text>
          }
        />
      )}

      {/* FAB */}
      {!composing && (
        <TouchableOpacity style={styles.fab} onPress={() => setComposing(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.ivory },
  channelBar: { paddingTop: 56, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8E6E1' },
  channelScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  channelChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#EDE9E2',
    marginRight: 8,
  },
  channelChipActive: { backgroundColor: COLORS.orange },
  channelChipText: { fontSize: 13, fontWeight: '600', color: COLORS.navy },
  channelChipTextActive: { color: '#fff' },
  listContent: { padding: 16, paddingBottom: 80 },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  postAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  postAvatarText: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
  postHeaderInfo: { flex: 1 },
  postAuthor: { fontSize: 14, fontWeight: '700', color: COLORS.navy },
  postTime: { fontSize: 11, color: COLORS.warmGray },
  postContent: { fontSize: 14, color: COLORS.navy, lineHeight: 20, marginBottom: 10 },
  postActions: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#F0EDE8', paddingTop: 8 },
  postAction: { flexDirection: 'row', alignItems: 'center' },
  postActionText: { fontSize: 12, color: COLORS.warmGray, fontWeight: '600' },
  repliesContainer: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0EDE8' },
  noReplies: { fontSize: 13, color: COLORS.warmGray, fontStyle: 'italic' },
  replyCard: {
    backgroundColor: COLORS.ivory,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  replyAuthor: { fontSize: 13, fontWeight: '700', color: COLORS.navy, marginBottom: 2 },
  replyContent: { fontSize: 13, color: COLORS.navy, lineHeight: 18 },
  replyTime: { fontSize: 10, color: COLORS.warmGray, marginTop: 4 },
  composeBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E1',
  },
  composeInput: {
    borderWidth: 1,
    borderColor: '#E0DDD8',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.navy,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  composeActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cancelText: { color: COLORS.warmGray, fontSize: 14, fontWeight: '600' },
  postBtn: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.orange,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '600', marginTop: -2 },
  empty: { fontSize: 14, color: COLORS.warmGray, textAlign: 'center', paddingVertical: 20 },
});
