import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data: slots, error: slotsErr } = await supabase
    .from('plan_slots')
    .select('id, task_id, start_at, end_at, is_committed')
    .order('start_at', { ascending: true });

  if (slotsErr) {
    return NextResponse.json({ error: slotsErr.message }, { status: 500 });
  }

  const { data: tasks, error: tasksErr } = await supabase
    .from('tasks')
    .select('id, title, priority, est_minutes, deadline');

  if (tasksErr) {
    return NextResponse.json({ error: tasksErr.message }, { status: 500 });
  }

  const taskMap = new Map(tasks?.map((t) => [t.id, t]));
  const events = (slots ?? []).map((s) => {
    const t = taskMap.get(s.task_id);
    return {
      id: s.id,
      title: t?.title ?? '(無題)',
      start: s.start_at,
      end: s.end_at,
      extendedProps: {
        priority: t?.priority ?? 2,
        est_minutes: t?.est_minutes ?? 60,
        is_committed: s.is_committed,
        deadline: t?.deadline ?? null,
      },
    };
  });

  return NextResponse.json({ events });
}
