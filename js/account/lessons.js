// Dersler: önce Firestore'a yazılır, sonra Google Calendar'a. Takvim başarısız olursa ders kayıtlı kalır,
// calendarSync = 'failed' ve pendingAction (create / update / cancel) ile "Tekrar dene" yapılabilir.
// users/{uid}/lessons/{id}: startAt, durationMin, note, status (scheduled/cancelled), seriesId, seriesIndex,
// calendarEventId (tek ders ya da tekrarın o dersi), seriesEventId (tekrarlayan etkinlik), meetUrl,
// calendarSync (pending/ok/failed), calendarError, pendingAction, studentName, createdAt, updatedAt.
import { db, fs } from './firebase.js';
import { addDaysToKey, berlinAt, berlinParts, toDate } from './common.js';
import * as cal from './calendar.js';

export const DEFAULT_DURATION = 50;
export const MAX_WEEKS = 26;

const lessonsOf = (uid) => fs.collection(db, 'users', uid, 'lessons');

// Davetliler: öğrenci; 16 yaş altıysa ve ayar açıksa (varsayılan açık) veli de.
export function attendeesFor(student){
  const list = [student.email];
  if(student.minor && student.inviteParent !== false && student.parent?.email) list.push(student.parent.email);
  return list;
}

export const parentInvited = (student) => Boolean(student.minor && student.inviteParent !== false && student.parent?.email);

// Haftalık tekrar: aynı Berlin saatinde (yaz/kış saati değişse de).
export function occurrences(dayKey, time, weeks){
  return Array.from({ length: weeks }, (_, i) => berlinAt(addDaysToKey(dayKey, 7 * i), time));
}

export async function loadAllLessons(){
  const snap = await fs.getDocs(fs.collectionGroup(db, 'lessons'));
  return snap.docs.map((d) => ({ id: d.id, uid: d.ref.parent.parent.id, ref: d.ref, ...d.data(), startAt: toDate(d.data().startAt) }));
}

export async function loadStudentLessons(uid){
  const snap = await fs.getDocs(lessonsOf(uid));
  return snap.docs.map((d) => ({ id: d.id, uid, ref: d.ref, ...d.data(), startAt: toDate(d.data().startAt) }));
}

function failure(error){
  return { calendarSync: 'failed', calendarError: String(error?.message || error).slice(0, 300), updatedAt: fs.serverTimestamp() };
}

async function updateAll(lessons, data){
  const batch = fs.writeBatch(db);
  lessons.forEach((l) => batch.update(l.ref, typeof data === 'function' ? data(l) : data));
  await batch.commit();
}

const isWeekly = (lessons) => lessons.every((l, i) => i === 0
  || (berlinParts(l.startAt).time === berlinParts(lessons[0].startAt).time
    && berlinParts(l.startAt).key === addDaysToKey(berlinParts(lessons[0].startAt).key, 7 * i)));

// Takvim'de oluşturma: birden fazla haftalık ders tek tekrarlayan etkinlik olur (öğrenciye tek davet),
// her dersin kendi kimliği tekrarın "instances" listesinden alınır.
async function createInCalendar(student, lessons){
  const sorted = [...lessons].sort((a, b) => a.startAt - b.startAt);
  const first = sorted[0];
  const attendees = attendeesFor(student);
  if(sorted.length > 1 && isWeekly(sorted)){
    const event = await cal.insertEvent(cal.lessonEvent({
      start: first.startAt, durationMin: first.durationMin, note: first.note, student, attendees,
      lessonId: first.seriesId || first.id, count: sorted.length
    }));
    const list = await cal.instances(event.id);
    await updateAll(sorted, (l) => {
      const match = list.find((i) => i.start.getTime() === l.startAt.getTime());
      return {
        calendarEventId: match?.id || '', seriesEventId: event.id, meetUrl: event.meetUrl,
        calendarSync: match ? 'ok' : 'failed', calendarError: match ? '' : 'Takvimde bu ders bulunamadı.',
        pendingAction: match ? null : 'create', updatedAt: fs.serverTimestamp()
      };
    });
    return;
  }
  for(const l of sorted){
    const event = await cal.insertEvent(cal.lessonEvent({
      start: l.startAt, durationMin: l.durationMin, note: l.note, student, attendees, lessonId: l.id
    }));
    await updateAll([l], { calendarEventId: event.id, seriesEventId: null, meetUrl: event.meetUrl, calendarSync: 'ok', calendarError: '', pendingAction: null, updatedAt: fs.serverTimestamp() });
    l.calendarEventId = event.id;
  }
}

// calendarReady: düğmeye basınca Google izni alınabildi mi (false ise ders yine kaydedilir, "failed" olur).
export async function createLessons({ student, dayKey, time, durationMin, note, weeks }, calendarError){
  const starts = occurrences(dayKey, time, weeks);
  const seriesId = weeks > 1 ? crypto.randomUUID() : null;
  const batch = fs.writeBatch(db);
  const lessons = starts.map((startAt, i) => {
    const ref = fs.doc(lessonsOf(student.id));
    const data = {
      startAt: fs.Timestamp.fromDate(startAt), durationMin, note, status: 'scheduled', seriesId, seriesIndex: i,
      calendarEventId: '', seriesEventId: null, meetUrl: '', calendarSync: 'pending', calendarError: '',
      pendingAction: 'create', studentName: student.name, createdAt: fs.serverTimestamp(), updatedAt: fs.serverTimestamp()
    };
    batch.set(ref, data);
    return { ...data, id: ref.id, ref, uid: student.id, startAt };
  });
  await batch.commit();
  return syncCreate(student, lessons, calendarError);
}

async function syncCreate(student, lessons, calendarError){
  try{
    if(calendarError) throw calendarError;
    await createInCalendar(student, lessons);
    return { ok: true };
  }catch(error){
    console.error(error);
    await updateAll(lessons.filter((l) => !l.calendarEventId), failure(error)).catch(() => {});
    return { ok: false, error };
  }
}

export async function moveLesson(lesson, student, startAt, durationMin, calendarError){
  const pendingAction = lesson.calendarEventId ? 'update' : 'create';
  await fs.updateDoc(lesson.ref, { startAt: fs.Timestamp.fromDate(startAt), durationMin, calendarSync: 'pending', pendingAction, updatedAt: fs.serverTimestamp() });
  const moved = { ...lesson, startAt, durationMin, pendingAction };
  return pendingAction === 'create' ? syncCreate(student, [moved], calendarError) : syncUpdate(moved, calendarError);
}

async function syncUpdate(lesson, calendarError){
  try{
    if(calendarError) throw calendarError;
    await cal.patchEvent(lesson.calendarEventId, cal.timeChanges(lesson.startAt, lesson.durationMin));
    await fs.updateDoc(lesson.ref, { calendarSync: 'ok', calendarError: '', pendingAction: null, updatedAt: fs.serverTimestamp() });
    return { ok: true };
  }catch(error){
    console.error(error);
    await fs.updateDoc(lesson.ref, failure(error)).catch(() => {});
    return { ok: false, error };
  }
}

export async function cancelLesson(lesson, calendarError){
  const hasEvent = Boolean(lesson.calendarEventId);
  await fs.updateDoc(lesson.ref, {
    status: 'cancelled', cancelledAt: fs.serverTimestamp(), updatedAt: fs.serverTimestamp(),
    calendarSync: hasEvent ? 'pending' : 'ok', pendingAction: hasEvent ? 'cancel' : null, calendarError: ''
  });
  return hasEvent ? syncCancel([{ ...lesson, status: 'cancelled' }], calendarError) : { ok: true };
}

async function syncCancel(lessons, calendarError){
  try{
    if(calendarError) throw calendarError;
    for(const l of lessons) await cal.deleteEvent(l.calendarEventId, { notify: true });
    await updateAll(lessons, { calendarSync: 'ok', calendarError: '', pendingAction: null, updatedAt: fs.serverTimestamp() });
    return { ok: true };
  }catch(error){
    console.error(error);
    await updateAll(lessons, failure(error)).catch(() => {});
    return { ok: false, error };
  }
}

// "Bu ve sonraki dersleri iptal et": tekrarlayan etkinlikte tekrar bu dersten önce bitirilir
// (öğrenciye tek güncelleme gider); ilk dersse bütün etkinlik silinir.
export async function cancelFollowing(lesson, seriesLessons, calendarError){
  const targets = seriesLessons.filter((l) => l.status !== 'cancelled' && l.startAt >= lesson.startAt);
  const earlierInCalendar = seriesLessons.some((l) => l.startAt < lesson.startAt && l.seriesEventId === lesson.seriesEventId);
  await updateAll(targets, (l) => ({
    status: 'cancelled', cancelledAt: fs.serverTimestamp(), updatedAt: fs.serverTimestamp(),
    calendarSync: l.calendarEventId ? 'pending' : 'ok', pendingAction: l.calendarEventId ? 'cancel' : null, calendarError: ''
  }));
  const inCalendar = targets.filter((l) => l.calendarEventId);
  if(!inCalendar.length) return { ok: true };
  if(!lesson.seriesEventId) return syncCancel(inCalendar, calendarError);
  try{
    if(calendarError) throw calendarError;
    if(earlierInCalendar) await cal.patchEvent(lesson.seriesEventId, cal.untilBefore(lesson.startAt));
    else await cal.deleteEvent(lesson.seriesEventId, { notify: true });
    await updateAll(inCalendar, { calendarSync: 'ok', calendarError: '', pendingAction: null, updatedAt: fs.serverTimestamp() });
    return { ok: true };
  }catch(error){
    console.error(error);
    await updateAll(inCalendar, failure(error)).catch(() => {});
    return { ok: false, error };
  }
}

// Başarısız Takvim işlemlerini yeniden dener. Aynı tekrardaki oluşturulamamış dersler birlikte oluşturulur.
export async function retryFailed(failedLessons, studentsById, calendarError){
  const results = [];
  const creates = new Map();
  for(const l of failedLessons){
    const student = studentsById.get(l.uid);
    if(!student){
      results.push({ ok: false, error: new Error('Öğrenci bulunamadı') });
      continue;
    }
    if(l.pendingAction === 'update') results.push(await syncUpdate(l, calendarError));
    else if(l.pendingAction === 'cancel') results.push(await syncCancel([l], calendarError));
    else if(l.status === 'scheduled'){
      const key = `${l.uid}/${l.seriesId || l.id}`;
      creates.set(key, [...(creates.get(key) || []), l]);
    }
  }
  for(const lessons of creates.values()){
    results.push(await syncCreate(studentsById.get(lessons[0].uid), lessons, calendarError));
  }
  return results;
}

// Veli daveti ayarı değişince gelecekteki derslerin davetlileri güncellenir (her etkinlik bir kez).
export async function applyAttendees(student, lessons, calendarError){
  if(calendarError) throw calendarError;
  const now = new Date();
  const events = new Set(lessons
    .filter((l) => l.status === 'scheduled' && l.startAt > now && l.calendarEventId)
    .map((l) => l.seriesEventId || l.calendarEventId));
  const attendees = attendeesFor(student).map((email) => ({ email }));
  for(const id of events) await cal.patchEvent(id, { attendees });
  return events.size;
}

// Öğrenci silinirken: gelecekte dersi olan etkinlikler iptal bildirimiyle, sadece geçmiş dersi olanlar
// bildirimsiz silinir. Başarısız olanlar sayılır; öğretmen onları takviminden elle siler.
export async function deleteCalendarEvents(lessons){
  const now = new Date();
  const events = new Map();
  for(const l of lessons){
    if(!l.calendarEventId) continue;
    const id = l.seriesEventId || l.calendarEventId;
    const future = l.status === 'scheduled' && l.startAt > now;
    events.set(id, (events.get(id) || false) || future);
  }
  let failed = 0;
  for(const [id, notify] of events){
    try{ await cal.deleteEvent(id, { notify }); }catch(error){ console.error(error); failed++; }
  }
  return { total: events.size, failed };
}

export const needsCalendar = (lessons) => lessons.some((l) => l.calendarEventId);
