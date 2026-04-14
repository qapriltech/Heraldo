"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Hash,
  Send,
  ThumbsUp,
  Heart,
  Flame,
  MessageCircle,
  Loader2,
  Plus,
  X,
  Clock,
  User,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface Channel {
  id: string;
  name: string;
  unread: number;
}

interface Post {
  id: string;
  author: string;
  authorMedia?: string;
  content: string;
  title?: string;
  time: string;
  reactions: { thumbsUp: number; heart: number; fire: number };
  replies: number;
  myReaction?: string | null;
}

const DEFAULT_CHANNELS: Channel[] = [
  { id: "general", name: "general", unread: 0 },
  { id: "politique", name: "politique", unread: 0 },
  { id: "economie", name: "economie", unread: 0 },
  { id: "societe", name: "societe", unread: 0 },
  { id: "sport", name: "sport", unread: 0 },
  { id: "culture", name: "culture", unread: 0 },
  { id: "technique", name: "technique", unread: 0 },
  { id: "opportunites", name: "opportunites", unread: 0 },
  { id: "alertes-terrain", name: "alertes-terrain", unread: 0 },
];

export default function ForumPage() {
  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);
  const [activeChannel, setActiveChannel] = useState("general");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [mobileSidebar, setMobileSidebar] = useState(false);

  useEffect(() => {
    api.get<any>("/forum/channels")
      .then((res) => {
        const data = res.data ?? res;
        if (Array.isArray(data) && data.length > 0) setChannels(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPostsLoading(true);
    api.get<any>(`/forum/channels/${activeChannel}/posts`)
      .then((res) => {
        const data = res.data ?? res;
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, [activeChannel]);

  const handleReact = (postId: string, reaction: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const key = reaction as keyof Post["reactions"];
      const wasActive = p.myReaction === reaction;
      return {
        ...p,
        myReaction: wasActive ? null : reaction,
        reactions: {
          ...p.reactions,
          [key]: wasActive ? p.reactions[key] - 1 : p.reactions[key] + 1,
        },
      };
    }));
    api.post(`/forum/posts/${postId}/react`, { reaction }).catch(() => {});
  };

  const handleNewPost = async () => {
    if (!newPostContent.trim()) return;
    const tempPost: Post = {
      id: `temp-${Date.now()}`,
      author: "Vous",
      content: newPostContent,
      title: newPostTitle || undefined,
      time: "A l'instant",
      reactions: { thumbsUp: 0, heart: 0, fire: 0 },
      replies: 0,
    };
    setPosts(prev => [tempPost, ...prev]);
    setShowNewPost(false);
    setNewPostTitle("");
    setNewPostContent("");
    try {
      await api.post(`/forum/channels/${activeChannel}/posts`, { title: newPostTitle, content: newPostContent });
    } catch {}
  };

  const activeChannelData = channels.find(c => c.id === activeChannel);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-orange animate-spin" />
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Forum</h1>
          <p className="text-warm-gray text-sm mt-1">Echangez avec la communaute des journalistes.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMobileSidebar(!mobileSidebar)}
            className="lg:hidden px-3 py-2 rounded-lg bg-white border border-navy/10 text-sm font-bold text-navy cursor-pointer"
          >
            <Hash className="w-4 h-4" />
          </button>
          <Button onClick={() => setShowNewPost(true)} className="bg-orange hover:bg-orange-light text-white">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nouveau post</span>
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Channel sidebar */}
        <div className={`${mobileSidebar ? "block" : "hidden"} lg:block`}>
          <Card hover={false}>
            <h3 className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-3">Canaux</h3>
            <div className="space-y-1">
              {channels.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => { setActiveChannel(ch.id); setMobileSidebar(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                    activeChannel === ch.id
                      ? "bg-orange text-white font-bold"
                      : "text-navy hover:bg-navy/5 font-medium"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5" />
                    {ch.name}
                  </span>
                  {ch.unread > 0 && (
                    <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      activeChannel === ch.id ? "bg-white text-orange" : "bg-orange text-white"
                    }`}>
                      {ch.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Main post feed */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-5 h-5 text-orange" />
            <h2 className="text-lg font-bold text-navy">{activeChannelData?.name ?? activeChannel}</h2>
          </div>

          {postsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-orange animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {posts.length > 0 ? posts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card padding="sm">
                    {/* Author header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-orange" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-navy">{post.author}</span>
                          {post.authorMedia && (
                            <span className="text-[10px] text-warm-gray">- {post.authorMedia}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-warm-gray flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {post.time}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    {post.title && <h3 className="text-sm font-bold text-navy mb-1">{post.title}</h3>}
                    <p className="text-sm text-navy/80 leading-relaxed">{post.content}</p>

                    {/* Reactions + replies */}
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-navy/5">
                      {([
                        { key: "thumbsUp", icon: ThumbsUp, label: "" },
                        { key: "heart", icon: Heart, label: "" },
                        { key: "fire", icon: Flame, label: "" },
                      ] as const).map(({ key, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => handleReact(post.id, key)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                            post.myReaction === key
                              ? "bg-orange/10 text-orange font-bold"
                              : "text-warm-gray hover:bg-navy/5"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {post.reactions[key] > 0 && <span>{post.reactions[key]}</span>}
                        </button>
                      ))}
                      <div className="flex items-center gap-1 text-xs text-warm-gray ml-auto">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.replies} reponse{post.replies !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )) : (
                <Card hover={false}>
                  <p className="text-sm text-warm-gray text-center py-8">Aucun post dans ce canal. Soyez le premier !</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowNewPost(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-navy">Nouveau post dans #{activeChannel}</h2>
                <button onClick={() => setShowNewPost(false)} className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center hover:bg-navy/10 cursor-pointer">
                  <X className="w-4 h-4 text-navy" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-warm-gray">Titre (optionnel)</label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={e => setNewPostTitle(e.target.value)}
                    placeholder="Titre de votre post..."
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-navy/10 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-warm-gray">Contenu</label>
                  <textarea
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    placeholder="Partagez votre message..."
                    rows={5}
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-navy/10 bg-white text-sm resize-none"
                  />
                </div>
                <Button onClick={handleNewPost} className="w-full bg-orange hover:bg-orange-light text-white">
                  <Send className="w-4 h-4" /> Publier
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
