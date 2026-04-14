import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
} from 'react-native';
import { Audio } from 'expo-av';
import { api } from '@/services/api';

const COLORS = {
  navy: '#0D1B3E',
  orange: '#E8742E',
  gold: '#C8A45C',
  green: '#1A7A3C',
  ivory: '#FAF8F4',
  warmGray: '#8A8278',
  red: '#D94040',
};

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

const TAGS = ['Politique', 'Économie', 'Sport', 'Culture', 'Société', 'International'];

interface Recording {
  id: string;
  title: string;
  uri: string;
  duration: number;
  date: string;
  transcription?: string;
  tags: string[];
}

export default function CaptureScreen() {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingInstance, setRecordingInstance] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Post-recording state
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sourceLink, setSourceLink] = useState('');
  const [saving, setSaving] = useState(false);

  // Playback state
  const [playbackSound, setPlaybackSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Past recordings
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingRecordings, setLoadingRecordings] = useState(true);

  const loadRecordings = useCallback(async () => {
    try {
      const data = await api.get<{ recordings: Recording[] }>('/journalist/recordings');
      setRecordings(data.recordings || []);
    } catch (err: any) {
      // Silent fail on first load
    } finally {
      setLoadingRecordings(false);
    }
  }, []);

  useEffect(() => { loadRecordings(); }, [loadRecordings]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      playbackSound?.unloadAsync();
    };
  }, [playbackSound]);

  // Pulse animation
  useEffect(() => {
    if (isRecording && !isPaused) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, isPaused, pulseAnim]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- Recording controls ---
  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission requise', 'Autorisez l\'accès au microphone pour enregistrer');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecordingInstance(recording);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);
      setRecordedUri(null);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement');
    }
  };

  const pauseRecording = async () => {
    try {
      if (isPaused) {
        await recordingInstance?.startAsync();
        setIsPaused(false);
        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      } else {
        await recordingInstance?.pauseAsync();
        setIsPaused(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre en pause');
    }
  };

  const stopRecording = async () => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      await recordingInstance?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingInstance?.getURI();
      setRecordedUri(uri || null);
      setRecordedDuration(recordingDuration);
      setIsRecording(false);
      setIsPaused(false);
      setRecordingInstance(null);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'arrêter l\'enregistrement');
    }
  };

  // --- Save ---
  const handleSave = async () => {
    if (!recordedUri) return;
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre');
      return;
    }
    setSaving(true);
    try {
      await api.post('/journalist/recordings', {
        title: title.trim(),
        tags: selectedTags,
        sourceLink: sourceLink.trim() || undefined,
        duration: recordedDuration,
        uri: recordedUri,
      });
      Alert.alert('Succès', 'Enregistrement sauvegardé');
      setRecordedUri(null);
      setTitle('');
      setSelectedTags([]);
      setSourceLink('');
      loadRecordings();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de sauvegarder');
    } finally {
      setSaving(false);
    }
  };

  // --- Playback ---
  const playRecording = async (rec: Recording) => {
    try {
      if (playbackSound) {
        await playbackSound.unloadAsync();
        setPlaybackSound(null);
      }
      if (playingId === rec.id) {
        setPlayingId(null);
        return;
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: rec.uri },
        { rate: playbackSpeed, shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            const pos = status.positionMillis || 0;
            const dur = status.durationMillis || 1;
            setPlaybackProgress(pos / dur);
            if (status.didJustFinish) {
              setPlayingId(null);
              setPlaybackProgress(0);
            }
          }
        }
      );
      setPlaybackSound(sound);
      setPlayingId(rec.id);
    } catch {
      Alert.alert('Erreur', 'Impossible de lire l\'enregistrement');
    }
  };

  const changeSpeed = async () => {
    const idx = SPEED_OPTIONS.indexOf(playbackSpeed);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setPlaybackSpeed(next);
    if (playbackSound) {
      await playbackSound.setRateAsync(next, true);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // --- Render ---
  const renderRecordingItem = (rec: Recording) => {
    const isExpanded = expandedId === rec.id;
    const isPlaying = playingId === rec.id;
    return (
      <View key={rec.id} style={styles.pastCard}>
        <TouchableOpacity
          style={styles.pastHeader}
          onPress={() => setExpandedId(isExpanded ? null : rec.id)}
        >
          <View style={styles.pastHeaderLeft}>
            <Text style={styles.pastTitle}>{rec.title}</Text>
            <Text style={styles.pastMeta}>
              {formatTime(rec.duration)} - {new Date(rec.date).toLocaleDateString('fr-FR')}
            </Text>
            {rec.transcription && !isExpanded && (
              <Text style={styles.transcriptionPreview} numberOfLines={1}>
                {rec.transcription}
              </Text>
            )}
          </View>
          <Text style={styles.expandArrow}>{isExpanded ? '\u25B2' : '\u25BC'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.pastExpanded}>
            {/* Playback controls */}
            <View style={styles.playbackRow}>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => playRecording(rec)}
              >
                <Text style={styles.playBtnText}>{isPlaying ? '\u23F8' : '\u25B6'}</Text>
              </TouchableOpacity>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: isPlaying ? `${playbackProgress * 100}%` : '0%' }]} />
              </View>
              <TouchableOpacity style={styles.speedBtn} onPress={changeSpeed}>
                <Text style={styles.speedText}>{playbackSpeed}x</Text>
              </TouchableOpacity>
            </View>

            {rec.transcription && (
              <View style={styles.transcriptionBox}>
                <Text style={styles.transcriptionLabel}>Transcription</Text>
                <Text style={styles.transcriptionText}>{rec.transcription}</Text>
              </View>
            )}

            {rec.tags.length > 0 && (
              <View style={styles.tagRow}>
                {rec.tags.map((t, i) => (
                  <View key={i} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Capture audio</Text>

      {/* Recorder */}
      <View style={styles.recorderSection}>
        {/* Timer */}
        <Text style={styles.timer}>
          {isRecording ? formatTime(recordingDuration) : '00:00'}
        </Text>

        {/* Big Record Button */}
        <View style={styles.recordBtnContainer}>
          {isRecording ? (
            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlBtn} onPress={pauseRecording}>
                <Text style={styles.controlBtnText}>{isPaused ? '\u25B6' : '\u23F8'}</Text>
              </TouchableOpacity>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
                  <View style={styles.stopSquare} />
                </TouchableOpacity>
              </Animated.View>
              <View style={{ width: 48 }} />
            </View>
          ) : (
            <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
              <View style={styles.recordInner} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.recorderHint}>
          {isRecording
            ? isPaused ? 'En pause' : 'Enregistrement en cours...'
            : 'Appuyez pour enregistrer'}
        </Text>
      </View>

      {/* Post-recording form */}
      {recordedUri && !isRecording && (
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Détails de l'enregistrement</Text>
          <Text style={styles.formDuration}>Durée: {formatTime(recordedDuration)}</Text>

          <TextInput
            style={styles.input}
            placeholder="Titre de l'enregistrement"
            placeholderTextColor={COLORS.warmGray}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagRow}>
            {TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagChipText, selectedTags.includes(tag) && styles.tagChipTextActive]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Lien source (optionnel)"
            placeholderTextColor={COLORS.warmGray}
            value={sourceLink}
            onChangeText={setSourceLink}
            autoCapitalize="none"
            keyboardType="url"
          />

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Sauvegarder</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Past recordings */}
      <View style={styles.pastSection}>
        <Text style={styles.sectionTitle}>Enregistrements</Text>
        {loadingRecordings ? (
          <ActivityIndicator color={COLORS.orange} style={{ marginTop: 12 }} />
        ) : recordings.length === 0 ? (
          <Text style={styles.empty}>Aucun enregistrement</Text>
        ) : (
          recordings.map(renderRecordingItem)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  screenTitle: { fontSize: 26, fontWeight: '800', color: COLORS.navy, marginBottom: 24 },

  // Recorder
  recorderSection: { alignItems: 'center', marginBottom: 32 },
  timer: { fontSize: 48, fontWeight: '200', color: COLORS.navy, marginBottom: 24, fontVariant: ['tabular-nums'] },
  recordBtnContainer: { marginBottom: 16 },
  recordBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FDE8E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.red,
  },
  recordInner: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.red },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8E6E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnText: { fontSize: 20, color: COLORS.navy },
  stopBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.red,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FDE8E0',
  },
  stopSquare: { width: 28, height: 28, borderRadius: 4, backgroundColor: '#fff' },
  recorderHint: { fontSize: 13, color: COLORS.warmGray },

  // Form
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
  },
  formTitle: { fontSize: 17, fontWeight: '700', color: COLORS.navy, marginBottom: 4 },
  formDuration: { fontSize: 13, color: COLORS.warmGray, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.navy, marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#E0DDD8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.navy,
    marginBottom: 8,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#EDE9E2',
  },
  tagChipActive: { backgroundColor: COLORS.orange },
  tagChipText: { fontSize: 12, fontWeight: '600', color: COLORS.navy },
  tagChipTextActive: { color: '#fff' },
  saveBtn: {
    backgroundColor: COLORS.orange,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Past recordings
  pastSection: { marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
  empty: { fontSize: 14, color: COLORS.warmGray, textAlign: 'center', paddingVertical: 12 },
  pastCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  pastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  pastHeaderLeft: { flex: 1 },
  pastTitle: { fontSize: 15, fontWeight: '700', color: COLORS.navy },
  pastMeta: { fontSize: 12, color: COLORS.warmGray, marginTop: 2 },
  transcriptionPreview: { fontSize: 12, color: COLORS.warmGray, marginTop: 4, fontStyle: 'italic' },
  expandArrow: { fontSize: 12, color: COLORS.warmGray, marginLeft: 8 },
  pastExpanded: { paddingHorizontal: 14, paddingBottom: 14 },

  // Playback
  playbackRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnText: { color: '#fff', fontSize: 14 },
  progressTrack: { flex: 1, height: 4, backgroundColor: '#E8E6E1', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: COLORS.orange, borderRadius: 2 },
  speedBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EDE9E2',
  },
  speedText: { fontSize: 12, fontWeight: '700', color: COLORS.navy },
  transcriptionBox: {
    backgroundColor: COLORS.ivory,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  transcriptionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.warmGray, marginBottom: 4, textTransform: 'uppercase' },
  transcriptionText: { fontSize: 13, color: COLORS.navy, lineHeight: 20 },
});
