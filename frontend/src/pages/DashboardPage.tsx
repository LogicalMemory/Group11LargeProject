import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { buildPath } from '../components/Path';
import { clearToken, retrieveToken, storeToken } from '../tokenStorage';

type CommentRecord = {
  CommentId: number;
  AuthorId: number;
  AuthorName: string;
  AuthorImageUrl?: string | null;
  Text: string;
  CreatedAt: string;
};

type EventRecord = {
  EventId: number;
  EventOwnerId: number;
  EventTitle: string;
  EventDescription: string;
  EventTime: string;
  EventDuration: string;
  EventLocation: string;
  Likes?: number;
  LikedBy?: Array<number | string>;
  Comments?: CommentRecord[];
  EventImageUrl?: string | null;
  OwnerProfileImageUrl?: string | null;
};

type DecodedToken = {
  userId: number;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
};

type DashboardFormState = {
  eventTitle: string;
  eventDescription: string;
  eventTime: string;
  eventDuration: string;
  eventLocation: string;
  eventImageUrl: string | null;
};

type NotificationState = {
  type: 'info' | 'success' | 'error';
  text: string;
};

const emptyForm: DashboardFormState = {
  eventTitle: '',
  eventDescription: '',
  eventTime: '',
  eventDuration: '60',
  eventLocation: '',
  eventImageUrl: null,
};

const formatDateTime = (value?: string) => {
  if (!value) return 'Date TBA';
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return value;
  return dateValue.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const toDatetimeLocal = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
};

const toIsoString = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
};

const toAbsoluteUrl = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return buildPath(cleanPath);
};

const getEventTimestamp = (event: EventRecord): number => {
  const time = new Date(event.EventTime).getTime();
  if (!Number.isNaN(time)) {
    return time;
  }
  return Number(event.EventId) || 0;
};

const formatCalendarDate = (date: Date) => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const buildGoogleCalendarLink = (event: EventRecord) => {
  const title = encodeURIComponent(event.EventTitle || 'LoopU Event');
  const rawStart = event.EventTime ? new Date(event.EventTime) : new Date();
  const startDate = Number.isNaN(rawStart.getTime()) ? new Date() : rawStart;
  const start = formatCalendarDate(startDate);
  const durationMinutes = Number.parseInt(event.EventDuration ?? '60', 10);
  const minutes = Number.isNaN(durationMinutes) ? 60 : durationMinutes;
  const endDate = new Date(startDate.getTime() + minutes * 60000);
  const end = formatCalendarDate(endDate);
  const description = encodeURIComponent(event.EventDescription || 'Created via LoopU');
  const location = encodeURIComponent(event.EventLocation || '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}&location=${location}`;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState<string | null>(() => retrieveToken());
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [activeSearch, setActiveSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [viewFilter, setViewFilter] = useState<'mine' | 'all'>('mine');
  const [isFetching, setIsFetching] = useState(false);
  const [formState, setFormState] = useState<DashboardFormState>(emptyForm);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [commentErrors, setCommentErrors] = useState<Record<number, string>>({});
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem('user_data');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed.profileImageUrl ?? null;
    } catch {
      return null;
    }
  });
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [profileImageError, setProfileImageError] = useState<string | null>(null);
  const [isUploadingEventImage, setIsUploadingEventImage] = useState(false);
  const [eventImageError, setEventImageError] = useState<string | null>(null);
  const [notificationMessages, setNotificationMessages] = useState<Record<number, NotificationState>>({});
  const [notificationLoading, setNotificationLoading] = useState<Record<number, boolean>>({});

  const sortEventsList = useCallback((list: EventRecord[]) => {
    return [...list].sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a));
  }, []);

  const decodedUser = useMemo(() => {
    if (!authToken) return null;
    try {
      return jwtDecode<DecodedToken>(authToken);
    } catch {
      return null;
    }
  }, [authToken]);

  useEffect(() => {
    if (!authToken) {
      navigate('/login', { replace: true });
    }
  }, [authToken, navigate]);

  const syncToken = useCallback((incoming?: unknown) => {
    if (!incoming) return;
    storeToken(incoming as any);
    setAuthToken(retrieveToken());
  }, []);

  const updateStoredUser = useCallback((updates: Record<string, unknown>) => {
    try {
      const stored = localStorage.getItem('user_data');
      const parsed = stored ? JSON.parse(stored) : {};
      const next = { ...parsed, ...updates };
      localStorage.setItem('user_data', JSON.stringify(next));
    } catch (storageError) {
      console.error('Unable to persist user data', storageError);
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
    localStorage.removeItem('user_data');
    setAuthToken(null);
    setProfileImageUrl(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const fetchEvents = useCallback(async () => {
    if (!authToken) return;
    setIsFetching(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        token: authToken,
      };
      if (activeSearch) {
        body.searchKeyword = activeSearch;
      }
      if (viewFilter === 'mine' && decodedUser?.userId) {
        body.ownerId = decodedUser.userId;
      }

      const response = await fetch(buildPath('api/CRUD/searchEvents'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.error) {
        throw new Error(data?.error || 'Unable to load events.');
      }

      const rawEvents = Array.isArray(data.events) ? data.events : [];
      setEvents(sortEventsList(rawEvents));
      if (data.token) {
        syncToken(data.token);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong while fetching events.';
      setError(message);
      if (message.toLowerCase().includes('jwt')) {
        handleLogout();
      }
    } finally {
      setIsFetching(false);
    }
  }, [authToken, activeSearch, viewFilter, decodedUser?.userId, sortEventsList, syncToken]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return events.filter((event) => {
      const date = new Date(event.EventTime).getTime();
      return !Number.isNaN(date) && date >= now;
    });
  }, [events]);

  const updateEventInState = useCallback(
    (updatedEvent: EventRecord) => {
      setEvents((prev) =>
        sortEventsList(prev.map((item) => (item.EventId === updatedEvent.EventId ? updatedEvent : item))),
      );
    },
    [sortEventsList],
  );

  const nextEvent = useMemo(() => {
    if (upcomingEvents.length === 0) return null;
    return [...upcomingEvents].sort(
      (a, b) => new Date(a.EventTime).getTime() - new Date(b.EventTime).getTime(),
    )[0];
  }, [upcomingEvents]);

  const ownedEventsCount = useMemo(
    () =>
      decodedUser?.userId
        ? events.filter((event) => event.EventOwnerId === decodedUser.userId).length
        : events.length,
    [events, decodedUser?.userId],
  );

  const stats = [
    { label: 'Total events', value: events.length },
    { label: 'Owned events', value: ownedEventsCount },
    { label: 'Upcoming', value: upcomingEvents.length },
  ];

  const handleProfileImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!authToken) {
      setProfileImageError('Please log in again to update your photo.');
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setProfileImageError('Choose an image under 5MB.');
      event.target.value = '';
      return;
    }
    setIsUploadingProfileImage(true);
    setProfileImageError(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('token', authToken);

    try {
      const response = await fetch(buildPath('api/auth/uploadProfilePhoto'), {
        method: 'POST',
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.error) {
        throw new Error(data?.error || 'Unable to upload profile photo.');
      }
      if (data.token) {
        syncToken(data.token);
      }
      if (data.profileImageUrl) {
        setProfileImageUrl(data.profileImageUrl);
        updateStoredUser({ profileImageUrl: data.profileImageUrl });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to upload profile photo.';
      setProfileImageError(message);
    } finally {
      setIsUploadingProfileImage(false);
      event.target.value = '';
    }
  };

  const handleEventImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setEventImageError('Choose an image under 5MB.');
      event.target.value = '';
      return;
    }

    setIsUploadingEventImage(true);
    setEventImageError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(buildPath('api/CRUD/uploadPhoto'), {
        method: 'POST',
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.error || !data.imageUrl) {
        throw new Error(data?.error || 'Unable to upload event image.');
      }
      setFormState((prev) => ({ ...prev, eventImageUrl: data.imageUrl }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to upload event image.';
      setEventImageError(message);
    } finally {
      setIsUploadingEventImage(false);
      event.target.value = '';
    }
  };

  const handleRemoveEventImage = () => {
    setFormState((prev) => ({ ...prev, eventImageUrl: null }));
    setEventImageError(null);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const resetSearch = () => {
    setSearchInput('');
    setActiveSearch('');
  };

  const handleFormChange = (field: keyof DashboardFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.currentTarget;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormState(emptyForm);
    setEditingEvent(null);
    setEventImageError(null);
  };

  const handleEdit = (eventRecord: EventRecord) => {
    if (!decodedUser || eventRecord.EventOwnerId !== decodedUser.userId) {
      setFeedback('You can only edit events you created.');
      return;
    }
    setEditingEvent(eventRecord);
    setFormState({
      eventTitle: eventRecord.EventTitle ?? '',
      eventDescription: eventRecord.EventDescription ?? '',
      eventTime: toDatetimeLocal(eventRecord.EventTime),
      eventDuration: eventRecord.EventDuration?.toString() ?? '',
      eventLocation: eventRecord.EventLocation ?? '',
      eventImageUrl: eventRecord.EventImageUrl ?? null,
    });
  };

  const handleDelete = async (eventRecord: EventRecord) => {
    if (!authToken || !decodedUser) return;
    if (eventRecord.EventOwnerId !== decodedUser.userId) {
      setFeedback('You can only delete events you created.');
      return;
    }
    const confirmDelete = window.confirm(`Delete “${eventRecord.EventTitle}”?`);
    if (!confirmDelete) return;
    setFeedback(null);
    try {
      const response = await fetch(buildPath('api/CRUD/deleteEvent'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: authToken, eventId: eventRecord.EventId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.error) {
        throw new Error(data?.error || 'Unable to delete event.');
      }
      if (data.token) {
        syncToken(data.token);
      }
      setEvents((prev) => sortEventsList(prev.filter((item) => item.EventId !== eventRecord.EventId)));
      setFeedback('Event deleted.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete event.';
      setError(message);
    }
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authToken) return;

    if (!formState.eventTitle.trim() || !formState.eventDescription.trim()) {
      setFeedback('Please provide a title and description.');
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const payload: Record<string, unknown> = {
        token: authToken,
        eventTitle: formState.eventTitle.trim(),
        eventDescription: formState.eventDescription.trim(),
        eventTime: toIsoString(formState.eventTime),
        eventDuration: formState.eventDuration,
        eventLocation: formState.eventLocation.trim(),
        eventImageUrl: formState.eventImageUrl,
      };

      let endpoint = 'api/CRUD/createEvent';
      if (editingEvent) {
        endpoint = 'api/CRUD/updateEvent';
        payload.eventId = editingEvent.EventId;
      }

      const response = await fetch(buildPath(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.error) {
        throw new Error(data?.error || 'Unable to save event.');
      }

      if (data.token) {
        syncToken(data.token);
      }

      if (data.eventObject) {
        setEvents((prev) => {
          let next: EventRecord[];
          if (editingEvent) {
            next = prev.map((item) => (item.EventId === data.eventObject.EventId ? data.eventObject : item));
          } else {
            next = [data.eventObject, ...prev];
          }
          return sortEventsList(next);
        });
      } else {
        fetchEvents();
      }

      setFeedback(editingEvent ? 'Event updated!' : 'Event created!');
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save event.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (eventRecord: EventRecord) => {
    if (!authToken) return;
    try {
      const response = await fetch(buildPath('api/CRUD/toggleLike'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: authToken, eventId: eventRecord.EventId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.error) {
        throw new Error(data?.error || 'Unable to update like.');
      }
      if (data.token) {
        syncToken(data.token);
      }
      if (data.eventObject) {
        updateEventInState(data.eventObject);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update like.';
      setError(message);
    }
  };

  const handleCommentChange = (eventId: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setCommentDrafts((prev) => ({ ...prev, [eventId]: value }));
    setCommentErrors((prev) => ({ ...prev, [eventId]: '' }));
  };

  const handleAddComment = async (eventRecord: EventRecord) => {
    if (!authToken) return;
    const text = (commentDrafts[eventRecord.EventId] || '').trim();
    if (!text) {
      setCommentErrors((prev) => ({ ...prev, [eventRecord.EventId]: 'Add a comment before sending.' }));
      return;
    }
    try {
      const response = await fetch(buildPath('api/CRUD/addComment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: authToken, eventId: eventRecord.EventId, commentText: text }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.error) {
        throw new Error(data?.error || 'Unable to post comment.');
      }
      if (data.token) {
        syncToken(data.token);
      }
      if (data.eventObject) {
        updateEventInState(data.eventObject);
      }
      setCommentDrafts((prev) => ({ ...prev, [eventRecord.EventId]: '' }));
      setCommentErrors((prev) => ({ ...prev, [eventRecord.EventId]: '' }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to post comment.';
      setCommentErrors((prev) => ({ ...prev, [eventRecord.EventId]: message }));
    }
  };

  const handleNotifyMe = async (eventRecord: EventRecord) => {
    const eventKey = Number(eventRecord.EventId);
    if (!authToken) {
      setNotificationMessages((prev) => ({
        ...prev,
        [eventKey]: { type: 'error', text: 'Please log back in to subscribe to reminders.' },
      }));
      return;
    }
    setNotificationLoading((prev) => ({ ...prev, [eventKey]: true }));
    setNotificationMessages((prev) => ({
      ...prev,
      [eventKey]: { type: 'info', text: 'Sending reminder...' },
    }));
    try {
      const response = await fetch(buildPath('api/CRUD/notifyEvent'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: authToken, eventId: eventRecord.EventId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.error) {
        throw new Error(data?.error || 'Unable to send reminder.');
      }
      if (data.token) {
        syncToken(data.token);
      }
      setNotificationMessages((prev) => ({
        ...prev,
        [eventKey]: { type: 'success', text: 'Reminder email sent! Check your inbox.' },
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to send reminder.';
      setNotificationMessages((prev) => ({
        ...prev,
        [eventKey]: { type: 'error', text: message },
      }));
    } finally {
      setNotificationLoading((prev) => ({ ...prev, [eventKey]: false }));
    }
  };

  const avatarUrl = toAbsoluteUrl(profileImageUrl);
  const eventImagePreview = toAbsoluteUrl(formState.eventImageUrl);
  const nextEventImageUrl = toAbsoluteUrl(nextEvent?.EventImageUrl ?? null);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">LoopU Dashboard</p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Hey {decodedUser?.firstName ?? 'there'}, ready for tonight?
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{decodedUser?.firstName ?? 'LoopU'} {decodedUser?.lastName ?? 'Member'}</p>
            </div>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-11 w-11 rounded-full border border-slate-200 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] text-white font-semibold">
                {decodedUser?.firstName?.[0]}
                {decodedUser?.lastName?.[0]}
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-screen-2xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[2fr,1fr] lg:px-8">
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <form className="flex w-full gap-3" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search events by title, description, or location"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.currentTarget.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                >
                  Search
                </button>
                {activeSearch && (
                  <button
                    type="button"
                    onClick={resetSearch}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-gray-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                  >
                    Clear
                  </button>
                )}
              </form>

              <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-600">
                <button
                  type="button"
                  onClick={() => setViewFilter('mine')}
                  className={`rounded-full px-3 py-1 transition ${viewFilter === 'mine' ? 'bg-white text-slate-900 shadow' : ''}`}
                >
                  My events
                </button>
                <button
                  type="button"
                  onClick={() => setViewFilter('all')}
                  className={`rounded-full px-3 py-1 transition ${viewFilter === 'all' ? 'bg-white text-slate-900 shadow' : ''}`}
                >
                  All events
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
              <button
                type="button"
                onClick={fetchEvents}
                className="text-sm font-medium text-[#FF2D55] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
              >
                Refresh list
              </button>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            ) : null}

            {isFetching ? (
              <div className="mt-6 space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-slate-500">
                No events yet. Start by creating your first event on the right.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {events.map((eventRecord) => {
                  const isOwner = decodedUser?.userId === eventRecord.EventOwnerId;
                  const likes = eventRecord.Likes ?? 0;
                  const commentsCount = eventRecord.Comments?.length ?? 0;
                  const likedByMe =
                    !!decodedUser &&
                    Array.isArray(eventRecord.LikedBy) &&
                    eventRecord.LikedBy.some((id) => Number(id) === decodedUser.userId);
                  const cardImageUrl = toAbsoluteUrl(eventRecord.EventImageUrl ?? null);
                  const ownerImageUrl = toAbsoluteUrl(eventRecord.OwnerProfileImageUrl ?? null);
                  const avatarLabel = (eventRecord.EventTitle || 'LU').slice(0, 2).toUpperCase();
                  const calendarLink = buildGoogleCalendarLink(eventRecord);
                  const reminderMessage = notificationMessages[eventRecord.EventId];
                  const reminderLoading = notificationLoading[eventRecord.EventId];

                  return (
                    <article
                      key={eventRecord.EventId}
                      className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        {ownerImageUrl ? (
                          <img
                            src={ownerImageUrl}
                            alt={eventRecord.EventTitle}
                            className="h-11 w-11 rounded-full border border-slate-200 object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] text-xs font-semibold uppercase text-white">
                            {avatarLabel}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-base font-semibold text-slate-900">
                                  {eventRecord.EventTitle || 'Untitled Event'}
                                </h3>
                                <span className="text-xs font-semibold text-slate-400">#{eventRecord.EventId}</span>
                              </div>
                              <p className="text-xs text-slate-500">
                                {formatDateTime(eventRecord.EventTime)}
                                {eventRecord.EventLocation ? ` • ${eventRecord.EventLocation}` : null}
                              </p>
                            </div>
                            {isOwner ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(eventRecord)}
                                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-gray-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(eventRecord)}
                                  className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
                                >
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </div>
                          {eventRecord.EventDescription ? (
                            <p className="mt-3 text-sm text-slate-700">{eventRecord.EventDescription}</p>
                          ) : null}
                          {cardImageUrl ? (
                            <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100 bg-white">
                              <img
                                src={cardImageUrl}
                                alt={eventRecord.EventTitle}
                                className="h-auto max-h-72 w-full bg-slate-50 object-contain"
                              />
                            </div>
                          ) : null}
                          <div className="mt-3 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500">
                            <button
                              type="button"
                              onClick={() => handleToggleLike(eventRecord)}
                              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18] ${
                                likedByMe
                                  ? 'border-transparent bg-gradient-to-r from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] text-white shadow-brand'
                                  : 'border-gray-200 text-slate-600 hover:border-gray-300 hover:text-slate-900'
                              }`}
                            >
                              ❤️ {likes}
                            </button>
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              💬 {commentsCount}
                            </span>
                            {eventRecord.EventDuration ? (
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                ⏱ {eventRecord.EventDuration} mins
                              </span>
                            ) : null}
                            <a
                              href={calendarLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-slate-600 transition hover:border-gray-300 hover:text-slate-900"
                            >
                              📅 Add to Google Calendar
                            </a>
                            <button
                              type="button"
                              onClick={() => handleNotifyMe(eventRecord)}
                              disabled={!!reminderLoading}
                              className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-slate-600 transition hover:border-gray-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {reminderLoading ? 'Sending…' : 'Email reminder'}
                            </button>
                          </div>
                          {reminderMessage ? (
                            <p
                              className={`mt-2 text-xs ${
                                reminderMessage.type === 'error'
                                  ? 'text-rose-500'
                                  : reminderMessage.type === 'success'
                                  ? 'text-emerald-600'
                                  : 'text-slate-500'
                              }`}
                            >
                              {reminderMessage.text}
                            </p>
                          ) : null}
                          <div className="mt-4 space-y-3">
                            {(eventRecord.Comments ?? []).slice(-3).map((comment) => {
                              const initials = (comment.AuthorName || 'LoopU').slice(0, 2).toUpperCase();
                              return (
                                <div
                                  key={comment.CommentId}
                                  className="rounded-2xl border border-gray-100 bg-white/80 px-3 py-2 text-xs text-slate-600"
                                >
                                  <div className="flex gap-3">
                                    {comment.AuthorImageUrl ? (
                                      <img
                                        src={toAbsoluteUrl(comment.AuthorImageUrl) ?? undefined}
                                        alt={comment.AuthorName}
                                        className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-600">
                                        {initials}
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="truncate font-semibold text-slate-800">
                                          {comment.AuthorName || 'LoopU Member'}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                                          {formatDateTime(comment.CreatedAt)}
                                        </p>
                                      </div>
                                      <p className="mt-1 text-slate-600">{comment.Text}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <div className="rounded-2xl border border-gray-100 bg-slate-50/60 px-3 py-2">
                              <label htmlFor={`comment-${eventRecord.EventId}`} className="sr-only">
                                Add a comment
                              </label>
                              <input
                                id={`comment-${eventRecord.EventId}`}
                                type="text"
                                placeholder="Share something about this event…"
                                value={commentDrafts[eventRecord.EventId] || ''}
                                onChange={handleCommentChange(eventRecord.EventId)}
                                className="w-full rounded-full border border-gray-200 bg-white px-3 py-2 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                              />
                              {commentErrors[eventRecord.EventId] ? (
                                <p className="mt-1 text-[11px] text-rose-500">{commentErrors[eventRecord.EventId]}</p>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => handleAddComment(eventRecord)}
                                className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] px-3 py-2 text-xs font-semibold text-white shadow-brand transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                              >
                                Post comment
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Profile photo</p>
                <h2 className="text-lg font-semibold text-slate-900">Make it yours</h2>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Current profile"
                  className="h-20 w-20 rounded-full border border-slate-200 object-cover shadow"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-slate-300 text-xs text-slate-400">
                  No photo
                </div>
              )}
              <p className="text-sm text-slate-500">
                This photo shows up on your events and comments. Upload a square image for the best results.
              </p>
            </div>
            <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#FF7A18]">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageUpload}
                disabled={isUploadingProfileImage}
              />
              {isUploadingProfileImage ? 'Uploading…' : 'Upload new photo'}
            </label>
            {profileImageError ? (
              <p className="mt-2 text-xs text-rose-500">{profileImageError}</p>
            ) : (
              <p className="mt-2 text-xs text-slate-400">JPG, PNG, or WEBP up to 5MB.</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {editingEvent ? 'Update event' : 'Create event'}
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingEvent ? 'Edit details' : 'Plan something new'}
                </h2>
              </div>
              {editingEvent && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-semibold text-[#FF2D55] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                >
                  Cancel edit
                </button>
              )}
            </div>

            {feedback ? (
              <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                feedback.toLowerCase().includes('unable') ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'
              }`}>
                {feedback}
              </div>
            ) : null}

            <form className="mt-4 space-y-4" onSubmit={handleFormSubmit}>
              <div>
                <label htmlFor="eventTitle" className="text-sm font-medium text-slate-700">
                  Event title
                </label>
                <input
                  id="eventTitle"
                  name="eventTitle"
                  type="text"
                  required
                  placeholder="LoopU Late Night"
                  value={formState.eventTitle}
                  onChange={handleFormChange('eventTitle')}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                />
              </div>

              <div>
                <label htmlFor="eventDescription" className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  id="eventDescription"
                  name="eventDescription"
                  rows={3}
                  placeholder="Write a short highlight for the feed..."
                  value={formState.eventDescription}
                  onChange={handleFormChange('eventDescription')}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="eventTime" className="text-sm font-medium text-slate-700">
                    Start time
                  </label>
                  <input
                    id="eventTime"
                    name="eventTime"
                    type="datetime-local"
                    value={formState.eventTime}
                    onChange={handleFormChange('eventTime')}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                  />
                </div>
                <div>
                  <label htmlFor="eventDuration" className="text-sm font-medium text-slate-700">
                    Duration (mins)
                  </label>
                  <input
                    id="eventDuration"
                    name="eventDuration"
                    type="number"
                    min="15"
                    step="15"
                    value={formState.eventDuration}
                    onChange={handleFormChange('eventDuration')}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="eventLocation" className="text-sm font-medium text-slate-700">
                  Location
                </label>
                <input
                  id="eventLocation"
                  name="eventLocation"
                  type="text"
                  placeholder="Union Amphitheater"
                  value={formState.eventLocation}
                  onChange={handleFormChange('eventLocation')}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Cover image (optional)</label>
                {eventImagePreview ? (
                  <div className="mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white">
                    <img src={eventImagePreview} alt="Event" className="h-auto max-h-64 w-full bg-slate-50 object-contain" />
                    <button
                      type="button"
                      onClick={handleRemoveEventImage}
                      className="w-full bg-white px-3 py-2 text-xs font-semibold text-rose-500 underline-offset-4 hover:underline"
                    >
                      Remove image
                    </button>
                  </div>
                ) : null}
                <label className="mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#FF7A18]">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEventImageUpload}
                    disabled={isUploadingEventImage}
                  />
                  {isUploadingEventImage ? 'Uploading…' : formState.eventImageUrl ? 'Replace image' : 'Upload image'}
                </label>
                {eventImageError ? (
                  <p className="mt-2 text-xs text-rose-500">{eventImageError}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">PNG, JPG, or WEBP up to 5MB.</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] px-4 py-3 text-sm font-semibold text-white shadow-brand transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving…' : editingEvent ? 'Update event' : 'Create event'}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Next up</p>
            {nextEvent ? (
              <div className="mt-3 rounded-2xl border border-gray-100 bg-gradient-to-br from-orange-50 via-white to-purple-50 p-4 shadow-inner">
                {nextEventImageUrl ? (
                  <div className="mb-3 overflow-hidden rounded-xl border border-white/60 bg-white shadow">
                    <img src={nextEventImageUrl} alt={nextEvent.EventTitle} className="h-auto max-h-64 w-full bg-slate-50 object-contain" />
                  </div>
                ) : null}
                <p className="text-sm font-semibold text-slate-800">{nextEvent.EventTitle}</p>
                <p className="text-xs text-slate-500">{nextEvent.EventLocation || 'Location TBA'}</p>
                <p className="mt-3 text-base font-semibold text-slate-900">{formatDateTime(nextEvent.EventTime)}</p>
                {nextEvent.EventDescription && (
                  <p className="mt-2 text-sm text-slate-600">{nextEvent.EventDescription}</p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No upcoming events. Once you publish one, it will appear here.</p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
