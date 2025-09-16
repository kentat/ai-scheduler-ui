"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";

type EventItem = {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps?: {
    priority?: number;
    est_minutes?: number;
    is_committed?: boolean;
    deadline?: string | null;
  };
};

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/schedule", { cache: "no-store" });
      const json = await res.json();
      setEvents(json.events ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b-2 border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl p-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            AIスケジューラー
          </h1>
          <span className="text-base font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-lg">
            {loading ? "読み込み中..." : `${events.length}件のスロット`}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-3xl bg-white shadow-lg border border-slate-200 p-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            nowIndicator={true}
            height="80vh"
            events={events}
            locales={[jaLocale]}
            locale="ja"
            timeZone="local"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            dayHeaderFormat={{ weekday: 'long' }}
            titleFormat={{ month: 'long', year: 'numeric' }}
            buttonText={{
              today: '今日',
              month: '月',
              week: '週',
              day: '日'
            }}
            eventContent={(eventInfo) => {
              return (
                <div className="p-1 text-black font-bold text-sm">
                  <div className="font-bold">{eventInfo.event.title}</div>
                  {eventInfo.timeText && (
                    <div className="text-xs opacity-90">{eventInfo.timeText}</div>
                  )}
                </div>
              );
            }}
            eventClassNames={(arg) => {
              const priority = arg.event.extendedProps?.priority ?? 2;
              return priority === 1
                ? ["border-red-500"]    // 優先度1: 赤枠
                : priority === 3
                ? ["border-gray-400"]   // 優先度3: グレー枠
                : ["border-amber-500"]; // 優先度2: オレンジ枠
            }}
            eventColor="#ffffff"
            eventBackgroundColor="#ffffff"
            eventBorderColor="#e5e7eb"
          />
        </div>
      </div>
    </main>
  );
}
