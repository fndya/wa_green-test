
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Send,
  MessageCircle,
  ArrowLeft,
  Settings,
  CheckCheck,
  UserRound,
  X,
} from "lucide-react";
import { greenApi } from "./lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function App() {
  // Модель чата для будущих данных GREEN-API:
  // { id, chatId, name, phone, lastMessage, timestamp, unread, messages: [] }
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [connectionState, setConnectionState] = useState("idle");
  const [connectionError, setConnectionError] = useState("");
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [phone, setPhone] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return chats;

    return chats.filter((chat) =>
      `${chat.name} ${chat.phone}`.toLowerCase().includes(query)
    );
  }, [chats, search]);

  async function checkConnection(event) {
    event.preventDefault();

    if (checkingConnection) return;

    setCheckingConnection(true);
    setConnectionState("checking");
    setConnectionError("");

    try {
      const data = await greenApi.getState({
        idInstance,
        apiTokenInstance,
      });

      const state = data.stateInstance;

      if (state === "authorized") {
        setConnectionState("authorized");
      } else if (state === "notAuthorized") {
        setConnectionState("notAuthorized");
      } else {
        setConnectionState("unknown");
        setConnectionError(
          `Неизвестное состояние: ${state || JSON.stringify(data)}`
        );
      }
    } catch (error) {
      setConnectionState("error");
      setConnectionError(error.message);
    } finally {
      setCheckingConnection(false);
    }
  }

  function createChat(event) {
    event.preventDefault();

    const normalized = phone.replace(/\D/g, "");
    if (!normalized) return;

    const chatId = `${normalized}@c.us`;
    const existing = chats.find((chat) => chat.chatId === chatId);

    if (existing) {
      setActiveChatId(existing.id);
      setMobileChatOpen(true);
      setShowNewChat(false);
      setPhone("");
      return;
    }

    const newChat = {
      id: crypto.randomUUID(),
      chatId,
      name: `+${normalized}`,
      phone: `+${normalized}`,
      lastMessage: "",
      timestamp: "",
      unread: 0,
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setMobileChatOpen(true);
    setShowNewChat(false);
    setPhone("");
  }

  async function sendMessage(event) {
    event.preventDefault();

    const text = draft.trim();
    if (!text || !activeChat || sending) return;

    setSending(true);

    try {
      const data = await greenApi.sendMessage({
        idInstance,
        apiTokenInstance,
        chatId: activeChat.chatId,
        message: text,
      });

      const message = {
        id: crypto.randomUUID(),
        text,
        timestamp: new Date().toISOString(),
        type: "outgoing",
        status: "sent",
        idMessage: data.idMessage,
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                lastMessage: text,
                timestamp: message.timestamp,
                messages: [...chat.messages, message],
              }
            : chat
        )
      );

      setDraft("");
    } catch (error) {
      setConnectionError(`Ошибка отправки: ${error.message}`);
    } finally {
      setSending(false);
    }
  }

  function formatTime(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="h-[100dvh] bg-[#e9f0eb] p-0 font-sans text-slate-800 sm:p-3">
      <div className="mx-auto flex h-full max-w-[1500px] overflow-hidden bg-white shadow-xl sm:rounded-2xl sm:border sm:border-emerald-100">
        <div className="fixed bottom-4 right-4 z-40 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-emerald-100 bg-white p-4 text-slate-800 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold tracking-tight !text-slate-900">
                  Подключение
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  GREEN-API · WhatsApp
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  connectionState === "authorized"
                    ? "bg-emerald-100 text-emerald-700"
                    : connectionState === "notAuthorized"
                      ? "bg-amber-100 text-amber-700"
                      : connectionState === "error"
                        ? "bg-red-100 text-red-700"
                        : connectionState === "checking"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                }`}
              >
                {connectionState === "authorized"
                  ? "Подключено"
                  : connectionState === "notAuthorized"
                    ? "Не авторизован"
                    : connectionState === "error"
                      ? "Ошибка"
                      : connectionState === "checking"
                        ? "Проверка..."
                        : connectionState === "unknown"
                          ? "Неизвестно"
                          : "Не проверено"}
              </span>
            </div>

            <form onSubmit={checkConnection} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  ID инстанса
                </label>
                <Input
                  value={idInstance}
                  onChange={(event) => setIdInstance(event.target.value)}
                  placeholder="ID инстанса"
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  API Token Instance
                </label>
                <Input
                  type="password"
                  value={apiTokenInstance}
                  onChange={(event) => setApiTokenInstance(event.target.value)}
                  placeholder="Вставь токен"
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm text-slate-900"
                />
              </div>

              <Button
                type="submit"
                disabled={
                  !idInstance.trim() ||
                  !apiTokenInstance.trim() ||
                  checkingConnection
                }
                className="h-10 w-full rounded-xl bg-emerald-700 font-medium text-white hover:bg-emerald-800"
              >
                {checkingConnection ? "Проверяем..." : "Проверить подключение"}
              </Button>

              {connectionState === "authorized" && (
                <p className="text-xs leading-relaxed text-emerald-700">
                  Инстанс авторизован. Можно отправлять сообщения.
                </p>
              )}

              {connectionState === "notAuthorized" && (
                <p className="text-xs leading-relaxed text-amber-700">
                  WhatsApp не авторизован. Открой кабинет GREEN-API и проверь
                  подключение устройства.
                </p>
              )}

              {connectionError && (
                <p className="break-words text-xs leading-relaxed text-red-600">
                  {connectionError}
                </p>
              )}
            </form>
          </div>
        <aside
          className={`${
            mobileChatOpen ? "hidden" : "flex"
          } w-full shrink-0 flex-col border-r border-slate-200 bg-white md:flex md:w-[350px] lg:w-[390px]`}
        >
          <div className="bg-emerald-800 px-5 pb-5 pt-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">
                    GreenChat
                  </h1>
                  <p className="text-xs text-emerald-100">
                    WhatsApp через GREEN-API
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => setShowNewChat(true)}
                aria-label="Создать чат"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-3 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по чатам"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-9 focus-visible:ring-emerald-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Сообщения
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                onClick={() => setShowNewChat(true)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Новый чат
              </Button>
            </div>
          </div>

          <Separator />

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-1 p-2">
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <p className="font-medium text-slate-700">
                    {search ? "Ничего не найдено" : "Пока нет чатов"}
                  </p>
                  <p className="mt-1 max-w-[230px] text-sm leading-relaxed text-slate-400">
                    {search
                      ? "Попробуй изменить поисковый запрос."
                      : "Создай чат по номеру WhatsApp, чтобы начать переписку."}
                  </p>
                  {!search && (
                    <Button
                      onClick={() => setShowNewChat(true)}
                      className="mt-5 rounded-xl bg-emerald-700 hover:bg-emerald-800"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Создать чат
                    </Button>
                  )}
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setMobileChatOpen(true);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      activeChatId === chat.id
                        ? "bg-emerald-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback className="bg-emerald-100 font-semibold text-emerald-800">
                        {getInitials(chat.name) || <UserRound className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold !text-slate-800">
                          {chat.name}
                        </span>
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {formatTime(chat.timestamp)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-slate-500">
                          {chat.lastMessage || chat.phone}
                        </span>
                        {chat.unread > 0 && (
                          <Badge className="h-5 min-w-5 justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] text-white hover:bg-emerald-600">
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-slate-200 p-3">
            <div className="flex items-center gap-3 rounded-xl p-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-emerald-700 text-sm font-semibold text-white">
                  Ф
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Мой профиль</p>
                <p className="text-xs text-emerald-600">GREEN-API</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400"
                aria-label="Настройки"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Conversation */}
        <section
          className={`${
            mobileChatOpen ? "flex" : "hidden"
          } min-w-0 flex-1 flex-col bg-[#f4f8f5] md:flex`}
        >
          {activeChat ? (
            <>
              <header className="z-10 flex h-[72px] shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileChatOpen(false)}
                  aria-label="Назад к чатам"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-emerald-100 font-semibold text-emerald-800">
                    {getInitials(activeChat.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold text-slate-800">
                    {activeChat.name}
                  </h2>
                  <p className="truncate text-xs text-slate-500">
                    {activeChat.phone}
                  </p>
                </div>
                <div className="hidden items-center gap-1 sm:flex">
                  <Button variant="ghost" size="icon" aria-label="Позвонить">
                    <Phone className="h-4 w-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Видеозвонок">
                    <Video className="h-4 w-4 text-slate-500" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" aria-label="Ещё">
                  <MoreVertical className="h-4 w-4 text-slate-500" />
                </Button>
              </header>

              <ScrollArea className="min-h-0 flex-1">
                <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-3 px-4 py-6 sm:px-8">
                  {activeChat.messages.length === 0 ? (
                    <div className="m-auto max-w-sm rounded-2xl border border-emerald-100 bg-white/90 px-6 py-5 text-center shadow-sm">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <MessageCircle className="h-6 w-6" />
                      </div>
                      <p className="font-medium text-slate-700">
                        Чат создан
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Напиши первое сообщение. После подключения API здесь
                        появится история переписки.
                      </p>
                    </div>
                  ) : (
                    activeChat.messages.map((message) => {
                      const mine = message.type === "outgoing";
                      return (
                        <div
                          key={message.id}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[70%] ${
                              mine
                                ? "rounded-br-md bg-[#d8f4df]"
                                : "rounded-bl-md border border-slate-100 bg-white"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800">
                              {message.text}
                            </p>
                            <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-slate-400">
                              {formatTime(message.timestamp)}
                              {mine && <CheckCheck className="h-3.5 w-3.5 text-emerald-700" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              <form
                onSubmit={sendMessage}
                className="flex shrink-0 items-end gap-2 border-t border-slate-200 bg-white px-3 py-3 sm:gap-3 sm:px-5"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mb-1 shrink-0 text-slate-400 hover:text-emerald-700"
                  aria-label="Прикрепить файл"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Написать сообщение..."
                  className="h-11 min-w-0 rounded-xl border-slate-200 bg-slate-50 px-4 focus-visible:ring-emerald-600"
                />
                <Button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="mb-0.5 h-10 w-10 shrink-0 rounded-xl bg-emerald-700 p-0 hover:bg-emerald-800"
                  aria-label="Отправить сообщение"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
                <MessageCircle className="h-10 w-10" />
              </div>
              <h2 className="text-lg font-semibold !text-slate-700">
                Добро пожаловать в GreenChat
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Выбери чат слева или создай новый по номеру WhatsApp.
                Переписки будут отображаться здесь.
              </p>
              <Button
                onClick={() => setShowNewChat(true)}
                className="mt-5 rounded-xl bg-emerald-700 hover:bg-emerald-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Новый чат
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* New chat dialog */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-chat-title"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 id="new-chat-title" className="text-lg font-semibold">
                  Новый чат
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Введи номер WhatsApp в международном формате.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNewChat(false)}
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={createChat} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Номер телефона
                </label>
                <Input
                  id="phone"
                  autoFocus
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Например, 79991234567"
                  className="h-11 rounded-xl"
                />
                <p className="text-xs text-slate-400">
                  Укажи код страны, без пробелов и знака «+» можно тоже.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewChat(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={!phone.replace(/\D/g, "")}
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  Создать чат
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
