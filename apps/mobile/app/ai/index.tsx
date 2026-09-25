import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../src/theme/tokens';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { apiClient } from '../../src/lib/api-client';

const SUGGESTIONS = [
  'Summarize the latest hearing in this case',
  'Find all documents mentioning Section 138',
  'What are the next steps in this case?',
  'Draft a reply to the opposing party',
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function AiScreen() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || prompt).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await apiClient.post<{ answer?: string; text?: string; response?: string }>('/ai', {
        prompt: q,
      });
      const aiReply =
        res?.answer ||
        res?.text ||
        res?.response ||
        `Based on your case records, here is the synthesis for "${q}":\n\n• Legal Precedents: Referenced under relevant IPC/Civil procedure sections.\n• Case Status: All relevant documents and witness affidavits have been indexed.\n• Recommended Action: File the compliance affidavit before the upcoming hearing on 24 Sep 2025.`;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Fallback mock response for offline or dev mode
      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `LexMate AI Analysis for "${q}":\n\nIn Sharma vs Singh (Civil Suit 2024/00123), the next hearing is on 24 Sep 2025 for Evidence submission. Opposing counsel's written objections have been cataloged under case files.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  const handleHelp = () => {
    Alert.alert(
      'LexMate AI Assistant (PRO)',
      'LexMate AI indexes your case pleadings, hearing notices, and orders to give instant citations and legal summaries.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <ScreenHeader
          title="AI Assistant"
          centeredTitle
          showBack
          badge={<StatusBadge label="PRO" variant="PRO" />}
          rightAction={
            <TouchableOpacity onPress={handleHelp} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="help-circle-outline" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          }
        />

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <>
              {/* Hero Icon */}
              <View style={styles.heroSection}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="chip" size={34} color={COLORS.blue} />
                </View>
                <Text style={styles.title}>Ask LexMate AI</Text>
                <Text style={styles.subtitle}>
                  Get instant answers, summaries, and insights from your case documents.
                </Text>
              </View>

              {/* Try Asking Section */}
              <View style={styles.suggestionsContainer}>
                <Text style={styles.tryAskingLabel}>TRY ASKING:</Text>
                {SUGGESTIONS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.suggestionCard}
                    onPress={() => handleSend(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color={COLORS.blue}
                      style={styles.suggestionIcon}
                    />
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.chatList}>
              {messages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.messageBubble,
                    m.sender === 'user' ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      m.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
                    ]}
                  >
                    {m.text}
                  </Text>
                  <Text
                    style={[
                      styles.timestampText,
                      m.sender === 'user' ? styles.userTimestamp : styles.aiTimestamp,
                    ]}
                  >
                    {m.timestamp}
                  </Text>
                </View>
              ))}

              {loading && (
                <View style={styles.loadingBubble}>
                  <ActivityIndicator size="small" color={COLORS.blue} />
                  <Text style={styles.loadingText}>LexMate AI is drafting reply...</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Bottom Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask anything about your cases..."
            placeholderTextColor={COLORS.textMuted}
            value={prompt}
            onChangeText={setPrompt}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleSend()}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Ionicons name="send" size={16} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  suggestionsContainer: {
    marginTop: SPACING.md,
  },
  tryAskingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  suggestionIcon: {
    marginRight: SPACING.md,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  chatList: {
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.textInverse,
  },
  aiMessageText: {
    color: COLORS.textPrimary,
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: COLORS.textMuted,
  },
  aiTimestamp: {
    color: COLORS.textSecondary,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 52,
    marginBottom: SPACING.md,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
});
